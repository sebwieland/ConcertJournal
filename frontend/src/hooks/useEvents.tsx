import { useQuery, useMutation } from "react-query";
import { getAllEvents, createEvent as apiCreateEvent, updateEvent as apiUpdateEvent, deleteEvent as apiDeleteEvent } from "../api/apiEvents";
import useAuth from "./useAuth";
import {
  ConcertEvent,
  CreateEventData,
  UpdateEventData,
} from "../types/events";
import { ApiError, handleApiError } from "../api/apiErrors";

interface UseEvents {
  data: ConcertEvent[] | undefined;
  error: ApiError | null;
  isLoading: boolean;
  refetch: () => void;
  createEvent: (
    data: CreateEventData,
    options?: {
      onSuccess?: (data: ConcertEvent) => void;
      onError?: (error: ApiError) => void;
    },
  ) => Promise<void>;
  updateEvent: (
    id: number,
    data: UpdateEventData,
    options?: {
      onSuccess?: (data: ConcertEvent) => void;
      onError?: (error: ApiError) => void;
    },
  ) => Promise<void>;
  deleteEvent: (
    id: number,
    options?: {
      onSuccess?: () => void;
      onError?: (error: ApiError) => void;
    },
  ) => Promise<void>;
}

const useEvents = (): UseEvents => {
  const { token } = useAuth();

  const { data, error, isLoading, refetch } = useQuery(
    "allEvents",
    async () => {
      try {
        const response = await getAllEvents();

        // Process the response to ensure dates are in the correct format
        const processedResponse = Array.isArray(response)
          ? response.map((item) => {
              const processedItem = { ...item };

              if (
                processedItem.date === undefined ||
                processedItem.date === null
              ) {
                const today = new Date();
                processedItem.date = [
                  today.getFullYear(),
                  today.getMonth() + 1,
                  today.getDate(),
                ];
              } else if (
                typeof processedItem.date === "string" &&
                processedItem.date.startsWith("[") &&
                processedItem.date.endsWith("]")
              ) {
                try {
                  processedItem.date = JSON.parse(processedItem.date);
                } catch (error) {
                  const today = new Date();
                  processedItem.date = [
                    today.getFullYear(),
                    today.getMonth() + 1,
                    today.getDate(),
                  ];
                }
              }

              return processedItem;
            })
          : response;

        return processedResponse;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    {
      enabled: !!token, // only fetch when token is available
    },
  );

  const createEventMutation = useMutation(async (data: CreateEventData) => {
    try {
      return await apiCreateEvent(data);
    } catch (error) {
      throw handleApiError(error);
    }
  });

  const updateEventMutation = useMutation(
    async ({ id, data }: { id: number; data: UpdateEventData }) => {
      try {
        return await apiUpdateEvent(id, data);
      } catch (error) {
        throw handleApiError(error);
      }
    },
  );

  const deleteEventMutation = useMutation(async (id: number) => {
    try {
      return await apiDeleteEvent(id);
    } catch (error) {
      throw handleApiError(error);
    }
  });

  const createEvent = async (
    data: CreateEventData,
    options?: {
      onSuccess?: (data: ConcertEvent) => void;
      onError?: (error: ApiError) => void;
    },
  ) => {
    try {
      const response = await createEventMutation.mutateAsync(data);
      options?.onSuccess?.(response);
    } catch (error) {
      options?.onError?.(error as ApiError);
    }
  };

  const updateEvent = async (
    id: number,
    data: UpdateEventData,
    options?: {
      onSuccess?: (data: ConcertEvent) => void;
      onError?: (error: ApiError) => void;
    },
  ) => {
    try {
      const response = await updateEventMutation.mutateAsync({ id, data });
      options?.onSuccess?.(response);
    } catch (error) {
      options?.onError?.(error as ApiError);
    }
  };

  const deleteEvent = async (
    id: number,
    options?: {
      onSuccess?: () => void;
      onError?: (error: ApiError) => void;
    },
  ) => {
    try {
      await deleteEventMutation.mutateAsync(id);
      options?.onSuccess?.();
    } catch (error) {
      options?.onError?.(error as ApiError);
    }
  };

  return {
    data,
    error: error as ApiError | null,
    isLoading,
    refetch,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};

export default useEvents;
