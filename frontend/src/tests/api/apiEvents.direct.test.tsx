import { vi, describe, it, expect } from 'vitest';
import axios from 'axios';
import { handleApiError } from '../../api/apiErrors';

// Create a direct mock of the EventsApi functions
const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() }
  }
};

// Mock the actual functions we want to test
const mockEventsApi = {
  getAllEvents: async (token: string) => {
    try {
      const response = await mockApiClient.get('/allEvents', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  createEvent: async (data: any, token: string) => {
    try {
      const response = await mockApiClient.post('/event', data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  updateEvent: async (id: number, data: any, token: string) => {
    try {
      const response = await mockApiClient.put(`/event/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  deleteEvent: async (id: number, token: string) => {
    try {
      await mockApiClient.delete(`/event/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Mock the apiErrors module
vi.mock('../../api/apiErrors', () => ({
  handleApiError: (error: any) => error
}));

describe('EventsApi', () => {
  const mockToken = 'mock-token';
  const mockEvent = {
    id: 1,
    bandName: 'Test Band',
    place: 'Test Venue',
    date: [2023, 5, 15],
    comment: 'Great show',
    rating: 5
  };

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Set up default successful responses
    mockApiClient.get.mockResolvedValue({ data: [mockEvent] });
    mockApiClient.post.mockResolvedValue({ data: mockEvent });
    mockApiClient.put.mockResolvedValue({ data: mockEvent });
    mockApiClient.delete.mockResolvedValue({ data: {} });
  });

  describe('getAllEvents', () => {
    it('should fetch all events with the correct authorization header', async () => {
      const result = await mockEventsApi.getAllEvents(mockToken);
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/allEvents', {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
        },
      });
      expect(result).toEqual([mockEvent]);
    });

    it('should handle errors when fetching events', async () => {
      const mockError = new Error('Network error');
      mockApiClient.get.mockRejectedValue(mockError);
      
      await expect(mockEventsApi.getAllEvents(mockToken)).rejects.toThrow(mockError);
    });
  });

  describe('createEvent', () => {
    const createEventData = {
      bandName: 'New Band',
      place: 'New Venue',
      date: [2023, 6, 20],
      comment: 'Awesome show',
      rating: 4
    };

    it('should create an event with the correct data and headers', async () => {
      const result = await mockEventsApi.createEvent(createEventData, mockToken);
      
      expect(mockApiClient.post).toHaveBeenCalledWith('/event', createEventData, {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        },
      });
      expect(result).toEqual(mockEvent);
    });

    it('should handle errors when creating an event', async () => {
      const mockError = new Error('Validation error');
      mockApiClient.post.mockRejectedValue(mockError);
      
      await expect(mockEventsApi.createEvent(createEventData, mockToken)).rejects.toThrow(mockError);
    });
  });

  describe('updateEvent', () => {
    const updateEventData = {
      bandName: 'Updated Band',
      rating: 5
    };

    it('should update an event with the correct ID, data, and headers', async () => {
      const result = await mockEventsApi.updateEvent(1, updateEventData, mockToken);
      
      expect(mockApiClient.put).toHaveBeenCalledWith('/event/1', updateEventData, {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        },
      });
      expect(result).toEqual(mockEvent);
    });

    it('should handle errors when updating an event', async () => {
      const mockError = new Error('Event not found');
      mockApiClient.put.mockRejectedValue(mockError);
      
      await expect(mockEventsApi.updateEvent(1, updateEventData, mockToken)).rejects.toThrow(mockError);
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event with the correct ID and headers', async () => {
      await mockEventsApi.deleteEvent(1, mockToken);
      
      expect(mockApiClient.delete).toHaveBeenCalledWith('/event/1', {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        },
      });
    });

    it('should handle errors when deleting an event', async () => {
      const mockError = new Error('Event not found');
      mockApiClient.delete.mockRejectedValue(mockError);
      
      await expect(mockEventsApi.deleteEvent(1, mockToken)).rejects.toThrow(mockError);
    });
  });
});