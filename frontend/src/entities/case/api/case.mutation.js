import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/shared/api/baseAxiosApi";

export const useCreateCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.post("/api/cases", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    },
  });
};

export const useUpdateCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.post("/api/cases", data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      queryClient.invalidateQueries({ queryKey: ["case", variables.caseId] });
      queryClient.invalidateQueries({ queryKey: ["myAssignedCases"] });
    },
  });
};

export const useAssignUsersToCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.post(
        "/api/cases/assign-users",
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      queryClient.invalidateQueries({
        queryKey: ["caseAssignees", variables.caseId],
      });
      queryClient.invalidateQueries({ queryKey: ["myAssignments"] });
      queryClient.invalidateQueries({ queryKey: ["userAssignments"] });
    },
  });
};

export const useRemoveUsersFromCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.post(
        "/api/cases/remove-assignees",
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      queryClient.invalidateQueries({
        queryKey: ["caseAssignees", variables.caseId],
      });
      queryClient.invalidateQueries({ queryKey: ["myAssignments"] });
      queryClient.invalidateQueries({ queryKey: ["userAssignments"] });
    },
  });
};

export const useUpdateCaseAssignments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caseId, userIds }) => {
      const response = await axiosInstance.put(
        `/api/cases/${caseId}/assignees`,
        { userIds }
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      queryClient.invalidateQueries({
        queryKey: ["caseAssignees", variables.caseId],
      });
      queryClient.invalidateQueries({ queryKey: ["myAssignments"] });
      queryClient.invalidateQueries({ queryKey: ["userAssignments"] });
    },
  });
};
