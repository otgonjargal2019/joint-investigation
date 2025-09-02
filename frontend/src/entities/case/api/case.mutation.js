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
