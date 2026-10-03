# MAZOALA Inventory — Implementation Plan

Version 1.0 · 2026-10-04 · Business timezone: Asia/Ulaanbaatar

## 1. Purpose, evidence, and gates

Build MAZOALA Inventory first: catalog, stock, receiving, manual orders, prepared deliveries, reports, and audit. Prepare stable interfaces for future e-commerce without building a storefront or payment system in v1.

**Source limitation:** The seven-page *MAZOALA Inventory & Delivery System Full Report* was unavailable when this plan was written. The workspace `sources/` directory was empty; the referenced chat returned no attachments. This plan uses the visible “System Automation Planning” conversation and the current request. It does not claim page-by-page report verification. Exact source formulas, missing-price identities, lid identities, and reporting cutoffs have not been invented.

Reference: “System Automation Planning,” conversation `6abcc220-dbb8-83ee-9d82-e9668b2e2e29`. The chat confirms modular monolith, inventory-first sequencing, code/color matching, confirmed counts, prepared-stock deductions, item rows, ledger/reservations, and staged migration. The current request specifies twelve missing prices, two lids without SKU, and Wednesday-exclusive reporting. Several recent chat answers were returned only as content-reference placeholders.

Evidence labels:
- **[L] Legacy requirement reported in chat/request:** preserve, then verify against report/workbook before claiming parity.
- **[A] Agreed architecture:** inventory-first modular monolith; Next.js/TypeScript, Node.js domain backend, PostgreSQL/Drizzle, Supabase Auth, Tailwind/custom UI, object storage, jobs, REST/webhooks.
- **[P] Proposed implementation:** new design, not documented legacy behavior.
- **[U] Unconfirmed:** requires source evidence or owner decision.

**Gate 0:** Obtain the report and timestamped workbook export, including formulas, tabs, checkbox meanings, and representative delivery/report rows. Create `docs/legacy-rule-matrix.md`: rule ID, report page, tab/column/formula, example, target behavior, approval. Keep `sources/` read-only; put working copies and outputs elsewhere. Scaffolding can begin before this gate; legacy sign-off, production migration, and report scheduling cannot.

## 2. Scope and operating principles

V1 includes staff authentication, catalog/price-gap review, inventory ledger, receiving, manual orders/reservations, full-order preparation, manual delivery tracking, Wednesday reporting/export, migration, audit, backups, and integration-ready contracts.

Defer storefront/checkout, payments, automatic courier submission, source-website import, marketing/Meta analytics, full purchasing accounting, multi-location transfers, and complex partial fulfillment. Keep extension points; do not build those systems prematurely.

- Every stock mutation goes through one domain engine.
- Draft entry changes no stock; confirmation does.
- Reservations reduce availability, not on-hand quantity.
- Preparation consumes stock once; delivery/payment callbacks never deduct again.
- PostgreSQL and Sheets cannot be independent simultaneous stock authorities.
- External failures cannot corrupt committed inventory.
- Corrections append compensating records; never erase history.

## 3. Legacy rules and exact target behavior

| ID | Reported legacy requirement | Target implementation | Verify before parity |
|---|---|---|---|
| L01 | Product ↔ Item Code ↔ Color match | Resolve one approved variant; reject conflicting tuple | Code normalization, aliases, duplicates |
| L02 | Invoice/count/difference/confirmation | Add counted quantity only after explicit confirmation | Difference sign, checkbox meaning, approvals |
| L03 | Prepared deliveries subtract stock | Preparation is the single outgoing-stock event | Row/order checkbox granularity, partial preparation |
| L04 | Wednesday-exclusive weekly reporting | Preserve approved Wednesday-only behavior | Generation day versus included dates/cutoff |
| L05 | One product per row | Separate variant/quantity/price line per item | Export header repetition and grouping |
| L06 | Addresses and notes | Preserve full original text and snapshot per order | Required fields and courier format |
| L07 | Twelve prices missing | NULL, review queue, no invented/zero default | Identities, price type, latest count |
| L08 | Two lids without SKU | Quarantine until approved code/classification | Names, colors, quantities, relationships |

### Item Code and color [L + P]

Use stable internal variant UUIDs and preserve raw source Item Codes. Proposed uniqueness: one Item Code globally within MAZOALA. Keep approved product/color aliases in explicit mapping tables. Trimming, case folding, and Unicode normalization must follow collision analysis and approval; never silently merge codes. Fuzzy suggestions can assist review but cannot finalize a stock match. Verify product, code, and color together on import and order entry. Optional source HEX values are not identification keys and must not be guessed. Display-label edits do not rewrite historical snapshots.

