import "server-only";

export const WEEKLY_SUMMARY_DISCLAIMER =
  "CircleRelay Care Mode is for family coordination only and does not provide medical advice. If this is an emergency, call emergency services.";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildPrintableWeeklySummaryHtml(input: {
  careCircleId: string;
  summaryText: string;
  source: string;
  generatedAt?: string;
}) {
  const generatedAt = input.generatedAt || new Date().toISOString();
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>CircleRelay Weekly Summary</title>
  <style>
    body { color: #22302f; font-family: Arial, sans-serif; line-height: 1.5; margin: 32px; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    .meta, .disclaimer { color: #5f6b68; font-size: 13px; }
    .summary { border: 1px solid #d8dfdc; border-radius: 8px; margin-top: 20px; padding: 18px; white-space: pre-wrap; }
    .disclaimer { border-top: 1px solid #d8dfdc; margin-top: 28px; padding-top: 14px; }
  </style>
</head>
<body>
  <h1>CircleRelay Weekly Summary</h1>
  <p class="meta">Care circle: ${escapeHtml(input.careCircleId)}<br />Generated: ${escapeHtml(generatedAt)}<br />Source: ${escapeHtml(input.source)}</p>
  <section class="summary">${escapeHtml(input.summaryText)}</section>
  <p class="disclaimer">${escapeHtml(WEEKLY_SUMMARY_DISCLAIMER)}</p>
</body>
</html>`;
}
