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
  sortBy = "recordName",
  sortDirection = "asc",
  page = 0,
  size = 10,
  progressStatus,
  recordName,
} = {}) => {
  return useQuery({
    queryKey: ["investigationRecords", { sortBy, sortDirection, page, size, progressStatus, recordName }],
    queryFn: async () => {
      const params = new URLSearchParams({
        sortBy,
        sortDirection,
        page: String(page),
        size: String(size),
        ...(progressStatus && { progressStatus }),
        ...(recordName && { recordName }),
      });

      const { data } = await axiosInstance.get(
        `/investigation-records/list?${params.toString()}`
      );
      return data;
    },
  });
};
