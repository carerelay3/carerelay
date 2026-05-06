import { NextResponse } from "next/server";
import { appConfig, currentMode } from "@/lib/config";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    supabaseConfigured: appConfig.supabaseConfigured,
    twilioConfigured: appConfig.twilioConfigured,
    openaiConfigured: appConfig.openAiConfigured,
    stripeConfigured: appConfig.stripeConfigured,
    currentMode: currentMode(),
  });
}
