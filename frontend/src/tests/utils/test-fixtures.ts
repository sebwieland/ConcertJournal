import { vi } from 'vitest';

// Mock event data for testing
export const mockEventData = [
  {
    id: 1,
    bandName: 'Test Band 1',
    place: 'Test Place 1',
    date: [2023, 5, 15], // [year, month, day]
    comment: 'Great show',
    rating: 4,
  },
  {
    id: 2,
    bandName: 'Test Band 2',
    place: 'Test Place 2',
    date: [2023, 6, 20],
    comment: 'Amazing performance',
    rating: 5,
  },
];

// Mock user data for testing
export const mockUserData = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
};

// Mock login data for testing
export const mockLoginData = {
  email: 'test@example.com',
  password: 'password123',
};

// Mock registration data for testing
export const mockRegistrationData = {
  username: 'testuser',
  password: 'password123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
};

// Mock API responses
export const mockApiResponses = {
  login: {
    success: {
      status: 200,
      data: {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      },
    },
    failure: {
      status: 401,
      statusText: 'Unauthorized',
    },
  },
  register: {
    success: {
      status: 200,
      data: {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      },
    },
    failure: {
      status: 400,
      statusText: 'Bad Request',
      data: {
        message: 'Email already in use',
      },
    },
  },
  events: {
    success: {
      status: 200,
      data: mockEventData,
    },
    failure: {
      status: 500,
      statusText: 'Internal Server Error',
    },
  },
};

// Common mock functions
export const mockFunctions = {
  onSubmit: vi.fn().mockResolvedValue(undefined),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  setBandName: vi.fn(),
  setPlace: vi.fn(),
  setDate: vi.fn(),
  setRating: vi.fn(),
  setComment: vi.fn(),
  navigate: vi.fn(),
};

// Common props for EntryForm component
export const mockEntryFormProps = {
  onSubmit: mockFunctions.onSubmit,
  bandName: '',
  setBandName: mockFunctions.setBandName,
  place: '',
  setPlace: mockFunctions.setPlace,
  date: [2023, 5, 15],
  setDate: mockFunctions.setDate,
  rating: 0,
  setRating: mockFunctions.setRating,
  comment: '',
  setComment: mockFunctions.setComment,
  message: '',
  isSuccess: false,
  data: [],
  isUpdate: false,
  showArtistDetailsButton: true
};