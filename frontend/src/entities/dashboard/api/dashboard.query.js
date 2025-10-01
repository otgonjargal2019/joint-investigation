import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/shared/api/baseAxiosApi";

export const useDashboardMain = () => {
  return useQuery({
    queryKey: ["dashboard", "main"],
    queryFn: () => {
      return axiosInstance.get("/api/dashboard/main");
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - dashboard data can be slightly stale
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
  });
};
