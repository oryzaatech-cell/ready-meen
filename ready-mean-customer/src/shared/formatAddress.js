/**
 * Format a structured address object into a multi-line string (for storing in order).
 */
export function formatAddressText(addr) {
  const lines = [];

  // Line 1: Mobile number
  lines.push(`Mobile: ${addr.phone}`);

  // Line 2: Building name + flat number + floor
  let line2 = addr.flat_name;
  if (addr.flat_number) line2 += `, Flat ${addr.flat_number}`;
  if (addr.floor) line2 += `, Floor ${addr.floor}`;
  lines.push(line2);

  // Line 3: Area
  lines.push(addr.area);

  // Line 4: Recipient name
  lines.push(addr.name);

  return lines.join('\n');
}

/**
 * Format a structured address into a one-line summary for card display.
 */
export function formatAddressSummary(addr) {
  const parts = [addr.flat_name];
  if (addr.flat_number) parts.push(`Flat ${addr.flat_number}`);
  parts.push(addr.area);
  return parts.join(', ');
}
