import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/shared/api/baseAxiosApi";

//create
export const useCreatePost = () => {
  return useMutation({
    mutationFn: async ({ boardType, title, content, files }) => {
      const formData = new FormData();

      const post = { boardType, title, content };

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
    mutationFn: async ({ id, title, content, files }) => {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);

      if (files && files.length > 0) {
        files.forEach((file, idx) => {
          formData.append(`attachments[${idx}].file`, file);
          formData.append(`attachments[${idx}].fileName`, file.name);
        });
      }

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
