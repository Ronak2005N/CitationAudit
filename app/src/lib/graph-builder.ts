import type { AnalyzedCitation, GraphNode, GraphEdge } from "./types";

function getRiskColor(riskLevel: string, isRetracted: boolean): string {
  if (isRetracted) return "#EF4444";
  switch (riskLevel) {
    case "critical":
      return "#EF4444";
    case "high":
      return "#F97316";
    case "medium":
      return "#F59E0B";
    case "low":
    default:
      return "#22C55E";
  }
}

function getNodeSize(citationCount: number, isRetracted: boolean): number {
  const base = isRetracted ? 16 : 12;
  const scaled = Math.min(8, Math.log2(Math.max(1, citationCount)) * 1.5);
  return base + scaled;
}

export function buildGraph(
  paperTitle: string,
  citations: AnalyzedCitation[]
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  nodes.push({
    id: "root",
    label: paperTitle.length > 30 ? paperTitle.slice(0, 27) + "..." : paperTitle,
    color: "#FAFAFA",
    size: 22,
    isRetracted: false,
    citationCount: citations.length,
    year: null,
  });

  for (const citation of citations) {
    const nodeId = citation.paper.openalexId || citation.paper.doi || citation.paper.id;
    const color = getRiskColor(citation.riskLevel, citation.isRetracted);
    const size = getNodeSize(citation.paper.citationCount, citation.isRetracted);

    nodes.push({
      id: nodeId,
      label:
        citation.paper.title.length > 25
          ? citation.paper.title.slice(0, 22) + "..."
          : citation.paper.title,
      color,
      size,
      isRetracted: citation.isRetracted,
      citationCount: citation.paper.citationCount,
      year: citation.paper.year,
    });

    edges.push({
      source: "root",
      target: nodeId,
      color: citation.isRetracted ? "#EF4444" : "#3F3F46",
      isRetractedPath: citation.isRetracted,
    });
  }

  return { nodes, edges };
}
