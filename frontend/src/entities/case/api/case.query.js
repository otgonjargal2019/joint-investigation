import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/shared/api/baseAxiosApi";

export const useCase = ({
  sortBy = "number",
  sortDirection = "desc",
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
  sortBy = "number",
  sortDirection = "desc",
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
  enabled = true,
} = {}) => {
  return useQuery({
    queryKey: ["/api/cases/id", { id }],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/api/cases/${id}`
      );
      return data;
    },
    enabled: enabled && !!id, // Only run query when enabled and id is provided
  });
};

export const useCaseAssignees = (caseId, options = {}) => {
  return useQuery({
    queryKey: ['caseAssignees', caseId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/cases/${caseId}/assignees`);
      return response.data;
    },
    enabled: options.enabled !== undefined ? options.enabled : !!caseId,
  });
};

export const useMyAssignments = () => {
  return useQuery({
    queryKey: ['myAssignments'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/cases/my-assignments');
      return response.data;
    },
  });
};

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
