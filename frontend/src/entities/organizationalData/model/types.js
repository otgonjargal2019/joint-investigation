/**
 * @typedef {Object} UserTreeNode
 * @property {string} userId
 * @property {string} loginId
 * @property {string} nameKr
 * @property {string} nameEn
 * @property {string} email
 * @property {string} phone
 * @property {'PLATFORM_ADMIN' | 'INV_ADMIN' | 'INVESTIGATOR' | 'RESEARCHER' | 'COPYRIGHT_HOLDER'} role
 * @property {'PENDING' | 'ACTIVE' | 'INACTIVE'} status
 */

/**
 * @typedef {Object} DepartmentTreeNode
 * @property {number} departmentId
 * @property {string} departmentUuid
 * @property {string} departmentName
 * @property {UserTreeNode[]} investigators
 */

/**
 * @typedef {Object} HeadquarterTreeNode
 * @property {number} headquarterId
 * @property {string} headquarterUuid
 * @property {string} headquarterName
 * @property {DepartmentTreeNode[]} departments
 */

/**
 * @typedef {Object} CountryOrganizationTree
 * @property {number} countryId
 * @property {string} countryUuid
 * @property {string} countryName
 * @property {string} countryCode
 * @property {HeadquarterTreeNode[]} headquarters
 */

/**
 * @typedef {Object} ForeignInvAdminTree
 * @property {number} countryId
 * @property {string} countryUuid
 * @property {string} countryName
 * @property {string} countryCode
 * @property {UserTreeNode[]} invAdmins
 */

/**
 * @typedef {Object} CombinedOrganizationalData
 * @property {CountryOrganizationTree} currentCountryOrganization
 * @property {ForeignInvAdminTree[]} foreignInvAdmins
 */

/**
 * @typedef {Object} Country
 * @property {number} id
 * @property {string} uuid
 * @property {string} name
 * @property {string} phonePrefix
 * @property {string} code
 * @property {string} createdAt
 * @property {string} updatedAt
 */

export {};
