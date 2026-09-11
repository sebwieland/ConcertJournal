import { useQuery, useMutation } from "react-query";
import EventsApi from "../api/apiEvents";
import useAuth from "./useAuth";
import { handleApiError } from "../api/apiErrors";
const useEvents = () => {
    const eventsApi = EventsApi();
    const { token } = useAuth();
    const { data, error, isLoading, refetch } = useQuery("allEvents", async () => {
        if (!token) {
            throw handleApiError(new Error("No authentication token found"));
        }
        try {
            const response = await eventsApi.getAllEvents(token);
            // Process the response to ensure dates are in the correct format
            const processedResponse = Array.isArray(response)
                ? response.map((item) => {
                    // Make a copy of the item to avoid mutating the original
                    const processedItem = { ...item };
                    // Handle undefined or null dates by providing a default date
                    if (processedItem.date === undefined ||
                        processedItem.date === null) {
                        // Use current date as default
                        const today = new Date();
                        processedItem.date = [
                            today.getFullYear(),
                            today.getMonth() + 1,
                            today.getDate(),
                        ];
                    }
                    // If date is a string that looks like an array, convert it to an actual array
                    else if (typeof processedItem.date === "string" &&
                        processedItem.date.startsWith("[") &&
                        processedItem.date.endsWith("]")) {
                        try {
                            processedItem.date = JSON.parse(processedItem.date);
                        }
                        catch (error) {
                            // Provide a default date if parsing fails
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
        }
        catch (error) {
            throw handleApiError(error);
        }
    }, {
        enabled: !!token, // only fetch when token is available
    });
    const createEventMutation = useMutation(async (data) => {
        if (!token) {
            throw handleApiError(new Error("No authentication token found"));
        }
        try {
            const response = await eventsApi.createEvent(data, token);
            return response;
        }
        catch (error) {
            throw handleApiError(error);
        }
    });
    const updateEventMutation = useMutation(async ({ id, data }) => {
        if (!token) {
            throw handleApiError(new Error("No authentication token found"));
        }
        try {
            const response = await eventsApi.updateEvent(id, data, token);
            return response;
        }
        catch (error) {
            throw handleApiError(error);
        }
    });
    const deleteEventMutation = useMutation(async (id) => {
        if (!token) {
            throw handleApiError(new Error("No authentication token found"));
        }
        try {
            const response = await eventsApi.deleteEvent(id, token);
            return response;
        }
        catch (error) {
            throw handleApiError(error);
        }
    });
    const createEvent = async (data, options) => {
        try {
            const response = await createEventMutation.mutateAsync(data);
            options?.onSuccess?.(response);
        }
        catch (error) {
            options?.onError?.(error);
        }
    };
    const updateEvent = async (id, data, options) => {
        try {
            const response = await updateEventMutation.mutateAsync({ id, data });
            options?.onSuccess?.(response);
        }
        catch (error) {
            options?.onError?.(error);
        }
    };
    const deleteEvent = async (id, options) => {
        try {
            await deleteEventMutation.mutateAsync(id);
            options?.onSuccess?.();
        }
        catch (error) {
            options?.onError?.(error);
        }
    };
    return {
        data,
        error: error,
        isLoading,
        refetch,
        createEvent,
        updateEvent,
        deleteEvent,
    };
};
export default useEvents;
//# sourceMappingURL=useEvents.js.map