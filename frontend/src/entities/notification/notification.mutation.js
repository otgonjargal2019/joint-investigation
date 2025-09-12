import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/shared/api/baseAxiosApi";

export const useDeleteAll = () => {
  return useMutation({
    mutationFn: async () => {
      return axiosInstance.delete(`/api/notifications/delete-all`);
    },
  });
};

export const useReadAll = () => {
  return useMutation({
    mutationFn: async () => {
      return axiosInstance.post(`/api/notifications/read-all`);
    },
  });
};
