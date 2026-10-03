import { z } from "zod";
import { UUIDSchema } from "./common.js";

export const OrderStateSchema = z.enum(["DRAFT", "CONFIRMED", "CANCELLED", "CLOSED"]);
export type OrderState = z.infer<typeof OrderStateSchema>;

export const FulfillmentStateSchema = z.enum(["UNPREPARED", "PREPARED", "REVERSED"]);
export type FulfillmentState = z.infer<typeof FulfillmentStateSchema>;

export const DeliveryStateSchema = z.enum([
  "NOT_CREATED",
  "PENDING",
  "IN_TRANSIT",
  "DELIVERED",
  "FAILED",
  "CANCELLED"
]);
export type DeliveryState = z.infer<typeof DeliveryStateSchema>;

export const PaymentStateSchema = z.enum(["UNKNOWN", "UNPAID", "PAID"]);
export type PaymentState = z.infer<typeof PaymentStateSchema>;

export const OrderItemSnapshotSchema = z.object({
  id: UUIDSchema,
  orderId: UUIDSchema,
  variantId: UUIDSchema,
  quantity: z.number().int().positive(),
  unitPrice: z.number().int().nonnegative().nullable(), // MNT integer, NULL requires approval
  subtotal: z.number().int().nonnegative().nullable(),
  productNameSnapshot: z.string(),
  itemCodeSnapshot: z.string(),
  colorNameSnapshot: z.string()
});

export type OrderItemSnapshot = z.infer<typeof OrderItemSnapshotSchema>;

export const DeliveryAddressSnapshotSchema = z.object({
  recipientName: z.string().min(1),
  phone: z.string().min(1),
  district: z.string().optional(),
  khoroo: z.string().optional(),
  buildingStreet: z.string().optional(),
  apartment: z.string().optional(),
  entrance: z.string().optional(),
  floor: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  rawAddressText: z.string().min(1)
});

export type DeliveryAddressSnapshot = z.infer<typeof DeliveryAddressSnapshotSchema>;

export const OrderSchema = z.object({
  id: UUIDSchema,
  orderNumber: z.string().min(1),
  channel: z.string().default("MANUAL"),
  orderState: OrderStateSchema,
  fulfillmentState: FulfillmentStateSchema,
  deliveryState: DeliveryStateSchema,
  paymentState: PaymentStateSchema,
  internalNotes: z.string().nullable().optional(),
  currency: z.string().default("MNT"),
  totalAmount: z.number().int().nonnegative().nullable(),
  version: z.number().int().positive(),
  address: DeliveryAddressSnapshotSchema,
  items: z.array(OrderItemSnapshotSchema),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type Order = z.infer<typeof OrderSchema>;

export const CreateOrderInputSchema = z.object({
  channel: z.string().optional().default("MANUAL"),
  internalNotes: z.string().optional(),
  address: DeliveryAddressSnapshotSchema,
  items: z.array(z.object({
    variantId: UUIDSchema,
    quantity: z.number().int().positive(),
    customPriceOverride: z.number().int().nonnegative().optional(),
    customPriceReason: z.string().optional()
  })).min(1)
});

export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>;
