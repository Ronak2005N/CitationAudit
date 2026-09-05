# Citation Contagion — Full Session Context

> **Purpose:** This file captures the complete state of the project so a new AI session can pick up exactly where we left off without losing any context.

---

## 1. Project Overview

**Name:** Citation Contagion

**One-liner:** A research dependency scanner that detects when scientific papers rely on retracted research and shows how that potential problem spreads through the scientific literature.

**Problem:** When a scientific paper gets retracted (fake data, wrong methodology, plagiarism), the papers that cited it continue to exist without showing they may be affected. There is no tool that automatically checks all references for retractions, understands HOW each citation is used, calculates a quantified risk score, and visualizes the spread of contamination through citation networks.

**Solution:** Upload a paper (DOI or PDF), extract references, check each for retraction status via Crossref/Retraction Watch, analyze citation context with AI (Gemini Flash), calculate a risk score, and display an interactive citation graph with color-coded risk levels.

**MVP Scope:**
- Biomedical research focus
- Single paper analysis (one DOI or PDF upload)
- 1-3 hop citation chain
- Real retractions from Retraction Watch via Crossref
- Interactive citation graph (Cytoscape.js)
- Risk score with detailed breakdown
- No user accounts required

---

## 2. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 | Project scaffolded at `Citation Contagion/app/` |
| Animation | Motion (framer-motion successor) | `motion/react` imports |
| Graph Viz | Cytoscape.js + react-cytoscapejs | Installed and used in `/analyze` page for interactive citation graph |
| Database | Supabase (PostgreSQL + pgvector + pgRouting) | Not yet set up |
| PDF Parsing | PyMuPDF + FastAPI (Python backend) | Not yet built |
| Backend APIs | Next.js API Routes (src/app/api/) | Built — 3 routes with OpenAlex, Crossref, Gemini |
| LLM | Google Gemini Flash (gemini-2.5-flash) | Free tier: 250 RPD, 10 RPM, 1M context |
| Fonts | Geist + Geist Mono | Already configured in layout.tsx |

---

## 3. Free APIs & Rate Limits

### OpenAlex (Primary paper data)
- **URL:** `https://api.openalex.org`
- **Auth:** API key (free, $1/day budget)
- **Key endpoint:** `GET /works/doi:{DOI}?api_key=KEY` — single paper lookup
- **Batch:** `GET /works?filter=openalex:ID1|ID2|...&per_page=100` — up to 100 IDs
- **Key field:** `referenced_works` — array of OpenAlex IDs this paper cites
- **Rate:** 100 req/sec, ~10K list calls/day free

### Crossref (Retraction detection)
- **URL:** `https://api.crossref.org`
- **Auth:** None required, polite pool via `mailto` param
- **Key endpoint:** `GET /v1/works/{DOI}?mailto=email` — check retraction
- **Retraction check:** Look for `update-to` field with `type: "retraction"`
- **Rate:** 10 req/sec with polite pool

### Semantic Scholar (Embeddings, bulk data)
- **URL:** `https://api.semanticscholar.org`
- **Auth:** Free API key (1 req/sec dedicated)
- **Not needed for MVP** — OpenAlex covers paper metadata

### PubMed (Biomedical papers)
- **URL:** `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/`
- **Auth:** Free API key (10 req/sec)
- **Not needed for MVP** — OpenAlex covers biomedical

### Unpaywall (Open access PDFs)
- **URL:** `https://api.unpaywall.org/v2/{DOI}?email=email`
- **Auth:** Email only, 100K/day
- **Not needed for MVP**

### Google Gemini Flash (Citation context analysis)
- **URL:** `https://generativelanguage.googleapis.com`
- **Auth:** API key (free)
- **Free tier:** 250 requests/day, 10 RPM, 250K TPM, 1M context window
- **Model:** `gemini-2.5-flash`
- **Use:** Analyze how each citation is used (methodology/background/comparison)

---

## 4. Design Direction

### Chosen Direction: Creator-Hardware Desk Instrument (Scientific Adaptation)

**Concept:** A precision instrument you operate, not a website you visit. Every control clicks with tactile certainty. The one orange key is obviously, satisfyingly, the point. Adapted for scientific credibility — no audio-synth or gaming aesthetics.

**Design Dials:**
- DESIGN_VARIANCE: 6 (offset compositions, not perfectly symmetrical)
- MOTION_INTENSITY: 4 (fluid CSS, no complex choreography)
- VISUAL_DENSITY: 5 (data-dense but readable)

