import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/shared/api/baseAxiosApi";

export const useSignIn = () => {
  return useMutation({
    mutationFn: async (payload) => {
      return axiosInstance.post(`/api/auth/login`, payload);
    },
  });
};

export const useSignUp = () => {
  return useMutation({
    mutationFn: async ({ loginId, password, nameKr, nameEn, country, phone, countryId, headquarterId, departmentId, email, passwordConfirm }) => {
      return axiosInstance.post(`/api/auth/signup`, {
        loginId,
        password,
        passwordConfirm,
        nameKr,
        nameEn,
        country,
        phone,
        countryId,
        headquarterId,
        departmentId,
        email
      });
    },
  });
};

export const useCheckEmail = () => {
  return useMutation({
    mutationFn: async ({ email }) => {
      return axiosInstance.post(`/api/auth/checkemail`, {
        email
      });
    },
  });
};


export const useCheckLoginId = () => {
  return useMutation({
    mutationFn: async ({ loginId }) => {
      return axiosInstance.post(`/api/auth/checkloginid`, {
        loginId
      });
    },
  });
};
