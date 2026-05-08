import { appConfig } from "@/lib/config";

export type EventName =
  | "demo_message_submitted"
  | "demo_started"
  | "care_circle_created"
  | "care_circle_keyword_created"
  | "family_member_invited"
  | "family_member_phone_added"
  | "inbound_sms_received"
  | "inbound_sms_routed"
  | "inbound_sms_unknown_sender"
  | "inbound_sms_multiple_circle_keyword_needed"
  | "inbound_sms_keyword_resolved"
  | "inbound_sms_parse_failed"
  | "inbound_sms_logged"
  | "inbound_message_logged"
  | "inbound_message_routed"
  | "routing_failed_unknown_sender"
  | "routing_failed_multiple_circles"
  | "message_categorized"
  | "medication_confirmation_logged"
  | "task_created"
  | "appointment_created"
  | "supply_created"
  | "concern_flagged"
  | "daily_summary_generated"
  | "weekly_summary_generated"
  | "summary_openai_used"
  | "summary_fallback_used"
  | "summary_safety_filter_triggered"
  | "pricing_viewed"
  | "pricing_cta_clicked"
  | "sign_in_started"
  | "signup_started"
  | "signup_completed"
  | "setup_started"
  | "homepage_cta_clicked"
  | "shared_number_explainer_viewed"
  | "terms_viewed"
  | "privacy_viewed"
  | "setup_completed";

export function trackEvent(name: EventName, properties?: Record<string, unknown>) {
  if (!appConfig.analyticsEnabled) {
    // Fail silently when disabled or unconfigured
    return;
  }

  try {
    // Avoid sending raw message bodies to analytics
    const safeProps = { ...properties };
    if (safeProps.rawMessage) {
      delete safeProps.rawMessage;
    }
    if (safeProps.body) {
      delete safeProps.body;
    }

    // In a real app, this would be a fetch to an analytics provider (like PostHog, Mixpanel, etc.)
    // fetch('https://analytics.example.com/track', {
    //   method: 'POST',
    //   body: JSON.stringify({ event: name, properties: safeProps }),
    // }).catch(() => {});

    if (process.env.NODE_ENV !== "production") {
      console.log(`[Analytics] Tracked ${name}`, safeProps);
    }
  } catch (err) {
    // Do not crash the application under any circumstances
    console.error("Analytics error:", err);
  }
}
