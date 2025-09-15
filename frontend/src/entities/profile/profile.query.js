import { queryOptions } from "@tanstack/react-query";
import { axiosInstance } from "@/shared/api/baseAxiosApi";

export const profileQuery = {
  all: () => ["profileQuery"],
  getProfile: () =>
    queryOptions({
      queryKey: [...profileQuery.all()],
      queryFn: async () => {
        const response = await axiosInstance.get(`/api/user/me`);
        return response.data;
      }
    })
};
