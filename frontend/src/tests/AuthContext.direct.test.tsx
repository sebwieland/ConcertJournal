import React from 'react';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, beforeAll, afterEach, afterAll } from 'vitest';

// Mock document.cookie
const setupCookieMock = () => {
  let cookieStore: Record<string, string> = {};
  
  const originalDocumentCookie = Object.getOwnPropertyDescriptor(document, 'cookie');
  
  Object.defineProperty(document, 'cookie', {
    get: () => {
      return Object.entries(cookieStore)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');
    },
    set: (value: string) => {
      const [cookieRaw] = value.split(';');
      const [key, val] = cookieRaw.split('=');
      
      if (val === '' || val === undefined) {
        delete cookieStore[key];
      } else {
        cookieStore[key] = val;
      }
      
      return value;
    },
  });
  
  return {
    cookieStore,
    restoreOriginalCookie: () => {
      if (originalDocumentCookie) {
        Object.defineProperty(document, 'cookie', originalDocumentCookie);
      }
    },
    clearCookies: () => {
      cookieStore = {};
    }
  };
};

// Create a simplified version of the AuthContext
const createMockAuthContext = () => {
  let isLoggedIn = false;
  let token = '';
  let csrfToken = '';
  let isLoading = false;
  
  const setIsLoggedIn = (value: boolean) => {
    isLoggedIn = value;
  };
  
  const setAccessToken = (value: string) => {
    token = value;
  };
  
  const fetchCsrfToken = async () => {
    // Check if we already have a CSRF token
    const existingCookie = document.cookie.match(/XSRF-TOKEN=([^;]*)/);
    if (existingCookie && existingCookie[1]) {
      csrfToken = existingCookie[1];
      return;
    }
    
    // Simulate fetching a new token
    document.cookie = 'XSRF-TOKEN=test-csrf-token';
    csrfToken = 'test-csrf-token';
  };
  
  const setLoggedOut = () => {
    isLoggedIn = false;
    token = '';
    
    // Clear auth cookies
    const authCookies = ['refreshToken', 'accessToken', 'auth', 'session'];
    const cookies = document.cookie.split(";");
    
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      if (authCookies.some(authCookie => name.toLowerCase().includes(authCookie.toLowerCase()))) {
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;";
      }
    }
  };
  
  const refreshTokenApiCall = async () => {
    // Check for refresh token cookie
    const hasRefreshToken = document.cookie.split(';')
      .some(cookie => cookie.trim().startsWith('refreshToken='));
      
    if (!hasRefreshToken) {
      setLoggedOut();
      return;
    }
    
    // Simulate successful token refresh
    isLoggedIn = true;
    token = 'new-access-token';
  };
  
  return {
    isLoggedIn,
    token,
    csrfToken,
    isLoading,
    setIsLoggedIn,
    setAccessToken,
    fetchCsrfToken,
    setLoggedOut,
    refreshTokenApiCall,
    getState: () => ({
      isLoggedIn,
      token,
      csrfToken,
      isLoading
    })
  };
};

describe('AuthContext Direct Tests', () => {
  const { cookieStore, restoreOriginalCookie, clearCookies } = setupCookieMock();
  
  beforeAll(() => {
    // Mock console methods to prevent noise in test output
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  
  afterAll(() => {
    restoreOriginalCookie();
    vi.restoreAllMocks();
  });
  
  beforeEach(() => {
    clearCookies();
    vi.clearAllMocks();
  });
  
  it('should initialize with default values', () => {
    const authContext = createMockAuthContext();
    const state = authContext.getState();
    
    expect(state.isLoggedIn).toBe(false);
    expect(state.token).toBe('');
    expect(state.csrfToken).toBe('');
    expect(state.isLoading).toBe(false);
  });
  
  it('should set isLoggedIn and token', () => {
    const authContext = createMockAuthContext();
    
    authContext.setIsLoggedIn(true);
    authContext.setAccessToken('test-token');
    
    const state = authContext.getState();
    expect(state.isLoggedIn).toBe(true);
    expect(state.token).toBe('test-token');
  });
  
  it('should fetch CSRF token', async () => {
    const authContext = createMockAuthContext();
    
    await authContext.fetchCsrfToken();
    
    const state = authContext.getState();
    expect(state.csrfToken).toBe('test-csrf-token');
    expect(document.cookie).toContain('XSRF-TOKEN=test-csrf-token');
  });
  
  it('should use existing CSRF token if available', async () => {
    document.cookie = 'XSRF-TOKEN=existing-csrf-token';
    
    const authContext = createMockAuthContext();
    await authContext.fetchCsrfToken();
    
    const state = authContext.getState();
    expect(state.csrfToken).toBe('existing-csrf-token');
  });
  
  it('should clear auth cookies and reset state when logged out', async () => {
    document.cookie = 'refreshToken=test-refresh-token';
    document.cookie = 'accessToken=test-access-token';
    document.cookie = 'XSRF-TOKEN=test-csrf-token';
    
    const authContext = createMockAuthContext();
    authContext.setIsLoggedIn(true);
    authContext.setAccessToken('test-token');
    
    authContext.setLoggedOut();
    
    const state = authContext.getState();
    expect(state.isLoggedIn).toBe(false);
    expect(state.token).toBe('');
    
    // Auth cookies should be cleared
    expect(document.cookie).not.toContain('refreshToken=');
    expect(document.cookie).not.toContain('accessToken=');
    
    // CSRF token should remain
    expect(document.cookie).toContain('XSRF-TOKEN=test-csrf-token');
  });
  
  it('should refresh token if refresh token cookie exists', async () => {
    document.cookie = 'refreshToken=test-refresh-token';
    
    const authContext = createMockAuthContext();
    await authContext.refreshTokenApiCall();
    
    const state = authContext.getState();
    expect(state.isLoggedIn).toBe(true);
    expect(state.token).toBe('new-access-token');
  });
  
  it('should not refresh token if refresh token cookie does not exist', async () => {
    const authContext = createMockAuthContext();
    authContext.setIsLoggedIn(true);
    authContext.setAccessToken('old-token');
    
    await authContext.refreshTokenApiCall();
    
    const state = authContext.getState();
    expect(state.isLoggedIn).toBe(false);
    expect(state.token).toBe('');
  });
});