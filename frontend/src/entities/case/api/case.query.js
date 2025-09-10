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

export const useMyAssignedCase = ({
  sortBy = "createdAt",
  sortDirection = "asc",
  page = 0,
  size = 10,
  status,
  caseName,
} = {}) => {
  return useQuery({
    queryKey: ["/api/cases/my-assigned", { sortBy, sortDirection, page, size, status, caseName }],
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
        `/api/cases/my-assigned?${params.toString()}`
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

/**
 * Hook for fetching case assignees
 * @param {string} caseId - The case ID
 * @returns {import('@tanstack/react-query').UseQueryResult<
 *   Array<{
 *     caseId: string,
 *     userId: string,
 *     assignedAt: string,
 *     user: any,
 *     caseName: string
 *   }>,
 *   Error
 * >}
 */
export const useCaseAssignees = (caseId) => {
  return useQuery({
    queryKey: ['caseAssignees', caseId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/cases/${caseId}/assignees`);
      return response.data;
    },
    enabled: !!caseId,
  });
};

/**
 * Hook for fetching current user's case assignments
 * @returns {import('@tanstack/react-query').UseQueryResult<
 *   Array<{
 *     caseId: string,
 *     userId: string,
 *     assignedAt: string,
 *     user: any,
 *     caseName: string
 *   }>,
 *   Error
 * >}
 */
export const useMyAssignments = () => {
  return useQuery({
    queryKey: ['myAssignments'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/cases/my-assignments');
      return response.data;
    },
  });
};

/**
 * Hook for fetching a specific user's case assignments
 * @param {string} userId - The user ID
 * @returns {import('@tanstack/react-query').UseQueryResult<
 *   Array<{
 *     caseId: string,
 *     userId: string,
 *     assignedAt: string,
 *     user: any,
 *     caseName: string
 *   }>,
 *   Error
 * >}
 */
export const useUserAssignments = (userId) => {
  return useQuery({
    queryKey: ['userAssignments', userId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/cases/user/${userId}/assignments`);
      return response.data;
    },
    enabled: !!userId,
  });
};

/**
 * Hook for checking if a user is assigned to a case
 * @param {string} caseId - The case ID
 * @param {string} userId - The user ID
 * @returns {import('@tanstack/react-query').UseQueryResult<boolean, Error>}
 */
export const useIsUserAssignedToCase = (caseId, userId) => {
  return useQuery({
    queryKey: ['userCaseAssignment', caseId, userId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/cases/${caseId}/assignees/${userId}/exists`);
      return response.data;
    },
    enabled: !!(caseId && userId),
  });
};

/**
 * Hook for fetching case assignment count
 * @param {string} caseId - The case ID
 * @returns {import('@tanstack/react-query').UseQueryResult<number, Error>}
 */
export const useCaseAssignmentCount = (caseId) => {
  return useQuery({
    queryKey: ['caseAssignmentCount', caseId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/cases/${caseId}/assignment-count`);
      return response.data;
    },
    enabled: !!caseId,
  });
};
