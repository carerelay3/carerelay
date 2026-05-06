import { NextResponse } from "next/server";
import { getDemoSnapshot } from "@/lib/demo/data";

export async function GET() {
  return NextResponse.json(getDemoSnapshot());
}
