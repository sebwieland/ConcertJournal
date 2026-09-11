import useApiClient from "./apiClient";
import { handleApiError } from "./apiErrors";
const EventsApi = () => {
    const apiClient = useApiClient().apiClient;
    const getAllEvents = async (token) => {
        try {
            const response = await apiClient.get("/allEvents", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    };
    const createEvent = async (data, token) => {
        try {
            const response = await apiClient.post("/event", data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    };
    const updateEvent = async (id, data, token) => {
        try {
            const response = await apiClient.put(`/event/${id}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    };
    const deleteEvent = async (id, token) => {
        try {
            await apiClient.delete(`/event/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
        }
        catch (error) {
            throw handleApiError(error);
        }
    };
    return { getAllEvents, createEvent, updateEvent, deleteEvent };
};
export default EventsApi;
//# sourceMappingURL=apiEvents.js.map