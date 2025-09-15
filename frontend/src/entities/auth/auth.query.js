import { queryOptions } from "@tanstack/react-query";
import { axiosInstance } from "@/shared/api/baseAxiosApi";

export const signupQuery = {
  all: () => ["signupQuery"],
  getSignup: () =>
    queryOptions({
      queryKey: [...signupQuery.all()],
      queryFn: async () => {
        const response = await axiosInstance.get(`/api/auth/signup`);
        return response.data;
      }
    })
};
