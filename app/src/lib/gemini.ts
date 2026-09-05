import type { CitationType, RiskLevel, CitationAnalysis } from "./types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash";
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const RPM_LIMIT = 10;
const DELAY_MS = Math.ceil(60000 / RPM_LIMIT) + 200;

let lastRequestTime = 0;
let requestCount = 0;
let windowStart = Date.now();

async function rateLimit(): Promise<void> {
  const now = Date.now();
  if (now - windowStart >= 60000) {
    requestCount = 0;
    windowStart = now;
  }
  if (requestCount >= RPM_LIMIT - 1) {
    const waitMs = 60000 - (now - windowStart) + 200;
    console.log(`[gemini] Rate limit hit, waiting ${waitMs}ms`);
    await new Promise((r) => setTimeout(r, waitMs));
    requestCount = 0;
    windowStart = Date.now();
  }
  const timeSinceLast = Date.now() - lastRequestTime;
  if (timeSinceLast < DELAY_MS) {
    await new Promise((r) => setTimeout(r, DELAY_MS - timeSinceLast));
  }
  lastRequestTime = Date.now();
  requestCount++;
}

const RISK_PROMPT = `You are an expert in research integrity and academic citation analysis.

Analyze how the following citation is used in a research paper and assess the risk if the cited paper has been retracted.

PAPER SNIPPET:
"{contextSnippet}"

CITATION DETAILS:
- Cited Paper: "{citedTitle}" ({citedYear})
- Retraction Status: {retractionStatus}
{retractionReasonLine}

Provide your analysis in this exact JSON format (no markdown, just raw JSON):
{{
  "citationType": "methodology|background|comparison|result_dependency|general_reference",
  "riskLevel": "low|medium|high|critical",
  "riskScore": 0.0-1.0,
  "explanation": "Detailed explanation of why this citation type and risk level",
  "confidence": 0.0-1.0,
  "sectionWhereUsed": "introduction|methods|results|discussion|conclusion",
  "dependencyStrength": "none|weak|moderate|strong|critical"
}}

Rules:
1. If the cited paper is NOT retracted, riskLevel must be "low" and riskScore must be 0.0
2. METHODOLOGY citations are HIGH risk if retracted
3. RESULT_DEPENDENCY citations are CRITICAL if retracted
4. BACKGROUND citations are LOW risk even if retracted
5. Consider whether the retraction reason affects this specific usage`;

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

function parseJsonFromText(text: string): CitationAnalysis | null {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      citationType: parsed.citationType as CitationType,
      riskLevel: parsed.riskLevel as RiskLevel,
      riskScore: Math.min(1, Math.max(0, parsed.riskScore ?? 0)),
      explanation: parsed.explanation ?? "",
      confidence: Math.min(1, Math.max(0, parsed.confidence ?? 0.5)),
      sectionWhereUsed: parsed.sectionWhereUsed ?? "unknown",
      dependencyStrength: parsed.dependencyStrength ?? "unknown",
    };
  } catch {
    return null;
  }
}

function getDefaultAnalysis(isRetracted: boolean): CitationAnalysis {
  return {
    citationType: "general_reference",
    riskLevel: isRetracted ? "medium" : "low",
    riskScore: isRetracted ? 0.5 : 0.0,
    explanation: "Unable to analyze citation context via AI. Default risk applied.",
    confidence: 0.3,
    sectionWhereUsed: "unknown",
    dependencyStrength: isRetracted ? "moderate" : "none",
  };
}

export async function analyzeCitationContext(
  contextSnippet: string,
  citedTitle: string,
  citedYear: number | null,
  isRetracted: boolean,
  retractionReason: string | null,
  retryCount = 0
): Promise<CitationAnalysis> {
  if (!GEMINI_API_KEY || retryCount >= 3) {
    return getDefaultAnalysis(isRetracted);
  }

  await rateLimit();

  const prompt = RISK_PROMPT
    .replace("{contextSnippet}", contextSnippet)
    .replace("{citedTitle}", citedTitle)
    .replace("{citedYear}", String(citedYear ?? "unknown"))
    .replace("{retractionStatus}", isRetracted ? "RETRACTED" : "NOT RETRACTED")
    .replace(
      "{retractionReasonLine}",
      isRetracted && retractionReason ? `- Retraction Reason: ${retractionReason}` : ""
    );

  try {
    const response = await fetch(`${BASE_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get("Retry-After") ?? "60");
      console.warn(`[gemini] 429 rate limited, waiting ${retryAfter}s`);
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      requestCount = 0;
      windowStart = Date.now();
      return analyzeCitationContext(
        contextSnippet, citedTitle, citedYear, isRetracted, retractionReason, retryCount + 1
      );
    }

    if (!response.ok) {
      console.error(`Gemini API error: ${response.status}`);
      return getDefaultAnalysis(isRetracted);
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return getDefaultAnalysis(isRetracted);
    }

    const analysis = parseJsonFromText(text);
    return analysis ?? getDefaultAnalysis(isRetracted);
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return getDefaultAnalysis(isRetracted);
  }
}
