# Citation Contagion — Complete Project Specification

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Solution Architecture](#3-solution-architecture)
4. [Tech Stack](#4-tech-stack)
5. [Free APIs & Tools](#5-free-apis--tools)
6. [Database Design](#6-database-design)
7. [System Pipeline](#7-system-pipeline)
8. [Frontend Design](#8-frontend-design)
9. [Backend Implementation](#9-backend-implementation)
10. [Citation Context Analysis (AI)](#10-citation-context-analysis-ai)
11. [Risk Scoring Algorithm](#11-risk-scoring-algorithm)
12. [Citation Graph Visualization](#12-citation-graph-visualization)
13. [Project Setup](#13-project-setup)
14. [Implementation Phases](#14-implementation-phases)
15. [API Integration Details](#15-api-integration-details)
16. [Error Handling & Edge Cases](#16-error-handling--edge-cases)
17. [Deployment](#17-deployment)
18. [Demo & Testing](#18-demo--testing)
19. [Budget & Limits Summary](#19-budget--limits-summary)
20. [Future Enhancements](#20-future-enhancements)

---

## 1. Project Overview

### 1.1 What is Citation Contagion?

Citation Contagion is a **research dependency scanner** that detects when scientific papers rely on retracted or unreliable research and shows how that potential problem spreads through the scientific literature. Think of it as a **security vulnerability scanner, but for academic research**.

Just as developers have tools (like `npm audit` or Snyk) that tell them if their software depends on a vulnerable package, researchers currently have **no equivalent tool** that tells them if their research depends heavily on problematic scientific literature. Citation Contagion fills that missing layer of **research integrity checking**.

### 1.2 One-Sentence Summary

> Citation Contagion is a research dependency scanner that detects when scientific papers rely on retracted research and shows how that potential problem spreads through the scientific literature.

### 1.3 Core Value Proposition

The fundamental difference between Citation Contagion and existing reference managers (Zotero, Mendeley, EndNote) is:

| Feature | Reference Managers | Citation Contagion |
|---|---|---|
| Tracks citations | Yes | Yes |
| Detects retractions | No | Yes |
| Analyzes *how* citations are used | No | Yes |
| Calculates risk scores | No | Yes |
| Shows contagion spread | No | Yes |
| Interactive citation graph | No | Yes |

We are not just asking **"Did this paper get retracted?"** We are asking **"If this paper was retracted, how much does that affect the research that depends on it?"**

### 1.4 Target Users

- **Academic researchers** — checking their own papers before submission
- **Peer reviewers** — verifying references during review
- **Journal editors** — screening submissions for integrity issues
- **Research institutions** — monitoring institutional research quality
- **Graduate students** — learning to identify problematic literature
- **Science journalists** — verifying claims in scientific reporting

### 1.5 MVP Scope

For the hackathon MVP, we focus on:

- **Biomedical research** (highest retraction rates, most public interest)
- **Single paper analysis** (upload one paper, get a report)
- **1-3 hop citation chain** (immediate citations + citations of citations)
- **Real retractions** from Retraction Watch database via Crossref
- **Interactive citation graph** with color-coded risk levels
- **Risk score** with detailed breakdown

---

## 2. Problem Statement

### 2.1 The Retraction Problem

Scientific retractions are increasing. According to Retraction Watch, there are over **60,000 retracted papers** in their database as of 2026. But the problem is not just the retracted papers themselves — it is the **downstream effect**:

1. Paper A is published and cited by 50 other papers
2. Paper A is retracted because of fake data
3. Those 50 papers **still exist** without clearly showing they may be affected
4. Some of those 50 papers used Paper A's methodology for their own experiments
5. Those papers' results are now questionable, but nobody knows

### 2.2 Why Manual Checking Fails

Currently, researchers must:
- Manually check each reference against Retraction Watch
- Read each citation to understand how it was used
- Trace citation chains across multiple papers
- Assess risk subjectively

This is **time-consuming, error-prone, and incomplete**. A paper with 50 references could take hours to check manually, and the researcher might miss a retraction in a tangentially related field.

### 2.3 The Gap

There is no tool that:
1. Automatically checks all references for retractions
2. Understands **how** each citation is used (methodology vs. background)
3. Calculates a **quantified risk score**
4. Visualizes the **spread of contamination** through citation networks

Citation Contagion solves all four.

---

## 3. Solution Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                              │
│                                                                      │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  Upload   │  │   Dashboard   │  │    Graph     │  │   Report    │ │
│  │  Paper    │  │   Overview   │  │  Explorer   │  │   Export    │ │
│  └────┬─────┘  └──────┬───────┘  └──────┬──────┘  └──────┬──────┘ │
│       │               │                 │                  │         │
└───────┼───────────────┼─────────────────┼──────────────────┼─────────┘
        │               │                 │                  │
        ▼               ▼                 ▼                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API LAYER (Next.js)                          │
│                                                                      │
│  ┌───────────────┐  ┌───────────────┐  ┌─────────────────────────┐ │
│  │   /api/upload  │  │  /api/analyze  │  │     /api/graph          │ │
│  │   /api/papers  │  │  /api/reports  │  │     /api/citations      │ │
│  └───────┬───────┘  └───────┬───────┘  └───────────┬─────────────┘ │
│          │                  │                       │                │
└──────────┼──────────────────┼───────────────────────┼────────────────┘
           │                  │                       │
           ▼                  ▼                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     PROCESSING PIPELINE                             │
│                                                                      │
│  Step 1: PDF Upload & Reference Extraction (PyMuPDF / GROBID)      │
│  Step 2: Paper Metadata Lookup (OpenAlex API)                       │
│  Step 3: Retraction Status Check (Crossref API + Retraction Watch)  │
│  Step 4: Citation Context Analysis (Gemini Flash LLM)               │
│  Step 5: Risk Score Calculation (Custom Algorithm)                  │
│  Step 6: Citation Graph Construction (Graph Traversal)              │
│  Step 7: Report Generation                                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
           │                  │                       │
           ▼                  ▼                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                  Supabase (PostgreSQL)                        │   │
│  │                                                               │   │
│  │  ┌─────────┐  ┌────────────┐  ┌──────────┐  ┌───────────┐  │   │
│  │  │ papers   │  │ citations  │  │ analyses │  │  users     │  │   │
│  │  └─────────┘  └────────────┘  └──────────┘  └───────────┘  │   │
│  │                                                               │   │
│  │  Extensions: pgvector (embeddings) + pgRouting (graph)       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Data Flow

```
User uploads PDF
       │
       ▼
┌─────────────────┐
│ Extract          │ ← PyMuPDF parses PDF, extracts reference list
│ References       │
└────────┬────────┘
         │  List of DOIs / paper titles / author names
         ▼
┌─────────────────┐
│ Resolve Papers   │ ← OpenAlex API looks up each reference by DOI/title
│ (OpenAlex)       │    Returns: paper ID, title, authors, year, citation count
└────────┬────────┘
         │  List of resolved paper IDs with metadata
         ▼
┌─────────────────┐
│ Check Retraction │ ← Crossref API checks each paper's update-to field
│ Status (Crossref)│    Filter: update-type:retraction
└────────┬────────┘
         │  Papers marked as retracted or not
         ▼
┌─────────────────┐
│ Analyze Citation │ ← Gemini Flash reads the sentence where each citation
│ Context (LLM)    │    appears and classifies: methodology/background/comparison
└────────┬────────┘
         │  Citation types + risk levels per citation
         ▼
┌─────────────────┐
│ Calculate Risk   │ ← Custom algorithm weights citation types, retraction
│ Score            │    severity, and citation chain depth
└────────┬────────┘
         │  Overall risk score + breakdown
         ▼
┌─────────────────┐
│ Build Citation   │ ← Traverse citation graph 1-3 hops deep
│ Graph            │    Color-code: green (safe) → yellow → orange → red (retracted)
└────────┬────────┘
         │  Interactive graph data structure
         ▼
┌─────────────────┐
│ Generate Report  │ ← Assemble all data into final user-facing report
│ & Visualization  │
└─────────────────┘
```

---

## 4. Tech Stack

### 4.1 Frontend

| Technology | Version | Purpose | Why This Choice |
|---|---|---|---|
| **Next.js** | 14+ (App Router) | React framework | Server-side rendering, API routes, file-based routing, excellent DX |
| **React** | 18+ | UI library | Component-based, massive ecosystem |
| **TypeScript** | 5+ | Type safety | Catches errors at compile time, better IDE support |
| **Tailwind CSS** | 3+ | Styling | Utility-first, fast prototyping, no CSS-in-JS overhead |
| **Cytoscape.js** | 3+ | Graph visualization | Built-in graph algorithms (PageRank, centrality, clustering), perfect for citation networks |
| **react-cytoscapejs** | 3+ | React wrapper for Cytoscape | Easy React integration |
| **Recharts** | 2+ | Charts | Simple, composable charts for risk breakdown |
| **Lucide React** | Latest | Icons | Clean, consistent icon set |

### 4.2 Backend

| Technology | Version | Purpose | Why This Choice |
|---|---|---|---|
| **Next.js API Routes** | 14+ | REST API | Co-located with frontend, serverless functions |
| **Python (FastAPI)** | 3.11+ | PDF parsing pipeline | PyMuPDF, GROBID, NLP libraries are Python-native |
| **PyMuPDF** | Latest | PDF parsing | Fast, reliable, extracts text and references |
| **GROBID** | Latest | Reference extraction | ML-based reference parser, highest accuracy for academic PDFs |
| **google-generativeai** | Latest | Gemini API client | Official Python SDK for Gemini |

### 4.3 Database

| Technology | Purpose | Why This Choice |
|---|---|---|
| **Supabase** | Primary database | PostgreSQL + auto-generated API + real-time + auth |
| **pgvector** | Vector similarity search | Semantic paper matching, embedding storage |
| **pgRouting** | Graph traversal | Shortest path, Dijkstra for citation chains |

### 4.4 External APIs

| API | Purpose | Free Tier |
|---|---|---|
| **OpenAlex** | Paper metadata, citations | $1/day free (~10K queries) |
| **Crossref** | DOI resolution, retractions | 10 req/sec with `mailto` |
| **Semantic Scholar** | Embeddings, bulk data | 1 req/sec with API key |
| **PubMed E-utilities** | Biomedical papers | 10 req/sec with API key |
| **Unpaywall** | Open access PDF links | 100K/day |
| **Google Gemini Flash** | Citation context analysis | 250 RPD, 10 RPM |

### 4.5 DevOps & Deployment

| Technology | Purpose |
|---|---|
| **Vercel** | Frontend deployment (free tier) |
| **Railway / Render** | Python backend deployment (free tier) |
| **Supabase Cloud** | Database hosting (free tier: 500MB) |
| **GitHub** | Version control |

---

## 5. Free APIs & Tools

### 5.1 OpenAlex API (Primary Data Source)

**What it is:** A free, open catalog of 250M+ scholarly works, 250M+ citations, 250M+ concepts, and 250M+ authors. Successor to Microsoft Academic Graph.

**Why we use it:** Best all-in-one source for paper metadata, citation relationships, and concept tagging. Generous free tier.

**Free Tier Details:**
- **Budget:** $1/day free usage with API key (free to create)
- **Rate limit:** 100 requests/second hard cap
- **Daily capacity:** ~10,000 list calls OR ~1,000 search calls per day
- **Singleton lookups (by DOI):** Unlimited within budget
- **No key:** 100 credits/day (only for testing)

**Key Endpoints:**

```
# Get paper by DOI
GET https://api.openalex.org/works/doi:10.1234/example?api_key=YOUR_KEY

# Search papers
GET https://api.openalex.org/works?search=cancer+treatment&api_key=YOUR_KEY

# Filter by concept, year, author, venue
GET https://api.openalex.org/works?filter=concepts.id:C154945302,from_publication_date:2020-01-01&api_key=YOUR_KEY

# Get citations of a paper
GET https://api.openalex.org/works?filter=cites:W2741809803&api_key=YOUR_KEY

# Get references of a paper
GET https://api.openalex.org/works?filter=cited_by:W2741809803&api_key=YOUR_KEY
```

**Credit Costs:**
| Endpoint | Cost |
|---|---|
| Singleton lookup (`/works/W123`) | 1 credit |
| List/filter (`/works?filter=...`) | 10 credits |
| Search (`?search=`) | 100 credits |
| PDF download | 1,000 credits |

**Key Fields Returned:**
- `id` — OpenAlex ID
- `doi` — Digital Object Identifier
- `title` — Paper title
- `abstract_inverted_index` — Full abstract (inverted index format)
- `authorships` — Authors with affiliations
- `cited_by_count` — How many papers cite this one
- `referenced_works` — List of papers this one cites
- `concepts` — AI-assigned concepts with scores
- `open_access` — OA status and PDF links

**Setup:**
1. Go to https://openalex.org
2. Create free account
3. Get API key at https://openalex.org/settings/api
4. Add `?api_key=YOUR_KEY` to all requests

### 5.2 Crossref API (Retraction Detection)

**What it is:** A registry of 180M+ digital object identifiers (DOIs) and their metadata. Since September 2023, Crossref acquired the Retraction Watch database and integrated retraction data into their API.

**Why we use it:** **The only reliable source for retraction detection.** Retraction Watch data is now built into Crossref's REST API.

**Free Tier Details:**
- **No signup required** — completely public
- **Polite pool (recommended):** Add `mailto=your@email.com` to requests
- **Polite rate limit:** 10 requests/second (single), 3 requests/second (lists)
- **Public rate limit:** 5 req/sec (single), 1 req/sec (lists)

**Retraction Detection — The Key Query:**

```
# Get recent retractions
GET https://api.crossref.org/v1/works?filter=update-type:retraction&rows=10&mailto=your@email.com

# Check if specific DOI is retracted
GET https://api.crossref.org/v1/works/DOI_HERE?mailto=your@email.com
# Look for: "update-to" field with "type": "retraction"

# Retractions from specific date range
GET https://api.crossref.org/v1/works?filter=update-type:retraction,from-pub-date:2020-01-01,until-pub-date:2024-12-31&mailto=your@email.com
```

**How Retraction Detection Works:**

When a paper is retracted, Crossref adds an `update-to` field to the original DOI record:

```json
{
  "DOI": "10.1234/example",
  "title": ["Original Paper Title"],
  "update-to": [
    {
      "DOI": "10.1234/example.r1",
      "type": "retraction",
      "label": "Retraction",
      "source": "retraction-watch",
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
```

**Also Available as CSV:**
```bash
git clone https://gitlab.com/crossref/retraction-watch-data
# Updated daily on workdays
# Contains: DOI, retraction date, reason, original article info
```

**Retraction Reasons Available:**
- Data fabrication/falsification
- Plagiarism
- Image manipulation
- Unreliable results
- Ethical violations
- Peer review manipulation
- Paper mill production

### 5.3 Semantic Scholar API (Embeddings & Context)

**What it is:** A free, AI-powered academic search engine by Allen Institute for AI (AI2). Indexes 214M+ papers with 2.49B citations.

**Why we use it:** SPECTER2 embeddings for semantic similarity, citation context snippets, bulk endpoints.

**Free Tier Details:**
- **No auth required:** Shared pool (1,000 RPS among all users)
- **Free API key:** 1 request/second dedicated rate
- **Batch endpoints:** For bulk lookups

**Key Endpoints:**

```
# Get paper details with citations
GET https://api.semanticscholar.org/graph/v1/paper/DOI:10.1234/example?fields=title,abstract,citationCount,citations,references

# Batch paper lookup (up to 500 papers)
POST https://api.semanticscholar.org/graph/v1/paper/batch
Body: {"ids": ["DOI:10.1234/a", "DOI:10.1234/b", ...]}

# Citation context (how a paper is cited by others)
GET https://api.semanticscholar.org/graph/v1/paper/DOI:10.1234/example/citations?fields=title,abstract,intentingPapers

# Paper recommendations
GET https://api.semanticscholar.org/recommendations/v1/papers/forpaper/DOI:10.1234/example
```

**Key Fields:**
- `paperId` — Semantic Scholar ID
- `title`, `abstract` — Paper content
- `citationCount` — Citation count
- `citations` — Papers that cite this one
- `references` — Papers this one cites
- `embedding` — SPECTER2 vector (128-dim or 768-dim)
- `isOpenAccess`, `openAccessPdf` — OA status

**Setup:**
1. Go to https://www.semanticscholar.org/product/api
2. Fill out API key request form
3. Free key provides 1 RPS dedicated rate
4. Add `?api_key=YOUR_KEY` to requests

### 5.4 PubMed E-utilities (Biomedical Focus)

**What it is:** NCBI's suite of APIs for accessing PubMed, PMC, GenBank, and 30+ biomedical databases.

**Why we use it:** Essential for biomedical papers. Highest quality abstracts, MeSH terms, full-text via PMC.

**Free Tier Details:**
- **Completely free**, no billing
- **Without API key:** 3 requests/second
- **With free API key:** 10 requests/second
- **Bulk:** Up to 100,000 UIDs per ESearch call

**Key Endpoints:**

```
# Search PubMed
GET https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=cancer+treatment&retmax=20&api_key=YOUR_KEY

# Get paper details
GET https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=12345678,23456789&rettype=abstract&api_key=YOUR_KEY

# Get paper summary
GET https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=12345678&api_key=YOUR_KEY

# Check PMC availability (full text)
GET https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pmc&term=10.1234/EXAMPLE[doi]&api_key=YOUR_KEY
```

**Setup:**
1. Go to https://www.ncbi.nlm.nih.gov/account/
2. Create free NCBI account
3. Generate API key in account settings
4. Add `&api_key=YOUR_KEY` to all requests

### 5.5 Unpaywall API (Open Access PDFs)

**What it is:** Maps DOI numbers to open access PDF URLs. Covers 120M+ articles.

**Why we use it:** Finds free, legal PDFs for full-text analysis.

**Free Tier Details:**
- **100,000 requests/day**
- **No API key**, just email address
- **Rate limit:** ~1.15 req/sec sustained

**Endpoint:**
```
GET https://api.unpaywall.org/v2/DOI_HERE?email=your@email.com
```

**Response includes:**
- `is_oa` — Boolean, is it open access?
- `oa_status` — "gold", "green", "bronze", "hybrid", "closed"
- `best_oa_location` — URL to free PDF
- `oa_locations` — All available OA locations

### 5.6 Google Gemini Flash (LLM Analysis)

**What it is:** Google's fast, efficient LLM with a **1 million token context window**.

**Why we use it:** Can process entire research papers in one prompt. Best free tier for long-document analysis.

**Free Tier Details:**
- **Requests per minute (RPM):** 10
- **Tokens per minute (TPM):** 250,000
- **Requests per day (RPD):** 250
- **Context window:** 1,000,000 tokens (~750,000 words)
- **No credit card required**
- **Commercial use permitted**

**Key Capabilities:**
- Text, image, audio, video, PDF input
- Up to 65K output tokens
- Multimodal understanding
- Structured JSON output

**Setup:**
1. Go to https://aistudio.google.com/apikey
2. Create free API key
3. Use Python SDK: `pip install google-generativeai`
4. Or REST API: `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`

**Our Use Case — Citation Context Analysis:**

```python
prompt = f"""
Analyze how the following citation is used in this paper.

Paper snippet: "{sentence_with_citation}"

Citation details:
- Title: {cited_paper_title}
- Year: {cited_paper_year}

Classify the citation type:
1. METHODOLOGY — The citing paper uses the cited paper's method/experiment
2. BACKGROUND — The citing paper mentions the cited paper as general context
3. COMPARISON — The citing paper compares results with the cited paper
4. RESULT_DEPENDENCY — The citing paper's findings depend on the cited paper's results
5. GENERAL_REFERENCE — Brief mention, no strong dependency

Also assess risk level if the cited paper is retracted:
- LOW — Minimal impact (background mention)
- MEDIUM — Some dependency but not core to methodology
- HIGH — Strong methodological or result dependency
- CRITICAL — Core findings depend entirely on cited paper

Return JSON: {{"citation_type": "...", "risk_level": "...", "explanation": "..."}}
"""
```

---

## 6. Database Design

### 6.1 Supabase Schema

We use Supabase (PostgreSQL) with the following tables:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- TABLE: papers
-- Stores metadata for every paper we track
-- =====================================================
CREATE TABLE papers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identifiers
  doi TEXT UNIQUE,                           -- Digital Object Identifier
  openalex_id TEXT UNIQUE,                   -- OpenAlex work ID
  semantic_scholar_id TEXT UNIQUE,           -- S2 paper ID
  pmid TEXT UNIQUE,                          -- PubMed ID
  pmcid TEXT UNIQUE,                         -- PMC ID
  
  -- Content
  title TEXT NOT NULL,
  abstract TEXT,
  authors JSONB DEFAULT '[]',               -- [{name, affiliation, orcid}]
  year INTEGER,
  month INTEGER,
  day INTEGER,
  venue TEXT,                                -- Journal/conference name
  publisher TEXT,
  
  -- Metrics
  citation_count INTEGER DEFAULT 0,
  reference_count INTEGER DEFAULT 0,
  
  -- Retraction status
  is_retracted BOOLEAN DEFAULT FALSE,
  retraction_date DATE,
  retraction_reason TEXT,
  retraction_source TEXT DEFAULT 'crossref', -- 'crossref' or 'manual'
  
  -- Open access
  is_open_access BOOLEAN DEFAULT FALSE,
  oa_status TEXT,                            -- 'gold','green','bronze','hybrid','closed'
  oa_url TEXT,                               -- URL to free PDF
  
  -- Embeddings (for semantic search)
  embedding VECTOR(768),                     -- SPECTER2 embedding vector
  
  -- Raw data cache
  raw_openalex JSONB,                        -- Full OpenAlex response
  raw_crossref JSONB,                        -- Full Crossref response
  raw_semantic_scholar JSONB,                -- Full S2 response
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookup
CREATE INDEX idx_papers_doi ON papers(doi);
CREATE INDEX idx_papers_title ON papers USING gin(title gin_trgm_ops);
CREATE INDEX idx_papers_year ON papers(year);
CREATE INDEX idx_papers_is_retracted ON papers(is_retracted);
CREATE INDEX idx_papers_embedding ON papers USING ivfflat(embedding vector_cosine_ops);

-- =====================================================
-- TABLE: citations
-- Stores citation relationships between papers
-- =====================================================
CREATE TABLE citations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Paper references
  citing_paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
  cited_paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
  
  -- Citation context (what the LLM analyzed)
  context_snippet TEXT,                      -- The sentence where citation appears
  context_page INTEGER,                      -- Page number where citation found
  context_section TEXT,                      -- Section name (Methods, Intro, etc.)
  
  -- LLM analysis results
  citation_type TEXT,                        -- 'methodology','background','comparison','result_dependency','general_reference'
  risk_level TEXT,                           -- 'low','medium','high','critical'
  risk_score FLOAT CHECK (risk_score >= 0 AND risk_score <= 1),
  llm_explanation TEXT,                      -- LLM's reasoning for the classification
  llm_raw_output JSONB,                      -- Full LLM response
  
  -- Metadata
  is_influential BOOLEAN DEFAULT FALSE,      -- S2's "influential" flag
  citation_count_at_analysis INTEGER,        -- Citation count when analyzed
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_citations_citing ON citations(citing_paper_id);
CREATE INDEX idx_citations_cited ON citations(cited_paper_id);
CREATE INDEX idx_citations_risk ON citations(risk_level);
CREATE INDEX idx_citations_type ON citations(citation_type);

-- =====================================================
-- TABLE: analyses
-- Stores complete analysis results for a paper
-- =====================================================
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- User reference
  user_id UUID REFERENCES auth.users(id),
  
  -- Analyzed paper
  paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
  
  -- Input
  input_type TEXT,                           -- 'doi','pdf','url','text'
  input_value TEXT,                          -- The actual DOI/URL/text submitted
  
  -- Overall results
  overall_risk_score FLOAT,
  risk_level TEXT,                           -- 'safe','low','medium','high','critical'
  
  -- Statistics
  total_references INTEGER DEFAULT 0,
  resolved_references INTEGER DEFAULT 0,    -- How many we could find metadata for
  retracted_count INTEGER DEFAULT 0,
  retracted_strong_dependency INTEGER DEFAULT 0,
  high_risk_count INTEGER DEFAULT 0,
  medium_risk_count INTEGER DEFAULT 0,
  low_risk_count INTEGER DEFAULT 0,
  
  -- Contagion chain
  downstream_papers_affected INTEGER DEFAULT 0,  -- Papers that cite the retracted ones
  max_chain_depth INTEGER DEFAULT 0,             -- How deep the contagion goes
  
  -- Full results JSON
  results JSONB,
  
  -- Status
  status TEXT DEFAULT 'pending',             -- pending/processing/completed/failed
  error_message TEXT,
  processing_time_ms INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- =====================================================
-- TABLE: citation_chains
-- Stores the contagion chain (how retraction spreads)
-- =====================================================
CREATE TABLE citation_chains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  
  -- Chain path
  source_paper_id UUID REFERENCES papers(id),    -- The retracted paper
  affected_paper_id UUID REFERENCES papers(id),  -- A paper that depends on it
  chain_depth INTEGER NOT NULL,                   -- 1 = direct, 2 = one hop, etc.
  
  -- Chain path as array of paper IDs
  path UUID[] NOT NULL,
  
  -- Risk at each hop
  cumulative_risk_score FLOAT,
  hop_risk_score FLOAT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: user_analyses (if using auth)
-- =====================================================
CREATE TABLE user_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.2 Key Relationships

```
papers (1) ──────< citations (many)
  │                    │
  │                    │ citing_paper_id → papers.id
  │                    │ cited_paper_id → papers.id
  │                    │
  └──────< analyses (many)
             │
             └──────< citation_chains (many)
                        │
                        │ source_paper_id → papers.id
                        │ affected_paper_id → papers.id
```

---

## 7. System Pipeline

### 7.1 Step-by-Step Pipeline

#### Step 1: PDF Upload & Reference Extraction

**Input:** User uploads PDF file or enters DOI

**Process:**
1. If DOI entered → skip to Step 2 (DOI is already known)
2. If PDF uploaded:
   - Save to temporary storage (Supabase Storage or filesystem)
   - Parse PDF using PyMuPDF to extract text
   - Use GROBID (or regex patterns) to identify the References section
   - Extract individual reference strings
   - For each reference string:
     - Try to extract DOI using regex: `10.\d{4,9}/[-._;()/:A-Z0-9]+`
     - Try to extract title + author + year for OpenAlex search
     - If DOI found → direct lookup
     - If no DOI → search by title + author

**Output:** List of reference strings with extracted DOIs/titles

#### Step 2: Paper Metadata Lookup (OpenAlex)

**Input:** List of DOIs/titles from Step 1

**Process:**
1. For each DOI:
   ```
   GET https://api.openalex.org/works/doi:{DOI}?api_key=KEY
   ```
2. For each title search:
   ```
   GET https://api.openalex.org/works?search={TITLE}&filter=authorships.author.display_name:{AUTHOR}&api_key=KEY
   ```
3. Batch lookups (up to 50 DOIs per request):
   ```
   GET https://api.openalex.org/works?filter=doi:{DOI1}|{DOI2}|...&api_key=KEY
   ```
4. Store results in `papers` table
5. Track which references could not be resolved (count as "unresolved")

**Output:** List of resolved paper IDs with full metadata

#### Step 3: Retraction Status Check (Crossref)

**Input:** List of paper DOIs from Step 2

**Process:**
1. For each DOI:
   ```
   GET https://api.crossref.org/v1/works/{DOI}?mailto=your@email.com
   ```
2. Check for `update-to` field in response
3. If `update-to` exists and `type` is "retraction":
   - Mark paper as retracted
   - Extract retraction reason from `assertion` field
   - Store retraction metadata
4. Also check the Retraction Watch CSV for additional details

**Alternative (batch check):**
```
GET https://api.crossref.org/v1/works?filter=update-type:retraction&query.bibliographic={TITLE}&mailto=your@email.com
```

**Output:** Papers marked as retracted or not, with reasons

#### Step 4: Citation Context Analysis (Gemini Flash)

**Input:** List of citations with surrounding text

**Process:**
1. For each citation in the original paper:
   - Extract the sentence(s) where the citation appears
   - Identify the section (Introduction, Methods, Results, Discussion)
2. Send to Gemini Flash:
   ```
   Analyze this citation context and classify:
   - Citation type (methodology/background/comparison/result_dependency/general_reference)
   - Risk level if cited paper is retracted (low/medium/high/critical)
   - Explanation of why
   
   Context: "{sentence}"
   Cited paper: "{title}" ({year})
   ```
3. Parse JSON response
4. Store in `citations` table

**Output:** Each citation classified with type and risk level

#### Step 5: Risk Score Calculation

**Input:** All citation classifications + retraction status

**Process:**
1. For each citation, calculate individual risk score:
   - Retracted + CRITICAL dependency = 1.0
   - Retracted + HIGH dependency = 0.8
   - Retracted + MEDIUM dependency = 0.5
   - Retracted + LOW dependency = 0.2
   - Not retracted + any = 0.0
2. Calculate overall paper risk score:
   ```
   risk_score = sum(individual_scores) / total_references
   ```
3. Weight by:
   - Citation count of retracted paper (higher impact if widely cited)
   - Section importance (Methods section citations weighted higher)
   - Recency (more recent retractions matter more)

**Output:** Overall risk score (0.0-1.0) with breakdown

#### Step 6: Citation Graph Construction

**Input:** All papers and citation relationships

**Process:**
1. Build graph data structure:
   - Nodes: All papers (root paper + all references)
   - Edges: Citation relationships
2. Traverse 1-3 hops from retracted papers:
   - Find all papers that cite retracted papers
   - Find all papers that cite those papers
   - Calculate cumulative risk at each hop
3. Assign colors:
   - Green: Safe (no retracted dependencies)
   - Yellow: Low risk
   - Orange: Medium risk
   - Red: Retracted or high-risk dependency

**Output:** Graph data for Cytoscape.js visualization

#### Step 7: Report Generation

**Input:** All analysis results

**Process:**
1. Assemble final report:
   - Paper summary (title, authors, year)
   - Overall risk score with explanation
   - Reference breakdown (total, resolved, retracted)
   - Individual citation analysis
   - Contagion chain visualization
   - Recommendations
2. Store in `analyses` table
3. Return to frontend for display

**Output:** Complete analysis report

---

## 8. Frontend Design

### 8.1 Page Structure

```
/ (Landing Page)
├── Hero section with value proposition
├── How it works (3-step visual)
├── Demo preview
├── Call to action

/analyze (Analysis Page)
├── Upload section (DOI input / PDF upload / URL input)
├── Processing indicator (real-time progress)
├── Results dashboard
│   ├── Risk score card
│   ├── Reference breakdown chart
│   ├── Citation graph (Cytoscape.js)
│   ├── Detailed citation list
│   └── Recommendations

/graph (Graph Explorer)
├── Full-screen interactive graph
├── Node details panel
├── Filter controls (risk level, citation type)
├── Export options (PNG, JSON)

/about (About Page)
├── Problem explanation
├── How the algorithm works
├── API documentation
├── Team info
```

### 8.2 Key Components

```tsx
// Landing page hero
<HeroSection>
  <h1>Citation Contagion</h1>
  <p>A research dependency scanner that detects when scientific papers
     rely on retracted research and shows how that potential problem
     spreads through the scientific literature.</p>
  <InputWithButton placeholder="Enter DOI (e.g., 10.1234/example)" />
  <UploadButton>Or upload a PDF</UploadButton>
</HeroSection>

// Risk score card
<RiskScoreCard score={0.72} level="high">
  <ScoreCircle>
    <ScoreValue>72%</ScoreValue>
    <ScoreLabel>Risk Score</ScoreLabel>
  </ScoreCircle>
  <Breakdown>
    <Stat label="Total References" value={47} />
    <Stat label="Retracted" value={3} color="red" />
    <Stat label="High Risk" value={2} color="orange" />
    <Stat label="Downstream Affected" value={37} />
  </Breakdown>
</RiskScoreCard>

// Citation graph
<CytoscapeComponent
  elements={graphData}
  style={{ width: '100%', height: '600px' }}
  layout={{ name: 'cose', animate: true }}
  stylesheet={graphStyles}
  onNodeClick={handleNodeClick}
/>

// Individual citation analysis
<CitationCard citation={citation}>
  <CitationTypeBadge type="methodology" />
  <RiskLevelIndicator level="high" />
  <ContextSnippet>
    "We applied the methodology described by {citation.cited_paper.title}
     to our experimental setup..."
  </ContextSnippet>
  <LLMExplanation>
    HIGH RISK — The citing paper directly uses the retracted paper's
    experimental methodology, making its results potentially unreliable.
  </LLMExplanation>
</CitationCard>
```

### 8.3 Color Scheme

| Color | Hex | Meaning |
|---|---|---|
| Safe Green | `#22c55e` | No retracted dependencies |
| Low Risk Yellow | `#eab308` | Minor dependency, low concern |
| Medium Risk Orange | `#f97316` | Some methodological dependency |
| High Risk Red | `#ef4444` | Strong dependency on retracted work |
| Critical Red | `#dc2626` | Core findings depend entirely on retracted paper |
| Background | `#0f172a` | Dark mode background |
| Surface | `#1e293b` | Card background |
| Text | `#f8fafc` | Primary text |

### 8.4 Responsive Design

- **Desktop (1200px+):** Full graph visualization, side-by-side panels
- **Tablet (768-1199px):** Stacked layout, smaller graph
- **Mobile (< 768px):** Single column, simplified graph, touch-friendly

---

## 9. Backend Implementation

### 9.1 API Routes (Next.js)

```
app/
├── api/
│   ├── analyze/
│   │   └── route.ts          # POST /api/analyze — Main analysis endpoint
│   ├── papers/
│   │   └── route.ts          # GET /api/papers — Search papers
│   │   └── [id]/
│   │       └── route.ts      # GET /api/papers/:id — Get paper details
│   ├── citations/
│   │   └── route.ts          # GET /api/citations — Get citations for a paper
│   ├── graph/
│   │   └── route.ts          # GET /api/graph — Get citation graph data
│   ├── retraction/
│   │   └── check/
│   │       └── route.ts      # POST /api/retraction/check — Check retraction status
│   └── upload/
│       └── route.ts          # POST /api/upload — Upload PDF for parsing
```

### 9.2 Core Service Functions

```typescript
// services/openalex.ts
export async function getPaperByDOI(doi: string): Promise<Paper | null> {
  const response = await fetch(
    `https://api.openalex.org/works/doi:${doi}?api_key=${OPENALEX_KEY}`
  );
  if (!response.ok) return null;
  const data = await response.json();
  return transformOpenAlexWork(data);
}

export async function searchPapers(query: string, limit: number = 10): Promise<Paper[]> {
  const response = await fetch(
    `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per_page=${limit}&api_key=${OPENALEX_KEY}`
  );
  const data = await response.json();
  return data.results.map(transformOpenAlexWork);
}

// services/crossref.ts
export async function checkRetraction(doi: string): Promise<RetractionResult> {
  const response = await fetch(
    `https://api.crossref.org/v1/works/${doi}?mailto=${CROSSREF_EMAIL}`
  );
  const data = await response.json();
  
  const updateTo = data.message?.['update-to'];
  if (updateTo) {
    const retraction = updateTo.find((u: any) => u.type === 'retraction');
    if (retraction) {
      return {
        isRetracted: true,
        retractionDate: retraction.created,
        reason: retraction.assertion?.[0]?.explanation,
        source: retraction.source,
      };
    }
  }
  
  return { isRetracted: false };
}

// services/gemini.ts
export async function analyzeCitationContext(
  contextSnippet: string,
  citedPaperTitle: string,
  citedPaperYear: number
): Promise<CitationAnalysis> {
  const prompt = `Analyze this citation...`; // As shown in Section 5.6
  
  const response = await generativeAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });
  
  return JSON.parse(response.text);
}

// services/pipeline.ts
export async function runAnalysisPipeline(input: AnalysisInput): Promise<AnalysisResult> {
  // Step 1: Extract references
  const references = await extractReferences(input);
  
  // Step 2: Resolve papers via OpenAlex
  const papers = await resolvePapers(references);
  
  // Step 3: Check retraction status
  const retractionResults = await checkRetractions(papers);
  
  // Step 4: Analyze citation contexts
  const citationAnalyses = await analyzeCitations(input.text, papers);
  
  // Step 5: Calculate risk scores
  const riskScores = calculateRiskScores(retractionResults, citationAnalyses);
  
  // Step 6: Build citation graph
  const graph = await buildCitationGraph(papers, retractionResults);
  
  // Step 7: Generate report
  return generateReport(papers, retractionResults, citationAnalyses, riskScores, graph);
}
```

### 9.3 PDF Reference Extraction

```typescript
// services/pdf-parser.ts
import * as PyMuPDF from 'pymupdf'; // Via Python backend

export async function extractReferencesFromPDF(pdfBuffer: Buffer): Promise<Reference[]> {
  // Send to Python backend for GROBID/PyMuPDF processing
  const response = await fetch(`${PYTHON_BACKEND}/extract-references`, {
    method: 'POST',
    body: pdfBuffer,
    headers: { 'Content-Type': 'application/pdf' },
  });
  
  return response.json();
}

// Python backend (FastAPI)
// @app.post("/extract-references")
// async def extract_references(file: UploadFile):
//     pdf = fitz.open(stream=await file.read(), filetype="pdf")
//     references_section = find_references_section(pdf)
//     references = parse_references(references_section)
//     return references
```

---

## 10. Citation Context Analysis (AI)

### 10.1 Why This Matters

The same citation can have vastly different risk implications:

**Example 1 — Low Risk:**
> "Previous studies have explored various approaches to cancer detection [1]."

Risk: LOW — The paper merely mentions prior work as background.

**Example 2 — High Risk:**
> "We adopted the experimental protocol described by Smith et al. [1] for our cell culture assays."

Risk: HIGH — The paper directly uses the retracted paper's methodology.

**Example 3 — Critical:**
> "Our key finding confirms the results reported by Jones et al. [1], extending their framework to a new domain."

Risk: CRITICAL — The paper's core findings are built on the retracted paper's results.

### 10.2 Citation Type Taxonomy

| Type | Definition | Risk if Cited Paper Retracted |
|---|---|---|
| `methodology` | Citing paper uses cited paper's method, protocol, or technique | HIGH |
| `result_dependency` | Citing paper's findings depend on cited paper's results | CRITICAL |
| `comparison` | Citing paper compares its results with cited paper | MEDIUM |
| `background` | Citing paper mentions cited paper as general context | LOW |
| `general_reference` | Brief mention, no strong dependency | LOW |

### 10.3 Risk Level Definitions

| Level | Score Range | Definition |
|---|---|---|
| `low` | 0.0 - 0.25 | Minimal impact if cited paper is retracted |
| `medium` | 0.25 - 0.50 | Some dependency, results may need re-evaluation |
| `high` | 0.50 - 0.75 | Strong dependency, methodology or results may be compromised |
| `critical` | 0.75 - 1.00 | Core findings entirely dependent on retracted paper |

### 10.4 Prompt Engineering for Citation Analysis

```
System: You are an expert in research integrity and academic citation analysis.
Your task is to analyze how a specific citation is used in a research paper
and assess the risk if the cited paper has been retracted.

User:
Analyze the following citation context:

PAPER SNIPPET:
"{full_paragraph_containing_citation}"

CITATION BEING ANALYZED:
- Cited Paper: "{cited_paper_title}" ({cited_paper_year})
- Cited Paper Topic: {cited_paper_abstract_summary}
- Retraction Status: {RETRACTED / NOT_RETRACTED}
- Retraction Reason: {retraction_reason if applicable}

Provide your analysis in the following JSON format:
{
  "citation_type": "methodology|background|comparison|result_dependency|general_reference",
  "risk_level": "low|medium|high|critical",
  "risk_score": 0.0-1.0,
  "explanation": "Detailed explanation of why this citation type and risk level",
  "confidence": 0.0-1.0,
  "section_where_used": "introduction|methods|results|discussion|conclusion",
  "dependency_strength": "none|weak|moderate|strong|critical"
}

Rules:
1. METHODOLOGY risk is always at least HIGH if the cited paper is retracted
2. RESULT_DEPENDENCY risk is always CRITICAL if the cited paper is retracted
3. BACKGROUND citations are LOW risk even if the cited paper is retracted
4. Consider whether the retraction reason affects the specific usage
   (e.g., plagiarism retraction may not affect methodology validity)
5. If the cited paper is NOT retracted, risk is always 0.0 and level is "low"
```

---

## 11. Risk Scoring Algorithm

### 11.1 Individual Citation Risk Score

```
For each citation i:

  base_score = {
    methodology: 0.7,
    result_dependency: 0.9,
    comparison: 0.4,
    background: 0.1,
    general_reference: 0.05
  }[citation_type]

  retraction_multiplier = is_retracted ? 1.0 : 0.0

  reason_multiplier = {
    data_fabrication: 1.0,      # Most severe
    falsification: 1.0,
    image_manipulation: 0.9,
    unreliable_results: 0.8,
    plagiarism: 0.5,            # Affects attribution, not methodology
    ethical_violations: 0.6,
    peer_review_manipulation: 0.7,
    paper_mill: 0.9,
    other: 0.7
  }[retraction_reason] || 0.7

  section_multiplier = {
    methods: 1.2,               # Methodology citations weighted higher
    results: 1.1,
    introduction: 0.8,
    discussion: 0.9,
    conclusion: 1.0
  }[section] || 1.0

  citation_i_risk = base_score × retraction_multiplier × reason_multiplier × section_multiplier

  # Clamp to [0, 1]
  citation_i_risk = min(1.0, max(0.0, citation_i_risk))
```

### 11.2 Overall Paper Risk Score

```
For the entire paper:

  retracted_citations = [c for c in citations if c.is_retracted]
  high_risk_citations = [c for c in citations if c.risk_level in ['high', 'critical']]

  # Base score: proportion of references that are retracted
  retraction_ratio = len(retracted_citations) / total_references

  # Severity score: average risk of retracted citations
  severity_score = mean([c.risk_score for c in retracted_citations]) if retracted_citations else 0

  # Dependency score: proportion of references with high/critical dependency
  dependency_ratio = len(high_risk_citations) / total_references

  # Citation impact: weighted by citation count of retracted papers
  impact_score = mean([c.cited_paper.citation_count for c in retracted_citations]) / 1000

  # Combined score
  overall_risk = (
    0.35 × retraction_ratio +
    0.30 × severity_score +
    0.20 × dependency_ratio +
    0.15 × min(1.0, impact_score)
  )

  # Risk level
  risk_level = {
    [0.0, 0.2): 'safe',
    [0.2, 0.4): 'low',
    [0.4, 0.6): 'medium',
    [0.6, 0.8): 'high',
    [0.8, 1.0]: 'critical'
  }
```

### 11.3 Downstream Contagion Score

```
For papers that cite retracted papers (transitively):

  chain_risk = base_risk × (0.7 ^ depth)

  Where:
  - base_risk = risk score of the retracted paper citation
  - depth = number of hops from retracted paper (1 = direct, 2 = one hop away)
  - 0.7 = decay factor (risk decreases with distance)

  Example:
  - Direct citation of retracted paper: risk = 0.9 × 0.7^0 = 0.9
  - Paper that cites a paper that cites retracted: risk = 0.9 × 0.7^1 = 0.63
  - 3 hops away: risk = 0.9 × 0.7^2 = 0.44
```

---

## 12. Citation Graph Visualization

### 12.1 Graph Structure

**Nodes (Papers):**
- Each paper is a node
- Size based on citation count (more citations = larger node)
- Color based on risk level:
  - Green: Safe
  - Yellow: Low risk
  - Orange: Medium risk
  - Red: High risk / Retracted

**Edges (Citations):**
- Directed edges from citing paper → cited paper
- Thickness based on dependency strength
- Color matches the risk level of the dependency

### 12.2 Cytoscape.js Configuration

```typescript
const graphStyles = [
  {
    selector: 'node',
    style: {
      'label': 'data(label)',
      'background-color': 'data(color)',
      'width': 'mapData(citationCount, 0, 1000, 20, 60)',
      'height': 'mapData(citationCount, 0, 1000, 20, 60)',
      'font-size': '12px',
      'text-wrap': 'wrap',
      'text-max-width': '100px',
    }
  },
  {
    selector: 'edge',
    style: {
      'width': 'mapData(dependencyStrength, 0, 1, 1, 5)',
      'line-color': 'data(color)',
      'target-arrow-color': 'data(color)',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
    }
  },
  {
    selector: 'node[type="retracted"]',
    style: {
      'border-width': 3,
      'border-color': '#dc2626',
      'border-style': 'dashed',
    }
  },
  {
    selector: 'node:selected',
    style: {
      'border-width': 4,
      'border-color': '#3b82f6',
    }
  }
];

const layoutOptions = {
  name: 'cose',
  animate: true,
  animationDuration: 1000,
  nodeRepulsion: () => 8000,
  idealEdgeLength: () => 100,
  edgeElasticity: () => 100,
  gravity: 0.25,
  numIter: 1000,
};
```

### 12.3 Interactive Features

1. **Node Click:** Show paper details (title, authors, year, risk level)
2. **Edge Click:** Show citation context (the sentence where citation appears)
3. **Zoom/Pinch:** Navigate large graphs
4. **Filter by Risk Level:** Show only papers above certain risk threshold
5. **Filter by Citation Type:** Show only methodology citations, etc.
6. **Highlight Chain:** Click a retracted paper to highlight its contagion chain
7. **Export:** Download as PNG, SVG, or JSON

---

## 13. Project Setup

### 13.1 Directory Structure

```
citation-contagion/
├── README.md
├── package.json
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
├── .env.local                          # Environment variables
├── .env.example                        # Example env file
│
├── public/
│   ├── favicon.ico
│   └── logo.svg
│
├── src/
│   ├── app/                            # Next.js App Router
│   │   ├── layout.tsx                  # Root layout
│   │   ├── page.tsx                    # Landing page
│   │   ├── globals.css                 # Global styles
│   │   │
│   │   ├── analyze/
│   │   │   └── page.tsx                # Analysis page
│   │   │
│   │   ├── graph/
│   │   │   └── page.tsx                # Graph explorer
│   │   │
│   │   ├── about/
│   │   │   └── page.tsx                # About page
│   │   │
│   │   └── api/                        # API Routes
│   │       ├── analyze/
│   │       │   └── route.ts            # Main analysis endpoint
│   │       ├── papers/
│   │       │   ├── route.ts            # Search papers
│   │       │   └── [id]/
│   │       │       └── route.ts        # Get paper by ID
│   │       ├── citations/
│   │       │   └── route.ts            # Get citations
│   │       ├── graph/
│   │       │   └── route.ts            # Get graph data
│   │       ├── retraction/
│   │       │   └── check/
│   │       │       └── route.ts        # Check retraction
│   │       └── upload/
│   │           └── route.ts            # Upload PDF
│   │
│   ├── components/
│   │   ├── ui/                         # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── Modal.tsx
│   │   │
│   │   ├── landing/                    # Landing page components
│   │   │   ├── Hero.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── Demo.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── analysis/                   # Analysis page components
│   │   │   ├── UploadForm.tsx
│   │   │   ├── RiskScoreCard.tsx
│   │   │   ├── ReferenceBreakdown.tsx
│   │   │   ├── CitationList.tsx
│   │   │   ├── CitationCard.tsx
│   │   │   └── Recommendations.tsx
│   │   │
│   │   └── graph/                      # Graph components
│   │       ├── CitationGraph.tsx
│   │       ├── GraphControls.tsx
│   │       └── NodeDetails.tsx
│   │
│   ├── lib/
│   │   ├── supabase.ts                 # Supabase client
│   │   ├── openalex.ts                 # OpenAlex API client
│   │   ├── crossref.ts                 # Crossref API client
│   │   ├── semantic-scholar.ts         # Semantic Scholar API client
│   │   ├── pubmed.ts                   # PubMed E-utilities client
│   │   ├── unpaywall.ts                # Unpaywall API client
│   │   ├── gemini.ts                   # Gemini API client
│   │   ├── pdf-parser.ts               # PDF parsing utilities
│   │   ├── reference-extractor.ts      # Reference extraction logic
│   │   ├── risk-scorer.ts              # Risk scoring algorithm
│   │   └── graph-builder.ts            # Citation graph construction
│   │
│   ├── types/
│   │   ├── paper.ts                    # Paper type definitions
│   │   ├── citation.ts                 # Citation type definitions
│   │   ├── analysis.ts                 # Analysis type definitions
│   │   └── graph.ts                    # Graph type definitions
│   │
│   └── hooks/
│       ├── useAnalysis.ts              # Analysis state management
│       ├── useGraph.ts                 # Graph state management
│       └── useSupabase.ts              # Supabase auth hook
│
├── backend/                            # Python backend (PDF processing)
│   ├── requirements.txt
│   ├── main.py                         # FastAPI server
│   ├── services/
│   │   ├── pdf_parser.py               # PyMuPDF PDF parsing
│   │   ├── grobid_client.py            # GROBID reference extraction
│   │   └── reference_resolver.py       # DOI/title resolution
│   └── utils/
│       ├── text_processing.py          # Text cleaning utilities
│       └── regex_patterns.py           # Regex for DOI/title extraction
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql      # Database schema
│   └── seed.sql                        # Test data
│
└── docs/
    ├── API.md                          # API documentation
    ├── ALGORITHM.md                    # Risk scoring algorithm details
    └── DEPLOYMENT.md                   # Deployment guide
```

### 13.2 Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAlex
OPENALEX_API_KEY=your-openalex-key

# Crossref
CROSSREF_EMAIL=your@email.com

# Semantic Scholar
SEMANTIC_SCHOLAR_API_KEY=your-s2-key

# PubMed
PUBMED_API_KEY=your-pubmed-key

# Unpaywall
UNPAYWALL_EMAIL=your@email.com

# Gemini
GEMINI_API_KEY=your-gemini-key

# Python Backend
PYTHON_BACKEND_URL=http://localhost:8000
```

### 13.3 Installation Commands

```bash
# 1. Create Next.js project
npx create-next-app@latest citation-contagion \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd citation-contagion

# 2. Install frontend dependencies
npm install cytoscape react-cytoscapejs @supabase/supabase-js recharts lucide-react

# 3. Install dev dependencies
npm install -D @types/cytoscape

# 4. Initialize Supabase
npx supabase init
npx supabase login
npx supabase link --project-ref your-project-ref

# 5. Push database schema
npx supabase db push

# 6. Set up Python backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# 7. Start development servers
# Terminal 1: Frontend
cd citation-contagion
npm run dev

# Terminal 2: Backend
cd backend
uvicorn main:app --reload --port 8000
```

### 13.4 Python Backend Requirements

```txt
# backend/requirements.txt
fastapi==0.109.0
uvicorn==0.27.0
python-multipart==0.0.6
PyMuPDF==1.23.21
requests==2.31.0
pydantic==2.6.0
httpx==0.26.0
```

---

## 14. Implementation Phases

### Phase 1: Foundation (Day 1 — Morning)

**Goal:** Project scaffolding and basic infrastructure

**Tasks:**
1. Initialize Next.js project with TypeScript and Tailwind
2. Set up Supabase project and push database schema
3. Create basic UI layout (header, footer, pages)
4. Set up environment variables
5. Create API client wrappers for OpenAlex and Crossref
6. Test API connections with sample DOIs

**Deliverable:** Working Next.js app with Supabase connected and API clients functional

### Phase 2: Core Intelligence (Day 1 — Afternoon)

**Goal:** PDF parsing and retraction detection

**Tasks:**
1. Set up Python backend with FastAPI
2. Implement PDF reference extraction (PyMuPDF)
3. Build OpenAlex paper resolution (DOI → metadata)
4. Build Crossref retraction checking
5. Create basic analysis pipeline (upload → extract → resolve → check)
6. Test with a real paper that has retracted references

**Deliverable:** Can upload a PDF, extract references, resolve them, and detect retractions

### Phase 3: AI Analysis (Day 2 — Morning)

**Goal:** Citation context analysis with Gemini

**Tasks:**
1. Set up Gemini API client
2. Design prompt for citation type classification
3. Implement citation context extraction (find sentences with citations)
4. Build LLM analysis pipeline
5. Implement risk scoring algorithm
6. Test with sample citations

**Deliverable:** Can analyze citation context and assign risk scores

### Phase 4: Visualization (Day 2 — Afternoon)

**Goal:** Citation graph and dashboard

**Tasks:**
1. Set up Cytoscape.js in React
2. Build graph data structure from analysis results
3. Implement graph layout (cose algorithm)
4. Add node/edge styling based on risk levels
5. Build risk score card component
6. Build reference breakdown chart
7. Add interactivity (click, zoom, filter)

**Deliverable:** Interactive citation graph with color-coded risk levels

### Phase 5: Polish & Demo (Day 3)

**Goal:** Complete UX and demo preparation

**Tasks:**
1. Build landing page with hero section
2. Add loading states and error handling
3. Implement responsive design
4. Add export functionality (PNG, PDF report)
5. Prepare demo paper (find a real paper with retracted references)
6. Record demo video
7. Write README and documentation

**Deliverable:** Polished, demo-ready application

---

## 15. API Integration Details

### 15.1 OpenAlex Integration

```typescript
// lib/openalex.ts

const BASE_URL = 'https://api.openalex.org';
const API_KEY = process.env.OPENALEX_API_KEY;

interface OpenAlexWork {
  id: string;
  doi: string;
  title: string;
  abstract_inverted_index: Record<string, number[]>;
  authorships: Array<{
    author: { display_name: string; orcid?: string };
    institutions: Array<{ display_name: string }>;
  }>;
  publication_year: number;
  cited_by_count: number;
  referenced_works: string[];
  concepts: Array<{ display_name: string; score: number }>;
  open_access: { is_oa: boolean; oa_status: string; oa_url?: string };
}

export async function getWorkByDOI(doi: string): Promise<OpenAlexWork | null> {
  const response = await fetch(
    `${BASE_URL}/works/doi:${doi}?api_key=${API_KEY}`
  );
  
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`OpenAlex error: ${response.status}`);
  
  return response.json();
}

export async function getWorksByDOIs(dois: string[]): Promise<OpenAlexWork[]> {
  // Batch lookup: up to 50 DOIs per request
  const filter = dois.map(d => `doi:${d}`).join('|');
  const response = await fetch(
    `${BASE_URL}/works?filter=doi:${filter}&per_page=50&api_key=${API_KEY}`
  );
  
  const data = await response.json();
  return data.results;
}

export async function searchWorks(
  query: string,
  options: { limit?: number; year?: number; concept?: string } = {}
): Promise<OpenAlexWork[]> {
  const params = new URLSearchParams({
    search: query,
    per_page: String(options.limit || 10),
    api_key: API_KEY!,
  });
  
  if (options.year) params.append('filter', `publication_year:${options.year}`);
  if (options.concept) params.append('filter', `concepts.id:${options.concept}`);
  
  const response = await fetch(`${BASE_URL}/works?${params}`);
  const data = await response.json();
  return data.results;
}

// Convert OpenAlex inverted index to readable abstract
export function reconstructAbstract(invertedIndex: Record<string, number[]>): string {
  if (!invertedIndex) return '';
  
  const wordPositions: Array<[number, string]> = [];
  
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) {
      wordPositions.push([pos, word]);
    }
  }
  
  wordPositions.sort((a, b) => a[0] - b[0]);
  return wordPositions.map(([_, word]) => word).join(' ');
}
```

### 15.2 Crossref Integration

```typescript
// lib/crossref.ts

const BASE_URL = 'https://api.crossref.org';
const EMAIL = process.env.CROSSREF_EMAIL;

interface RetractionResult {
  isRetracted: boolean;
  retractionDate?: string;
  reason?: string;
  source?: string;
  originalDOI?: string;
}

export async function checkRetraction(doi: string): Promise<RetractionResult> {
  const response = await fetch(
    `${BASE_URL}/v1/works/${doi}?mailto=${EMAIL}`
  );
  
  if (!response.ok) {
    console.error(`Crossref error for ${doi}: ${response.status}`);
    return { isRetracted: false };
  }
  
  const data = await response.json();
  const message = data.message;
  
  // Check for retraction in update-to field
  const updateTo = message['update-to'];
  if (updateTo && Array.isArray(updateTo)) {
    const retraction = updateTo.find(
      (update: any) => update.type === 'retraction'
    );
    
    if (retraction) {
      return {
        isRetracted: true,
        retractionDate: retraction.created,
        reason: retraction.assertion?.[0]?.explanation,
        source: retraction.source,
        originalDOI: retraction.DOI,
      };
    }
  }
  
  return { isRetracted: false };
}

export async function getRecentRetractions(
  options: { from?: string; until?: string; limit?: number } = {}
): Promise<any[]> {
  const params = new URLSearchParams({
    'filter': 'update-type:retraction',
    'rows': String(options.limit || 100),
    'mailto': EMAIL!,
  });
  
  if (options.from) params.append('filter', `from-pub-date:${options.from}`);
  if (options.until) params.append('filter', `until-pub-date:${options.until}`);
  
  const response = await fetch(`${BASE_URL}/v1/works?${params}`);
  const data = await response.json();
  
  return data.message.items;
}
```

### 15.3 Gemini Integration

```typescript
// lib/gemini.ts

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface CitationAnalysis {
  citation_type: 'methodology' | 'background' | 'comparison' | 'result_dependency' | 'general_reference';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  explanation: string;
  confidence: number;
  section_where_used: string;
  dependency_strength: 'none' | 'weak' | 'moderate' | 'strong' | 'critical';
}

export async function analyzeCitationContext(
  contextSnippet: string,
  citedPaperTitle: string,
  citedPaperYear: number,
  citedPaperAbstract: string,
  isRetracted: boolean,
  retractionReason?: string
): Promise<CitationAnalysis> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  const prompt = `You are an expert in research integrity and academic citation analysis.

Analyze the following citation and classify how it is used:

PAPER SNIPPET:
"${contextSnippet}"

CITATION DETAILS:
- Cited Paper: "${citedPaperTitle}" (${citedPaperYear})
- Abstract Summary: ${citedPaperAbstract}
- Retraction Status: ${isRetracted ? 'RETRACTED' : 'NOT RETRACTED'}
${isRetracted ? `- Retraction Reason: ${retractionReason}` : ''}

Provide your analysis in this exact JSON format (no markdown, just JSON):
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
5. Consider whether the retraction reason affects this specific usage`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  
  // Parse JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse Gemini response');
  }
  
  return JSON.parse(jsonMatch[0]);
}
```

---

## 16. Error Handling & Edge Cases

### 16.1 API Error Handling

```typescript
// Retry logic with exponential backoff
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3
): Promise<Response> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        // Rate limited — wait and retry
        const retryAfter = response.headers.get('Retry-After') || '5';
        await sleep(parseInt(retryAfter) * 1000);
        continue;
      }
      
      if (response.ok) return response;
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await sleep(Math.pow(2, attempt) * 1000); // Exponential backoff
    }
  }
  
  throw new Error('Max retries exceeded');
}
```

### 16.2 Edge Cases to Handle

| Edge Case | Handling |
|---|---|
| **DOI not found** | Mark as "unresolved", continue with other references |
| **Paper not in OpenAlex** | Try Semantic Scholar, then PubMed, then mark as unresolved |
| **Crossref timeout** | Retry with backoff, mark as "retraction check pending" |
| **Gemini rate limit (429)** | Queue and retry after cooldown, use cached results if available |
| **PDF has no references section** | Try GROBID first, fallback to regex patterns, ask user to enter DOIs manually |
| **Reference has no DOI** | Search by title + author via OpenAlex |
| **Multiple papers match title** | Present options to user for manual selection |
| **Retraction reason unavailable** | Use "unknown" as reason, assign default severity multiplier |
| **Circular citations** | Track visited nodes in graph traversal, prevent infinite loops |
| **Very large reference list (>200)** | Process in batches, show progress, allow user to cancel |
| **Non-English paper** | Attempt translation via Gemini, flag as "language: non-English" |
| **Paywalled full text** | Use abstract for analysis, flag as "limited analysis — full text unavailable" |

### 16.3 User-Facing Error Messages

```typescript
const ERROR_MESSAGES = {
  PDF_PARSE_FAILED: "We couldn't parse your PDF. Please try uploading a different file or enter your references manually.",
  DOI_NOT_FOUND: "This DOI wasn't found in our databases. Please check the DOI and try again.",
  RATE_LIMITED: "We're processing many requests right now. Please wait a moment and try again.",
  ANALYSIS_FAILED: "Analysis failed due to an unexpected error. Your partial results have been saved.",
  NO_REFERENCES_FOUND: "We couldn't extract references from this paper. Please enter them manually.",
  GEMINI_UNAVAILABLE: "AI analysis is temporarily unavailable. Basic retraction checking will still work.",
};
```

---

## 17. Deployment

### 17.1 Frontend (Vercel)

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/citation-contagion.git
git push -u origin main

# 2. Deploy to Vercel
# Go to vercel.com → Import GitHub repository → Deploy

# 3. Set environment variables in Vercel dashboard
# Project Settings → Environment Variables → Add all .env.local variables
```

### 17.2 Backend (Railway)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login and init
railway login
railway init

# 3. Add Python buildpack
# railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "uvicorn main:app --host 0.0.0.0 --port $PORT"

# 4. Deploy
railway up
```

### 17.3 Database (Supabase Cloud)

```bash
# Already cloud-hosted when you create project at supabase.com
# Push schema
npx supabase db push --project-ref your-project-ref
```

---

## 18. Demo & Testing

### 18.1 Demo Paper Selection

Find a real paper with known retracted references:
1. Search Retraction Watch for highly-cited retracted papers
2. Find papers that cite those retracted papers
3. Use one as the demo input

**Example chain:**
- Retracted: "STAP cells" paper by Obokata et al. (2014) — retracted for data fabrication
- Papers citing it: 100+ papers, some used the STAP methodology
- Demo: Upload one of those papers, show the system detecting the retracted dependency

### 18.2 Test Cases

| Test Case | Expected Result |
|---|---|
| Upload paper with 0 retracted references | Risk score: 0%, all green |
| Upload paper with 1 retracted background citation | Risk score: low, 1 yellow node |
| Upload paper with retracted methodology citation | Risk score: high, 1 red node with methodology badge |
| Upload paper with no DOI | Error message, manual entry option |
| Upload corrupted PDF | Error message, retry option |
| Enter valid DOI | Full analysis with graph |
| Enter invalid DOI | "DOI not found" message |

### 18.3 Performance Benchmarks

| Metric | Target |
|---|---|
| PDF upload to first result | < 10 seconds |
| Full analysis (50 references) | < 60 seconds |
| Graph rendering | < 3 seconds |
| API response time | < 500ms |
| LLM analysis per citation | < 5 seconds |

---

## 19. Budget & Limits Summary

### 19.1 Free Tier Allowances

| Service | Free Tier | Daily Capacity |
|---|---|---|
| **OpenAlex** | $1/day | ~10,000 list calls |
| **Crossref** | Unlimited (polite pool) | ~864,000 req/day |
| **Semantic Scholar** | 1 req/sec | ~86,400 req/day |
| **PubMed** | 10 req/sec | ~864,000 req/day |
| **Unpaywall** | 100K/day | 100,000 req/day |
| **Gemini Flash** | 250 RPD | 250 analyses/day |
| **Supabase** | 500MB DB | ~100K papers |
| **Vercel** | 100GB bandwidth | Sufficient |
| **Railway** | $5 credit | ~500 hours |

### 19.2 Cost at Scale

| Usage Level | Monthly Cost |
|---|---|
| MVP / Demo (< 100 analyses/day) | **$0** |
| Small team (10 users, 500 analyses/day) | **~$25** (Supabase Pro) |
| Department (50 users, 2K analyses/day) | **~$50-100** (Supabase + Gemini paid) |
| Production (500+ users) | **~$200-500** (scaled infrastructure) |

---

## 20. Future Enhancements

### 20.1 Post-MVP Features

1. **Browser Extension** — Check citations while browsing Google Scholar
2. **Zotero/Mendeley Integration** — Plugin for reference managers
3. **Batch Analysis** — Upload entire reference library
4. **Historical Tracking** — Monitor papers over time for new retractions
5. **Institutional Dashboard** — Overview for universities
6. **API for Third Parties** — Let other tools use our analysis engine
7. **Preprint Screening** — Check preprints before publication
8. **Collaboration Features** — Share analyses with co-authors
9. **PDF Report Export** — Generate shareable PDF reports
10. **Email Alerts** — Notify when a referenced paper is retracted

### 20.2 Advanced Analysis

1. **Full-text Analysis** — Analyze entire paper, not just citation sentences
2. **Network Effects** — Model how retraction risk propagates through citation networks
3. **Journal Reputation** — Factor in journal impact and retraction history
4. **Author Reputation** — Track author-level integrity metrics
5. **Temporal Analysis** — How quickly do retractions propagate?
6. **Field Comparison** — Retraction rates across disciplines

### 20.3 Data Sources to Add

1. **DOAJ** — Directory of Open Access Journals
2. **CORE** — Full-text research papers
3. **Europe PMC** — Additional biomedical full text
4. **SSRN** — Preprints in social sciences
5. **arXiv** — Preprints in physics, math, CS
6. **PubPeer** — Post-publication peer review
7. **Retraction Watch CSV** — Local database for fast lookups

---

## Appendix A: Sample API Responses

### A.1 OpenAlex Work Response

```json
{
  "id": "https://openalex.org/W2741809803",
  "doi": "https://doi.org/10.1038/nature12373",
  "title": "A high-resolution transcriptome-wide spatial atlas of protein expression in the mouse brain",
  "publication_year": 2014,
  "cited_by_count": 342,
  "referenced_works": [
    "https://openalex.org/W1528548608",
    "https://openalex.org/W2105044823"
  ],
  "authorships": [
    {
      "author": {
        "display_name": "John Smith",
        "orcid": "https://orcid.org/0000-0002-1234-5678"
      },
      "institutions": [
        { "display_name": "MIT" }
      ]
    }
  ],
  "open_access": {
    "is_oa": true,
    "oa_status": "green",
    "oa_url": "https://example.com/paper.pdf"
  }
}
```

### A.2 Crossref Retraction Response

```json
{
  "status": "ok",
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
            "explanation": "Retracted due to image manipulation and data fabrication"
          }
        ]
      }
    ]
  }
}
```

### A.3 Gemini Analysis Response

```json
{
  "citation_type": "methodology",
  "risk_level": "high",
  "risk_score": 0.78,
  "explanation": "The citing paper explicitly states it adopted the experimental protocol from the cited paper for cell culture and assay procedures. Since the cited paper was retracted for data fabrication, the validity of this methodology is questionable, and the citing paper's experimental results may be unreliable.",
  "confidence": 0.92,
  "section_where_used": "methods",
  "dependency_strength": "strong"
}
```

---

## Appendix B: Glossary

| Term | Definition |
|---|---|
| **DOI** | Digital Object Identifier — unique identifier for academic papers |
| **Citation** | A reference from one paper to another |
| **Retraction** | Formal withdrawal of a published paper due to serious problems |
| **Contagion** | The spread of unreliability from retracted papers to papers that cite them |
| **Risk Score** | Numerical assessment (0.0-1.0) of how affected a paper is by retracted citations |
| **Citation Context** | The sentence(s) in a paper where a specific citation appears |
| **Citation Type** | Classification of how a citation is used (methodology, background, etc.) |
| **Downstream** | Papers that cite papers that cite the retracted paper (transitive dependency) |
| **pgvector** | PostgreSQL extension for vector similarity search |
| **pgRouting** | PostgreSQL extension for graph traversal algorithms |
| **SPECTER2** | Semantic Scholar's embedding model for paper similarity |
| **GROBID** | Machine learning tool for extracting references from PDFs |

---

*Document Version: 1.0*
*Last Updated: September 2026*
*Project: Citation Contagion*
*Status: MVP Specification*
