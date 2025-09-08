import { queryOptions } from "@tanstack/react-query";
import { axiosInstance } from "@/shared/api/baseAxiosApi";

export const postQuery = {
  all: () => ["postQuery"],
  getPosts: ({ boardType, page = 0, size = 10 }) =>
    queryOptions({
      queryKey: [...postQuery.all(), boardType, page, size],
      queryFn: async () => {
        const response = await axiosInstance.get(`/api/posts`, {
          params: { boardType, page, size },
        });
        return response.data;
      },
      enabled: !!boardType,
    }),

  getPost: ({ postId }) =>
    queryOptions({
      queryKey: [...postQuery.all(), postId],
      queryFn: async () => {
        const response = await axiosInstance.get(`/api/posts/${postId}`);
        return response.data;
      },
      enabled: !!postId,
    }),

  getPostWithNeighbors: ({ postId, boardType }) =>
    queryOptions({
      queryKey: [...postQuery.all(), postId, boardType],
      queryFn: async () => {
        const response = await axiosInstance.get(
          `/api/posts/${boardType}/${postId}`
        );
        return response.data;
      },
      enabled: !!postId && !!boardType,
    }),
};