### Incoming stock [L + P]

Proposed states: `DRAFT → COUNTED → CONFIRMED`; void only before confirmation.

1. Enter invoice quantity and actual count separately for each variant; whole nonnegative units in v1.
2. Counted zero is valid; missing count is NULL.
3. Proposed signed difference: `counted - invoice`. Confirm legacy sign before matching its display.
4. A discrepancy requires a reason and proposed manager approval; confirm permission policy.
5. Explicit confirmation adds **counted**, not invoice quantity, once in an atomic transaction.
6. Lock confirmed receipts. Correct with linked reversal/correction records; reject reductions violating reservations.
7. V1 confirmation is all-or-nothing. Separate receipts can reference one shipment; do not edit an already posted receipt for partial arrival.
8. Incoming projections never count as available stock; identify shipment references to prevent duplicate incoming totals.

Example: invoice 100, counted 98, difference -2. Entry changes stock by zero; confirmation adds 98; retries still add only 98.

### Orders, preparation, and double-deduction prevention [L + P]

Separate state axes:
- Order: `DRAFT`, `CONFIRMED`, `CANCELLED`, `CLOSED`.
- Fulfillment: `UNPREPARED`, `PREPARED`, `REVERSED`.
- Delivery: `NOT_CREATED`, `PENDING`, `IN_TRANSIT`, `DELIVERED`, `FAILED`, `CANCELLED`.
- Manual payment annotation: `UNKNOWN`, `UNPAID`, `PAID`; no stock effect.

Reserve every item atomically on order confirmation [P]. Preparation consumes reservations and deducts on-hand in the same transaction. V1 prepares the whole order; partial behavior requires a separately approved extension. Block unresolved items, missing quantity, inadequate stock, and repeated consumption. Courier creation, dispatch, delivery completion/failure, and payment updates have zero stock effect.

Before preparation, cancellation releases reservations. After preparation, cancellation does not automatically restock: require physical return, inspection, manager confirmation, and linked compensating movement. Failed delivery is not proof that saleable stock returned. Undoing preparation requires a physical re-entry/reversal and reason; a checkbox toggle cannot delete ledger history.

### Rows, prices, addresses, notes [L + P]

An order header owns customer/delivery details. Each item row holds one variant, quantity, unit-price snapshot, and amount. Multiple different products never share a comma-separated item field. Identical units may use one row with quantity two; distinct source rows with different prices/notes remain distinct. Group legacy rows only by reliable source order identity, never merely name/phone/date.

Store unknown prices as NULL, not zero. Catalog gap review must identify the twelve reported records and explain any latest-snapshot count changes. Proposed rule: missing price blocks automatic-priced order confirmation; a manager may enter a verified order-specific price with provenance/reason without silently updating catalog. Free-of-charge is a separate approved case. Proposed currency is MNT with integer monetary units and documented scale; verify currency and fractional pricing before schema finalization.

The two SKU-less lids remain unresolved catalog records. Assign no fabricated code. Owner must approve unique codes or non-sellable classification. Their physical quantities must remain accounted for, including if quarantined at cutover.

Preserve original address text plus recipient, phone, district, khoroo, building/street, apartment, entrance, floor, and delivery instructions where available. Confirm mandatory fields and phone rules. Preserve Mongolian text/line breaks. Snapshot addresses and item descriptions per order so customer/catalog edits do not change existing delivery details. Separate internal notes from courier-facing instructions. A future adapter should preview its outbound address/notes payload.

### Wednesday-exclusive report [L, exact semantics U]

Do not assume “weekly” means seven days of sales or only Wednesday transactions. Confirm whether Wednesday controls generation, cutoff, included transaction dates, or several of these. Confirm exact local boundaries, source date column, inclusion/confirmation status, cancellations/returns, late entries, price gaps, and historical reruns.

**Proposed default, pending approval:** normal official generation only on Wednesday in Asia/Ulaanbaatar, with prior-Wednesday-to-current-Wednesday half-open period `[start, end)`. This is a proposal, not a documented legacy rule. Keep production scheduling disabled until verified. Other-day previews must be labeled previews.

