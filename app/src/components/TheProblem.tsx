"use client";

import { ScrollReveal } from "./ScrollReveal";

const stats = [
  {
    value: "60,000+",
    label: "retracted papers indexed in Retraction Watch",
  },
  {
    value: "50+",
    label: "papers can cite one retracted study",
  },
  {
    value: "0",
    label: "tools exist to detect the dependency spread",
  },
];

export function TheProblem() {
  return (
    <section className="py-24 border-t border-surface-2">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-16">
            The problem
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-12 md:gap-8">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.value} delay={i * 0.06}>
              <div>
                <span className="font-mono text-5xl md:text-6xl font-bold text-bone block mb-4">
                  {stat.value}
                </span>
                <p className="text-putty text-sm leading-relaxed max-w-[36ch]">
                  {stat.label}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
