// src/api/apiErrors.ts

import axios from 'axios';
import { ApiErrorType } from '../types/api';

export interface ApiError {
  type: ApiErrorType;
  message: string;
  statusCode?: number;
  details?: Record<string, string>;
  originalError?: unknown;
}

export function handleApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return {
        type: ApiErrorType.NETWORK_ERROR,
        message: 'Network error. Please check your connection.',
        originalError: error
      };
    }

    const statusCode = error.response.status;
    const responseData = error.response.data;

    switch (statusCode) {
      case 401:
        return {
          type: ApiErrorType.UNAUTHORIZED,
          message: 'Unauthorized. Please log in again.',
          statusCode,
          originalError: error
        };
      case 403:
        return {
          type: ApiErrorType.FORBIDDEN,
          message: 'You do not have permission to perform this action.',
          statusCode,
          originalError: error
        };
      case 404:
        return {
          type: ApiErrorType.NOT_FOUND,
          message: 'The requested resource was not found.',
          statusCode,
          originalError: error
        };
      case 422:
        return {
          type: ApiErrorType.VALIDATION_ERROR,
          message: 'Validation error. Please check your input.',
          statusCode,
          details: responseData.errors,
          originalError: error
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          type: ApiErrorType.SERVER_ERROR,
          message: 'Server error. Please try again later.',
          statusCode,
          originalError: error
        };
      default:
        return {
          type: ApiErrorType.UNKNOWN_ERROR,
          message: `Error: ${responseData.message || 'Unknown error'}`,
          statusCode,
          originalError: error
        };
    }
  }

  return {
    type: ApiErrorType.UNKNOWN_ERROR,
    message: error instanceof Error ? error.message : 'Unknown error occurred',
    originalError: error
  };
}