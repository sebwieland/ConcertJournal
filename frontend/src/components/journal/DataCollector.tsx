import React, { useEffect, useState } from 'react';
import useEvents from "../../hooks/useEvents";
import { useConfirm } from "material-ui-confirm";
import EventsApi from "../../api/apiEvents";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { JSX } from "react";
import { ConcertEvent } from "../../types/events";
import { ApiError, handleApiError } from "../../api/apiErrors";

interface DataCollectorProps {
    children: (state: DataCollectorState) => JSX.Element;
}

export interface DataCollectorState {
    data: ConcertEvent[];
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
}

const DataCollector = ({ children }: DataCollectorProps) => {
    const eventsApi = EventsApi();
    const { data, refetch } = useEvents();
    const confirm = useConfirm();
    const { token } = useAuth();
    const navigate = useNavigate();
    
    // Component lifecycle hooks
    useEffect(() => {
        // Component mounted
        return () => {
            // Component unmounted
        };
    }, []);

    const handleEdit = (id: number) => {
        navigate(`/edit-entry/${id}`);
    };

    const handleDelete = async (id: number) => {
        try {
            await confirm({ description: "This action is permanent!" });
            await eventsApi.deleteEvent(id, token);
            refetch();
            // Event successfully deleted
        } catch (error) {
            const processedError = handleApiError(error);
            if (process.env.NODE_ENV === 'development') {
                console.error('Error deleting event:', processedError);
            }
        }
    };

    // Process and validate data before passing to children
    const processedData = (data || []).map(item => {
        // Create a copy to avoid mutating the original
        const processedItem = { ...item };
        
        // Ensure date is valid
        if (processedItem.date === undefined || processedItem.date === null) {
            // Use current date as default
            const today = new Date();
            processedItem.date = [today.getFullYear(), today.getMonth() + 1, today.getDate()];
        }
        
        // Convert string array representation to actual array
        if (typeof processedItem.date === 'string' &&
            processedItem.date.startsWith('[') &&
            processedItem.date.endsWith(']')) {
            try {
                processedItem.date = JSON.parse(processedItem.date);
            } catch (error) {
                // Use current date as fallback
                const today = new Date();
                processedItem.date = [today.getFullYear(), today.getMonth() + 1, today.getDate()];
            }
        }
        
        return processedItem;
    });
    
    return children({
        data: processedData,
        onEdit: handleEdit,
        onDelete: handleDelete
    });
};

export default DataCollector;