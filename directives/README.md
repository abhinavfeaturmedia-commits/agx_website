# Layer 1: Directives (SOPs)

This directory contains Standard Operating Procedures (SOPs) written in Markdown. Directives define **what to do** in clear, natural language steps.

## Directive Structure Template

When creating new directives in `directives/`, follow this structure:

```markdown
# [Directive Name]

## Goal
A clear description of the objective and desired outcome.

## Inputs
- Required input files, parameters, arguments, or environment variables.

## Tools & Scripts
- Reference deterministic scripts located in `execution/` (e.g. `execution/scrape_single_site.py`).

## Step-by-Step Procedure
1. Step 1...
2. Step 2...
3. Step 3...

## Outputs & Deliverables
- Intermediate artifacts (stored in `.tmp/`).
- Final cloud deliverables (e.g., Google Sheets, Slides, etc.).

## Edge Cases & Failure Recovery
- Known limitations, rate limits, retry strategies, and error handling steps.
```

## Guidelines
- Directives are living documents. When new edge cases, API limits, or better workflows are discovered, update the directive.
- Directives should describe the goal and process clearly so any agent or human operator can orchestrate deterministic execution.
