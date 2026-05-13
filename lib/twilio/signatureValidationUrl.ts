import "server-only";

const SMS_INBOUND_PATH = "/api/sms/inbound";

type TwilioSignatureUrlResult =
  | { ok: true; url: string; source: "APP_BASE_URL" | "NEXT_PUBLIC_APP_URL" }
  | { ok: false; errorCode: "missing_app_base_url" | "invalid_app_base_url"; errorMessage: string };

function normalizeBaseUrl(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (url.protocol !== "https:" && (process.env.NODE_ENV === "production" || !isLocalhost)) {
      return null;
    }
    url.pathname = url.pathname.replace(/\/+$/, "");
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function resolveTwilioSignatureValidationUrl(): TwilioSignatureUrlResult {
  const appBaseUrl = normalizeBaseUrl(process.env.APP_BASE_URL);
  if (appBaseUrl) return { ok: true, url: `${appBaseUrl}${SMS_INBOUND_PATH}`, source: "APP_BASE_URL" };

  if (process.env.APP_BASE_URL?.trim()) {
    return {
      ok: false,
      errorCode: "invalid_app_base_url",
      errorMessage: "APP_BASE_URL must be an absolute https URL, or localhost for local development.",
    };
  }

  if (process.env.NODE_ENV !== "production") {
    const publicAppUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
    if (publicAppUrl) return { ok: true, url: `${publicAppUrl}${SMS_INBOUND_PATH}`, source: "NEXT_PUBLIC_APP_URL" };
  }

  return {
    ok: false,
    errorCode: "missing_app_base_url",
    errorMessage: "APP_BASE_URL is required for Twilio signature validation.",
  };
}

export function isTwilioSignatureUrlConfigured() {
  return resolveTwilioSignatureValidationUrl().ok;
}
