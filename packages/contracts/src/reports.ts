import { z } from "zod";
import { UUIDSchema } from "./common.js";

export const ReportTypeSchema = z.enum(["WEDNESDAY_WEEKLY_SALES", "INVENTORY_VALUATION", "DISCREPANCY_LOG"]);
export type ReportType = z.infer<typeof ReportTypeSchema>;

export const ReportRunStatusSchema = z.enum(["GENERATING", "COMPLETED", "FAILED"]);
export type ReportRunStatus = z.infer<typeof ReportRunStatusSchema>;

export const WeeklyReportRunSchema = z.object({
  id: UUIDSchema,
  periodStart: z.string(),
  periodEnd: z.string(),
  businessTimezone: z.string().default("Asia/Ulaanbaatar"),
  ruleVersion: z.string().default("v1.0-wednesday-halfopen"),
  revision: z.number().int().positive().default(1),
  status: ReportRunStatusSchema,
  totalUnitsSold: z.number().int().nonnegative(),
  totalRevenueMnt: z.number().int().nonnegative().nullable(), // Nullable if missing prices present
  hasMissingPrices: z.boolean(),
  includedOrderCount: z.number().int().nonnegative(),
  generatedBy: UUIDSchema,
  isPreview: z.boolean().default(false),
  artifactKey: z.string().nullable().optional(),
  createdAt: z.string()
});

export type WeeklyReportRun = z.infer<typeof WeeklyReportRunSchema>;

export const GenerateReportInputSchema = z.object({
  type: ReportTypeSchema,
  targetDate: z.string().optional(), // ISO date
  isPreview: z.boolean().default(true)
});

export type GenerateReportInput = z.infer<typeof GenerateReportInputSchema>;
