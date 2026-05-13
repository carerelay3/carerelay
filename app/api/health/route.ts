import { NextResponse } from "next/server";
import { appConfig, currentMode } from "@/lib/config";
import { isTwilioSignatureUrlConfigured } from "@/lib/twilio/signatureValidationUrl";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    supabaseConfigured: appConfig.supabaseConfigured,
    twilioConfigured: appConfig.twilioConfigured,
    twilioSignatureUrlConfigured: isTwilioSignatureUrlConfigured(),
    openaiConfigured: appConfig.openAiConfigured,
    stripeConfigured: appConfig.stripeConfigured,
    currentMode: currentMode(),
  });
}
