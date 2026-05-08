/**
 * Safely filters summary outputs to ensure they never include medical advice,
 * diagnostic claims, or unsafe dosage recommendations.
 */

export function isSummarySafe(text: string): boolean {
  if (!text) return false;
  
  const lower = text.toLowerCase();
  
  const unsafeTerms = [
    "diagnosis", "diagnose", "treatment", "clinical",
    "triage", "medical-grade", "unsafe", "dosage", "prescribe",
    "symptom means", "emergency detected", "medical issue", 
    "increase dose", "decrease dose", "you should treat"
  ];

  for (const term of unsafeTerms) {
    if (lower.includes(term)) {
      return false;
    }
  }

  return true;
}