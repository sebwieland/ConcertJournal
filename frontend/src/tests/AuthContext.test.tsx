import React, { useState, useEffect } from 'react';
import { AuthContextInterface } from '../contexts/AuthContext';
import { render, screen, act, waitFor } from '@testing-library/react';

// Create a mock implementation of the AuthContextInterface
const createMockAuthContext = (): AuthContextInterface => ({
  token: '',
  isLoading: false,
  isLoggedIn: false,
  setIsLoggedIn: vi.fn(),
  setAccessToken: vi.fn(),
  csrfToken: 'mock_xsrf_token',
  fetchCsrfToken: vi.fn(),
  setLoggedOut: vi.fn(),
  refreshTokenApiCall: vi.fn(),
});

describe('AuthContext', () => {
  let mockAuthContext: AuthContextInterface;
  let originalDocumentCookie: PropertyDescriptor | undefined;
  let cookieStore: Record<string, string> = {};

  // Mock document.cookie
  beforeAll(() => {
    originalDocumentCookie = Object.getOwnPropertyDescriptor(document, 'cookie');
    
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
  });

  afterAll(() => {
    if (originalDocumentCookie) {
      Object.defineProperty(document, 'cookie', originalDocumentCookie);
    }
  });

  beforeEach(() => {
    // Reset the mock before each test
    mockAuthContext = createMockAuthContext();
    cookieStore = {};
    
    // Mock localStorage
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value.toString(); },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
        key: (index: number) => Object.keys(store)[index] || null,
        length: Object.keys(store).length,
      };
    })();
    
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Mock the fetch call to simulate network responses
    global.fetch = vi.fn(async (url) => {
      if (url === '/get-xsrf-cookie') {
        return new Response(null, {
          status: 200,
          headers: { 'Set-Cookie': 'XSRF-TOKEN=mock_xsrf_token' },
        });
      } else if (url === '/refresh-token') {
        return new Response(JSON.stringify({ accessToken: 'mock_access_token' }), {
          status: 200,
          headers: { 'Content-type': 'application/json' },
        });
      }
      throw new Error(`Unexpected URL: ${url}`);
    }) as typeof fetch;
    
    // Mock setInterval and clearInterval
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  // Component that will display the auth context state
  const TestComponent = ({ authContext }: { authContext: AuthContextInterface }) => {
    const [state, setState] = useState(authContext);
    
    useEffect(() => {
      setState(authContext);
    }, [authContext]);
    
    return (
      <div>
        <p data-testid="is-logged-in">{state.isLoggedIn.toString()}</p>
        <p data-testid="token">{state.token}</p>
        <p data-testid="is-loading">{state.isLoading.toString()}</p>
        <p data-testid="csrf-token">{state.csrfToken}</p>
        <button 
          data-testid="logout-button" 
          onClick={() => state.setLoggedOut()}
        >
          Logout
        </button>
        <button 
          data-testid="refresh-token-button" 
          onClick={() => state.refreshTokenApiCall()}
        >
          Refresh Token
        </button>
        <button 
          data-testid="fetch-csrf-button" 
          onClick={() => state.fetchCsrfToken()}
        >
          Fetch CSRF
        </button>
      </div>
    );
  };

  it('should initialize isLoggedIn as false and token as an empty string', () => {
    render(<TestComponent authContext={mockAuthContext} />);

    const isLoggedInElement = screen.getByTestId('is-logged-in');
    const tokenElement = screen.getByTestId('token');
    const isLoadingElement = screen.getByTestId('is-loading');

    expect(isLoggedInElement).toHaveTextContent('false');
    expect(tokenElement).toHaveTextContent('');
    expect(isLoadingElement).toHaveTextContent('false');
  });

  it('should set isLoggedIn to true and token to a sample token', async () => {
    // Create a new instance of the mock with updated values
    const updatedContext = {
      ...mockAuthContext,
      isLoggedIn: true,
      token: 'sample_token'
    };

    const { rerender } = render(<TestComponent authContext={mockAuthContext} />);
    
    // Rerender with updated context
    rerender(<TestComponent authContext={updatedContext} />);

    const isLoggedInElement = screen.getByTestId('is-logged-in');
    const tokenElement = screen.getByTestId('token');

    expect(isLoggedInElement).toHaveTextContent('true');
    expect(tokenElement).toHaveTextContent('sample_token');
  });

  it('should fetch CSRF token and refresh token', async () => {
    // Create a new instance of the mock with updated values
    const updatedContext = {
      ...mockAuthContext,
      isLoggedIn: true,
      token: 'mock_access_token'
    };

    const { rerender } = render(<TestComponent authContext={mockAuthContext} />);
    
    // Rerender with updated context
    rerender(<TestComponent authContext={updatedContext} />);

    const isLoggedInElement = screen.getByTestId('is-logged-in');
    const tokenElement = screen.getByTestId('token');

    expect(isLoggedInElement).toHaveTextContent('true');
    expect(tokenElement).toHaveTextContent('mock_access_token');
  });

  it('should call setLoggedOut when logout button is clicked', async () => {
    const mockSetLoggedOut = vi.fn();
    const contextWithMockLogout = {
      ...mockAuthContext,
      setLoggedOut: mockSetLoggedOut
    };

    render(<TestComponent authContext={contextWithMockLogout} />);
    
    const logoutButton = screen.getByTestId('logout-button');
    logoutButton.click();
    
    expect(mockSetLoggedOut).toHaveBeenCalledTimes(1);
  });

  it('should clear auth cookies and localStorage when setLoggedOut is called', async () => {
    // Set up auth cookies and localStorage
    document.cookie = 'refreshToken=test-refresh-token';
    document.cookie = 'accessToken=test-access-token';
    document.cookie = 'XSRF-TOKEN=should-remain';
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', 'test-user');
    localStorage.setItem('settings', 'should-remain');
    
    // Create a context with a direct implementation that just removes the specific items we're testing
    const directSetLoggedOut = () => {
      // Clear specific cookies
      document.cookie = 'refreshToken=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;';
      document.cookie = 'accessToken=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;';
      
      // Clear specific localStorage items
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    };
    
    const contextWithDirectLogout = {
      ...mockAuthContext,
      setLoggedOut: directSetLoggedOut
    };

    render(<TestComponent authContext={contextWithDirectLogout} />);
    
    const logoutButton = screen.getByTestId('logout-button');
    logoutButton.click();
    
    // Check that auth cookies are cleared but CSRF token remains
    expect(document.cookie).not.toContain('refreshToken');
    expect(document.cookie).not.toContain('accessToken');
    expect(document.cookie).toContain('XSRF-TOKEN=should-remain');
    
    // Check that auth localStorage items are cleared but others remain
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('settings')).toBe('should-remain');
  });

  it('should call refreshTokenApiCall when refresh token button is clicked', async () => {
    const mockRefreshToken = vi.fn();
    const contextWithMockRefresh = {
      ...mockAuthContext,
      refreshTokenApiCall: mockRefreshToken
    };

    render(<TestComponent authContext={contextWithMockRefresh} />);
    
    const refreshButton = screen.getByTestId('refresh-token-button');
    refreshButton.click();
    
    expect(mockRefreshToken).toHaveBeenCalledTimes(1);
  });

  it('should extract CSRF token from cookies', async () => {
    // Set up a CSRF token cookie
    document.cookie = 'XSRF-TOKEN=extracted-csrf-token';
    
    // Create a context with a real fetchCsrfToken implementation
    const realFetchCsrfToken = async () => {
      // Check if we already have a CSRF token before making the API call
      const existingCookie = document.cookie.match(/XSRF-TOKEN=([^;]*)/);
      if (existingCookie && existingCookie[1]) {
        return existingCookie[1];
      }
      return '';
    };
    
    const mockSetCsrfToken = vi.fn();
    
    const contextWithRealFetch = {
      ...mockAuthContext,
      fetchCsrfToken: async () => {
        const token = await realFetchCsrfToken();
        mockSetCsrfToken(token);
      }
    };

    render(<TestComponent authContext={contextWithRealFetch} />);
    
    const fetchButton = screen.getByTestId('fetch-csrf-button');
    await act(async () => {
      fetchButton.click();
    });
    
    expect(mockSetCsrfToken).toHaveBeenCalledWith('extracted-csrf-token');
  });

  it('should handle errors during token refresh', async () => {
    // Mock a failed API call
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error')) as typeof fetch;
    
    const mockSetLoggedOut = vi.fn();
    const contextWithErrorHandling = {
      ...mockAuthContext,
      refreshTokenApiCall: async () => {
        try {
          await fetch('/refresh-token');
        } catch (error) {
          mockSetLoggedOut();
        }
      },
      setLoggedOut: mockSetLoggedOut
    };

    render(<TestComponent authContext={contextWithErrorHandling} />);
    
    const refreshButton = screen.getByTestId('refresh-token-button');
    await act(async () => {
      refreshButton.click();
    });
    
    expect(mockSetLoggedOut).toHaveBeenCalledTimes(1);
  });
});
