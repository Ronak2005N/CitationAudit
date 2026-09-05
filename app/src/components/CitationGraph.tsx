"use client";

import { motion, useReducedMotion } from "motion/react";
import { ScrollReveal } from "./ScrollReveal";

const graphNodes = [
  { id: "root", label: "Your Paper", color: "#FAFAFA", x: 250, y: 160, size: 22 },
  { id: "r1", label: "Smith 2019", color: "#22C55E", x: 100, y: 60, size: 14 },
  { id: "r2", label: "Jones 2021", color: "#22C55E", x: 400, y: 60, size: 14 },
  { id: "r3", label: "RETRACTED\nObokata 2014", color: "#EF4444", x: 80, y: 220, size: 18 },
  { id: "r4", label: "Chen 2020", color: "#F59E0B", x: 420, y: 220, size: 15 },
  { id: "r5", label: "Lee 2018", color: "#22C55E", x: 60, y: 140, size: 12 },
  { id: "r6", label: "Patel 2022", color: "#F97316", x: 440, y: 140, size: 16 },
  { id: "r7", label: "Kim 2021", color: "#22C55E", x: 180, y: 40, size: 11 },
  { id: "r8", label: "Wang 2019", color: "#F59E0B", x: 320, y: 40, size: 13 },
  { id: "r9", label: "Garcia 2023", color: "#22C55E", x: 150, y: 280, size: 12 },
  { id: "r10", label: "Liu 2020", color: "#22C55E", x: 350, y: 280, size: 12 },
];

const graphEdges = [
  { source: "root", target: "r1" },
  { source: "root", target: "r2" },
  { source: "root", target: "r3" },
  { source: "root", target: "r4" },
  { source: "root", target: "r5" },
  { source: "root", target: "r6" },
  { source: "root", target: "r7" },
  { source: "root", target: "r8" },
  { source: "r3", target: "r9" },
  { source: "r3", target: "r10" },
  { source: "r6", target: "r4" },
];

export function CitationGraph() {
  const reduce = useReducedMotion();

  return (
    <section className="py-24 border-t border-surface-2">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <div className="flex items-baseline gap-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              See the contagion spread
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="rounded-xl bg-surface border border-surface-2 overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-3 border-b border-surface-2">
              <div className="w-2 h-2 rounded-full bg-amber animate-pulse-amber" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-putty">
                Interactive Citation Graph
              </span>
            </div>

            <div className="p-6">
              <svg viewBox="0 0 500 320" className="w-full h-auto">
                {graphEdges.map((edge, i) => {
                  const from = graphNodes.find((n) => n.id === edge.source)!;
                  const to = graphNodes.find((n) => n.id === edge.target)!;
                  const isRetracted =
                    from.id === "r3" || to.id === "r3";
                  return (
                    <motion.line
                      key={i}
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke={isRetracted ? "#EF4444" : "#3F3F46"}
                      strokeWidth={isRetracted ? 2 : 1.5}
                      strokeDasharray={isRetracted ? "4 4" : "none"}
                      opacity={isRetracted ? 0.7 : 0.5}
                      initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: isRetracted ? 0.7 : 0.5 }}
                      viewport={{ once: true }}
                      transition={{
                        type: "spring",
                        duration: 0.8,
                        bounce: 0,
                        delay: 0.1 + i * 0.05,
                      }}
                    />
                  );
                })}
                {graphNodes.map((node, i) => (
                  <motion.g
                    key={node.id}
                    initial={reduce ? false : { opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      type: "spring",
                      duration: 0.5,
                      bounce: 0.1,
                      delay: 0.15 + i * 0.04,
                    }}
                    style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.size}
                      fill={node.color}
                      opacity={0.85}
                    />
                    {node.id === "r3" && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.size + 5}
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth={2}
                        strokeDasharray="4 3"
                        opacity={0.5}
                      />
                    )}
                    {node.label.split("\n").map((line, li) => (
                      <text
                        key={li}
                        x={node.x}
                        y={node.y + node.size + 12 + li * 11}
                        textAnchor="middle"
                        fill={node.id === "r3" ? "#EF4444" : "#A1A1AA"}
                        fontSize="8"
                        fontFamily="var(--font-geist-mono)"
                      >
                        {line}
                      </text>
                    ))}
                  </motion.g>
                ))}
              </svg>
            </div>

            <div className="flex flex-wrap items-center gap-6 px-6 py-4 border-t border-surface-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green" />
                <span className="font-mono text-[10px] text-putty">Safe reference</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber" />
                <span className="font-mono text-[10px] text-putty">At risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange" />
                <span className="font-mono text-[10px] text-putty">High risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red" />
                <span className="font-mono text-[10px] text-putty">Retracted</span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <div className="w-6 border-t-2 border-dashed border-red opacity-50" />
                <span className="font-mono text-[10px] text-putty">Contagion path</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
