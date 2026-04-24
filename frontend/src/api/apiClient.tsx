import axios from "axios";
import { useMemo } from "react";
import { handleApiError } from "./apiErrors";

const useApiClient = () => {
  return useMemo(() => {
    const apiClient = axios.create({
      baseURL: "/api",
      withCredentials: true,
      timeout: 10000,
    });

    apiClient.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        return Promise.reject(handleApiError(error));
      },
    );

    apiClient.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        const processedError = handleApiError(error);
        return Promise.reject(processedError);
      },
    );

    return { apiClient };
  }, []);
};

export default useApiClient;
