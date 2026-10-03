import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    version: "1.0.0",
    service: "mazoala-inventory-api",
    timezone: process.env.BUSINESS_TIMEZONE ?? "Asia/Ulaanbaatar",
    invariants: {
      zeroOverselling: true,
      singlePreparationDeduction: true,
      wednesdayExclusiveReports: true,
      quarantinedLidsTracked: true,
      missingPricesNullable: true
    }
  });
}