Implement approved period resolution as a pure tested function. Store timezone, start/end, cutoff, rule version, revision, included entity IDs, totals, completeness, and generator on immutable report snapshots. One scheduled logical run per period/rule prevents duplicate reports. Approved reruns create revisions. Missing included prices make financial totals incomplete; NULL cannot quietly become zero.

## 4. Architecture [A + P]

```text
Staff → Next.js admin + /api/v1 routes (Node runtime)
                  → shared TypeScript domain modules
                           → Drizzle → PostgreSQL
                           → transactional outbox
                                      ↓
                               Node job worker
                                      ↓
                       exports/storage/future adapters
Supabase Auth → verified server identity → application RBAC
Future commerce → same API/domain commands
```

One repository, one domain codebase, one database; web and worker are separate runtime processes from the same release. The Node domain backend starts as server-only packages invoked by thin Next.js handlers, not another independent stock service. Extract an HTTP host later only if operational needs justify it.

Modules: catalog, inventory, receiving, orders, fulfillment, delivery, reporting, migration, identity/audit, integrations. Each owns validation, policies, commands, queries, and persistence mappings. Cross-module commands share explicit transactions. No UI SQL or worker-specific stock calculations.

Propose PostgreSQL-backed queue/outbox for v1. Select a maintained compatible queue during setup and test leases/retries; Redis/hosted workflows remain optional. Disable/mock external adapters until their contracts and access are confirmed.

Tailwind/custom design system: spacing/typography/color/focus tokens, inputs, variant selector, stock table, discrepancy panel, status badges, confirmation dialogs, row errors, and accessible packing views. Support Mongolian content, keyboard use, responsive layouts, and explicit empty/loading/error states. Label on-hand/reserved/available separately.

## 5. Repository structure

```text
mazoala/
  PLAN.md, AGENTS.md
  apps/
    admin/                # Next.js UI, server auth, thin REST routes
    worker/               # Node queue/outbox/report scheduler
  packages/
    domain/src/{catalog,inventory,receiving,orders,fulfillment,delivery,reporting}/
    db/{src/schema,migrations,seeds}/
    contracts/            # validation/API types/OpenAPI
    ui/                   # design tokens/components
    integrations/         # Sheets, storage, future provider adapters
    auth/                 # server identity/permission policies
    observability/
  tools/migration/
  tests/{unit,integration,e2e,fixtures}/
  docs/
    legacy-rule-matrix.md
    decisions/
    migration/{mapping,data-quality,cutover}/
    runbooks/{deploy,restore,worker,inventory-correction}/
  .env.example
  package.json, pnpm-workspace.yaml
```

Pin current compatible supported versions and lockfile during implementation; check official documentation then. Fixtures are synthetic; never embed production customer data in tests.

## 6. Schema outline [P]

Operational records use UUIDs, UTC timestamps, actor references, foreign keys, and import lineage. Preserve date-only source values as business dates; do not invent precise historical timestamps.

| Table | Main fields/constraints |
|---|---|
| products/colors | canonical names, product metadata, optional HEX, active status |
| variants | product/color FKs, item_code, normalized lookup, nullable sale/cost price, provenance, sellable; unique approved code scope |
| catalog_aliases | source namespace/raw values, approved variant, approver |
| locations | one main location initially; future-ready FK |
| stock_balances | unique variant/location, on_hand, reserved, version; `0 <= reserved <= on_hand` |
| stock_movements | signed delta, type, variant/location, operation/source reference, reversal_of, reason/actor/time; immutable, unique logical movement |
| reservations | item/location, qty, ACTIVE/CONSUMED/RELEASED, operation; one active allocation per item/location in v1 |
| receipts/items | supplier/reference, invoice_qty, counted_qty nullable, state, difference/reason, confirmed_at/by, source row |
| customers | optional reusable contact; legacy dedup not mandatory |
| orders | number, source/external ID, state axes, address/contact snapshot, internal notes, currency/totals/version |
| order_items | one variant/row, qty, price and description/code/color snapshots, source identity |
| preparations/items | order, operation, item allocations, prepared actor/time; unique consumed allocation |
| deliveries | order, provider/external ID, state/tracking/fee, address/instructions snapshot, attempt metadata |
| report_runs/rows | period/timezone/rule/revision/cutoff, included IDs, completeness/totals, artifact key |
| user_roles | Supabase user UUID, role, active, approver; server-managed |
| audit_events | actor/action/entity, redacted change diff, reason, request/operation ID; append-only |
| idempotency_records | client/actor scope, command/key, request hash, result/status; unique scoped key |
| outbox_events/jobs | event ID/version, payload, attempts/due_at/lease/status/error; unique consumer/event |
| webhook_inbox | provider/event unique, verified payload reference, received/processed times |
| integration_links | provider/external identity/internal identity; unique namespace mapping |
| import_batches/rows | file hash/time, tab/row/raw values, mapping/status/errors, target IDs |
| unresolved_catalog | missing code/price source records, issue/resolution/approval history |
| assets | private object key, MIME/size/checksum, owner/access policy |

