import supabase from '../config/supabase.js';

// Alphanumeric chars excluding ambiguous ones (I, O, 0, 1)
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomCode(length = 6) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

/**
 * Generate a unique 6-char vendor code, retrying on collision
 */
export async function generateVendorCode() {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const { data } = await supabase
      .from('vendor_info')
      .select('id')
      .eq('vendor_code', code)
      .maybeSingle();

    if (!data) return code;
  }
  // Extremely unlikely fallback — append timestamp suffix
  return randomCode(4) + randomCode(4);
}
