"use client";

import { useRef, useEffect } from "react";
import cytoscape from "cytoscape";
import CytoscapeComponent from "react-cytoscapejs";
import type { GraphNode, GraphEdge } from "@/lib/types";

interface CytoscapeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const NODE_COLORS = {
  root: "#FAFAFA",
  safe: "#22C55E",
  medium: "#F59E0B",
  high: "#F97316",
  critical: "#EF4444",
  retracted: "#EF4444",
};

function getNodeColor(node: GraphNode): string {
  if (node.id === "root") return NODE_COLORS.root;
  if (node.isRetracted) return NODE_COLORS.retracted;
  return node.color;
}

function getEdgeColor(edge: GraphEdge): string {
  if (edge.isRetractedPath) return "#EF4444";
  return "#3F3F46";
}

export function CytoscapeGraph({ nodes, edges }: CytoscapeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  useEffect(() => {
    if (!cyRef.current || nodes.length === 0) return;

    const cy = cyRef.current;
    cy.nodes().ungrabify();
    cy.fit(undefined, 40);
  }, [nodes]);

  if (nodes.length === 0) {
    return (
      <div
        ref={containerRef}
        className="w-full h-[400px] bg-ground rounded-lg border border-surface-2 flex items-center justify-center"
      >
        <p className="font-mono text-xs text-putty">No graph data</p>
      </div>
    );
  }

  const elements: cytoscape.ElementDefinition[] = [
    ...nodes.map((node) => ({
      data: {
        id: node.id,
        label: node.label,
        color: getNodeColor(node),
        size: node.size,
        isRetracted: node.isRetracted,
      },
    })),
    ...edges.map((edge, i) => ({
      data: {
        id: `e${i}`,
        source: edge.source,
        target: edge.target,
        color: getEdgeColor(edge),
        isRetractedPath: edge.isRetractedPath,
      },
    })),
  ];

  const stylesheet: cytoscape.StylesheetJsonBlock[] = [
    {
      selector: "node",
      style: {
        label: "data(label)",
        "background-color": "data(color)",
        width: "data(size)",
        height: "data(size)",
        "font-size": "9px",
        "font-family": "var(--font-geist-mono), monospace",
        color: "#A1A1AA",
        "text-valign": "bottom",
        "text-margin-y": 6,
        "text-wrap": "ellipsis",
        "text-max-width": "80px",
        "border-width": 0,
        "overlay-opacity": 0,
      } as cytoscape.Css.Node,
    },
    {
      selector: "node[id = 'root']",
      style: {
        "background-color": "#FAFAFA",
        width: 28,
        height: 28,
        "font-size": "10px",
        color: "#FAFAFA",
        "font-weight": "bold",
      } as cytoscape.Css.Node,
    },
    {
      selector: "node[?isRetracted]",
      style: {
        "border-width": 2,
        "border-color": "#EF4444",
        "border-style": "dashed",
      } as cytoscape.Css.Node,
    },
    {
      selector: "edge",
      style: {
        width: 1.5,
        "line-color": "data(color)",
        "curve-style": "bezier",
        "target-arrow-shape": "none",
        opacity: 0.8,
      } as cytoscape.Css.Edge,
    },
    {
      selector: "edge[?isRetractedPath]",
      style: {
        width: 2.5,
        "line-color": "#EF4444",
        "line-style": "dashed",
        opacity: 1,
      } as cytoscape.Css.Edge,
    },
    {
      selector: "node:selected",
      style: {
        "border-width": 2,
        "border-color": "#F59E0B",
      } as cytoscape.Css.Node,
    },
  ];

  const layout: cytoscape.LayoutOptions = {
    name: "concentric",
    concentric: (node: cytoscape.NodeSingular) => {
      return node.id() === "root" ? 10 : 1;
    },
    levelWidth: () => 1,
    padding: 30,
    animate: true,
    animationDuration: 500,
  };

  return (
    <div ref={containerRef} className="w-full h-[400px] bg-ground rounded-lg">
      <CytoscapeComponent
        elements={elements}
        stylesheet={stylesheet}
        layout={layout}
        cy={(cy: cytoscape.Core) => {
          cyRef.current = cy;
        }}
        className="w-full h-full"
      />
    </div>
  );
}
