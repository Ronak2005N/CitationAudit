# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 14 (App Router) + TypeScript + Tailwind CSS + Python (FastAPI) + Supabase (PostgreSQL)

## Users

Primary: Academic researcher checking their own paper before submission. They need to identify whether any references in their paper are retracted or create a potentially significant research dependency risk.

Other audiences (post-MVP): Peer reviewers, journal editors, graduate students, research institutions, science journalists.

## Product Purpose

Citation Contagion is a research dependency scanner. It takes a paper (via DOI or PDF upload), extracts its references, checks each for retraction status, analyzes how each citation is used (methodology vs. background), calculates a risk score, and visualizes the "contagion" through an interactive citation graph.

Success: A researcher discovers a retracted dependency they did not know about, understands the risk level, and can take action before submission.

## Positioning

Unlike reference managers (Zotero, Mendeley) that just track citations, Citation Contagion answers: "If this paper was retracted, how much does that affect MY research?" — the dependency/security scanner for scientific literature.

## Operating Context

- Researcher has a paper ready or near-ready for submission
- They upload PDF or enter DOI
- System processes in under 60 seconds
- They see: risk score, retracted references highlighted, citation graph, recommendations
- They take action: revise references, re-evaluate methodology, note in cover letter

## Capabilities and Constraints

- Single paper analysis (MVP)
- Biomedical research focus (MVP)
- 1-3 hop citation chain
- Real retractions from Retraction Watch via Crossref
- AI-powered citation context analysis (Gemini Flash)
- Interactive citation graph (Cytoscape.js)
- Risk score with breakdown
- PDF upload and DOI input
- No user accounts required (MVP)

## Brand Commitments

- Name: Citation Contagion
- Voice: Serious, clear, authoritative — like a research tool, not a marketing site
- Visual: Serious and trustworthy — clean, minimal, medical-journal authority feel
- Dark mode: Yes, as primary theme

## Evidence on Hand

- Full project specification (PROJECT.md)
- Database schema, API integrations, risk algorithm all documented
- No existing code, assets, or brand materials — greenfield

## Product Principles

1. Invisible problem → visible danger (the graph makes contagion tangible)
2. Quantified risk, not binary yes/no (score + breakdown)
3. Context matters (how you cite matters more than whether you cite)
4. Trust through transparency (show the data, explain the reasoning)
5. Zero friction (DOI in, report out, no signup required)

## Accessibility and Inclusion

- WCAG AA contrast compliance
- Keyboard navigable
- Screen reader compatible
- Reduced motion support
