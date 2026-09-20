# Layer 3: Execution Scripts

This directory contains deterministic Python scripts that perform the actual work: API calls, data transformations, scraping, exports, and database interactions.

## Script Guidelines

1. **Deterministic & Testable**:
   - Write clean, modular functions.
   - Scripts should accept command-line arguments or explicit inputs.
   - Avoid hardcoded values; use `.env` for secrets, tokens, and credentials.

2. **Error Handling & Logging**:
   - Return structured status outputs (e.g., JSON or exit codes).
   - Provide clear stack traces and log messages when exceptions occur to aid self-annealing.

3. **Intermediates vs Deliverables**:
   - Write temporary files/caches into `.tmp/`.
   - Never commit `.tmp/` data.

4. **Self-Annealing Flow**:
   - If a script encounters an API error, rate limit, or format mismatch, fix the script in `execution/`, test it, and update the corresponding directive in `directives/`.
