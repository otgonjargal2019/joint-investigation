import { queryOptions } from "@tanstack/react-query";
import { axiosInstance } from "@/shared/api/baseAxiosApi";

export const profileQuery = {
  getProfile: () =>
    queryOptions({
      queryFn: async () => {
        const response = await axiosInstance.get(`/api/user/me`);
        return response.data;
      }
    })
};
