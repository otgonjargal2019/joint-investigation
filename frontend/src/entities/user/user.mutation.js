import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/shared/api/baseAxiosApi";

export const useUpdateUserStatus = () => {
  return useMutation({
    mutationFn: async ({ userId, status, reason }) => {
      return axiosInstance.post("/api/user/update-status", {
        userId,
        status,
        reason,
      });
    },
  });
};
