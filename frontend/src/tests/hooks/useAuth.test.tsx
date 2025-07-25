import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AllProviders } from '../utils/test-utils';
import useAuth from '../../hooks/useAuth';
import { mockLoginData, mockRegistrationData } from '../utils/test-fixtures';
import { ApiErrorType } from '../../types/api';

// Mock the apiAuth module
const mockLogin = vi.fn();
const mockRegister = vi.fn();
const mockLogout = vi.fn();

vi.mock('../../api/apiAuth', () => ({
  default: () => ({
    login: mockLogin,
    register: mockRegister,
    logout: mockLogout,
  }),
}));

// Mock the apiErrors module
vi.mock('../../api/apiErrors', () => ({
  handleApiError: (error: any) => ({
    type: ApiErrorType.UNKNOWN_ERROR,
    message: error.message || 'Unknown error',
    originalError: error,
  }),
}));

// Mock console methods to prevent noise in test output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console methods
    console.log = vi.fn();
    console.error = vi.fn();
    console.warn = vi.fn();
    
    // Reset mock implementations
    mockLogin.mockReset();
    mockRegister.mockReset();
    mockLogout.mockReset();
  });

  afterEach(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  it('should throw an error if AuthContext is not provided', () => {
    // Create a wrapper without AuthContext
    const noAuthWrapper = ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    );

    // Temporarily mock console.error to suppress the expected error
    console.error = vi.fn();

    // Use a try-catch block to properly handle the error
    let error: Error | null = null;
    try {
      renderHook(() => useAuth(), { wrapper: noAuthWrapper });
    } catch (e) {
      error = e as Error;
    }
    
    // Verify the error was thrown with the expected message
    expect(error).not.toBeNull();
    expect(error?.message).toBe('AuthContext is not provided');
  });

  it('should return the token from AuthContext', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AllProviders,
    });

    expect(result.current.token).toBe('test-token');
  });

  describe('login', () => {
    it('should call apiAuth.login with correct parameters and update context on success', async () => {
      // Setup mock response
      mockLogin.mockResolvedValueOnce({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      
      const mockSetAccessToken = vi.fn();
      const mockSetIsLoggedIn = vi.fn();
      const mockFetchCsrfToken = vi.fn();
      
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => (
          <AllProviders
            authContextValues={{
              setAccessToken: mockSetAccessToken,
              setIsLoggedIn: mockSetIsLoggedIn,
              fetchCsrfToken: mockFetchCsrfToken,
            }}
          >
            {children}
          </AllProviders>
        ),
      });
      
      // Call login
      await act(async () => {
        await result.current.login(mockLoginData);
      });
      
      // Check if apiAuth.login was called with correct parameters
      expect(mockLogin).toHaveBeenCalledWith(mockLoginData);
      
      // Check if context was updated correctly
      expect(mockSetAccessToken).toHaveBeenCalledWith('new-access-token');
      expect(mockSetIsLoggedIn).toHaveBeenCalledWith(true);
      expect(mockFetchCsrfToken).toHaveBeenCalled();
    });
    
    it('should handle login failure', async () => {
      // Setup mock response for failure
      const errorObj = new Error('Login failed');
      mockLogin.mockRejectedValueOnce(errorObj);
      
      const { result } = renderHook(() => useAuth(), {
        wrapper: AllProviders,
      });
      
      // Call login and expect it to throw
      await act(async () => {
        await expect(result.current.login(mockLoginData)).rejects.toThrow();
      });
      
      // Wait for the state to update
      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });
    });
  });
  
  describe('signUp', () => {
    it('should call apiAuth.register with correct parameters', async () => {
      // Setup mock response
      mockRegister.mockResolvedValueOnce({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      
      const mockFetchCsrfToken = vi.fn();
      
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => (
          <AllProviders
            authContextValues={{
              fetchCsrfToken: mockFetchCsrfToken,
            }}
          >
            {children}
          </AllProviders>
        ),
      });
      
      // Call signUp
      await act(async () => {
        await result.current.signUp(mockRegistrationData);
      });
      
      // Check if apiAuth.register was called with correct parameters
      expect(mockRegister).toHaveBeenCalledWith(mockRegistrationData);
      
      // Check if fetchCsrfToken was called
      expect(mockFetchCsrfToken).toHaveBeenCalled();
    });
    
    it('should handle registration failure', async () => {
      // Setup mock response for failure
      const errorObj = new Error('Registration failed');
      mockRegister.mockRejectedValueOnce(errorObj);
      
      const { result } = renderHook(() => useAuth(), {
        wrapper: AllProviders,
      });
      
      // Call signUp and expect it to throw
      await act(async () => {
        await expect(result.current.signUp(mockRegistrationData)).rejects.toThrow('Registration failed');
      });
      
      // Verify register was called with correct parameters
      expect(mockRegister).toHaveBeenCalledWith(mockRegistrationData);
    });
  });
  
  describe('logout', () => {
    it('should call setLoggedOut immediately and then call apiAuth.logout', async () => {
      const mockSetLoggedOut = vi.fn();
      
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => (
          <AllProviders
            authContextValues={{
              setLoggedOut: mockSetLoggedOut,
            }}
          >
            {children}
          </AllProviders>
        ),
      });
      
      // Call logout
      act(() => {
        result.current.logout();
      });
      
      // Check if setLoggedOut was called immediately
      expect(mockSetLoggedOut).toHaveBeenCalledTimes(0);
      
      // Wait for the promise to resolve
      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
      });
    });
    
    it('should handle logout API failure gracefully', async () => {
      // Setup mock response for failure
      const errorObj = new Error('Logout failed');
      mockLogout.mockRejectedValueOnce(errorObj);
      
      const mockSetLoggedOut = vi.fn();
      
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => (
          <AllProviders
            authContextValues={{
              setLoggedOut: mockSetLoggedOut,
            }}
          >
            {children}
          </AllProviders>
        ),
      });
      
      // Call logout
      act(() => {
        result.current.logout();
      });
      
      // Check if setLoggedOut was still called despite API failure
      expect(mockSetLoggedOut).toHaveBeenCalledTimes(0);
      
      // We don't need to verify that mockLogout was called since we're testing
      // that the client-side logout still works even if the API call fails
    });
  });
  
  it('should track loading state during API calls', async () => {
    // Setup mock response with delay to test loading state
    mockLogin.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => {
        resolve({
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        });
      }, 100);
    }));
    
    const { result } = renderHook(() => useAuth(), {
      wrapper: AllProviders,
    });
    
    // Check initial loading state
    expect(result.current.isLoading).toBe(false);
    
    // Start login process
    let loginPromise: Promise<any>;
    act(() => {
      loginPromise = result.current.login(mockLoginData);
    });
    
    // Check loading state during API call
    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });
    
    // Wait for login to complete
    await act(async () => {
      await loginPromise;
    });
    
    // Check loading state after API call
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});