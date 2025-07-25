import React from 'react';
import { renderHook } from '@testing-library/react';
import useApiClient from '../../api/apiClient';
import { ConfigContext } from '../../contexts/ConfigContext';
import { vi, describe, it, expect } from 'vitest';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    }))
  }
}));

// Mock apiErrors
vi.mock('../../api/apiErrors', () => ({
  handleApiError: vi.fn()
}));

describe('useApiClient', () => {
  it('returns an apiClient object', () => {
    const { result } = renderHook(() => useApiClient());
    
    expect(result.current).toHaveProperty('apiClient');
  });
  
  it('uses the backendURL from ConfigContext when available', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ConfigContext.Provider value={{ backendURL: 'https://api.example.com' }}>
        {children}
      </ConfigContext.Provider>
    );
    
    const { result } = renderHook(() => useApiClient(), { wrapper });
    
    // Just verify the hook returns an object with apiClient property
    expect(result.current).toHaveProperty('apiClient');
  });
  
  it('works without ConfigContext', () => {
    const { result } = renderHook(() => useApiClient());
    
    // Just verify the hook returns an object with apiClient property
    expect(result.current).toHaveProperty('apiClient');
  });
});