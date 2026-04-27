import apiClient from "./apiClient";
import {
  ConcertEvent,
  CreateEventData,
  UpdateEventData,
} from "../types/events";
import { handleApiError } from "./apiErrors";

export const getAllEvents = async (): Promise<ConcertEvent[]> => {
  try {
    const response = await apiClient.get("/allEvents");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createEvent = async (
  data: CreateEventData,
): Promise<ConcertEvent> => {
  try {
    const response = await apiClient.post("/event", data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateEvent = async (
  id: number,
  data: UpdateEventData,
): Promise<ConcertEvent> => {
  try {
    const response = await apiClient.put(`/event/${id}`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteEvent = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/event/${id}`, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    throw handleApiError(error);
  }
};
