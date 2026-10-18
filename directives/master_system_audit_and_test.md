# Directive: Master System Audit and Headless Verification

## Goal
Execute an automated, end-to-end headless verification of all 21 MySQL tables, Express REST API endpoints, business logic, workflows, foreign key relations, and options without launching or requiring a preview browser.

## Inputs
- Database connection via `server/db.js` (Hostinger MySQL / MariaDB 10.5+ on `srv2205.hstgr.io`).
- Environment variables in `.env` (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`).
- Server schema in `database/mysql_schema.sql` and API endpoints in `server.js`.

## Tools / Scripts
- `execution/test_master_system.mjs`: The deterministic test runner covering all 9 phases.
- `server/db.js`: Connection pool for direct SQL verification and assertions.
- `server/localDb.js`: Local persistence fallback store.

## Execution Steps
1. Run `node execution/test_master_system.mjs`.
2. The script executes the 9 test suites sequentially:
   - Phase 1: Health & MySQL Pool Connectivity
   - Phase 2: Profiles & Authentication (PBKDF2 & JWT)
   - Phase 3: Inbound Leads & Timeline Activities
   - Phase 4: Lead Conversion to Clients & Projects (Relational Integrity)
   - Phase 5: Milestones & Tokenized Client QA Portal
   - Phase 6: Sequential Quotations, Invoices, GST Engine & Payments Ledger
   - Phase 7: Partner Program, Tier Calculations, Custom Rates & Payouts
   - Phase 8: Secure Vault, Audit Trail & Document Storage
   - Phase 9: Soft Delete, Restore & Cleanup (Zero database debris)
3. Generate the finalized Audit Report with execution timestamps, latencies, and pass/fail metrics.

## Edge Cases & Handling
- **Database Connection Pool Timeout**: The script ensures `process.exit(0)` is invoked after closing the pool, preventing hung tasks.
- **Foreign Key Constraints**: All child records (e.g. `lead_activities`, `milestones`, `issues`) are cleaned up properly to respect foreign key cascades and prevent orphan rows.
- **Transient Network Hiccups**: The test harness retries MySQL queries up to 3 times before recording an error.
