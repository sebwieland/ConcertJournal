import { vi } from 'vitest';
import { mockApiResponses } from './test-fixtures';

// Mock for react-router-dom
export const mockNavigate = vi.fn();
export const mockUseNavigate = () => mockNavigate;

export const mockReactRouterDom = async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: mockUseNavigate,
  };
};

// Mock for apiClient
export const mockApiClientPost = vi.fn();
export const mockApiClientGet = vi.fn();
export const mockApiClientPut = vi.fn();
export const mockApiClientDelete = vi.fn();

export const mockApiClient = {
  apiClient: {
    post: mockApiClientPost,
    get: mockApiClientGet,
    put: mockApiClientPut,
    delete: mockApiClientDelete,
  }
};

// Mock for musicBrainzApi
export const mockMbApiSearch = vi.fn().mockImplementation((type, options) => {
  if (type === 'artist') {
    return Promise.resolve({
      artists: [
        {
          name: 'Test Artist',
          type: 'Group',
          country: 'US',
          'life-span': { begin: '2000' },
          tags: [{ count: 10, name: 'rock' }]
        }
      ]
    });
  }
  return Promise.resolve({ artists: [] });
});

export const mockMusicBrainzApi = {
  mbApi: {
    search: mockMbApiSearch
  }
};

// Mock for apiErrors
export const mockHandleApiError = vi.fn((error) => {
  return {
    type: 'UNKNOWN_ERROR',
    message: 'Mocked error',
    originalError: error,
  };
});

// Setup function to reset all mocks
export const resetAllMocks = () => {
  // Reset react-router-dom mocks
  mockNavigate.mockReset();
  
  // Reset apiClient mocks
  mockApiClientPost.mockReset();
  mockApiClientGet.mockReset();
  mockApiClientPut.mockReset();
  mockApiClientDelete.mockReset();
  
  // Reset musicBrainzApi mocks
  mockMbApiSearch.mockReset().mockImplementation((type, options) => {
    if (type === 'artist') {
      return Promise.resolve({
        artists: [
          {
            name: 'Test Artist',
            type: 'Group',
            country: 'US',
            'life-span': { begin: '2000' },
            tags: [{ count: 10, name: 'rock' }]
          }
        ]
      });
    }
    return Promise.resolve({ artists: [] });
  });
  
  // Reset apiErrors mocks
  mockHandleApiError.mockReset().mockImplementation((error) => {
    return {
      type: 'UNKNOWN_ERROR',
      message: 'Mocked error',
      originalError: error,
    };
  });
};

// Setup common mock responses
export const setupSuccessfulLoginMock = () => {
  mockApiClientPost.mockResolvedValueOnce({
    status: 200,
    data: {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    },
  });
};

export const setupFailedLoginMock = () => {
  mockApiClientPost.mockResolvedValueOnce({
    status: 401,
    statusText: 'Unauthorized',
  });
};

export const setupNetworkErrorMock = () => {
  const networkError = new Error('Network Error');
  mockApiClientPost.mockRejectedValueOnce(networkError);
  return networkError;
};

export const setupSuccessfulRegisterMock = () => {
  mockApiClientPost.mockResolvedValueOnce({
    status: 200,
    data: {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    },
  });
};

export const setupFailedRegisterMock = () => {
  mockApiClientPost.mockResolvedValueOnce({
    status: 400,
    data: {
      message: 'Email already in use',
    },
  });
};

export const setupSuccessfulEventsFetchMock = () => {
  mockApiClientGet.mockResolvedValueOnce({
    status: 200,
    data: mockApiResponses.events.success.data,
  });
};

export const setupFailedEventsFetchMock = () => {
  mockApiClientGet.mockResolvedValueOnce({
    status: 500,
    statusText: 'Internal Server Error',
  });
};