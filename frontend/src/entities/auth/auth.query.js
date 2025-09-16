import { queryOptions } from "@tanstack/react-query";
import { axiosInstance } from "@/shared/api/baseAxiosApi";

export const signupQuery = {
  all: () => ["signupQuery"],
  getSignup: () =>
    queryOptions({
      queryKey: [...signupQuery.all()],
      queryFn: async () => {
        const response = await axiosInstance.get(`/api/organizational-data`);
        return response.data;
      },
    }),
};