### Color System (Locked)
```
GROUND:     #18181B  (zinc-900, near-black charcoal — page background)
SURFACE:    #27272A  (zinc-800, raised panels, cards)
SURFACE-2:  #3F3F46  (zinc-700, borders, interactive elements)
BONE:       #FAFAFA  (zinc-50, primary text)
PUTTY:      #A1A1AA  (zinc-400, secondary text, labels)
ORANGE:     #F97316  (orange-500, single accent — retracted flags + primary CTA)
AMBER:      #F59E0B  (amber-500, processing/status glow)
GREEN:      #22C55E  (green-500, safe references)
RED:        #EF4444  (red-500, critical retracted)
```

**Rules:**
- One accent (orange) used sparingly: primary CTA, retracted paper highlights, flagged risk items
- Amber for: processing indicator, live status
- Green/Red only in: graph nodes, risk badges, status indicators
- No gradients. No glass. No glow effects.

### Typography (Locked)
- **Display:** Geist, 600 weight, tracking-tight — `text-4xl md:text-5xl lg:text-6xl`
- **Body:** Geist, 400 weight, `text-base` leading-relaxed, max-width 65ch
- **Mono/Data:** Geist Mono, 400 weight — DOI inputs, risk scores, paper IDs, technical labels
- **No serif.** Serious and trustworthy = sans-serif display.
- **Mono labels:** `text-[10px] uppercase tracking-[0.2em]` for section labels

### Explicit Bans (Craft Floor)
- No gradient text (weight/size for emphasis only)
- No glass/blur as decoration
- No hardware-knob UI elements (no rotary controls, button arrays)
- No decorative LED dots or status bars
- No centered hero with gradient text
- No "eyebrow" labels above section headings (max 1 per 3 sections)
- No em-dashes in copy
- No Inter font (using Geist)
- No generic SaaS purple/blue gradients
- No cyberpunk neon or glow effects

---

## 5. What Has Been Built

### Project Structure
```
Citation Contagion/
├── PROJECT.md                    # Full 2200-line project specification
├── PRODUCT.md                    # Product truth (impeccable init output)
├── context_md/
│   └── SESSION_CONTEXT.md        # This file
└── app/                          # Next.js project root
    ├── package.json
    ├── .env.local                # API key placeholders (OPENALEX, CROSSREF, GEMINI)
    ├── src/
    │   ├── app/
    │   │   ├── globals.css       # Custom CSS vars (gunmetal/bone palette)
    │   │   ├── layout.tsx        # Root layout (Geist fonts, dark mode)
    │   │   ├── page.tsx          # Main landing page (composes all sections)
    │   │   ├── analyze/
    │   │   │   ├── page.tsx      # Server wrapper with Suspense
    │   │   │   └── AnalyzeView.tsx # Client component — full analysis UI
    │   │   └── api/
    │   │       ├── papers/[doi]/route.ts    # GET — paper lookup (OpenAlex)
    │   │       ├── retraction/check/route.ts # POST — retraction check (Crossref)
    │   │       └── analyze/route.ts         # POST — full analysis orchestrator
    │   ├── components/
    │   │   ├── ScrollReveal.tsx  # Scroll-reveal wrapper (motion)
    │   │   ├── Hero.tsx          # Hero with DOI input + SVG graph preview
    │   │   ├── HowItWorks.tsx    # 3-step explanation
    │   │   ├── TheProblem.tsx    # Stats section (60K+, 50+, 0)
    │   │   ├── CitationGraph.tsx # Interactive graph demo (SVG, full section)
    │   │   ├── RiskBreakdown.tsx # Risk score circle + citation cards
    │   │   ├── Features.tsx      # 2x2 feature grid
    │   │   ├── Footer.tsx        # Product name + links
    │   │   └── CytoscapeGraph/
    │   │       └── index.tsx     # Interactive Cytoscape.js citation graph
    │   └── lib/
    │       ├── types.ts          # All TypeScript interfaces
    │       ├── openalex.ts       # OpenAlex API client
    │       ├── crossref.ts       # Crossref retraction checker
    │       ├── gemini.ts         # Gemini Flash citation analyzer
    │       ├── risk-scorer.ts    # Risk calculation algorithm
    │       └── graph-builder.ts  # Graph data construction
    └── node_modules/
```

