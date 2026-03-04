export function validatePhone(phone) {
  const cleaned = phone.replace(/[\s\-]/g, '');
  return /^(\+91)?[6-9]\d{9}$/.test(cleaned);
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function formatPhoneForSupabase(phone) {
  const cleaned = phone.replace(/[\s\-]/g, '');
  if (cleaned.startsWith('+91')) {
    return cleaned;
  }
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return '+' + cleaned;
  }
  return '+91' + cleaned;
}

export function validateRequired(value, fieldName) {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true, error: null };
}
