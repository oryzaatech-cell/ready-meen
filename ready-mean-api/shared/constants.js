export const FISH_CATEGORIES = [
  { id: 'sea_fish', label: 'Sea Fish', description: 'Fresh catch from the ocean' },
  { id: 'freshwater_fish', label: 'Freshwater Fish', description: 'Farm-raised freshwater varieties' },
  { id: 'shellfish', label: 'Shellfish', description: 'Prawns, crabs, lobsters' },
  { id: 'dried_fish', label: 'Dried Fish', description: 'Sun-dried and cured fish' },
];

export const CUTTING_TYPES = [
  { id: 'curry_cut', label: 'Curry Cut', description: 'Pieces for curry', priceMultiplier: 1 },
  { id: 'biriyani_cut', label: 'Biriyani Cut', description: 'Pieces for biriyani', priceMultiplier: 1 },
];

export const STATUS_FLOW = {
  placed: 'processing',
  cancel_requested: 'processing',
  processing: 'ready',
  ready: 'delivered',
};

export const STATUS_LABELS = {
  placed: 'Order Placed',
  cancel_requested: 'Cancel Requested',
  processing: 'Processing',
  ready: 'Ready for Pickup/Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const TIMELINE_STEPS = ['placed', 'processing', 'ready', 'delivered'];

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
