import axios from "axios";
import { useMemo } from "react";
import { handleApiError } from "./apiErrors";

const useApiClient = () => {
  return useMemo(() => {
    // Standard SPA double-submit: read the CSRF cookie and attach it as header
    const attachCsrfHeader = (
      config: import("axios").InternalAxiosRequestConfig,
    ) => {
      const method = (config.method || "").toLowerCase();
      if (["post", "put", "patch", "delete"].includes(method)) {
        const match = document.cookie.match(/XSRF-TOKEN=([^;]*)/);
        if (match) {
          config.headers["X-XSRF-TOKEN"] = match[1];
        }
      }
      return config;
    };

    const commonRequestInterceptor = (
      client: import("axios").AxiosInstance,
    ) => {
      client.interceptors.request.use(attachCsrfHeader, (error) => {
        return Promise.reject(handleApiError(error));
      });
    };

    const apiClient = axios.create({
      baseURL: "/api",
      withCredentials: true,
      timeout: 10000,
    });

    // Auth endpoints live at the root (Spring Security convention), not under /api
    const rootClient = axios.create({
      withCredentials: true,
      timeout: 10000,
    });

    commonRequestInterceptor(apiClient);
    commonRequestInterceptor(rootClient);

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

    return { apiClient, rootClient };
  }, []);
};

export default useApiClient;