### Analyze Page (Built)
- `/analyze?doi=10.xxxx/yyyy` — full analysis results page
- Server wrapper (`page.tsx`) with `Suspense` boundary for `useSearchParams`
- Client component (`AnalyzeView.tsx`) handles all states: idle, loading, success, error
- Features: paper header, risk meter (animated SVG circle), stat cards, Cytoscape.js interactive graph, citation detail cards
- Hero "Analyze" button navigates to `/analyze?doi=...` on click/Enter

### Landing Page Sections (All Built)
1. **Hero** — Left: headline + subtext + DOI input (recessed key slot) + orange ANALYZE button. Right: animated SVG citation graph with color-coded nodes.
2. **HowItWorks** — 3 steps: Input → Analyze → Report. Large step numbers, mono labels.
3. **TheProblem** — Three big mono stats: 60,000+ / 50+ / 0.
4. **CitationGraph** — Full-width interactive graph demo with 11 nodes, color legend, contagion path indicator.
5. **RiskBreakdown** — Left: 72% risk score circle with breakdown stats. Right: 4 citation cards with risk badges, progress bars, context snippets.
6. **Features** — 2x2 grid: AI Context Analysis, Real Retraction Data, Interactive Graph, Risk Scoring.
7. **Footer** — Product name, one-line description, GitHub/About/API links.

### Animations (Implemented)
- Hero entrance: spring fade-in + scale
- Graph nodes: staggered spring entrance with individual delays
- Graph edges: animated path drawing
- Section scroll reveals: opacity + translateY(8px) + blur(4px), spring bounce 0
- Pipeline status dots: amber pulse animation
- Input focus: amber glow border
- Button hover: scale 0.98 active state
- Reduced motion: all animations collapse to instant under `prefers-reduced-motion`

### Build Status
- `next build` compiles clean (0 errors) — 7 routes (2 static, 5 dynamic)
- `tsc --noEmit` passes (0 errors)
- Dev server runs on `http://localhost:3000`
- Routes: `/`, `/analyze`, `/api/analyze`, `/api/papers/[doi]`, `/api/retraction/check`

---

## 6. Backend API Routes (COMPLETED)

### API Routes Built

All 3 API routes are implemented and the build compiles clean.

#### Route 1: `GET /api/papers/[doi]`
- Resolves a DOI to full paper metadata via OpenAlex
- Calls `https://api.openalex.org/works/doi:{DOI}?api_key=KEY`
- Extracts `referenced_works` and batch-fetches reference details (100 per batch)
- Returns paper + its reference list

#### Route 2: `POST /api/retraction/check`
- Checks if papers are retracted via Crossref
- Calls `https://api.crossref.org/v1/works/{DOI}?mailto=email`
- Checks `update-to` field for `type: "retraction"`
- Returns retraction status for each DOI
- Max 50 DOIs per request, processes in batches of 5

#### Route 3: `POST /api/analyze`
- Orchestrator that runs the full pipeline
- DOI → OpenAlex lookup → Crossref retraction check → Gemini context analysis → Risk scoring → Graph building
- Returns complete analysis with risk score, citations, and graph data

### Library Files Built (`src/lib/`)
- `types.ts` — All TypeScript interfaces (Paper, Reference, RetractionResult, CitationAnalysis, AnalyzedCitation, GraphNode, GraphEdge, AnalysisResult, OpenAlexWork, CrossrefWork)
- `openalex.ts` — OpenAlex API client with batch fetching, retry logic, abstract reconstruction
- `crossref.ts` — Crossref API client with polite pool, retry logic, concurrent batch processing
- `gemini.ts` — Gemini Flash API client with JSON parsing, fallback defaults, prompt engineering
- `risk-scorer.ts` — Risk calculation algorithm with base scores, reason/section multipliers, overall scoring
- `graph-builder.ts` — Graph data structure construction with color coding, node sizing

### Implementation Order (Completed)
1. `src/lib/types.ts` — All TypeScript interfaces ✓
2. `src/lib/openalex.ts` — OpenAlex client ✓
3. `src/lib/crossref.ts` — Crossref retraction checker ✓
4. `src/lib/gemini.ts` — Gemini citation analyzer ✓
5. `src/lib/risk-scorer.ts` — Risk calculation algorithm ✓
6. `src/lib/graph-builder.ts` — Graph construction ✓
7. `src/app/api/papers/[doi]/route.ts` — Paper lookup API ✓
8. `src/app/api/retraction/check/route.ts` — Retraction check API ✓
9. `src/app/api/analyze/route.ts` — Main analysis orchestrator

