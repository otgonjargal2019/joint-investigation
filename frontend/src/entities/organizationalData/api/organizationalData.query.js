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

/**
 * Hook for fetching current country organizational tree with optional search
 * Returns hierarchical structure of headquarters, departments, and investigators from current user's country
 * Supports unified search across country name, headquarter name, department name, and investigator names
 * 
 * @param {string} [searchWord] - Optional search term to filter across all organizational fields using OR logic
 * @returns {import('@tanstack/react-query').UseQueryResult<import('../model/types').CountryOrganizationTree>}
 */
export const useCurrentCountryOrganizationTree = (searchWord) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.CURRENT_COUNTRY_TREE, { searchWord }],
    queryFn: async () => {
      const params = {};
      if (searchWord && searchWord.trim()) {
        params.searchWord = searchWord.trim();
      }
      
      const { data } = await axiosInstance.get(API_ENDPOINTS.CURRENT_COUNTRY_TREE, {
        params
      });
      return data;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes - search results should be relatively fresh
    cacheTime: 5 * 60 * 1000, // 5 minutes
    // Keep previous data while fetching new search results for better UX
    keepPreviousData: true,
  });
};