Index ledger by variant/location/time, orders/receipts by status/date, jobs by status/due time, imports by batch/status, and external identities. V1 is single-organization MAZOALA, not a multi-tenant SaaS.

`on_hand = SUM(stock movement deltas)` including opening stock. `reserved = SUM(active reservations)`. `available = on_hand - reserved`. Balance rows are transactionally maintained projections, not independently editable truth. Reconcile projections regularly; alert/block unsafe commands on drift.

Saleable on-hand is a logical bucket: prepared goods leave it even while physically waiting for courier. Incoming, damaged, quarantined, and return-pending-inspection quantities are separate and unavailable for sale.

## 7. Transactions and idempotency

Every stock command:
1. Authenticate/authorize server-side and validate input.
2. Begin transaction; claim scoped idempotency key and compare request hash.
3. Lock order/receipt and balance rows in consistent sorted variant/location order; safely initialize absent balance rows before locking.
4. Validate expected version, state, quantity, and availability.
5. Write domain state, reservation changes, movements, balances, audit, and outbox atomically.
6. Commit and return persisted result. No external network call inside transaction.

Use row locking and guarded updates. Bounded retries handle deadlocks/serialization failures using the same operation ID. Concurrent duplicates wait for a claim or get retryable response. Same key/different payload returns conflict. Durable movement/preparation uniqueness prevents duplication even after HTTP idempotency retention expires.

| Action | On-hand delta | Reserved delta |
|---|---:|---:|
| Draft entry | 0 | 0 |
| Confirm receipt | +counted | 0 |
| Confirm order | 0 | +qty |
| Cancel unprepared | 0 | -qty |
| Prepare | -qty | -qty |
| Ship/deliver/pay | 0 | 0 |
| Confirm inspected saleable return | +accepted qty | 0 |
| Approved adjustment | signed delta | 0; reservation invariant enforced |

Example: 10 on-hand/0 reserved → confirm qty 3: 10/3/available 7 → prepare: 7/0/available 7 → delivered: unchanged. A second preparation cannot produce on-hand 4.

Aggregate same-variant requirements across rows for stock checks while preserving row identity. One unavailable item rolls back the entire order operation. No negative stock/backorders in v1 [P]. Returns cannot exceed net previously consumed quantity.

Outbox delivery is at-least-once; repeat-safe consumers use unique event IDs. Leases recover worker crashes, bounded exponential retry with jitter handles temporary failure, and dead-letter review handles permanent failure. Unknown courier-create outcomes require provider lookup/idempotency before retry; if neither exists, reconcile manually rather than blindly submit again.

## 8. Endpoints and integration boundary

Version `/api/v1`; validation, stable error codes, cursor pagination, OpenAPI, UTC timestamps plus local business-date fields. Mutations carry `Idempotency-Key`; edits use expected version/If-Match.

| Routes | Purpose |
|---|---|
| GET /products, /variants; POST /products, /variants; PATCH /variants/:id | Catalog and approved price/code changes |
| GET /inventory, /inventory/:variantId/movements | Balances/history |
| POST /inventory/adjustments | Reasoned manager adjustment |
| POST /receipts; PATCH /receipts/:id/items/:itemId | Draft/count |
| POST /receipts/:id/confirm, /receipts/:id/corrections | Post once/correct explicitly |
| POST /orders; PATCH /orders/:id | Draft header/items |
| POST /orders/:id/confirm, /cancel, /prepare, /returns | Domain lifecycle commands |
| GET /deliveries; POST /orders/:id/deliveries | Manual delivery queue/record |
| POST /deliveries/:id/status-events | Status only, no stock deduction |
| POST /reports/weekly/preview, /reports/weekly/runs | Preview/approved official generation |
| GET /reports/weekly/runs/:id | Snapshot/export |
| POST /imports, /imports/:id/validate, /imports/:id/commit | Stage/dry-run/approved import |
| GET /audit-events | Restricted history |
| POST /webhooks/:provider | Disabled until provider contract verified |

