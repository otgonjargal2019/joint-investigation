import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/shared/api/baseAxiosApi";

/**
 * Hook for fetching investigation records with pagination and filtering
 * @param {import('../model/query-params').CaseQueryParams} params
 * @returns {import('@tanstack/react-query').UseQueryResult<{
 *   content: import('../model/types').Case[],
 *   totalElements: number,
 *   totalPages: number,
 *   size: number,
 *   number: number
 * }>}
 */
export const useCase = ({
  sortBy = "createdAt",
  sortDirection = "asc",
  page = 0,
  size = 10,
  status,
  caseName,
} = {}) => {
  return useQuery({
    queryKey: ["/api/cases", { sortBy, sortDirection, page, size, status, caseName }],
    queryFn: async () => {
      const params = new URLSearchParams({
        sortBy,
        sortDirection,
        page: String(page),
        size: String(size),
        ...(status && { status }),
        ...(caseName && { caseName }),
      });

      const { data } = await axiosInstance.get(
        `/api/cases?${params.toString()}`
      );
      return data;
    },
  });
};

export const useCaseById = ({
  id,
} = {}) => {
  return useQuery({
    queryKey: ["/api/cases/id", { id }],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/api/cases/${id}`
      );
      return data;
    },
  });
};
