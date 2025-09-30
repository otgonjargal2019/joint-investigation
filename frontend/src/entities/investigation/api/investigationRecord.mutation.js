import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/shared/api/baseAxiosApi';

export const useCreateInvestigationRecordWithFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
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

      return axiosInstance.post(
        '/investigation-records/create-with-files',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    },
    onSuccess: () => {
      // Invalidate investigation records list query to refetch the updated data
      queryClient.invalidateQueries({ queryKey: ['investigationRecords'] });
    }
  });
};

export const useUpdateInvestigationRecordWithFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
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

      return axiosInstance.put(
        '/investigation-records/update-with-files',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['investigationRecords'] });
      queryClient.invalidateQueries({ queryKey: ['investigationRecord', variables.record.recordId] });
    },
  });
};

export const useRejectInvestigationRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recordId, rejectionReason }) => {
      return axiosInstance.post('/investigation-records/reject', {
        recordId,
        rejectionReason
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['investigationRecords'] });
      queryClient.invalidateQueries({ queryKey: ['investigationRecord', variables.recordId] });
    }
  });
};

export const useApproveInvestigationRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recordId }) => {
      return axiosInstance.post('/investigation-records/approve', {
        recordId
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['investigationRecords'] });
      queryClient.invalidateQueries({ queryKey: ['investigationRecord', variables.recordId] });
    }
  });
};

export const useRequestReviewInvestigationRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recordId }) => {
      return axiosInstance.patch('/investigation-records/requestReview', {
        recordId
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['investigationRecords'] });
      queryClient.invalidateQueries({ queryKey: ['investigationRecord', variables.recordId] });
    }
  });
};