Errors: SKU_MISMATCH, PRICE_REQUIRED, INSUFFICIENT_STOCK, ALREADY_PREPARED, STATE_CONFLICT, VERSION_CONFLICT, IDEMPOTENCY_CONFLICT, REPORT_DAY_NOT_ALLOWED. No raw SQL/customer data in errors.

Future commerce supplies source namespace/external order ID, approved variant IDs/codes, quantities, price snapshots, and contact/address data. Unique source/external ID prevents repeated imports. Storefronts use API/domain commands, not direct Drizzle table writes. Other platforms receive availability projections; they do not overwrite physical stock.

Webhooks verify raw-body signature, timestamp/replay window, payload size, and event identity. Persist inbox before acknowledgment; process asynchronously; tolerate duplicates/out-of-order statuses. Unsigned callbacks cannot change operational state. Provider signing schemes, permissions, and subscriptions remain unconfirmed.

## 9. Sheets migration and source-of-truth transition

Earlier chat suggested temporary bidirectional sync. **This plan proposes controlled one-way phases instead**, to avoid duplicate stock events and conflicting writers.

### M1: Sheets authoritative; app shadow-only

Staff continue Sheets. PostgreSQL does not perform operational stock writes. Capture workbook/export timestamp, file checksum, tab/row provenance, formulas/raw values, checkbox meanings, and already-applied changes. Source positions alone are unsafe when rows move: use stable IDs or freeze/review mapping; quarantine ambiguous duplicates. Shadow discrepancy reports do not write back to Sheets.

### M2: validation and rehearsal

Build a data-quality manifest for code/color conflicts, duplicate codes, dates, noninteger quantities, orphan rows, formula errors, price gaps, and lids. Each issue records source identity, impact, resolution, approver, and time. Preserve unknown date precision/order identity instead of fabricating it.

Choose exactly one opening strategy per SKU/location:
- **Recommended:** approved cutover stock becomes opening ledger; historical receipts/prepared orders import as `historical_nonposting` references.
- Full historical replay only if opening stock and every movement are verified; never combine replay with current-stock opening movements.

Do not repost confirmed historical receipts or prepared historical deliveries. Pending receipts remain nonposting. Reserve open unprepared orders only after proving the source has not already deducted them.

Dry-run validates without stock writes. Immutable, resumable, repeat-safe batches commit bounded transactions; block operational access until final reconciliation. Compare per-SKU/color stock, total units including quarantines, incoming states, prepared rows, open orders, quantities/amounts, and approved weekly report totals. Manually verify sample addresses/notes and multi-product exports, including Mongolian text.

The twelve price records and two lids require actual source identification. If latest counts differ, document why. Explicit owner-approved quarantine can permit cutover only when their physical quantities are separately reconciled and unavailable for sale; otherwise they block it.

### M3: cutover checklist

1. Owner approves rules, mappings, resolutions/quarantines, report parity, and staff readiness.
2. Freeze Sheets writes and automations/external writers.
3. Take final export and DB backup; record cutover timestamp/watermark.
4. Import final delta with checksummed manifest; reconcile against physical count or signed inventory confirmation.
5. Create approved opening events and valid active reservations; verify ledger/balance invariants.
6. Enable app commands; Sheets becomes view/export-only operationally.
7. Run controlled receiving/order/preparation verification; owner signs launch.

After cutover PostgreSQL is stock authority; timestamped Sheet exports cannot feed stock changes back. Before app writes, rollback may restore approved pre-cutover state and reopen Sheets. After app writes, freeze both, reconcile all post-cutover deltas/reservations, and choose authority with owner sign-off. Never restore an old DB or resume Sheets while discarding new operations.

## 10. Auth, RBAC, audit, privacy

Supabase Auth verifies staff identity; server-managed application roles determine permission. Owner-approved invitation/membership; no unrestricted staff signup. Verify sessions/tokens server-side using supported key-rotation handling. Browser-controlled metadata and hidden buttons are not authorization.

| Proposed role | Allowed operations |
|---|---|
| Owner | Role/configuration/cutover management and all manager actions |
| Manager | Catalog/prices, discrepancies, adjustments/corrections, orders/reports/audit |
| Warehouse | Catalog/stock view, counts, permitted ordinary receiving confirmation, packing |
| Delivery | Necessary recipient/address data and delivery statuses |
| Read-only/reporting | Approved reports; PII separately authorized/redacted |

