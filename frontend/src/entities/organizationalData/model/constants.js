/**
 * User roles in the organizational structure
 */
export const USER_ROLES = {
  PLATFORM_ADMIN: 'PLATFORM_ADMIN',
  INV_ADMIN: 'INV_ADMIN',
  INVESTIGATOR: 'INVESTIGATOR',
  RESEARCHER: 'RESEARCHER',
  COPYRIGHT_HOLDER: 'COPYRIGHT_HOLDER'
};

/**
 * User status values
 */
export const USER_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  COMPLETE_TREE: '/api/organizational-data/complete-tree',
  CURRENT_COUNTRY_TREE: '/api/organizational-data/current-country-tree'
};

/**
 * Query keys for TanStack Query
 */
export const QUERY_KEYS = {
  ORGANIZATIONAL_DATA: 'organizational-data',
  COMPLETE_TREE: [API_ENDPOINTS.COMPLETE_TREE],
  CURRENT_COUNTRY_TREE: ['organizational-data', 'current-country-tree']
};
