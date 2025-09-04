import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/shared/api/baseAxiosApi";

//create
export const useCreatePost = () => {
  return useMutation({
    mutationFn: async ({ boardType, title, content, files }) => {
      const post = { boardType, title, content };

      const formData = new FormData();
      formData.append(
        "post",
        new Blob([JSON.stringify(post)], { type: "application/json" })
      );

      files.forEach((file) => formData.append("attachments", file));

      return axiosInstance.post("/api/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
  });
};

//update
export const useUpdatePost = () => {
  return useMutation({
    mutationFn: async ({
      id,
      boardType,
      title,
      content,
      files,
      removedAttachmentIds,
    }) => {
      const post = { boardType, title, content, removedAttachmentIds };

      const formData = new FormData();
      formData.append(
        "post",
        new Blob([JSON.stringify(post)], { type: "application/json" })
      );

      files.forEach((file) => formData.append("attachments", file));

      return axiosInstance.put(`/api/posts/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
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

//add view on post
export const useAddViewPost = () => {
  return useMutation({
    mutationFn: async ({ id }) => {
      return axiosInstance.post(`/api/posts/${id}/view`, {
        id,
      });
    },
  });
};
