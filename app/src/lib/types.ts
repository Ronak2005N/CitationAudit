export interface Paper {
  id: string;
  openalexId: string;
  doi: string | null;
  title: string;
  authors: string[];
  year: number | null;
  abstract: string;
  citationCount: number;
  referenceCount: number;
  isOpenAccess: boolean;
  oaUrl: string | null;
  venue: string | null;
}

export interface Reference {
  id: string;
  openalexId: string;
  doi: string | null;
  title: string;
  authors: string[];
  year: number | null;
  citationCount: number;
}

export interface RetractionResult {
  doi: string;
  isRetracted: boolean;
  retractionDate: string | null;
  retractionTimestamp: number | null;
  reason: string | null;
  source: string | null;
}

export type CitationType =
  | "methodology"
  | "background"
  | "comparison"
  | "result_dependency"
  | "general_reference";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface CitationAnalysis {
  citationType: CitationType;
  riskLevel: RiskLevel;
  riskScore: number;
  explanation: string;
  confidence: number;
  sectionWhereUsed: string;
  dependencyStrength: string;
}

export interface AnalyzedCitation {
  paper: Reference;
  isRetracted: boolean;
  retractionReason: string | null;
  retractionDate: string | null;
  citationType: CitationType;
  riskLevel: RiskLevel;
  riskScore: number;
  contextSnippet: string;
  explanation: string;
  sectionWhereUsed: string;
}

export interface GraphNode {
  id: string;
  label: string;
  color: string;
  size: number;
  isRetracted: boolean;
  citationCount: number;
  year: number | null;
}

export interface GraphEdge {
  source: string;
  target: string;
  color: string;
  isRetractedPath: boolean;
}

export interface AnalysisResult {
  paper: Paper;
  analysis: {
    overallRiskScore: number;
    riskLevel: "safe" | "low" | "medium" | "high" | "critical";
    totalReferences: number;
    resolvedReferences: number;
    retractedCount: number;
    retractedStrongDependency: number;
    highRiskCount: number;
    mediumRiskCount: number;
    lowRiskCount: number;
    citations: AnalyzedCitation[];
    graph: {
      nodes: GraphNode[];
      edges: GraphEdge[];
    };
  };
  processingTimeMs: number;
}

export interface OpenAlexWork {
  id: string;
  doi: string;
  title: string;
  abstract_inverted_index: Record<string, number[]> | null;
  authorships: Array<{
    author: { display_name: string; orcid?: string };
    institutions: Array<{ display_name: string }>;
  }>;
  publication_year: number;
  cited_by_count: number;
  referenced_works: string[];
  concepts: Array<{ display_name: string; score: number }>;
  open_access: { is_oa: boolean; oa_status: string; oa_url?: string };
  primary_location?: {
    source?: { display_name?: string };
  };
}

export interface CrossrefWork {
  status: string;
  message: {
    DOI: string;
    title: string[];
    "update-to"?: Array<{
      DOI: string;
      type: string;
      label: string;
      source: string;
      created: { "date-parts": number[][]; "date-time": string; timestamp: number };
      assertion?: Array<{
        label: string;
        group: string;
        explanation?: string;
      }>;
    }>;
  };
}
