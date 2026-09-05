"use client";

export function Footer() {
  return (
    <footer className="border-t border-surface-2 py-12 mt-auto">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="font-mono text-sm font-semibold text-bone tracking-tight">
              Citation Contagion
            </span>
            <p className="text-putty text-xs mt-1 max-w-[40ch]">
              A research dependency scanner that detects when scientific papers
              rely on retracted research.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="#"
              className="font-mono text-xs text-putty hover:text-bone transition-colors duration-150"
            >
              GitHub
            </a>
            <a
              href="#"
              className="font-mono text-xs text-putty hover:text-bone transition-colors duration-150"
            >
              About
            </a>
            <a
              href="#"
              className="font-mono text-xs text-putty hover:text-bone transition-colors duration-150"
            >
              API
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-surface-2">
          <p className="font-mono text-[10px] text-putty/50">
            Built for hackathon demo. Data sourced from OpenAlex, Crossref, and
            Retraction Watch.
          </p>
        </div>
      </div>
    </footer>
  );
}
