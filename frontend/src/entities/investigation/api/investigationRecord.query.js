import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/shared/api/baseAxiosApi";

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

export const useInvestigationRecord = (recordId, { enabled = true } = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["investigationRecord", recordId],
    queryFn: async () => {
      if (!recordId) {
        throw new Error("Record ID is required");
      }

      return axiosInstance.get(`/investigation-records/${recordId}`);
    },
    enabled: enabled && Boolean(recordId),
  });

  useEffect(() => {
      if (query.error?.response?.status === 404) {
        console.info(`Investigation record with ID ${recordId} not found.`);
        // side effect on error
        queryClient.removeQueries({ queryKey: ["investigationRecord", recordId] });
      }
  }, [query.error, recordId, queryClient]);

  return query;
};
