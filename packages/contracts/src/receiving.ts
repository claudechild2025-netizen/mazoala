import { z } from "zod";
import { UUIDSchema } from "./common.js";

export const ReceiptStatusSchema = z.enum(["DRAFT", "COUNTED", "CONFIRMED", "VOID"]);

export type ReceiptStatus = z.infer<typeof ReceiptStatusSchema>;

export const ReceiptItemSchema = z.object({
  id: UUIDSchema,
  receiptId: UUIDSchema,
  variantId: UUIDSchema,
  invoiceQty: z.number().int().nonnegative(),
  countedQty: z.number().int().nonnegative().nullable(),
  difference: z.number().int().nullable(), // counted - invoice
  differenceReason: z.string().nullable().optional()
});

export type ReceiptItem = z.infer<typeof ReceiptItemSchema>;

export const ReceiptSchema = z.object({
  id: UUIDSchema,
  supplierName: z.string().min(1),
  referenceNumber: z.string().min(1),
  status: ReceiptStatusSchema,
  locationId: UUIDSchema,
  confirmedAt: z.string().nullable(),
  confirmedBy: UUIDSchema.nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  items: z.array(ReceiptItemSchema)
});

export type Receipt = z.infer<typeof ReceiptSchema>;

export const CreateReceiptInputSchema = z.object({
  supplierName: z.string().min(1),
  referenceNumber: z.string().min(1),
  locationId: UUIDSchema,
  items: z.array(z.object({
    variantId: UUIDSchema,
    invoiceQty: z.number().int().nonnegative()
  })).min(1)
});

export type CreateReceiptInput = z.infer<typeof CreateReceiptInputSchema>;

export const UpdateReceiptCountInputSchema = z.object({
  items: z.array(z.object({
    itemId: UUIDSchema,
    countedQty: z.number().int().nonnegative(),
    differenceReason: z.string().optional()
  })).min(1)
});

export type UpdateReceiptCountInput = z.infer<typeof UpdateReceiptCountInputSchema>;
