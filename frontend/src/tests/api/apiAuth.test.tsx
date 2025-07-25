import React from 'react';
import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AllProviders } from '../utils/test-utils';
import { 
  mockLoginData, 
  mockRegistrationData 
} from '../utils/test-fixtures';
import { ApiErrorType } from '../../types/api';
import useAuthApi from '../../api/apiAuth';

// Create mock functions using vi.hoisted to avoid hoisting issues
const mockPost = vi.hoisted(() => vi.fn());
const mockHandleApiError = vi.hoisted(() => vi.fn());

// Mock the apiClient module
vi.mock('../../api/apiClient', () => ({
  default: () => ({
    apiClient: {
      post: mockPost,
    },
  }),
}));

// Mock the apiErrors module
vi.mock('../../api/apiErrors', () => ({
  handleApiError: mockHandleApiError,
}));

// No need to mock React's useContext, we'll use the AllProviders component

describe('useAuthApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock implementations for each test
    mockPost.mockReset();
    mockHandleApiError.mockReset();
  });

  it('throws an error if AuthContext is not provided', () => {
    // Create a wrapper without AuthContext
    const noAuthWrapper = ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    );

    // Temporarily mock console.error to suppress the expected error
    const originalConsoleError = console.error;
    console.error = vi.fn();

    // Use a try-catch block to properly handle the error
    let error: Error | null = null;
    try {
      renderHook(() => useAuthApi(), { wrapper: noAuthWrapper });
    } catch (e) {
      error = e as Error;
    } finally {
      // Restore console.error
      console.error = originalConsoleError;
    }
    
    // Verify the error was thrown with the expected message
    expect(error).not.toBeNull();
    expect(error?.message).toBe('AuthContext is not provided');
  });

  describe('login', () => {
    it('calls apiClient.post with correct parameters', async () => {
      // Setup mock response
      mockPost.mockResolvedValueOnce({
        status: 200,
        data: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        },
      });
      
      const { result } = renderHook(() => useAuthApi(), { 
        wrapper: AllProviders 
      });
      
      // Call login
      const response = await result.current.login(mockLoginData);
      
      // Check if apiClient.post was called with correct parameters
      expect(mockPost).toHaveBeenCalledWith(
        '/login',
        'email=test%40example.com&password=password123',
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-XSRF-TOKEN': 'test-csrf-token',
          },
        }
      );
      
      // Check if the response is correct
      expect(response).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });
    
    it('handles login failure', async () => {
      // Setup mock response for failure
      const errorObj = {
        response: {
          status: 401,
          statusText: 'Unauthorized',
        },
      };
      
      mockPost.mockRejectedValueOnce(errorObj);
      
      // Setup handleApiError mock for this test
      mockHandleApiError.mockReturnValue({
        type: ApiErrorType.UNKNOWN_ERROR,
        message: 'Unauthorized',
      });
      
      const { result } = renderHook(() => useAuthApi(), { 
        wrapper: AllProviders 
      });
      
      // Expect login to throw an error
      await expect(result.current.login(mockLoginData)).rejects.toMatchObject({
        type: ApiErrorType.UNKNOWN_ERROR,
        message: 'Unauthorized'
      });
      
      // Check if handleApiError was called with the correct error message
      expect(mockHandleApiError).toHaveBeenCalledWith({
        response: {
          status: 401,
          statusText: 'Unauthorized',
        },
      });
      
      // Check if handleApiError was called
      expect(mockHandleApiError).toHaveBeenCalled();
    });
    
    it('handles network errors', async () => {
      // Setup mock response for network error
      const errorObj = {
        response: {
          status: 500,
          data: {
            message: 'Network Error',
          },
        },
      };
      
      mockPost.mockRejectedValueOnce(errorObj);
      
      // Setup handleApiError mock for this test
      mockHandleApiError.mockReturnValue({
        type: ApiErrorType.UNKNOWN_ERROR,
        message: 'Network Error',
      });
      
      const { result } = renderHook(() => useAuthApi(), { 
        wrapper: AllProviders 
      });
      
      // Expect login to throw an error
      await expect(result.current.login(mockLoginData)).rejects.toMatchObject({
        type: ApiErrorType.UNKNOWN_ERROR,
        message: 'Network Error'
      });
      
      // Check if handleApiError was called with the correct error message
      expect(mockHandleApiError).toHaveBeenCalledWith({
        response: {
          status: 500,
          data: {
            message: 'Network Error',
          },
        },
      });
      
      // Check that handleApiError was called
      expect(mockHandleApiError).toHaveBeenCalled();
    });
  });
  
  describe('logout', () => {
    it('calls apiClient.post with correct parameters', async () => {
      // Mock successful response
      mockPost.mockResolvedValueOnce({
        status: 200,
      });
      
      const { result } = renderHook(() => useAuthApi(), { 
        wrapper: AllProviders 
      });
      
      // Call logout
      await result.current.logout();
      
      // Check if apiClient.post was called with correct parameters
      expect(mockPost).toHaveBeenCalledWith(
        '/logout',
        {},
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-XSRF-TOKEN': 'test-csrf-token',
          },
        }
      );
    });
    
    it('handles logout failure', async () => {
      // Mock failed response
      const errorObj = {
        response: {
          status: 500,
          statusText: 'Internal Server Error',
        },
      };
      
      mockPost.mockRejectedValueOnce(errorObj);
      
      // Setup handleApiError mock for this test
      mockHandleApiError.mockReturnValue({
        type: ApiErrorType.UNKNOWN_ERROR,
        message: 'Internal Server Error',
      });
      
      const { result } = renderHook(() => useAuthApi(), { 
        wrapper: AllProviders 
      });
      
      // Expect logout to throw an error
      await expect(result.current.logout()).rejects.toMatchObject({
        type: ApiErrorType.UNKNOWN_ERROR,
        message: 'Internal Server Error'
      });
      
      // Check if handleApiError was called with the correct error message
      expect(mockHandleApiError).toHaveBeenCalledWith({
        response: {
          status: 500,
          statusText: 'Internal Server Error',
        },
      });
      
      // Check if handleApiError was called
      expect(mockHandleApiError).toHaveBeenCalled();
    });
  });
  
  describe('register', () => {
    it('calls apiClient.post with correct parameters', async () => {
      // Setup mock response
      mockPost.mockResolvedValueOnce({
        status: 200,
        data: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        },
      });
      
      const { result } = renderHook(() => useAuthApi(), { 
        wrapper: AllProviders 
      });
      
      // Call register
      const response = await result.current.register(mockRegistrationData);
      
      // Check if apiClient.post was called with correct parameters
      expect(mockPost).toHaveBeenCalledWith(
        '/register',
        mockRegistrationData,
        {
          withCredentials: true,
        }
      );
      
      // Check if the response is correct
      expect(response).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });
    
    it('handles registration errors', async () => {
      // Setup failed registration mock
      const errorObj = {
        response: {
          status: 400,
          data: {
            message: 'Email already in use',
          },
        },
      };
      
      mockPost.mockRejectedValueOnce(errorObj);
      
      // Setup handleApiError mock for this test
      mockHandleApiError.mockReturnValue({
        type: ApiErrorType.UNKNOWN_ERROR,
        message: 'Email already in use',
      });
      
      const { result } = renderHook(() => useAuthApi(), { 
        wrapper: AllProviders 
      });
      
      // Expect register to throw an error
      await expect(result.current.register(mockRegistrationData)).rejects.toMatchObject({
        type: ApiErrorType.UNKNOWN_ERROR,
        message: 'Email already in use'
      });
      
      // Check if handleApiError was called with the correct error message
      expect(mockHandleApiError).toHaveBeenCalledWith({
        response: {
          status: 400,
          data: {
            message: 'Email already in use',
          },
        },
      });
      
      // Check that handleApiError was called
      expect(mockHandleApiError).toHaveBeenCalled();
    });
  });
});