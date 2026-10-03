# MAZOALA Legacy Rule Matrix & Gap Register

Version 1.0 · 2026-10-04 · Timezone: Asia/Ulaanbaatar
Status: Source-unverified (Gate 0 open: awaiting authoritative report & workbook export)

## 1. Legacy Rule Matrix (L01 – L08)

| Rule ID | Legacy Requirement Reported | Source Status | Target Monolith Implementation | Verification Gate Before Parity Sign-off |
|---|---|---|---|---|
| **L01** | Product ↔ Item Code ↔ Color match | Chat reference `6abcc220-...` | Enforce atomic resolution of approved `(Product, ItemCode, Color)` tuple. Reject conflicting or ambiguous items during import & order entry. | Obtain raw workbook items; verify normalization, aliases, case-folding, and collision checks. |
| **L02** | Invoice / Count / Difference / Confirmation | Chat reference `6abcc220-...` | Entry changes stock by 0 (`DRAFT`/`COUNTED`). Confirmation posts `counted_qty` atomically in DB transaction. Negative difference requires reason & manager approval. | Verify legacy difference sign (`counted - invoice`), checkbox semantics, and role permissions. |
| **L03** | Prepared deliveries subtract stock | Chat reference `6abcc220-...` | Full-order preparation consumes reservation & decrements `on_hand` in a single atomic transaction. Couriers/delivery statuses/payment callbacks have 0 stock effect. | Verify row vs order checkbox granularity, and confirm whether partial preparation ever occurred. |
| **L04** | Wednesday-exclusive weekly reporting | Current prompt specification | Preview-only mode on other days. Official immutable snapshot generated on Wednesday in `Asia/Ulaanbaatar`. Auto-scheduling disabled until cutoff rules confirmed. | Confirm cutoff boundary (e.g. half-open `[prev_wed, cur_wed)`), included statuses, returns handling. |
| **L05** | One product per row | Chat reference `6abcc220-...` | Separate `order_items` line per variant/qty/price. No comma-separated item cells in data or exports. Distinct legacy lines remain distinct. | Verify export header formatting and legacy grouping logic. |
| **L06** | Addresses and notes preservation | Chat reference `6abcc220-...` | Preserve raw text + normalized fields (recipient, phone, district, khoroo, building, apt, notes). Preserve Mongolian characters/line breaks without truncation. Snapshot per order. | Audit courier formats and mandatory field constraints. |
| **L07** | Twelve missing prices | Current prompt specification | Explicit `NULL` in catalog variants, never `0`. Items staged in gap queue. Blocks automatic priced orders unless manager provides documented order-specific price. | Identify exact 12 SKU/product identities from source; verify whether cost or retail price is missing. |
| **L08** | Two lids without SKU | Current prompt specification | Quarantined in catalog. No fabricated SKU. Physical stock accounted for but unavailable for sale until owner assigns approved code or non-sellable status. | Obtain physical names, colors, count, and relationship to container SKUs. |

## 2. Gap & Decision Register

1. **Gate 0 Source Limitation**: Neither the 7-page report nor the live workbook is yet placed in `sources/`. All scaffolding proceeding is strictly source-independent.
2. **Opening Stock Strategy**: Cutover stock will become initial `OPENING_BALANCE` ledger records; legacy historical deliveries will be staged as non-posting reference records.
3. **Idempotency & Concurrency Invariant**: Row locking on `stock_balances` ordered by `variant_id` + `location_id` to prevent deadlocks and enforce `0 <= reserved <= on_hand`.
