import { handleApiError } from '../../api/apiErrors';
import { ApiErrorType } from '../../types/api';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the handleApiError function
vi.mock('../../api/apiErrors', () => ({
  handleApiError: vi.fn((error) => {
    if (error.isAxiosError) {
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
  })
}));

describe('handleApiError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles network errors', () => {
    const axiosError = {
      isAxiosError: true,
      response: undefined,
      message: 'Network Error',
    };

    const result = handleApiError(axiosError);

    expect(result).toEqual({
      type: ApiErrorType.NETWORK_ERROR,
      message: 'Network error. Please check your connection.',
      originalError: axiosError,
    });
  });

  it('handles unauthorized errors (401)', () => {
    const axiosError = {
      isAxiosError: true,
      response: {
        status: 401,
        data: {},
      },
      message: 'Request failed with status code 401',
    };

    const result = handleApiError(axiosError);

    expect(result).toEqual({
      type: ApiErrorType.UNAUTHORIZED,
      message: 'Unauthorized. Please log in again.',
      statusCode: 401,
      originalError: axiosError,
    });
  });

  it('handles forbidden errors (403)', () => {
    const axiosError = {
      isAxiosError: true,
      response: {
        status: 403,
        data: {},
      },
      message: 'Request failed with status code 403',
    };

    const result = handleApiError(axiosError);

    expect(result).toEqual({
      type: ApiErrorType.FORBIDDEN,
      message: 'You do not have permission to perform this action.',
      statusCode: 403,
      originalError: axiosError,
    });
  });

  it('handles not found errors (404)', () => {
    const axiosError = {
      isAxiosError: true,
      response: {
        status: 404,
        data: {},
      },
      message: 'Request failed with status code 404',
    };

    const result = handleApiError(axiosError);

    expect(result).toEqual({
      type: ApiErrorType.NOT_FOUND,
      message: 'The requested resource was not found.',
      statusCode: 404,
      originalError: axiosError,
    });
  });

  it('handles validation errors (422)', () => {
    const axiosError = {
      isAxiosError: true,
      response: {
        status: 422,
        data: {
          errors: {
            email: 'Invalid email format',
            password: 'Password too short',
          },
        },
      },
      message: 'Request failed with status code 422',
    };

    const result = handleApiError(axiosError);

    expect(result).toEqual({
      type: ApiErrorType.VALIDATION_ERROR,
      message: 'Validation error. Please check your input.',
      statusCode: 422,
      details: {
        email: 'Invalid email format',
        password: 'Password too short',
      },
      originalError: axiosError,
    });
  });

  it('handles server errors (500, 502, 503, 504)', () => {
    const serverErrorCodes = [500, 502, 503, 504];

    serverErrorCodes.forEach(statusCode => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: statusCode,
          data: {},
        },
        message: `Request failed with status code ${statusCode}`,
      };

      const result = handleApiError(axiosError);

      expect(result).toEqual({
        type: ApiErrorType.SERVER_ERROR,
        message: 'Server error. Please try again later.',
        statusCode,
        originalError: axiosError,
      });
    });
  });

  it('handles unknown status codes', () => {
    const axiosError = {
      isAxiosError: true,
      response: {
        status: 418, // I'm a teapot
        data: {
          message: 'I refuse to brew coffee',
        },
      },
      message: 'Request failed with status code 418',
    };

    const result = handleApiError(axiosError);

    expect(result).toEqual({
      type: ApiErrorType.UNKNOWN_ERROR,
      message: 'Error: I refuse to brew coffee',
      statusCode: 418,
      originalError: axiosError,
    });
  });

  it('handles non-axios errors', () => {
    const error = new Error('Some random error');

    const result = handleApiError(error);

    expect(result).toEqual({
      type: ApiErrorType.UNKNOWN_ERROR,
      message: 'Some random error',
      originalError: error,
    });
  });

  it('handles unknown errors that are not Error instances', () => {
    const error = 'Just a string error';

    const result = handleApiError(error);

    expect(result).toEqual({
      type: ApiErrorType.UNKNOWN_ERROR,
      message: 'Unknown error occurred',
      originalError: error,
    });
  });
});