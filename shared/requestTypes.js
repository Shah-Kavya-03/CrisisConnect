/**
 * CrisisConnect Shared Types & Enums
 * Used across Client, Server, and Microservices
 */

export const REQUEST_CATEGORIES = {
  MEDICAL: 'Medical',
  RESCUE: 'Rescue',
  FOOD_WATER: 'Food & Water',
  OXYGEN: 'Oxygen',
  MEDICINES: 'Medicines',
  BLOOD: 'Blood',
  SHELTER: 'Shelter',
  TRANSPORT: 'Transportation',
  GENERAL: 'General'
};

export const URGENCY_LEVELS = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
};

export const REQUEST_STATUSES = {
  AWAITING_HELP: 'Awaiting Help',
  ASSIGNED: 'Assigned',
  EN_ROUTE: 'En Route',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  EXPIRED: 'Expired',
  FLAGGED_DUPLICATE: 'Flagged Duplicate',
  CANCELLED: 'Cancelled'
};

export const USER_ROLES = {
  REQUESTER: 'Requester',
  VOLUNTEER: 'Volunteer',
  NGO: 'NGO',
  ADMIN: 'Admin'
};

export const VOLUNTEER_SKILLS = [
  'First Aid / BLS',
  'Doctor / Physician',
  'Paramedic / EMT',
  'Boat / Water Rescue',
  '4x4 Off-Road Transport',
  'Heavy Lifting / Debris Clearing',
  'Food & Ration Distribution',
  'Psychological Support / Counseling',
  'Bilingual Translation'
];

export const VEHICLE_TYPES = [
  'None / Walking',
  'Bicycle / Two-Wheeler',
  'Standard Car / Sedan',
  'SUV / 4x4 Off-Road',
  'Ambulance / Medical Van',
  'Cargo Truck / Lorry',
  'Rescue Boat / Raft'
];

export const MATCH_STATUSES = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  DECLINED: 'Declined',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

export const DUPLICATE_SEVERITY = {
  EXACT_DUPLICATE: 'Exact Duplicate',
  HIGH_SIMILARITY: 'High Similarity',
  POTENTIAL_CLUSTER: 'Potential Incident Cluster',
  UNIQUE: 'Unique Request'
};

// CommonJS export fallback for backend environments that use require()
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    REQUEST_CATEGORIES,
    URGENCY_LEVELS,
    REQUEST_STATUSES,
    USER_ROLES,
    VOLUNTEER_SKILLS,
    VEHICLE_TYPES,
    MATCH_STATUSES,
    DUPLICATE_SEVERITY
  };
}
