export function normalizePhone(phone: string): string | null {
  if (!phone) return null;
  try {
    // Remove all non-numeric characters except leading +
    let digits = phone.replace(/[^\d+]/g, '');

    // If it doesn't start with +, let's add it based on rules
    if (!digits.startsWith('+')) {
      // If it's exactly 10 digits, assume US +1
      if (digits.length === 10) {
        digits = '+1' + digits;
      } else if (digits.length === 11 && digits.startsWith('1')) {
        // If it's 11 digits and starts with 1, assume US
        digits = '+' + digits;
      } else {
        // Otherwise, just prepend + and hope it's valid international
        digits = '+' + digits;
      }
    }

    // Validate it's basically a phone number (e.g., + followed by 10-15 digits)
    if (!/^\+\d{10,15}$/.test(digits)) {
      return null;
    }

    return digits;
  } catch {
    return null; // Safe fallback
  }
}
