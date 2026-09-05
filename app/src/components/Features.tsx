"use client";

import { ScrollReveal } from "./ScrollReveal";

const features = [
  {
    label: "AI CONTEXT ANALYSIS",
    title: "Understands how you cite",
    description:
      "Gemini Flash reads the sentence where each citation appears and classifies it: methodology, background, comparison, or result dependency.",
  },
  {
    label: "REAL RETRACTION DATA",
    title: "Retraction Watch via Crossref",
    description:
      "Every reference is checked against the live Retraction Watch database, updated daily. No stale data, no manual checks.",
  },
  {
    label: "INTERACTIVE GRAPH",
    title: "See the contagion spread",
    description:
      "Color-coded citation graph shows safe references in green, at-risk in amber, and retracted in red. Click any node for details.",
  },
  {
    label: "RISK SCORING",
    title: "Quantified danger, not just a flag",
    description:
      "A weighted algorithm considers citation type, retraction reason, section importance, and chain depth to produce an actionable score.",
  },
];

export function Features() {
  return (
    <section className="py-24 border-t border-surface-2">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-16">
            Built for researchers
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
          {features.map((f, i) => (
            <ScrollReveal key={f.label} delay={i * 0.04}>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-orange block mb-2">
                  {f.label}
                </span>
                <h3 className="text-lg font-semibold text-bone mb-2">
                  {f.title}
                </h3>
                <p className="text-putty text-sm leading-relaxed max-w-[44ch]">
                  {f.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
