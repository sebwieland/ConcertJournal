// src/api/apiErrors.ts

import axios from "axios";
import { ApiErrorType } from "../types/api";

export interface ApiError {
  type: ApiErrorType;
  message: string;
  statusCode?: number;
  details?: Record<string, string>;
  originalError?: unknown;
}

const API_ERROR_TYPES = new Set<string>(Object.values(ApiErrorType));

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    !axios.isAxiosError(error) &&
    API_ERROR_TYPES.has((error as ApiError).type) &&
    typeof (error as ApiError).message === "string"
  );
}

export function handleApiError(error: unknown): ApiError {
  // Errors pass through several layers (axios interceptor → api module →
  // hook), each calling this. Re-normalising an ApiError used to discard it
  // as "Unknown error occurred" and drop statusCode/details.
  if (isApiError(error)) {
    return error;
  }
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return {
        type: ApiErrorType.NETWORK_ERROR,
        message: "Network error. Please check your connection.",
        originalError: error,
      };
    }

    const statusCode = error.response.status;
    const responseData = error.response.data;

    switch (statusCode) {
      case 401:
        return {
          type: ApiErrorType.UNAUTHORIZED,
          message: "Unauthorized. Please log in again.",
          statusCode,
          originalError: error,
        };
      case 403:
        return {
          type: ApiErrorType.FORBIDDEN,
          message: "You do not have permission to perform this action.",
          statusCode,
          originalError: error,
        };
      case 404:
        return {
          type: ApiErrorType.NOT_FOUND,
          message: "The requested resource was not found.",
          statusCode,
          originalError: error,
        };
      case 422:
        return {
          type: ApiErrorType.VALIDATION_ERROR,
          // Backend joins its field messages (e.g. "Band Name is required.")
          message:
            responseData?.message ||
            "Validation error. Please check your input.",
          statusCode,
          details: responseData?.errors,
          originalError: error,
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          type: ApiErrorType.SERVER_ERROR,
          message: "Server error. Please try again later.",
          statusCode,
          originalError: error,
        };
      default:
        return {
          type: ApiErrorType.UNKNOWN_ERROR,
          // Some endpoints (e.g. /register 409) answer with a plain string
          message: `Error: ${
            (typeof responseData === "string" && responseData) ||
            responseData?.message ||
            "Unknown error"
          }`,
          statusCode,
          originalError: error,
        };
    }
  }

  return {
    type: ApiErrorType.UNKNOWN_ERROR,
    message: error instanceof Error ? error.message : "Unknown error occurred",
    originalError: error,
  };
}
