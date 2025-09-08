import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/shared/api/baseAxiosApi";

export const useProfile = () => {
  return useMutation({
    mutationFn: async ({profileImg,  countryId, headquarterId, departmentId, phone, email }) => {
      const profile = { countryId, headquarterId, departmentId, phone, email };
      const formData = new FormData();
      formData.append("profile", new Blob([JSON.stringify(profile)], { type: "application/json" }));
      formData.append("profileImg", profileImg);

      return axiosInstance.post(`/api/user/profile`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
  });
};

export const useDeleteProfileImg = () => {
  return useMutation({
    mutationFn: async () => {
      return axiosInstance.delete(`/api/user/deleteProfile`, {});
    },
  });
};
