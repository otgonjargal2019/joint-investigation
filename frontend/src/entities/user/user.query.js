import { queryOptions } from "@tanstack/react-query";
import { axiosInstance } from "@/shared/api/baseAxiosApi";

export const userQuery = {
  all: () => ["users"],
  getUsersByStatus: ({ status, page = 0, size = 10 }) =>
    queryOptions({
      queryKey: [...userQuery.all(), status, page, size],
      queryFn: async () => {
        const response = await axiosInstance.get(`/api/user/list`, {
          params: { status, page, size },
        });
        return response.data;
      },
    }),

  getUserById: ({ userId }) =>
    queryOptions({
      queryKey: [...userQuery.all(), userId],
      queryFn: async () => {
        console.log("end bnu");
        const response = await axiosInstance.get(`/api/user/${userId}`);
        return response.data;
      },
      enabled: !!userId,
    }),
};
