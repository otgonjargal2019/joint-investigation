import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/shared/api/baseAxiosApi';

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

export const useUpdateCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      // Use the same endpoint as create, but with caseId included for update
      const response = await axiosInstance.post('/api/cases', data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['case', variables.caseId] });
      queryClient.invalidateQueries({ queryKey: ['myAssignedCases'] });
    }
  });
};

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