Confirm discrepancy approval and segregation of duties. Audit grants/revocations; propose owner MFA. Every command authorizes server-side. Browser inventory writes are prohibited. If Supabase exposes tables, enforce/test RLS. Server-only Drizzle access still needs least-privilege DB roles and application authorization; privileged connections must not be assumed protected by RLS.

Audit catalog/prices, counts/confirmation, stock/reservation/preparation/cancellation/return, imports/cutover, reports, role grants, and adapter actions. Actor/reason/request-operation ID/time and redacted diffs are append-only. Restrict ledger/audit mutation; correct by new entries.

Private object storage for exports; authorize before short-lived signed downloads. Validate file size/MIME/path. Redact customer addresses/phones from logs/error trackers. Owner confirms retention/deletion policy; customer-profile deletion must not erase stock history. Service/storage credentials stay server-only.

## 11. Environment, deploy, operations

Separate local/staging/production DB, Auth configuration, and storage; use synthetic/sanitized staging data. `.env.example` documents placeholders only:
- DATABASE_URL (pooled app), DATABASE_MIGRATION_URL (migration connection).
- NEXT_PUBLIC_SUPABASE_URL and supported publishable-key variable; verify naming at setup.
- Server Auth credentials only if needed; never publish service credentials.
- APP_BASE_URL, BUSINESS_TIMEZONE=Asia/Ulaanbaatar.
- OBJECT_STORAGE_ENDPOINT/REGION/BUCKET/ACCESS_KEY_ID/SECRET_ACCESS_KEY.
- Worker lease/retry/log/monitoring settings and report-scheduler enabled flag.
- Future provider/webhook secrets only after selection.

Managed hosting must support Next.js Node runtime, transactional DB connections, long-running worker, secrets, health checks, and controlled releases. Vendor, budget, region, and storage provider are unconfirmed. Supabase-managed PostgreSQL is a practical proposal. Do not deploy a persistent worker to request-only hosting.

CI: type checks, lint, focused domain tests, real-PostgreSQL integration tests, build, migration smoke test, critical browser workflows. Controlled migration release job, not every app boot. Prefer additive expand/contract migrations compatible with previous web/worker release.

Deploy staging first; migrate once, deploy compatible web/worker, smoke test, then enable approved schedules/adapters. Keep external adapters behind switches. Stock transactions remain safe with worker offline.

Managed backups plus point-in-time recovery where available; restore rehearsal before launch. Proposed owner-approved targets: RPO ≤15 minutes, RTO ≤4 hours; revise explicitly if hosting cannot support them. Encrypt/protect backups. Monitor stock drift, invariant failures, adjustments, queue age, dead letters, failed reports/webhooks, auth failures, and backup health. Runbooks cover corrections, stuck jobs, unknown courier outcomes, import recovery, release rollback, and restore.

## 12. Tests and acceptance

Unit tests cover rules; real PostgreSQL tests cover transactions/constraints/concurrency; browser tests cover critical staff flows. Mock-only tests cannot prove last-unit protection.

| Area | Required evidence |
|---|---|
| Catalog | Correct tuple accepted; mismatch/ambiguous aliases/duplicate code rejected; source Unicode preserved |
| Gaps | Twelve price records/two lids identified; updated-count differences explained; NULL never defaults to zero; unresolved items cannot silently sell |
| Receiving | Draft adds zero; 100 invoice/98 count adds 98 once; concurrent retry same effect; zero versus missing count distinguished |
| Orders | Separate product rows; same-SKU aggregate check; one unavailable item rolls back all reservations; snapshots survive edits |
| Concurrency | Two sessions seek last unit: one succeeds, other stock conflict; no invariant drift |
| Preparation | 10→reserve 3→prepare leaves 7/0; repeats/delivery/payment cannot deduct again |
| Cancellation/returns | Unprepared release; prepared cancellation no automatic stock return; inspected returns post once and cannot exceed consumed stock |
| Reporting | Approved Wednesday rule documented; local weekday/period boundaries, late rows, missing prices, reruns/duplicate jobs tested; legacy totals match |
| Migration | Same import twice no duplicates; historical events do not repost; per-SKU and aggregate signed reconciliation |
| Reliability | Crash after commit/before job acknowledgment recovers; duplicate outbox handling safe; dead letters visible |
| Security | Direct API denial by role, anonymous/revoked rejection, protected exports, no browser secrets |
| Operations | Staging release/rollback and backup restore reproduce expected ledger/reservations/reports |

