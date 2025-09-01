import { queryOptions } from "@tanstack/react-query";
import { axiosInstance } from "@/shared/api/baseAxiosApi";

export const postQuery = {
  all: () => ["postQuery"],
  getPosts: (boardType, page = 0, size = 10) =>
    queryOptions({
      queryKey: [...postQuery.all(), boardType, page, size],
      queryFn: async ({ page, size }) => {
        const response = await axiosInstance.get(`/api/posts`, {
          params: { boardType, page, size },
        });
        return response.data;
      },
    }),

  getPost: (id) =>
    queryOptions({
      queryKey: [...postQuery.all(), id],
      queryFn: async () => {
        const response = await axiosInstance.get(`/api/posts/${id}`);
        return response.data;
      },
    }),
};
