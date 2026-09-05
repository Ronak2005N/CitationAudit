"use client";

import { ScrollReveal } from "./ScrollReveal";

const steps = [
  {
    number: "01",
    label: "INPUT",
    title: "Enter DOI or upload PDF",
    description:
      "Provide a paper via DOI lookup or upload a PDF. Our system extracts the reference list automatically.",
  },
  {
    number: "02",
    label: "ANALYZE",
    title: "AI checks retractions and context",
    description:
      "Each reference is checked against Retraction Watch. AI analyzes how each citation is used — methodology, background, or result dependency.",
  },
  {
    number: "03",
    label: "REPORT",
    title: "Graph, risk score, recommendations",
    description:
      "See the contagion spread in an interactive graph. Get a quantified risk score with a clear breakdown of what matters.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 border-t border-surface-2">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-16">
            How it works
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-12 md:gap-8">
          {steps.map((step, i) => (
            <ScrollReveal key={step.number} delay={i * 0.06}>
              <div className="relative">
                <span className="font-mono text-5xl font-bold text-surface-2 select-none">
                  {step.number}
                </span>
                <div className="mt-4 mb-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-orange">
                    {step.label}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-bone mb-2">
                  {step.title}
                </h3>
                <p className="text-putty text-sm leading-relaxed max-w-[38ch]">
                  {step.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
