import axios from 'axios';
import { useContext, useMemo } from 'react';
import { ConfigContext } from '../contexts/ConfigContext';
import { handleApiError } from './apiErrors';

const useApiClient = () => {
    const config = useContext(ConfigContext);
    const API_URL = config?.backendURL ?? 'http://localhost:8080';
    
    if (process.env.NODE_ENV === 'development') {
        console.log("API Client - Using backend URL:", API_URL);
        console.log("API Client - Config context:", config);
    }

    return useMemo(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log("Creating API client with URL:", API_URL);
        }
        
        const apiClient = axios.create({
            baseURL: API_URL,
            withCredentials: true,
            timeout: 10000, // 10 seconds timeout
        });

        // Request interceptor
        apiClient.interceptors.request.use(
            (config) => {
                // Development logging removed
                return config;
            },
            (error) => {
                return Promise.reject(handleApiError(error));
            }
        );

        // Response interceptor
        apiClient.interceptors.response.use(
            (response) => {
                // Development logging removed
                return response;
            },
            (error) => {
                const processedError = handleApiError(error);
                
                // Development logging removed
                
                return Promise.reject(processedError);
            }
        );

        return { apiClient };
    }, [API_URL]);
};

export default useApiClient;