Also test stale versions, same key/different body, unsafe adjustments with reservations, worker lease expiry, malformed source data, and webhook signature/out-of-order behavior when enabled.

Proposed performance target: agree realistic volume at Gate 0; test at 10× expected daily throughput, list p95 <2 seconds and stock command p95 <1 second excluding external networks. Record environment and measured results, not provider guarantees.

Owner walkthrough: incoming discrepancy, multi-product order, preparation, failed delivery, reconciliation, report, and price/lid resolution. Release needs zero unexplained stock differences, no critical security/stock bugs, restore evidence, training, and signed cutover.

## 13. Phases, checkpoints, estimates

Assume one experienced implementer using Codex, available owner, timely source access, no custom provider integration. Ranges are planning estimates; physical counts and owner decisions cannot be automated away.

| Phase | Deliverable/checkpoint | Working days |
|---|---|---:|
| 0 Discovery | Sources, rule matrix, decisions/gaps; owner approval | 2–4 |
| 1 Foundation | Workspace/Auth/RBAC/UI/CI/staging; build/migration/access checks | 3–5 |
| 2 Catalog + ledger | Resolution, balances/movements/reservations; invariant/concurrency tests | 4–6 |
| 3 Receiving | Count/confirm/correction; retry/discrepancy acceptance | 3–5 |
| 4 Orders + delivery | Rows/address/notes/reserve/prepare/return/manual delivery; single-deduction E2E | 5–8 |
| 5 Reports + jobs | Approved Wednesday snapshots/outbox; parity/recovery checks | 3–5 |
| 6 Migration rehearsal | Imports, gap resolution, dry-run/reconciliation; signed totals | 4–7 |
| 7 Launch | Security/restore/runbooks/training/cutover; owner acceptance | 3–5 |

Total **27–45 working days (~6–10 weeks)** plus source/approval delays. Add 20–30% contingency for inconsistent workbook identity/formulas. Checkpoint outputs: changed files, verified behavior, checks, unresolved decisions, reviewable commit/PR where repository exists.

Future provisional estimates after discovery: commerce/storefront 3–6 weeks; documented courier API 1–2 weeks; payment provider 1–3 weeks. Unsupported website automation needs separate feasibility and reliability estimate. No provider integration is assumed in the v1 range.

## 14. Step-by-step Codex prompts

Run sequentially in the implementation repo. Every prompt inherits: read PLAN.md/AGENTS.md; keep sources read-only; distinguish legacy/proposals; do not invent values/credentials; make focused changes; run relevant checks; report changed files, validation, and blockers. Supply verified sources/decisions before dependent work.

### Prompt 1 — evidence
> Read the report and workbook; create docs/legacy-rule-matrix.md with page/tab/column/formula evidence for L01–L08. Resolve Wednesday meaning, matching, count confirmation, preparation, rows, addresses/notes, twelve missing prices, and two lids. Create decision/gap register. If sources are absent, document that and proceed only with source-independent scaffolding.

### Prompt 2 — foundation
> Scaffold apps/admin, apps/worker and domain/db/contracts/ui/auth packages. Add strict TypeScript, Tailwind tokens, Drizzle migrations, synthetic local fixtures, CI, environment example, health routes, and staging instructions. Verify official compatibility and pin versions. Run install/type/build/migration checks. No storefront/providers.

### Prompt 3 — staff access
> Implement Supabase staff login, server verification, owner-approved roles, central authorization, and protected routes. Test anonymous, denied, revoked, and authorized direct API access. Document/test RLS if tables are exposed; do not trust browser role metadata.

### Prompt 4 — catalog
> Implement products/colors/variants, source lineage, approved aliases, price provenance, gap staging, and review screens. Enforce approved code/product/color matching and uniqueness. Unknown prices stay NULL; SKU-less lids remain quarantined. Test mismatch, collision, Unicode, and price requirements.

### Prompt 5 — stock engine
> Build immutable movements, balance projections, reservations, controlled adjustments, audit/outbox, shared transaction/idempotency handling. Lock consistently; enforce 0≤reserved≤on_hand. Use real PostgreSQL tests for last-unit race, duplicate operations, payload conflict, multi-item rollback, and reconciliation. No direct UI quantity edits.

### Prompt 6 — incoming
> Implement invoice/count/difference, discrepancy approval, explicit counted-stock confirmation, and linked correction. Draft entry adds zero, confirmation posts once. Follow approved legacy matrix. Test invoice100/count98, zero versus NULL, concurrent repeats, correction safety, and audit; build receiving UI.

