import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/shared/api/baseAxiosApi";

//create
export const useCreatePost = () => {
  return useMutation({
    mutationFn: async ({ boardType, title, content }) => {
      return axiosInstance.post(`/api/posts`, {
        boardType,
        title,
        content,
      });
    },
  });
};

//update
export const useUpdatePost = () => {
  return useMutation({
    mutationFn: async ({ id, title, content }) => {
      return axiosInstance.put(`/api/posts/${id}`, {
        title,
        content,
      });
    },
  });
};

//delete
export const useDeletePost = () => {
  return useMutation({
    mutationFn: async ({ id }) => {
      return axiosInstance.delete(`/api/posts/${id}`, {
        id,
      });
    },
  });
};
