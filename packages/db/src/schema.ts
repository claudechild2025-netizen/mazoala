import { pgTable, uuid, text, integer, boolean, timestamp, jsonb, uniqueIndex, index } from "drizzle-orm/pg-core";

// --- Catalog ---

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const colors = pgTable("colors", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  hexCode: text("hex_code"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const variants = pgTable("variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  colorId: uuid("color_id").references(() => colors.id).notNull(),
  itemCode: text("item_code").notNull(),
  normalizedCode: text("normalized_code").notNull(),
  salePrice: integer("sale_price"), // MNT integer, nullable if missing (L07)
  costPrice: integer("cost_price"),
  isSellable: boolean("is_sellable").default(true).notNull(),
  isQuarantined: boolean("is_quarantined").default(false).notNull(), // Quarantined lids (L08)
  quarantineReason: text("quarantine_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [
  uniqueIndex("variants_item_code_idx").on(table.itemCode),
  index("variants_product_color_idx").on(table.productId, table.colorId)
]);

export const catalogAliases = pgTable("catalog_aliases", {
  id: uuid("id").primaryKey().defaultRandom(),
  namespace: text("namespace").notNull(),
  rawValue: text("raw_value").notNull(),
  variantId: uuid("variant_id").references(() => variants.id).notNull(),
  approverId: uuid("approver_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

// --- Locations & Inventory Ledger ---

export const locations = pgTable("locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const stockBalances = pgTable("stock_balances", {
  id: uuid("id").primaryKey().defaultRandom(),
  variantId: uuid("variant_id").references(() => variants.id).notNull(),
  locationId: uuid("location_id").references(() => locations.id).notNull(),
  onHand: integer("on_hand").default(0).notNull(),
  reserved: integer("reserved").default(0).notNull(),
  version: integer("version").default(1).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [
  uniqueIndex("stock_balances_variant_location_idx").on(table.variantId, table.locationId)
]);

export const stockMovements = pgTable("stock_movements", {
  id: uuid("id").primaryKey().defaultRandom(),
  variantId: uuid("variant_id").references(() => variants.id).notNull(),
  locationId: uuid("location_id").references(() => locations.id).notNull(),
  delta: integer("delta").notNull(),
  type: text("type").notNull(), // OPENING_BALANCE, RECEIPT_CONFIRMATION, PREPARATION_DEDUCTION, etc.
  operationRef: text("operation_ref").notNull(),
  reversalOfId: uuid("reversal_of_id"),
  reason: text("reason").notNull(),
  actorId: uuid("actor_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [
  index("stock_movements_variant_time_idx").on(table.variantId, table.createdAt)
]);

export const reservations = pgTable("reservations", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull(),
  orderItemId: uuid("order_item_id").notNull(),
  variantId: uuid("variant_id").references(() => variants.id).notNull(),
  locationId: uuid("location_id").references(() => locations.id).notNull(),
  quantity: integer("quantity").notNull(),
  status: text("status").notNull(), // ACTIVE, CONSUMED, RELEASED
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [
  index("reservations_order_status_idx").on(table.orderId, table.status)
]);

// --- Receiving ---

export const receipts = pgTable("receipts", {
  id: uuid("id").primaryKey().defaultRandom(),
  supplierName: text("supplier_name").notNull(),
  referenceNumber: text("reference_number").notNull(),
  locationId: uuid("location_id").references(() => locations.id).notNull(),
  status: text("status").default("DRAFT").notNull(), // DRAFT, COUNTED, CONFIRMED, VOID
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  confirmedBy: uuid("confirmed_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const receiptItems = pgTable("receipt_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  receiptId: uuid("receipt_id").references(() => receipts.id, { onDelete: "cascade" }).notNull(),
  variantId: uuid("variant_id").references(() => variants.id).notNull(),
  invoiceQty: integer("invoice_qty").notNull(),
  countedQty: integer("counted_qty"),
  difference: integer("difference"),
  differenceReason: text("difference_reason")
});

// --- Orders & Fulfillment ---

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: text("order_number").notNull().unique(),
  channel: text("channel").default("MANUAL").notNull(),
  orderState: text("order_state").default("DRAFT").notNull(), // DRAFT, CONFIRMED, CANCELLED, CLOSED
  fulfillmentState: text("fulfillment_state").default("UNPREPARED").notNull(), // UNPREPARED, PREPARED, REVERSED
  deliveryState: text("delivery_state").default("NOT_CREATED").notNull(), // NOT_CREATED, PENDING, IN_TRANSIT, DELIVERED, FAILED, CANCELLED
  paymentState: text("payment_state").default("UNKNOWN").notNull(), // UNKNOWN, UNPAID, PAID
  internalNotes: text("internal_notes"),
  currency: text("currency").default("MNT").notNull(),
  totalAmount: integer("total_amount"),
  addressSnapshot: jsonb("address_snapshot").notNull(),
  version: integer("version").default(1).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
  variantId: uuid("variant_id").references(() => variants.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price"),
  subtotal: integer("subtotal"),
  productNameSnapshot: text("product_name_snapshot").notNull(),
  itemCodeSnapshot: text("item_code_snapshot").notNull(),
  colorNameSnapshot: text("color_name_snapshot").notNull()
});

export const preparations = pgTable("preparations", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  operationRef: text("operation_ref").notNull(),
  preparedBy: uuid("prepared_by").notNull(),
  preparedAt: timestamp("prepared_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [
  uniqueIndex("preparations_order_unique_idx").on(table.orderId)
]);

// --- Delivery ---

export const deliveries = pgTable("deliveries", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  courierProvider: text("courier_provider").default("MANUAL").notNull(),
  externalTrackingNumber: text("external_tracking_number"),
  state: text("state").default("PENDING").notNull(),
  deliveryFee: integer("delivery_fee").default(0).notNull(),
  addressSnapshot: jsonb("address_snapshot").notNull(),
  statusNotes: text("status_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

// --- Reports ---

export const reportRuns = pgTable("report_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportType: text("report_type").notNull(),
  periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
  periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
  timezone: text("timezone").default("Asia/Ulaanbaatar").notNull(),
  ruleVersion: text("rule_version").default("v1.0").notNull(),
  revision: integer("revision").default(1).notNull(),
  status: text("status").default("COMPLETED").notNull(),
  totalUnits: integer("total_units").default(0).notNull(),
  totalRevenue: integer("total_revenue"),
  hasMissingPrices: boolean("has_missing_prices").default(false).notNull(),
  includedOrdersCount: integer("included_orders_count").default(0).notNull(),
  generatedBy: uuid("generated_by").notNull(),
  isPreview: boolean("is_preview").default(false).notNull(),
  artifactKey: text("artifact_key"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

// --- Auth, Audit & Outbox ---

export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  role: text("role").notNull(), // OWNER, MANAGER, WAREHOUSE, DELIVERY, READ_ONLY
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [
  uniqueIndex("user_roles_user_unique_idx").on(table.userId)
]);

export const auditEvents = pgTable("audit_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  diffJson: jsonb("diff_json"),
  reason: text("reason").notNull(),
  operationId: text("operation_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const idempotencyRecords = pgTable("idempotency_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  scopedKey: text("scoped_key").notNull().unique(),
  requestHash: text("request_hash").notNull(),
  status: text("status").notNull(), // PROCESSING, COMPLETED, FAILED
  resultJson: jsonb("result_json"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull()
});

export const outboxEvents = pgTable("outbox_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventType: text("event_type").notNull(),
  payloadJson: jsonb("payload_json").notNull(),
  status: text("status").default("PENDING").notNull(), // PENDING, PROCESSING, COMPLETED, DEAD_LETTER
  attempts: integer("attempts").default(0).notNull(),
  leaseUntil: timestamp("lease_until", { withTimezone: true }),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});
