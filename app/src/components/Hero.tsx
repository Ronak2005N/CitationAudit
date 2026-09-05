"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";

export function Hero() {
  const [doi, setDoi] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const reduce = useReducedMotion();

  const handleAnalyze = () => {
    const trimmed = doi.trim();
    if (!trimmed) return;
    router.push(`/analyze?doi=${encodeURIComponent(trimmed)}`);
  };

  const graphNodes = [
    { id: "root", label: "Your Paper", color: "#FAFAFA", x: 200, y: 120, size: 18 },
    { id: "ref1", label: "Safe Ref", color: "#22C55E", x: 80, y: 50, size: 12 },
    { id: "ref2", label: "Safe Ref", color: "#22C55E", x: 320, y: 50, size: 12 },
    { id: "ref3", label: "Retracted", color: "#EF4444", x: 100, y: 200, size: 14 },
    { id: "ref4", label: "At Risk", color: "#F59E0B", x: 300, y: 200, size: 13 },
    { id: "ref5", label: "Safe Ref", color: "#22C55E", x: 50, y: 120, size: 10 },
    { id: "ref6", label: "High Risk", color: "#F97316", x: 350, y: 120, size: 13 },
  ];

  const graphEdges = [
    { source: "root", target: "ref1" },
    { source: "root", target: "ref2" },
    { source: "root", target: "ref3" },
    { source: "root", target: "ref4" },
    { source: "root", target: "ref5" },
    { source: "root", target: "ref6" },
    { source: "ref3", target: "ref4" },
  ];

  return (
    <section className="relative min-h-[100dvh] flex items-center">
      <div className="mx-auto w-full max-w-7xl px-6 py-24 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0 }}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-orange mb-6">
              Research Integrity Scanner
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] mb-6">
              Citation
              <br />
              Contagion
            </h1>
            <p className="text-putty text-lg leading-relaxed max-w-[48ch] mb-10">
              Detect when scientific papers rely on retracted research. See
              how potential problems spread through the scientific literature.
            </p>

            <div
              className={`relative rounded-lg transition-shadow duration-150 ${
                isFocused ? "shadow-[0_0_0_2px_var(--amber)]" : ""
              }`}
            >
              <div className="flex items-stretch rounded-lg bg-surface border border-surface-2 overflow-hidden">
                <div className="flex-1 flex items-center px-4">
                  <span className="font-mono text-putty text-sm select-none mr-2">
                    DOI
                  </span>
                  <input
                    type="text"
                    value={doi}
                    onChange={(e) => setDoi(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAnalyze(); }}
                    placeholder="10.1234/example"
                    className="flex-1 bg-transparent font-mono text-bone text-sm py-4 outline-none placeholder:text-putty/50"
                  />
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={!doi.trim()}
                  className="px-6 py-4 bg-orange text-ground font-mono text-sm font-semibold uppercase tracking-wider hover:bg-orange/90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
                >
                  Analyze
                </button>
              </div>
            </div>

            <p className="mt-4 font-mono text-xs text-putty/60">
              Or upload a PDF to extract references automatically
            </p>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", duration: 0.6, bounce: 0, delay: 0.15 }}
            className="relative"
          >
            <div className="relative rounded-xl bg-surface border border-surface-2 p-6 overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-amber animate-pulse-amber" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-putty">
                  Citation Graph Preview
                </span>
              </div>

              <svg viewBox="0 0 400 260" className="w-full h-auto">
                {graphEdges.map((edge, i) => {
                  const from = graphNodes.find((n) => n.id === edge.source)!;
                  const to = graphNodes.find((n) => n.id === edge.target)!;
                  return (
                    <motion.line
                      key={i}
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke="#3F3F46"
                      strokeWidth={1.5}
                      initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        duration: 0.6,
                        bounce: 0,
                        delay: 0.3 + i * 0.08,
                      }}
                    />
                  );
                })}
                {graphNodes.map((node, i) => (
                  <motion.g
                    key={node.id}
                    initial={reduce ? false : { opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      type: "spring",
                      duration: 0.4,
                      bounce: 0.1,
                      delay: 0.2 + i * 0.06,
                    }}
                    style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.size}
                      fill={node.color}
                      opacity={0.9}
                    />
                    {node.id === "ref3" && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.size + 4}
                        fill="none"
                        stroke={node.color}
                        strokeWidth={1.5}
                        strokeDasharray="3 3"
                        opacity={0.6}
                      />
                    )}
                    <text
                      x={node.x}
                      y={node.y + node.size + 14}
                      textAnchor="middle"
                      fill="#A1A1AA"
                      fontSize="9"
                      fontFamily="var(--font-geist-mono)"
                    >
                      {node.label}
                    </text>
                  </motion.g>
                ))}
              </svg>

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-surface-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green" />
                  <span className="font-mono text-[10px] text-putty">Safe</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber" />
                  <span className="font-mono text-[10px] text-putty">At Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange" />
                  <span className="font-mono text-[10px] text-putty">High Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red" />
                  <span className="font-mono text-[10px] text-putty">Retracted</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
