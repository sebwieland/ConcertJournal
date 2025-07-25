import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthContext } from '../contexts/AuthContext';

// Create a simplified test component
const TestAuthConsumer = () => {
  const authContext = React.useContext(AuthContext);
  
  if (!authContext) {
    return <div>No AuthContext provided</div>;
  }
  
  return (
    <div>
      <div data-testid="is-logged-in">{authContext.isLoggedIn.toString()}</div>
      <div data-testid="is-loading">{authContext.isLoading.toString()}</div>
      <div data-testid="token">{authContext.token}</div>
      <div data-testid="csrf-token">{authContext.csrfToken}</div>
    </div>
  );
};

// Create a mock AuthContext provider for testing
const MockAuthProvider = ({ 
  isLoggedIn = false, 
  isLoading = false, 
  token = '', 
  csrfToken = '',
  children 
}: { 
  isLoggedIn?: boolean;
  isLoading?: boolean;
  token?: string;
  csrfToken?: string;
  children: React.ReactNode;
}) => {
  const mockAuthContext = {
    isLoggedIn,
    isLoading,
    token,
    csrfToken,
    setIsLoggedIn: vi.fn(),
    setAccessToken: vi.fn(),
    fetchCsrfToken: vi.fn(),
    setLoggedOut: vi.fn(),
    refreshTokenApiCall: vi.fn()
  };
  
  return (
    <AuthContext.Provider value={mockAuthContext}>
      {children}
    </AuthContext.Provider>
  );
};

describe('AuthContext Additional Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders with default values', () => {
    render(
      <MockAuthProvider>
        <TestAuthConsumer />
      </MockAuthProvider>
    );
    
    expect(screen.getByTestId('is-logged-in').textContent).toBe('false');
    expect(screen.getByTestId('is-loading').textContent).toBe('false');
    expect(screen.getByTestId('token').textContent).toBe('');
    expect(screen.getByTestId('csrf-token').textContent).toBe('');
  });
  
  it('renders with logged in state', () => {
    render(
      <MockAuthProvider 
        isLoggedIn={true} 
        token="test-token" 
        csrfToken="test-csrf-token"
      >
        <TestAuthConsumer />
      </MockAuthProvider>
    );
    
    expect(screen.getByTestId('is-logged-in').textContent).toBe('true');
    expect(screen.getByTestId('token').textContent).toBe('test-token');
    expect(screen.getByTestId('csrf-token').textContent).toBe('test-csrf-token');
  });
  
  it('renders with loading state', () => {
    render(
      <MockAuthProvider isLoading={true}>
        <TestAuthConsumer />
      </MockAuthProvider>
    );
    
    expect(screen.getByTestId('is-loading').textContent).toBe('true');
  });
  
  it('handles missing context gracefully', () => {
    // Render without a provider to test the null case
    render(<TestAuthConsumer />);
    
    expect(screen.getByText('No AuthContext provided')).toBeInTheDocument();
  });
});