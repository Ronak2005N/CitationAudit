import { NextResponse } from "next/server";
import { getPaperByDOI } from "@/lib/openalex";
import { checkRetractions } from "@/lib/crossref";
import { analyzeCitationContext } from "@/lib/gemini";
import {
  buildAnalyzedCitation,
  calculateOverallRiskScore,
} from "@/lib/risk-scorer";
import { buildGraph } from "@/lib/graph-builder";
import type { AnalyzedCitation } from "@/lib/types";

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { doi } = body as { doi?: string };

    if (!doi) {
      return NextResponse.json(
        { error: "A DOI is required" },
        { status: 400 }
      );
    }

    const cleanDoi = doi
      .trim()
      .replace(/^https?:\/\/doi\.org\//, "")
      .replace(/^https?:\/\/[^/]+\/api\/papers\//, "")
      .replace(/^https?:\/\/[^/]+\//, "");

    if (!/^10\.\d{4,9}\/.+/.test(cleanDoi)) {
      return NextResponse.json(
        { error: "Invalid DOI format. Expected format: 10.XXXX/..." },
        { status: 400 }
      );
    }

    // Step 1: Fetch paper and references from OpenAlex
    console.log(`[analyze] Fetching paper: ${cleanDoi}`);
    const { paper, references } = await getPaperByDOI(cleanDoi);
    console.log(`[analyze] Found ${references.length} references`);

    // Step 2: Extract DOIs from references
    const refDois = references
      .map((r) => r.doi)
      .filter((d): d is string => d !== null);
    console.log(`[analyze] ${refDois.length} references have DOIs`);

    // Step 3: Check retraction status for all references
    console.log(`[analyze] Checking retraction status...`);
    const retractionResults = await checkRetractions(refDois);
    const retractionMap = new Map(
      retractionResults.map((r) => [r.doi, r])
    );
    const retractedCount = retractionResults.filter(
      (r) => r.isRetracted
    ).length;
    console.log(`[analyze] Found ${retractedCount} retracted references`);

    // Step 4: For each retracted reference, get AI citation analysis
    // For non-retracted, we still do basic analysis for risk scoring
    console.log(`[analyze] Analyzing citation contexts...`);
    const analyzedCitations: AnalyzedCitation[] = [];

    for (const ref of references) {
      const retraction = ref.doi
        ? retractionMap.get(ref.doi) ?? {
            doi: ref.doi,
            isRetracted: false,
            retractionDate: null,
            retractionTimestamp: null,
            reason: null,
            source: null,
          }
        : {
            doi: "",
            isRetracted: false,
            retractionDate: null,
            retractionTimestamp: null,
            reason: null,
            source: null,
          };

      // Generate a context snippet (in a real app, this would come from PDF parsing)
      const contextSnippet = retraction.isRetracted
        ? `Citation to retracted paper: ${ref.title} (${ref.year})`
        : `Reference: ${ref.title}`;

      // Analyze citation context with Gemini
      const aiAnalysis = await analyzeCitationContext(
        contextSnippet,
        ref.title,
        ref.year,
        retraction.isRetracted,
        retraction.reason
      );

      analyzedCitations.push(
        buildAnalyzedCitation(ref, retraction, aiAnalysis, contextSnippet)
      );
    }

    // Step 5: Calculate overall risk score
    const { score: overallRiskScore, level: riskLevel } =
      calculateOverallRiskScore(analyzedCitations, references.length);

    // Step 6: Build citation graph
    const graph = buildGraph(paper.title, analyzedCitations);

    // Step 7: Compile statistics
    const highRiskCount = analyzedCitations.filter(
      (c) => c.riskLevel === "high" || c.riskLevel === "critical"
    ).length;
    const mediumRiskCount = analyzedCitations.filter(
      (c) => c.riskLevel === "medium"
    ).length;
    const lowRiskCount = analyzedCitations.filter(
      (c) => c.riskLevel === "low"
    ).length;
    const retractedStrongDependency = analyzedCitations.filter(
      (c) => c.isRetracted && (c.citationType === "methodology" || c.citationType === "result_dependency")
    ).length;

    const processingTimeMs = Date.now() - startTime;

    return NextResponse.json({
      paper,
      analysis: {
        overallRiskScore,
        riskLevel,
        totalReferences: references.length,
        resolvedReferences: refDois.length,
        retractedCount,
        retractedStrongDependency,
        highRiskCount,
        mediumRiskCount,
        lowRiskCount,
        citations: analyzedCitations,
        graph,
      },
      processingTimeMs,
    });
  } catch (error) {
    console.error("[analyze] Pipeline failed:", error);
    return NextResponse.json(
      { error: "Analysis failed", details: String(error) },
      { status: 500 }
    );
  }
}
