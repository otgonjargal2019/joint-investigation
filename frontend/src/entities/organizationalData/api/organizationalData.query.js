import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/shared/api/baseAxiosApi";
import { API_ENDPOINTS, QUERY_KEYS } from "../model/constants";

/**
 * Hook for fetching complete organizational data for INV_ADMIN users
 * This includes both current country organizational structure and foreign INV_ADMIN users
 * 
 * @returns {import('@tanstack/react-query').UseQueryResult<import('../model/types').CombinedOrganizationalData>}
 */
export const useOrganizationalData = () => {
  return useQuery({
    queryKey: QUERY_KEYS.COMPLETE_TREE,
    queryFn: async () => {
      const { data } = await axiosInstance.get(API_ENDPOINTS.COMPLETE_TREE);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - organizational data doesn't change frequently
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
