import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/shared/api/baseAxiosApi';

/**
 * Hook for creating investigation record without files (legacy method)
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export const useCreateInvestigationRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.post('/investigation-records/create', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate investigation records list query to refetch the updated data
      queryClient.invalidateQueries({ queryKey: ['investigationRecords'] });
    }
  });
};

/**
 * Hook for creating investigation record with file uploads
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export const useCreateInvestigationRecordWithFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      record,
      files = [],
      fileTypes = [],
      digitalEvidenceFlags = [],
      investigationReportFlags = []
    }) => {
      const formData = new FormData();

      // Add the investigation record data
      formData.append(
        'record',
        new Blob([JSON.stringify(record)], { type: 'application/json' })
      );

      // Add files if provided
      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append('files', file);
        });

        // Add file metadata arrays
        if (fileTypes.length > 0) {
          fileTypes.forEach((type) => {
            formData.append('fileTypes', type);
          });
        }

        if (digitalEvidenceFlags.length > 0) {
          digitalEvidenceFlags.forEach((flag) => {
            formData.append('digitalEvidenceFlags', flag);
          });
        }

        if (investigationReportFlags.length > 0) {
          investigationReportFlags.forEach((flag) => {
            formData.append('investigationReportFlags', flag);
          });
        }
      }

      const response = await axiosInstance.post(
        '/investigation-records/create-with-files',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    },
    onSuccess: () => {
      // Invalidate investigation records list query to refetch the updated data
      queryClient.invalidateQueries({ queryKey: ['investigationRecords'] });
    }
  });
};

/**
 * Hook for updating investigation record
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export const useUpdateInvestigationRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recordId, data }) => {
      const response = await axiosInstance.put(`/investigation-records/${recordId}`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['investigationRecords'] });
      queryClient.invalidateQueries({ queryKey: ['investigationRecord', variables.recordId] });
    }
  });
};

/**
 * Hook for getting investigation record by ID
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export const useGetInvestigationRecord = () => {
  return useMutation({
    mutationFn: async (recordId) => {
      const response = await axiosInstance.get(`/investigation-records/${recordId}`);
      return response.data;
    }
  });
};

/**
 * Hook for rejecting investigation record
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export const useRejectInvestigationRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recordId, rejectionReason }) => {
      const response = await axiosInstance.post('/investigation-records/reject', {
        recordId,
        rejectionReason
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['investigationRecords'] });
      queryClient.invalidateQueries({ queryKey: ['investigationRecord', variables.recordId] });
    }
  });
};

/**
 * Hook for approving investigation record
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export const useApproveInvestigationRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recordId }) => {
      const response = await axiosInstance.post('/investigation-records/approve', {
        recordId
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['investigationRecords'] });
      queryClient.invalidateQueries({ queryKey: ['investigationRecord', variables.recordId] });
    }
  });
};

/**
 * Hook for requesting review of investigation record
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export const useRequestReviewInvestigationRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recordId }) => {
      const response = await axiosInstance.patch('/investigation-records/requestReview', {
        recordId
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['investigationRecords'] });
      queryClient.invalidateQueries({ queryKey: ['investigationRecord', variables.recordId] });
    }
  });
};