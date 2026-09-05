"use client";

import { ScrollReveal } from "./ScrollReveal";

const citations = [
  {
    title: "STAP Pluripotent Cell Properties",
    author: "Obokata et al.",
    year: "2014",
    type: "methodology",
    risk: "critical",
    riskScore: 0.95,
    snippet:
      '"We adopted the experimental protocol described by Obokata et al. for our cell reprogramming assays..."',
  },
  {
    title: "CRISPR Delivery Mechanisms",
    author: "Patel et al.",
    year: "2022",
    type: "result_dependency",
    risk: "high",
    riskScore: 0.72,
    snippet:
      '"Our findings extend the delivery framework established by Patel et al. to a new therapeutic context..."',
  },
  {
    title: "Meta-analysis of Oncology Trials",
    author: "Chen et al.",
    year: "2020",
    type: "background",
    risk: "medium",
    riskScore: 0.35,
    snippet:
      '"Previous studies have explored various approaches to immunotherapy (Chen et al., 2020)..."',
  },
  {
    title: "Statistical Methods Review",
    author: "Smith et al.",
    year: "2019",
    type: "general_reference",
    risk: "low",
    riskScore: 0.08,
    snippet:
      '"Standard statistical methods were applied as described in Smith et al..."',
  },
];

const riskColors: Record<string, string> = {
  critical: "bg-red text-ground",
  high: "bg-orange text-ground",
  medium: "bg-amber text-ground",
  low: "bg-surface-2 text-bone",
};

const typeLabels: Record<string, string> = {
  methodology: "Methodology",
  result_dependency: "Result Dependency",
  background: "Background",
  general_reference: "General Reference",
};

export function RiskBreakdown() {
  return (
    <section className="py-24 border-t border-surface-2">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-16">
            Quantified risk, not just a red flag
          </h2>
        </ScrollReveal>

        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          <ScrollReveal>
            <div className="rounded-xl bg-surface border border-surface-2 p-8">
              <div className="flex flex-col items-center">
                <div className="relative w-36 h-36">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="#3F3F46"
                      strokeWidth="6"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="#F97316"
                      strokeWidth="6"
                      strokeDasharray={`${0.72 * 264} ${264}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-mono text-3xl font-bold text-orange">
                      72%
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-putty">
                      Risk Score
                    </span>
                  </div>
                </div>

                <div className="mt-8 w-full space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-putty">
                      Total references
                    </span>
                    <span className="font-mono text-sm font-semibold text-bone">
                      47
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-putty">
                      Retracted
                    </span>
                    <span className="font-mono text-sm font-semibold text-red">
                      3
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-putty">
                      High risk
                    </span>
                    <span className="font-mono text-sm font-semibold text-orange">
                      2
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-putty">
                      Downstream affected
                    </span>
                    <span className="font-mono text-sm font-semibold text-amber">
                      37
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.06}>
            <div className="space-y-4">
              {citations.map((c) => (
                <div
                  key={c.title}
                  className="rounded-lg bg-surface border border-surface-2 p-5"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-bone truncate">
                        {c.title}
                      </h4>
                      <p className="font-mono text-xs text-putty mt-0.5">
                        {c.author}, {c.year}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-[10px] text-putty">
                        {typeLabels[c.type]}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold uppercase ${riskColors[c.risk]}`}
                      >
                        {c.risk}
                      </span>
                    </div>
                  </div>
                  <p className="font-mono text-xs text-putty/70 leading-relaxed italic">
                    {c.snippet}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full bg-surface-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${c.riskScore * 100}%`,
                          backgroundColor:
                            c.risk === "critical"
                              ? "#EF4444"
                              : c.risk === "high"
                              ? "#F97316"
                              : c.risk === "medium"
                              ? "#F59E0B"
                              : "#3F3F46",
                        }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-putty">
                      {Math.round(c.riskScore * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
