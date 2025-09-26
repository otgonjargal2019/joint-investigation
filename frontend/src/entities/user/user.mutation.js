import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/shared/api/baseAxiosApi";

export const useUpdateUserStatus = () => {
  return useMutation({
    mutationFn: async ({ userId, userStatus, historyStatus, reason }) => {
      return axiosInstance.post("/api/user/update-status", {
        userId,
        userStatus,
        historyStatus,
        reason,
      });
    },
  });
};

export const useUpdateRole = () => {
  return useMutation({
    mutationFn: async ({ userId, role }) => {
      return axiosInstance.post("/api/user/update-role", {
        userId,
        role,
      });
    },
  });
};

export const useGetLastWaitingToChangeByUserId = () => {
  return useMutation({
    mutationFn: async ({ userId }) => {
      const response = await axiosInstance.get(
        `/api/user-status-histories/last-waiting-change`,
        {
          params: { userId },
        }
      );
      return response.data;
    },
  });
};

export const useUpdateUser = () => {
  return useMutation({
    mutationFn: async ({
      countryId,
      headquarterId,
      departmentId,
      phone,
      email,
    }) => {
      const profile = { countryId, headquarterId, departmentId, phone, email };
      return axiosInstance.post(`/api/user/profile`, profile);
    },
  });
};

export const useUpdateUserProfileImg = () => {
  return useMutation({
    mutationFn: async ({ profileImg }) => {
      const formData = new FormData();
      formData.append("profileImg", profileImg);

      return axiosInstance.post(`/api/user/update-profile-img`, formData, {
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

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }) => {
      return axiosInstance.post(`/api/user/changePassword`, {
        currentPassword,
        newPassword,
      });
    },
  });
};
