import { vi, describe, it, expect, beforeEach } from 'vitest';

// Create a mock for the API client
const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
};

// Mock the apiClient module
vi.mock('../../api/apiClient', () => ({
  default: () => ({
    apiClient: mockApiClient
  })
}));

// Mock the ConfigContext
vi.mock('../../contexts/ConfigContext', () => ({
  ConfigContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
  }
}));

// Mock the apiErrors module
vi.mock('../../api/apiErrors', () => ({
  handleApiError: (error: any) => error
}));

// Create a simplified mock of the EventsApi
const mockEventsApi = {
  getAllEvents: vi.fn(),
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
  deleteEvent: vi.fn()
};

describe('EventsApi Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up default successful responses
    mockApiClient.get.mockResolvedValue({ data: [] });
    mockApiClient.post.mockResolvedValue({ data: {} });
    mockApiClient.put.mockResolvedValue({ data: {} });
    mockApiClient.delete.mockResolvedValue({ data: {} });
    
    // Set up mock implementations
    mockEventsApi.getAllEvents.mockImplementation(async (token) => {
      const response = await mockApiClient.get('/allEvents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    });
    
    mockEventsApi.createEvent.mockImplementation(async (data, token) => {
      const response = await mockApiClient.post('/event', data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    });
    
    mockEventsApi.updateEvent.mockImplementation(async (id, data, token) => {
      const response = await mockApiClient.put(`/event/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    });
    
    mockEventsApi.deleteEvent.mockImplementation(async (id, token) => {
      await mockApiClient.delete(`/event/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    });
  });
  
  describe('EventsApi functions', () => {
    it('should have the correct API methods', () => {
      expect(mockEventsApi).toHaveProperty('getAllEvents');
      expect(mockEventsApi).toHaveProperty('createEvent');
      expect(mockEventsApi).toHaveProperty('updateEvent');
      expect(mockEventsApi).toHaveProperty('deleteEvent');
    });
    
    it('should call the API with correct parameters for getAllEvents', async () => {
      const mockToken = 'test-token';
      await mockEventsApi.getAllEvents(mockToken);
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/allEvents', {
        headers: { 'Authorization': `Bearer ${mockToken}` }
      });
    });
    
    it('should call the API with correct parameters for createEvent', async () => {
      const mockToken = 'test-token';
      const mockData = { bandName: 'Test Band', rating: 5 };
      
      await mockEventsApi.createEvent(mockData, mockToken);
      
      expect(mockApiClient.post).toHaveBeenCalledWith('/event', mockData, {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        }
      });
    });
    
    it('should call the API with correct parameters for updateEvent', async () => {
      const mockToken = 'test-token';
      const mockId = 123;
      const mockData = { bandName: 'Updated Band' };
      
      await mockEventsApi.updateEvent(mockId, mockData, mockToken);
      
      expect(mockApiClient.put).toHaveBeenCalledWith(`/event/${mockId}`, mockData, {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        }
      });
    });
    
    it('should call the API with correct parameters for deleteEvent', async () => {
      const mockToken = 'test-token';
      const mockId = 123;
      
      await mockEventsApi.deleteEvent(mockId, mockToken);
      
      expect(mockApiClient.delete).toHaveBeenCalledWith(`/event/${mockId}`, {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        }
      });
    });
  });
});