### Prompt 7 — orders
> Implement header plus separate variant rows, channel, price/address snapshots, original address, internal/courier notes. Draft/edit/confirm/cancel; confirmation reserves all items atomically. Test multi-product rows, same-SKU aggregate demand, missing prices/SKUs, stale edits, and snapshot preservation.

### Prompt 8 — preparation/delivery
> Make full-order preparation the sole outgoing stock event: consume reservation, post movements/balances/state/audit/outbox atomically. Add manual delivery/status with zero stock effect. Add physical return/reversal requiring reason/permission. Prove repeats, payment, delivered/failed statuses cannot double-deduct or auto-restock. Keep partial fulfillment deferred.

### Prompt 9 — jobs/contracts
> Implement selected PostgreSQL job/outbox mechanism with leases, deduplication, bounded retries, dead letters, and metrics. Add versioned OpenAPI and mocked storage/delivery adapters. Test crash recovery and duplicate dispatch. Keep external courier/source-website/payment adapters disabled; document missing contracts.

### Prompt 10 — Wednesday reports
> Implement approved Wednesday rule exactly with tested local period resolution, immutable snapshots, completeness flags, separate-item exports, unique scheduled runs, and revision control. If semantics remain unconfirmed, provide labeled preview only and disable production scheduling. Compare verified workbook examples and boundary cases.

### Prompt 11 — migrate/rehearse
> Implement raw-preserving staging, checksums/mapping, validation/quarantine, dry-run, repeat-safe bounded imports, and per-SKU/aggregate reconciliation. Use approved opening strategy; mark historical prepared/confirmed records nonposting unless full replay is approved. Rehearse twice and prove no duplication. Deliver manifest and price/lid resolution evidence for review.

### Prompt 12 — launch
> Complete acceptance/security/concurrency/build/restore checks and fix critical failures. Write release/correction/queue/recovery/cutover runbooks. Prepare precise freeze/export/import/verify/enable and rollback sequence. Report measurements and remaining decisions. Execute production actions only within user authorization and environment controls; do not claim readiness with source/parity gates open.

### Prompt 13 — future commerce
> After launch acceptance, design the selected commerce adapter around existing catalog/order/reservation commands and external identity mappings. Preserve PostgreSQL authority. Specify signatures, deduplication, reservation expiry/payment races, reconciliation, and failure handling before coding. Do not create a second stock engine.

## 15. Unconfirmed decisions

| Decision | Required input | Safe interim behavior |
|---|---|---|
| Report/workbook evidence | Owner provides source | Source-unverified; Gate 0 open |
| Wednesday cutoff/inclusion/reruns | Source examples + owner | Preview only; scheduler disabled |
| Code normalization/aliases | Collision review/catalog owner | Preserve raw; reject ambiguity |
| Twelve prices/currency/scale | Authoritative price source | NULL/review or controlled exception |
| Two lid identities/SKUs | Catalog owner | Quarantine with quantity accountability |
| Preparation granularity | Legacy evidence/operations | Proposed full-order atomic action |
| Count discrepancy approval | Operations owner | Proposed manager approval |
| Reserve timing/expiry | Owner, future checkout contract | Confirm manual order; no auto-expiry v1 |
| Courier identity/API/access/idempotency | Courier contract/account | Manual tracking/export |
| Source website/API/export permission | Provider/source owner | Validated manual import; no assumed scraping |
| Payment provider/lifecycle | Owner/provider contract | Manual annotation, no automation |
| Commerce platform/storefront | Owner | Stable contracts only |
| Hosting/storage/region/budget | Owner/operational needs | Staging proposal |
| Roles/retention/MFA/RPO/RTO | Owner | Least privilege; proposed targets visible |
| Authority/cutover date | Signed reconciliation | Sheets authoritative until cutover |

## 16. Definition of completion

V1 completes when source rules are verified, gaps resolved or explicitly quarantined with complete stock accounting, migration reconciled, PostgreSQL is sole authority, receipt/preparation actions post once, reservations prevent overselling, Wednesday reports match approved legacy semantics, auth/audit/restore checks pass, staff are trained, and owner signs launch.

E-commerce readiness means authenticated repeat-safe external order contracts reuse the same catalog, reservations, and ledger. A storefront, courier API, and payment provider remain separate future deliverables.
