import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/shared/api/baseAxiosApi";

export const useSignIn = () => {
  return useMutation({
    mutationFn: async (payload) => {
      return axiosInstance.post(`/api/auth/login`, payload);
    },
  });
};
