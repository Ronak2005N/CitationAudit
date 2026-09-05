import type { CitationType, RiskLevel, CitationAnalysis, AnalyzedCitation, Reference, RetractionResult } from "./types";

const BASE_SCORES: Record<CitationType, number> = {
  methodology: 0.7,
  result_dependency: 0.9,
  comparison: 0.4,
  background: 0.1,
  general_reference: 0.05,
};

const REASON_MULTIPLIERS: Record<string, number> = {
  data_fabrication: 1.0,
  falsification: 1.0,
  image_manipulation: 0.9,
  unreliable_results: 0.8,
  plagiarism: 0.5,
  ethical_violations: 0.6,
  peer_review_manipulation: 0.7,
  paper_mill: 0.9,
};

const SECTION_MULTIPLIERS: Record<string, number> = {
  methods: 1.2,
  results: 1.1,
  introduction: 0.8,
  discussion: 0.9,
  conclusion: 1.0,
};

function normalizeReason(reason: string | null): string {
  if (!reason) return "unknown";
  const lower = reason.toLowerCase();
  if (lower.includes("fabricat") || lower.includes("fake")) return "data_fabrication";
  if (lower.includes("falsif")) return "falsification";
  if (lower.includes("image") || lower.includes("figure")) return "image_manipulation";
  if (lower.includes("unreliable") || lower.includes("reproducib")) return "unreliable_results";
  if (lower.includes("plagiari")) return "plagiarism";
  if (lower.includes("ethical") || lower.includes("consent")) return "ethical_violations";
  if (lower.includes("peer review") || lower.includes("review manipul")) return "peer_review_manipulation";
  if (lower.includes("paper mill")) return "paper_mill";
  return "unknown";
}

function normalizeSection(section: string | null): string {
  if (!section) return "unknown";
  const lower = section.toLowerCase();
  if (lower.includes("method") || lower.includes("experiment")) return "methods";
  if (lower.includes("result")) return "results";
  if (lower.includes("intro")) return "introduction";
  if (lower.includes("discuss")) return "discussion";
  if (lower.includes("conclu")) return "conclusion";
  return "unknown";
}

export function calculateCitationRiskScore(
  analysis: CitationAnalysis,
  isRetracted: boolean,
  retractionReason: string | null
): number {
  const baseScore = BASE_SCORES[analysis.citationType] ?? 0.1;
  const retractionMultiplier = isRetracted ? 1.0 : 0.0;
  const normalizedReason = normalizeReason(retractionReason);
  const reasonMultiplier = REASON_MULTIPLIERS[normalizedReason] ?? 0.7;
  const normalizedSection = normalizeSection(analysis.sectionWhereUsed);
  const sectionMultiplier = SECTION_MULTIPLIERS[normalizedSection] ?? 1.0;

  const rawScore = baseScore * retractionMultiplier * reasonMultiplier * sectionMultiplier;
  return Math.min(1, Math.max(0, rawScore));
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 0.8) return "critical";
  if (score >= 0.6) return "high";
  if (score >= 0.4) return "medium";
  return "low";
}

export function calculateOverallRiskScore(
  citations: AnalyzedCitation[],
  totalReferences: number
): { score: number; level: "safe" | "low" | "medium" | "high" | "critical" } {
  if (totalReferences === 0) return { score: 0, level: "safe" };

  const retractedCitations = citations.filter((c) => c.isRetracted);
  const highRiskCitations = citations.filter(
    (c) => c.riskLevel === "high" || c.riskLevel === "critical"
  );

  const retractionRatio = retractedCitations.length / totalReferences;
  const severityScore =
    retractedCitations.length > 0
      ? retractedCitations.reduce((sum, c) => sum + c.riskScore, 0) / retractedCitations.length
      : 0;
  const dependencyRatio = highRiskCitations.length / totalReferences;
  const avgCitationCount =
    retractedCitations.length > 0
      ? retractedCitations.reduce((sum, c) => sum + (c.paper?.citationCount ?? 0), 0) /
        retractedCitations.length
      : 0;
  const impactScore = Math.min(1, avgCitationCount / 1000);

  const overallRisk =
    0.35 * retractionRatio +
    0.30 * severityScore +
    0.20 * dependencyRatio +
    0.15 * impactScore;

  const clampedRisk = Math.min(1, Math.max(0, overallRisk));

  let level: "safe" | "low" | "medium" | "high" | "critical";
  if (clampedRisk >= 0.8) level = "critical";
  else if (clampedRisk >= 0.6) level = "high";
  else if (clampedRisk >= 0.4) level = "medium";
  else if (clampedRisk >= 0.2) level = "low";
  else level = "safe";

  return { score: clampedRisk, level };
}

export function buildAnalyzedCitation(
  ref: Reference,
  retraction: RetractionResult,
  aiAnalysis: CitationAnalysis,
  contextSnippet: string
): AnalyzedCitation {
  const riskScore = calculateCitationRiskScore(aiAnalysis, retraction.isRetracted, retraction.reason);
  const riskLevel = getRiskLevel(riskScore);

  return {
    paper: ref,
    isRetracted: retraction.isRetracted,
    retractionReason: retraction.reason,
    retractionDate: retraction.retractionDate,
    citationType: aiAnalysis.citationType,
    riskLevel,
    riskScore,
    contextSnippet,
    explanation: aiAnalysis.explanation,
    sectionWhereUsed: aiAnalysis.sectionWhereUsed,
  };
}
