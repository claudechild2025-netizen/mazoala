import { z } from "zod";
import { UUIDSchema } from "./common.js";

export const ProductSchema = z.object({
  id: UUIDSchema,
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type Product = z.infer<typeof ProductSchema>;

export const ColorSchema = z.object({
  id: UUIDSchema,
  name: z.string().min(1),
  hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  createdAt: z.string()
});

export type Color = z.infer<typeof ColorSchema>;

export const VariantSchema = z.object({
  id: UUIDSchema,
  productId: UUIDSchema,
  colorId: UUIDSchema,
  itemCode: z.string().min(1),
  normalizedCode: z.string().min(1),
  salePrice: z.number().int().nonnegative().nullable(), // MNT integer, NULL for missing
  costPrice: z.number().int().nonnegative().nullable(),
  isSellable: z.boolean().default(true),
  isQuarantined: z.boolean().default(false),
  quarantineReason: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type Variant = z.infer<typeof VariantSchema>;

export const CreateVariantInputSchema = z.object({
  productId: UUIDSchema,
  colorId: UUIDSchema,
  itemCode: z.string().min(1),
  salePrice: z.number().int().nonnegative().nullable().optional(),
  costPrice: z.number().int().nonnegative().nullable().optional(),
  isSellable: z.boolean().default(true)
});

export type CreateVariantInput = z.infer<typeof CreateVariantInputSchema>;
