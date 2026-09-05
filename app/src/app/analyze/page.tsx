import { Suspense } from "react";
import { AnalyzeView } from "./AnalyzeView";

function LoadingState() {
  return (
    <div className="min-h-screen bg-ground flex items-center justify-center">
      <div className="text-center">
        <div className="w-6 h-6 border-2 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-mono text-sm text-putty">Loading analysis...</p>
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AnalyzeView />
    </Suspense>
  );
}
