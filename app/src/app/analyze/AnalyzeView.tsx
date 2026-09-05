"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import type { AnalysisResult } from "@/lib/types";
import { CytoscapeGraph } from "@/components/CytoscapeGraph";

type Status = "idle" | "loading" | "success" | "error";

function RiskMeter({ score, level }: { score: number; level: string }) {
  const pct = Math.round(score * 100);
  const circumference = 2 * Math.PI * 42;
  const offset = circumference * (1 - score);

  const levelColor: Record<string, string> = {
    safe: "var(--green)",
    low: "var(--green)",
    medium: "var(--amber)",
    high: "var(--orange)",
    critical: "var(--red)",
  };
  const color = levelColor[level] ?? "var(--putty)";

  return (
    <div className="relative w-32 h-32">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--surface-2)" strokeWidth="6" />
        <motion.circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-2xl font-bold" style={{ color }}>
          {pct}%
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-putty">
          {level}
        </span>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <div className="bg-surface border border-surface-2 rounded-lg p-4">
      <p className="font-mono text-[10px] uppercase tracking-wider text-putty mb-1">{label}</p>
      <p className="font-mono text-2xl font-bold" style={{ color: color ?? "var(--bone)" }}>
        {value}
      </p>
    </div>
  );
}

function CitationCard({
  citation,
  index,
}: {
  citation: AnalysisResult["analysis"]["citations"][0];
  index: number;
}) {
  const riskColor: Record<string, string> = {
    low: "var(--green)",
    medium: "var(--amber)",
    high: "var(--orange)",
    critical: "var(--red)",
  };

  const badgeBg: Record<string, string> = {
    low: "rgba(34,197,94,0.12)",
    medium: "rgba(245,158,11,0.12)",
    high: "rgba(249,115,22,0.12)",
    critical: "rgba(239,68,68,0.12)",
  };

  const color = riskColor[citation.riskLevel] ?? "var(--putty)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * Math.min(index, 10), duration: 0.3 }}
      className={`bg-surface border rounded-lg p-4 ${
        citation.isRetracted ? "border-red/40" : "border-surface-2"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-mono text-sm text-bone leading-snug flex-1 min-w-0">
          {citation.paper.title}
        </h3>
        <span
          className="shrink-0 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded"
          style={{ color, background: badgeBg[citation.riskLevel] ?? "transparent" }}
        >
          {citation.riskLevel}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-2 font-mono text-[11px] text-putty">
        <span>{citation.paper.authors?.slice(0, 2).join(", ")}{citation.paper.authors && citation.paper.authors.length > 2 ? " et al." : ""}</span>
        {citation.paper.year && <span>({citation.paper.year})</span>}
        {citation.paper.citationCount > 0 && (
          <span>{citation.paper.citationCount.toLocaleString()} citations</span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-putty bg-surface-2 px-2 py-0.5 rounded">
          {citation.citationType.replace(/_/g, " ")}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-putty bg-surface-2 px-2 py-0.5 rounded">
          {citation.sectionWhereUsed}
        </span>
        {citation.isRetracted && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-red bg-red/10 px-2 py-0.5 rounded">
            RETRACTED
          </span>
        )}
      </div>

      {citation.contextSnippet && (
        <p className="font-mono text-xs text-putty/70 italic border-l-2 border-surface-2 pl-3 mb-2">
          &ldquo;{citation.contextSnippet}&rdquo;
        </p>
      )}

      <p className="font-mono text-xs text-putty leading-relaxed">{citation.explanation}</p>
    </motion.div>
  );
}

export function AnalyzeView() {
  const searchParams = useSearchParams();
  const doi = searchParams.get("doi");

  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = useCallback(async (targetDoi: string) => {
    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doi: targetDoi }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? `Analysis failed (${res.status})`);
      }

      const data: AnalysisResult = await res.json();
      setResult(data);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (doi) runAnalysis(doi);
  }, [doi, runAnalysis]);

  if (!doi) {
    return (
      <div className="min-h-screen bg-ground flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="font-mono text-xl text-bone mb-4">No DOI provided</h1>
          <p className="font-mono text-sm text-putty mb-8">
            Enter a DOI on the landing page to analyze a paper&apos;s citations.
          </p>
          <Link
            href="/"
            className="inline-block font-mono text-sm px-6 py-3 bg-orange text-ground rounded-lg hover:bg-orange/90 active:scale-[0.98] transition-all duration-150"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ground">
      {/* Header */}
      <header className="border-b border-surface-2 bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-mono text-sm text-bone hover:text-orange transition-colors">
            Citation Contagion
          </Link>
          <div className="flex items-center gap-4">
            {status === "loading" && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber animate-pulse-amber" />
                <span className="font-mono text-xs text-putty">Analyzing...</span>
              </div>
            )}
            {result && (
              <span className="font-mono text-xs text-putty">
                {result.processingTimeMs.toLocaleString()}ms
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Error State */}
      {status === "error" && (
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <div className="w-12 h-12 rounded-full bg-red/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-red text-xl">!</span>
          </div>
          <h2 className="font-mono text-lg text-bone mb-2">Analysis Failed</h2>
          <p className="font-mono text-sm text-putty mb-8">{error}</p>
          <Link
            href="/"
            className="inline-block font-mono text-sm px-6 py-3 bg-orange text-ground rounded-lg hover:bg-orange/90 active:scale-[0.98] transition-all duration-150"
          >
            Try Another DOI
          </Link>
        </div>
      )}

      {/* Loading State */}
      {status === "loading" && (
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="font-mono text-lg text-bone mb-2">Scanning citations...</h2>
          <p className="font-mono text-sm text-putty">
            Checking {doi} against retraction databases
          </p>
        </div>
      )}

      {/* Results */}
      {status === "success" && result && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Paper Header */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-orange mb-3">
              Analysis Complete
            </p>
            <h1 className="font-mono text-xl md:text-2xl text-bone font-semibold leading-snug mb-3">
              {result.paper.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-putty">
              <span>{result.paper.authors?.slice(0, 3).join(", ")}{result.paper.authors && result.paper.authors.length > 3 ? " et al." : ""}</span>
              {result.paper.year && <span>({result.paper.year})</span>}
              {result.paper.venue && <span>{result.paper.venue}</span>}
              {result.paper.doi && (
                <a
                  href={`https://doi.org/${result.paper.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange hover:underline"
                >
                  DOI
                </a>
              )}
            </div>
          </motion.div>

          {/* Risk Score + Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 mb-8"
          >
            <div className="bg-surface border border-surface-2 rounded-xl p-6 flex items-center gap-6">
              <RiskMeter
                score={result.analysis.overallRiskScore}
                level={result.analysis.riskLevel}
              />
              <div>
                <h2 className="font-mono text-sm text-bone font-semibold mb-1">Overall Risk</h2>
                <p className="font-mono text-xs text-putty leading-relaxed">
                  {result.analysis.riskLevel === "safe"
                    ? "No retracted citations detected."
                    : result.analysis.riskLevel === "critical"
                    ? "Critical: Direct dependency on retracted research."
                    : result.analysis.riskLevel === "high"
                    ? "High risk: Multiple retracted citations."
                    : "Moderate risk detected in citation network."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                label="References"
                value={result.analysis.totalReferences}
              />
              <StatCard
                label="Retracted"
                value={result.analysis.retractedCount}
                color={result.analysis.retractedCount > 0 ? "var(--red)" : "var(--green)"}
              />
              <StatCard
                label="High Risk"
                value={result.analysis.highRiskCount}
                color={result.analysis.highRiskCount > 0 ? "var(--orange)" : "var(--green)"}
              />
              <StatCard
                label="Medium Risk"
                value={result.analysis.mediumRiskCount}
                color={result.analysis.mediumRiskCount > 0 ? "var(--amber)" : "var(--green)"}
              />
            </div>
          </motion.div>

          {/* Cytoscape Graph */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-surface border border-surface-2 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-amber animate-pulse-amber" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-putty">
                  Citation Graph
                </span>
              </div>
              <CytoscapeGraph
                nodes={result.analysis.graph.nodes}
                edges={result.analysis.graph.edges}
              />
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-surface-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--bone)" }} />
                  <span className="font-mono text-[10px] text-putty">Paper</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--green)" }} />
                  <span className="font-mono text-[10px] text-putty">Safe</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--amber)" }} />
                  <span className="font-mono text-[10px] text-putty">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--orange)" }} />
                  <span className="font-mono text-[10px] text-putty">High</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--red)" }} />
                  <span className="font-mono text-[10px] text-putty">Retracted</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Citation List */}
          <div className="mb-8">
            <h2 className="font-mono text-sm text-bone font-semibold mb-4">
              Citation Details ({result.analysis.citations.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.analysis.citations.map((citation, i) => (
                <CitationCard key={citation.paper.doi ?? citation.paper.id} citation={citation} index={i} />
              ))}
            </div>
          </div>

          {/* Back Link */}
          <div className="text-center pb-12">
            <Link
              href="/"
              className="inline-block font-mono text-sm px-6 py-3 bg-surface border border-surface-2 text-putty rounded-lg hover:text-bone hover:border-putty transition-all duration-150"
            >
              Analyze Another Paper
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
