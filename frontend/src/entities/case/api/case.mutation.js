import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/shared/api/baseAxiosApi';

/**
 * Hook for creating a new case
 * @returns {import('@tanstack/react-query').UseMutationResult<
 *   import('../model/types').Case,
 *   Error,
 *   import('../model/types').CreateCaseRequest
 * >}
 */
export const useCreateCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.post('/api/cases', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate cases list query to refetch the updated data
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    }
  });
};

/**
 * Hook for assigning users to a case
 * @returns {import('@tanstack/react-query').UseMutationResult<
 *   Array<{
 *     caseId: string,
 *     userId: string,
 *     assignedAt: string,
 *     user: any,
 *     caseName: string
 *   }>,
 *   Error,
 *   {caseId: string, userIds: string[]}
 * >}
 */
export const useAssignUsersToCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.post('/api/cases/assign-users', data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate queries related to case assignments
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['caseAssignees', variables.caseId] });
      queryClient.invalidateQueries({ queryKey: ['myAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['userAssignments'] });
    }
  });
};

/**
 * Hook for removing users from a case
 * @returns {import('@tanstack/react-query').UseMutationResult<
 *   void,
 *   Error,
 *   {caseId: string, userIds: string[]}
 * >}
 */
export const useRemoveUsersFromCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.post('/api/cases/remove-assignees', data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate queries related to case assignments
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['caseAssignees', variables.caseId] });
      queryClient.invalidateQueries({ queryKey: ['myAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['userAssignments'] });
    }
  });
};
