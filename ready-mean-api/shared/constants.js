export const FISH_CATEGORIES = [
  { id: 'sea_fish', label: 'Sea Fish', description: 'Fresh catch from the ocean' },
  { id: 'freshwater_fish', label: 'Freshwater Fish', description: 'Farm-raised freshwater varieties' },
  { id: 'shellfish', label: 'Shellfish', description: 'Prawns, crabs, lobsters' },
  { id: 'dried_fish', label: 'Dried Fish', description: 'Sun-dried and cured fish' },
];

export const CUTTING_TYPES = [
  { id: 'whole', label: 'Whole Fish', description: 'Complete fish, uncleaned', priceMultiplier: 1 },
  { id: 'cleaned', label: 'Cleaned', description: 'Scaled and gutted', priceMultiplier: 1.1 },
  { id: 'steaks', label: 'Steaks', description: 'Cross-cut pieces', priceMultiplier: 1.2 },
  { id: 'fillets', label: 'Fillets', description: 'Boneless fillets', priceMultiplier: 1.4 },
  { id: 'cubes', label: 'Cubes', description: 'Cut into cubes', priceMultiplier: 1.3 },
];

export const STATUS_FLOW = {
  placed: 'accepted',
  accepted: 'processing',
  processing: 'ready',
  ready: 'delivered',
};

export const STATUS_LABELS = {
  placed: 'Order Placed',
  accepted: 'Accepted',
  processing: 'Processing',
  ready: 'Ready for Pickup/Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const TIMELINE_STEPS = ['placed', 'accepted', 'processing', 'ready', 'delivered'];

export const USER_ROLES = {
  CUSTOMER: 'customer',
  VENDOR: 'vendor',
  ADMIN: 'admin',
};

export function getNextStatus(current) {
  return STATUS_FLOW[current] || null;
}

export function canCancel(status) {
  return status === 'placed';
}

export function isValidTransition(from, to) {
  return STATUS_FLOW[from] === to;
}
