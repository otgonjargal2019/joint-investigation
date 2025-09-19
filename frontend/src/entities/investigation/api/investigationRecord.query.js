import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/shared/api/baseAxiosApi";

/**
 * Hook for fetching investigation records with pagination and filtering
 * @param {import('../model/query-params').InvestigationRecordQueryParams} params
 * @returns {import('@tanstack/react-query').UseQueryResult<{
 *   content: import('../model/types').InvestigationRecord[],
 *   totalElements: number,
 *   totalPages: number,
 *   size: number,
 *   number: number
 * }>}
 */
export const useInvestigationRecords = ({
  sortBy = "createdAt",
  sortDirection = "desc",
  page = 0,
  size = 10,
  progressStatus,
  recordName,
  caseId,
} = {}) => {
  return useQuery({
    queryKey: ["investigationRecords", { sortBy, sortDirection, page, size, progressStatus, recordName, caseId }],
    queryFn: async () => {
      const params = new URLSearchParams({
        sortBy,
        sortDirection,
        page: String(page),
        size: String(size),
        ...(progressStatus && { progressStatus }),
        ...(recordName && { recordName }),
        ...(caseId && { caseId }),
      });

      const { data } = await axiosInstance.get(
        `/investigation-records/list?${params.toString()}`
      );
      return data;
    },
  });
};

/**
 * Hook for fetching a single investigation record by ID
 * @param {string} recordId - UUID of the investigation record
 * @param {boolean} enabled - Whether the query should run
 * @returns {import('@tanstack/react-query').UseQueryResult<import('../model/types').InvestigationRecord>}
 */
export const useInvestigationRecord = (recordId, { enabled = true } = {}) => {
  return useQuery({
    queryKey: ["investigationRecord", recordId],
    queryFn: async () => {
      if (!recordId) {
        throw new Error("Record ID is required");
      }

      const { data } = await axiosInstance.get(`/investigation-records/${recordId}`);
      return data;
    },
    enabled: enabled && Boolean(recordId),
  });
};
