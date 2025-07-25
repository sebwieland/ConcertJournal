import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';
import { resetAllMocks } from './src/tests/utils/test-mocks';

// Mock modules that should be mocked globally
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('./src/api/apiClient', () => ({
  default: () => ({
    apiClient: {
      post: vi.fn(),
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    }
  })
}));

vi.mock('./src/api/apiErrors', () => ({
  handleApiError: vi.fn((error) => {
    return {
      type: 'UNKNOWN_ERROR',
      message: 'Mocked error',
      originalError: error,
    };
  }),
}));

vi.mock('./src/api/musicBrainzApi', () => ({
  mbApi: {
    search: vi.fn().mockImplementation((type, options) => {
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
    })
  }
}));

// Mock the DefaultLayout component
vi.mock('./src/theme/DefaultLayout', () => {
  return {
    default: vi.fn(({ children }) => {
      return React.createElement('div', { 'data-testid': 'default-layout' }, children);
    })
  };
});

// Mock the RatingStars component
vi.mock('./src/components/utilities/RatingStars', () => {
  return {
    default: vi.fn(({ rating }) => {
      return React.createElement('div', { 
        'data-testid': 'rating-stars', 
        'data-rating': rating 
      }, `Rating: ${rating}`);
    })
  };
});

// Reset all mocks before each test
beforeEach(() => {
  resetAllMocks();
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});