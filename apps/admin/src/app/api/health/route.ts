import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "mazoala-admin",
    timestamp: new Date().toISOString()
  });
}