### Environment Variables Needed (Not Yet Created)
```
# .env.local
OPENALEX_API_KEY=your_key
CROSSREF_EMAIL=your@email.com
GEMINI_API_KEY=your_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 7. Risk Scoring Algorithm

### Individual Citation Risk Score
```
base_score = {
  methodology: 0.7,
  result_dependency: 0.9,
  comparison: 0.4,
  background: 0.1,
  general_reference: 0.05
}[citation_type]

retraction_multiplier = is_retracted ? 1.0 : 0.0

reason_multiplier = {
  data_fabrication: 1.0,
  falsification: 1.0,
  image_manipulation: 0.9,
  unreliable_results: 0.8,
  plagiarism: 0.5,
  ethical_violations: 0.6,
  paper_mill: 0.9,
}[retraction_reason] || 0.7

section_multiplier = {
  methods: 1.2,
  results: 1.1,
  introduction: 0.8,
  discussion: 0.9,
}[section] || 1.0

citation_risk = base_score × retraction_multiplier × reason_multiplier × section_multiplier
# Clamp to [0, 1]
```

### Overall Paper Risk Score
```
retraction_ratio = retracted_count / total_references
severity_score = mean(retracted_citation_risks)
dependency_ratio = high_risk_count / total_references
impact_score = mean(retracted_citation_citation_counts) / 1000

overall_risk = (
  0.35 × retraction_ratio +
  0.30 × severity_score +
  0.20 × dependency_ratio +
  0.15 × min(1.0, impact_score)
)

risk_level = {
  [0.0, 0.2): 'safe',
  [0.2, 0.4): 'low',
  [0.4, 0.6): 'medium',
  [0.6, 0.8): 'high',
  [0.8, 1.0]: 'critical'
}
```

### Downstream Contagion Score
```
chain_risk = base_risk × (0.7 ^ depth)
# depth 0 = direct citation, depth 1 = one hop away, etc.
```

---

## 8. Citation Context Analysis (Gemini Prompt)

The Gemini Flash prompt for analyzing how a citation is used:

```
You are an expert in research integrity and academic citation analysis.

Analyze the following citation and classify how it is used:

PAPER SNIPPET:
"{context_snippet}"

CITATION DETAILS:
- Cited Paper: "{cited_paper_title}" ({cited_paper_year})
- Abstract Summary: {cited_paper_abstract}
- Retraction Status: {isRetracted ? 'RETRACTED' : 'NOT RETRACTED'}
{isRetracted ? `- Retraction Reason: ${retractionReason}` : ''}

Provide your analysis in this exact JSON format:
{
  "citation_type": "methodology|background|comparison|result_dependency|general_reference",
  "risk_level": "low|medium|high|critical",
  "risk_score": 0.0-1.0,
  "explanation": "Detailed explanation of classification",
  "confidence": 0.0-1.0,
  "section_where_used": "introduction|methods|results|discussion|conclusion",
  "dependency_strength": "none|weak|moderate|strong|critical"
}

Rules:
1. If the cited paper is NOT retracted, risk_level must be "low" and risk_score must be 0.0
2. METHODOLOGY citations are HIGH risk if retracted
3. RESULT_DEPENDENCY citations are CRITICAL if retracted
4. BACKGROUND citations are LOW risk even if retracted
5. Consider whether the retraction reason affects this specific usage
```

---

## 9. Crossref Retraction Detection

### How to check if a DOI is retracted:
```
GET https://api.crossref.org/v1/works/{DOI}?mailto=your@email.com
```

### Response structure for retracted papers:
```json
{
  "message": {
    "DOI": "10.1038/example",
    "title": ["Original Paper Title"],
    "update-to": [
      {
        "DOI": "10.1038/example.r1",
        "type": "retraction",
        "label": "Retraction",
        "source": "retraction-watch",
        "created": "2023-06-15T00:00:00Z",
        "assertion": [
          {
            "label": "retraction",
            "group": "Crossmark",
            "explanation": "Retracted due to data fabrication"
          }
        ]
      }
    ]
  }
}
```

### Retraction reasons available:
- data_fabrication
- falsification
- image_manipulation
- unreliable_results
- plagiarism
- ethical_violations
- peer_review_manipulation
- paper_mill

---

## 10. OpenAlex API Key Fields

### Paper response fields we need:
- `id` — OpenAlex ID (e.g., `https://openalex.org/W2741809803`)
- `doi` — DOI URL
- `title` — Paper title
- `abstract_inverted_index` — Abstract (inverted index format, needs reconstruction)
- `authorships` — Array of authors with names and affiliations
- `publication_year` — Year
- `cited_by_count` — How many papers cite this one
- `referenced_works` — Array of OpenAlex IDs this paper cites
- `open_access` — OA status and URL
- `concepts` — AI-assigned concepts with scores

