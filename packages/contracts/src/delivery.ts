import { z } from "zod";
import { UUIDSchema } from "./common.js";
import { DeliveryStateSchema, DeliveryAddressSnapshotSchema } from "./orders.js";

export const DeliveryRecordSchema = z.object({
  id: UUIDSchema,
  orderId: UUIDSchema,
  courierProvider: z.string().default("MANUAL"),
  externalTrackingNumber: z.string().nullable().optional(),
  state: DeliveryStateSchema,
  deliveryFee: z.number().int().nonnegative().default(0),
  addressSnapshot: DeliveryAddressSnapshotSchema,
  statusNotes: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type DeliveryRecord = z.infer<typeof DeliveryRecordSchema>;

export const UpdateDeliveryStatusInputSchema = z.object({
  state: DeliveryStateSchema,
  notes: z.string().optional(),
  actorId: UUIDSchema
});

export type UpdateDeliveryStatusInput = z.infer<typeof UpdateDeliveryStatusInputSchema>;
