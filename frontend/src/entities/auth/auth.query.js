import { queryOptions } from "@tanstack/react-query";
import { axiosInstance } from "@/shared/api/baseAxiosApi";

export const signupQuery = {
  getSignup: () =>
    queryOptions({
      queryFn: async () => {
        const response = await axiosInstance.get(`/api/auth/signup`);
        return response.data;
      }
    })
};
