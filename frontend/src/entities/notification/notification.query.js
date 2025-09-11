import { queryOptions } from "@tanstack/react-query";
import { axiosInstance } from "@/shared/api/baseAxiosApi";

export const notificationQuery = {
  all: () => ["notificationQuery"],
  getNotifications: () =>
    queryOptions({
      queryKey: [...notificationQuery.all()],
      queryFn: async () => {
        const response = await axiosInstance.get(`/api/notifications`);
        return response.data;
      },
    }),
};
