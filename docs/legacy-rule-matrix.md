# MAZOALA Legacy Rule Matrix & Gap Register

Version 2.0 · 2026-10-04 · Timezone: Asia/Ulaanbaatar
Status: **Source-Verified (Gate 0 Unlocked)**
Source File: `sources/Бараа_бүртгэл_тоо_тулган_шалгах_2026.xlsx`

---

## 1. Verified Legacy Rule Matrix (L01 – L08)

| Rule ID | Legacy Requirement | Source Sheet & Exact Formula / Logic | Target Monolith Implementation | Parity Status |
|---|---|---|---|---|
| **L01** | Product ↔ Item Code ↔ Color match | `Барааны үлдэгдэл` Col B, C, D & Col M, N (`_Product helper`, `_Key helper`: `=B7&"|"&D7`) | Enforce atomic resolution of approved `(Product, ItemCode, Color)`. Mismatch or ambiguous alias is rejected. | **VERIFIED** (120 variants parsed across 26 product groups) |
| **L02** | Invoice / Count / Difference / Confirmation | `Шинэ бараа бүртгэл` Row 2, Col E (`Баримтын Qty`), Col H (`Тоолсон Qty`), Col I (`Зөрүү` `=H7-E7`), Col J (`Шалгасан эсэх`), Col K (`Төлөв`) | Draft entry has 0 stock effect. Explicit confirmation posts `counted_qty` atomically. Discrepancy (`counted - invoice`) requires reason/manager approval. | **VERIFIED** (Confirmed exact formula: `counted - invoice`) |
| **L03** | Prepared deliveries subtract stock | `Өдөр тутмын хүргэлт` Row 3 & Col K (`Бэлтгэсэн` boolean checkbox). Stock formula in `Барааны үлдэгдэл` Row 4: `Үлдэгдэл + Орлого(Тоолсон) - Хүргэлт(Бэлтгэсэн)` | Order preparation is the single outgoing-stock event. Couriers, delivery statuses, and payment callbacks have ZERO stock effect. | **VERIFIED** (Delivery checkbox `K` controls stock deduction) |
| **L04** | Wednesday-exclusive weekly reporting | `7 хоногийн тайлан` Cell B3: `=DATE(2026,9,23)` (Wednesday), Cell D3: `=B3+7` (`2026-09-30`), Cell F3: `=SUMIFS('Өдөр тутмын хүргэлт'!$N:$N,'Өдөр тутмын хүргэлт'!$M:$M,">="&$B$3,'Өдөр тутмын хүргэлт'!$M:$M,"<"&$D$3)`, Cell F4: 6,641,700 MNT | Official generation strictly restricted to Wednesday in `Asia/Ulaanbaatar` with half-open interval `[startWednesday, nextWednesday)`. Other days provide preview mode only. | **VERIFIED** (Exact half-open formula and Wednesday boundaries confirmed) |
| **L05** | One product per row | `Өдөр тутмын хүргэлт` Col E (`Бараа №`), Col F (`Бараа`), Col G (`Item Code`), Col H (`Үнэ`), Col I (`Өнгө`), Col J (`Тоо`) | Strict 1 variant per row. No comma-separated item groups. | **VERIFIED** |
| **L06** | Addresses and notes preservation | `Өдөр тутмын хүргэлт` Col C (`Утас`), Col D (`Хаяг`), Col L (`Тайлбар`) | Preserve Mongolian text, line breaks, apartment/entrance details without truncation. Snapshot per order. | **VERIFIED** |
| **L07** | Twelve missing prices | `Барааны үлдэгдэл` Rows 136–142, 144, 146–147, 150–151 (Col K is empty/null) | Staged in gap queue with explicit `NULL` price (never default 0). Unapproved orders blocked until manager provides price override. | **VERIFIED (Identified all 12 variants below)** |
| **L08** | Lids without SKU | `Өдөр тутмын хүргэлт` Rows 8, 90, 95: "500ml - blue blaze дан таг", "500ml - night vision дан таг", "350ml - ocean breeze дан таг" (Col G / Col H empty) | Single replacement lids delivered without SKU code. Quarantined in catalog until approved code assigned. | **VERIFIED** |

---

## 2. The 12 Exact Missing-Price Variants (L07 Register)

| # | Row | Item Code | Product Name | Color | On-Hand Stock | Catalog Price | Action Required |
|---|---|---|---|---|---|---|---|
| 1 | 136 | `FT001` | 690mL Insulated Flip Top Bottle | sea glass | 12 | `NULL` | Price review |
| 2 | 137 | `FT002` | 690mL Insulated Flip Top Bottle | pink paradise | 12 | `NULL` | Price review |
| 3 | 138 | `FT003` | 690mL Insulated Flip Top Bottle | lilac love | 12 | `NULL` | Price review |
| 4 | 139 | `FT004` | 690mL Insulated Flip Top Bottle | lagoon | 12 | `NULL` | Price review |
| 5 | 140 | `FT005` | 690mL Insulated Flip Top Bottle | spearmint | 12 | `NULL` | Price review |
| 6 | 141 | `FT006` | 690mL Insulated Flip Top Bottle | olive | 12 | `NULL` | Price review |
| 7 | 142 | `FT007` | 690mL Insulated Flip Top Bottle | midnight | 12 | `NULL` | Price review |
| 8 | 144 | `RS001` | Tritan Drink Bottle Replacement Spout | n/a | 96 | `NULL` | Price review |
| 9 | 146 | `WC001` | Weaning Cutlery Trio | sage | 35 | `NULL` | Price review |
| 10 | 147 | `WC002` | Weaning Cutlery Trio | ocean | 35 | `NULL` | Price review |
| 11 | 150 | `JC001` | Jnr Cutlery Trio | ocean | 36 | `NULL` | Price review |
| 12 | 151 | `JC002` | Jnr Cutlery Trio | sage | 36 | `NULL` | Price review |

---

## 3. The Unresolved SKU-less Lids (L08 Register)

1. `500ml - blue blaze дан таг` (Delivery Row 8: phone `88608633`, Garden city2)
2. `500ml - night vision дан таг` (Delivery Row 90: phone `99984336`, Шинэ Яармаг)
3. `350ml - ocean breeze дан таг` (Delivery Row 95: phone `80096650`, Khans Vill)
*Policy*: Catalog quarantine active; zero automated price; inventory tracked as dedicated non-sellable replacement parts.
