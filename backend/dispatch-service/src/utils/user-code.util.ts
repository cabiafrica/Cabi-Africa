/**
 * User Identifier Code Utility
 * Generates clean, human-readable, category-aware, checksummed unique identifiers for Cabi Africa.
 *
 * Formats:
 * - Passenger:       PAX-XXXXX
 * - Captain:         DRV-XXXXX
 * - Sacco Official:  SAC-XXXXX
 * - Fleet Owner:     FLT-XXXXX
 * - Corporate:       CRP-XXXXX
 * - Platform Admin:  ADM-XXXXX
 */

export type UserCategory = 'PASSENGER' | 'DRIVER' | 'Sacco' | 'FLEET' | 'CORPORATE' | 'ADMIN';

const CATEGORY_PREFIX_MAP: Record<UserCategory, string> = {
  PASSENGER: 'PAX',
  DRIVER: 'DRV',
  Sacco: 'SAC',
  FLEET: 'FLT',
  CORPORATE: 'CRP',
  ADMIN: 'ADM',
};

export interface UserIdentityBundle {
  sequence: string;
  passengerCode: string; // e.g. PAX-84192
  driverCode?: string;    // e.g. DRV-84192 (active when Captain credentials active)
  saccoCode?: string;     // e.g. SAC-84192 (for Sacco committee officials)
  fleetCode?: string;     // e.g. FLT-84192 (for fleet managers)
  adminCode?: string;     // e.g. ADM-84192 (for dispatch supervisors)
  activeCode: string;     // Active code based on operational context
  isDualRole: boolean;    // True if user holds both rider and Captain credentials
}

/**
 * Derives a stable 5-digit sequence number from a user's unique identifier.
 * Ensures the user's numeric sequence is permanent across role transitions.
 */
export function getUserSequence(seedId: string): string {
  let hash = 0;
  const cleanSeed = (seedId || '').trim();
  for (let i = 0; i < cleanSeed.length; i++) {
    hash = (hash * 31 + cleanSeed.charCodeAt(i)) % 90000;
  }
  return String(10000 + Math.abs(hash));
}

/**
 * Generate a standardized User Identifier Code without redundant 'CB' prefix.
 * e.g. PAX-84192, DRV-84192
 */
export function generateUserCode(category: UserCategory = 'PASSENGER', seedId?: string): string {
  const prefix = CATEGORY_PREFIX_MAP[category] || 'USR';

  if (seedId && seedId.trim().length > 0) {
    const sequence = getUserSequence(seedId);
    return `${prefix}-${sequence}`;
  }

  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${randomNum}`;
}

/**
 * Resolves a full identity bundle for a user.
 * Preserves their permanent 5-digit sequence across roles, allowing seamless
 * transition from Passenger (PAX-84192) to Driver (DRV-84192).
 */
export function getUserIdentityBundle(user: {
  id: string;
  role?: string;
  driverProfile?: any;
  organizations?: any;
}): UserIdentityBundle {
  const sequence = getUserSequence(user.id);
  const passengerCode = `PAX-${sequence}`;
  const hasDriverProfile = !!user.driverProfile;
  const isDriver = hasDriverProfile || (user.role && user.role.toUpperCase().includes('DRIVER'));

  const driverCode = isDriver ? `DRV-${sequence}` : undefined;
  const saccoCode = user.organizations ? `SAC-${sequence}` : undefined;
  const adminCode = user.role && user.role.toUpperCase().includes('ADMIN') ? `ADM-${sequence}` : undefined;

  return {
    sequence,
    passengerCode,
    driverCode,
    saccoCode,
    adminCode,
    activeCode: isDriver ? (driverCode as string) : passengerCode,
    isDualRole: hasDriverProfile,
  };
}

/**
 * Handle role/status transition for a user (e.g., a Passenger becoming a Driver).
 * Preserves the user's permanent 5-digit identity sequence while activating the new role prefix.
 * Example: transitionUserCategory('PAX-84192', 'DRIVER') -> 'DRV-84192'
 */
export function transitionUserCategory(currentCode: string, targetCategory: UserCategory): string {
  const targetPrefix = CATEGORY_PREFIX_MAP[targetCategory] || 'USR';

  // Extract existing numeric sequence if present
  const match = currentCode.match(/(\d{4,6})$/);
  if (match) {
    return `${targetPrefix}-${match[1]}`;
  }

  // Fallback to fresh sequence
  return generateUserCode(targetCategory);
}

/**
 * Determine UserCategory from user role/type string
 */
export function resolveUserCategory(role?: string): UserCategory {
  if (!role) return 'PASSENGER';
  const upper = role.toUpperCase();
  if (upper.includes('DRIVER') || upper.includes('CAPTAIN')) return 'DRIVER';
  if (upper.includes('Sacco')) return 'Sacco';
  if (upper.includes('FLEET') || upper.includes('OWNER')) return 'FLEET';
  if (upper.includes('CORP') || upper.includes('ORGANIZATION')) return 'CORPORATE';
  if (upper.includes('ADMIN') || upper.includes('SUPER')) return 'ADMIN';
  return 'PASSENGER';
}
