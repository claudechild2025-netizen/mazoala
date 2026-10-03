import { z } from "zod";

export const UUIDSchema = z.string().uuid();

export const TimestampSchema = z.string().datetime();

export const ErrorCodeSchema = z.enum([
  "SKU_MISMATCH",
  "PRICE_REQUIRED",
  "INSUFFICIENT_STOCK",
  "ALREADY_PREPARED",
  "STATE_CONFLICT",
  "VERSION_CONFLICT",
  "IDEMPOTENCY_CONFLICT",
  "REPORT_DAY_NOT_ALLOWED",
  "DISCREPANCY_APPROVAL_REQUIRED",
  "ITEM_QUARANTINED",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND"
]);

export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

export const ApiErrorResponseSchema = z.object({
  code: ErrorCodeSchema,
  message: z.string(),
  details: z.record(z.any()).optional()
});

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

export const PaginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20)
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