### Batch fetch referenced papers:
```
GET https://api.openalex.org/works?filter=openalex:W1583139675|W2001771035|...&per_page=100&api_key=KEY
```

---

## 11. Supabase Database Schema (Planned, Not Yet Created)

```sql
papers (id, doi, openalex_id, title, abstract, authors, year, citation_count,
        is_retracted, retraction_reason, embedding VECTOR(768), created_at)

citations (id, citing_paper_id, cited_paper_id, context_snippet, citation_type,
           risk_level, risk_score, llm_explanation, created_at)

analyses (id, user_id, paper_id, overall_risk_score, total_references,
          retracted_count, high_risk_count, status, results JSONB, created_at)
```

---

## 12. Key Files to Reference

| File | Purpose |
|---|---|
| `PROJECT.md` | Complete 2200-line project specification (APIs, schema, algorithm, everything) |
| `PRODUCT.md` | Product truth (users, purpose, positioning, principles) |
| `app/src/app/globals.css` | Custom CSS variables (gunmetal/bone palette) |
| `app/src/app/layout.tsx` | Root layout with Geist fonts + dark mode |
| `app/src/app/page.tsx` | Main landing page composition |
| `app/src/components/*.tsx` | All 7 landing page components |

---

## 13. Impeccable Skills Used

| Skill | What It Did |
|---|---|
| `impeccable init` | Created PRODUCT.md with product truth |
| `impeccable new-work` | Generated visual directions via concept-seed.mjs |
| `design-taste-frontend` | Set design dials, typography rules, layout discipline |
| `design-motion-principles` | Emil (restraint) + Jakub (polish) weighting for animations |
| `gstack` | Router skill, QA/deploy workflow ready for later |

---

## 14. How to Resume This Project

### In a new session, say:
> "Read context_md/SESSION_CONTEXT.md. The landing page, backend API routes, and /analyze page are all built. Tell me what's next based on what's in the context."

### What's Done (All Complete)
- [x] Landing page with 7 sections + all animations
- [x] All 6 library files in `src/lib/` (types, openalex, crossref, gemini, risk-scorer, graph-builder)
- [x] All 3 API routes (`/api/papers/[doi]`, `/api/retraction/check`, `/api/analyze`)
- [x] `/analyze` results page with Cytoscape.js interactive graph
- [x] Hero button navigates to `/analyze?doi=...`
- [x] `.env.local` with API key placeholders
- [x] Build compiles clean (7 routes, 0 errors)

### What's Next (Candidates)
1. **Test with real DOIs** — populate `.env.local` with actual API keys and test the full pipeline
2. **PDF upload + reference extraction** — Python backend (PyMuPDF/FastAPI) for parsing PDFs
3. **Error handling refinements** — edge cases, rate limit handling, timeout handling
4. **Streaming responses** — stream analysis progress to the frontend
5. **Responsive polish** — mobile optimization for the analyze page
6. **Deployment** — Vercel or similar, environment variables setup
7. **Supabase integration** — caching, analysis history, user accounts (future)

---

## 15. Decisions Made

| Decision | Choice | Reason |
|---|---|---|
| Database | Supabase (PostgreSQL) | Free tier, pgvector, graph queries, auto-generated API |
| Primary API | OpenAlex | Best all-in-one: 250M+ papers, citations, concepts, free $1/day |
| Retraction source | Crossref (Retraction Watch built-in) | No separate API needed, just filter `update-type:retraction` |
| LLM | Gemini Flash | 1M context window, 250 RPD free, handles full papers |
| Graph viz | Cytoscape.js (for results) + SVG (for landing page) | Cytoscape has built-in graph algorithms for analysis |
| Font | Geist + Geist Mono | Clean, technical, no serif |
| Dark mode | Primary (locked to dark) | Brief specified "serious and trustworthy" |
| Animation library | Motion (framer-motion successor) | `motion/react` imports, spring physics |
| PDF parsing | PyMuPython + FastAPI (Python backend) | GROBID/PyMuPDF for reference extraction |

---

*Last updated: September 2, 2026*
*Session status: Landing page, backend API routes, and /analyze page all complete. Build clean. Ready for testing or next feature.*
