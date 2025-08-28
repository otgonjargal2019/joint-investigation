/**
 * @typedef {Object} InvestigationRecord
 * @property {string} recordId
 * @property {string} recordName
 * @property {'PRE_INVESTIGATION' | 'INVESTIGATION' | 'REVIEW' | 'PROSECUTION' | 'CLOSED'} progressStatus
 * @property {Object} caseInstance
 * @property {string} caseInstance.caseId
 * @property {string} caseInstance.caseName
 * @property {Object} creator
 * @property {string} creator.userId
 * @property {string} creator.loginId
 * @property {string} creator.nameKr
 * @property {string} creator.nameEn
 * @property {string} creator.email
 * @property {string} creator.phone
 * @property {string} creator.country
 * @property {string} creator.department
 * @property {string} creator.status
 * @property {Object} [reviewer]
 * @property {string} [reviewer.userId]
 * @property {string} [reviewer.loginId]
 * @property {string} [reviewer.nameKr]
 * @property {string} [reviewer.nameEn]
 * @property {string} [reviewer.email]
 * @property {string} [reviewer.phone]
 * @property {string} [reviewer.country]
 * @property {string} [reviewer.department]
 * @property {string} [reviewer.status]
 */

export {};
