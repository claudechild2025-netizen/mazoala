import { z } from "zod";
import { UUIDSchema } from "./common.js";

export const StockBalanceSchema = z.object({
  id: UUIDSchema,
  variantId: UUIDSchema,
  locationId: UUIDSchema,
  onHand: z.number().int().nonnegative(),
  reserved: z.number().int().nonnegative(),
  available: z.number().int().nonnegative(),
  version: z.number().int().positive(),
  updatedAt: z.string()
});

export type StockBalance = z.infer<typeof StockBalanceSchema>;

export const StockMovementTypeSchema = z.enum([
  "OPENING_BALANCE",
  "RECEIPT_CONFIRMATION",
  "RECEIPT_CORRECTION",
  "PREPARATION_DEDUCTION",
  "RESTOCK_RETURN",
  "MANUAL_ADJUSTMENT"
]);

export type StockMovementType = z.infer<typeof StockMovementTypeSchema>;

export const StockMovementSchema = z.object({
  id: UUIDSchema,
  variantId: UUIDSchema,
  locationId: UUIDSchema,
  delta: z.number().int(), // signed delta
  type: StockMovementTypeSchema,
  operationRef: z.string().min(1),
  reversalOfId: UUIDSchema.nullable().optional(),
  reason: z.string().min(1),
  actorId: UUIDSchema,
  createdAt: z.string()
});

export type StockMovement = z.infer<typeof StockMovementSchema>;

export const ReservationStatusSchema = z.enum(["ACTIVE", "CONSUMED", "RELEASED"]);

export type ReservationStatus = z.infer<typeof ReservationStatusSchema>;

export const ReservationSchema = z.object({
  id: UUIDSchema,
  orderId: UUIDSchema,
  orderItemId: UUIDSchema,
  variantId: UUIDSchema,
  locationId: UUIDSchema,
  quantity: z.number().int().positive(),
  status: ReservationStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string()
});

export type Reservation = z.infer<typeof ReservationSchema>;

export const ManualAdjustmentInputSchema = z.object({
  variantId: UUIDSchema,
  locationId: UUIDSchema,
  delta: z.number().int(),
  reason: z.string().min(3),
  actorId: UUIDSchema
});

export type ManualAdjustmentInput = z.infer<typeof ManualAdjustmentInputSchema>;
