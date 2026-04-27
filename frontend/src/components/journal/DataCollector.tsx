import React, { useEffect } from "react";
import useEvents from "../../hooks/useEvents";
import { useConfirm } from "material-ui-confirm";
import { deleteEvent } from "../../api/apiEvents";
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
  const { data, refetch } = useEvents();
  const confirm = useConfirm();
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
      await deleteEvent(id);
      refetch();
      // Event successfully deleted
    } catch (error) {
      const processedError = handleApiError(error);
      if (process.env.NODE_ENV === "development") {
        console.error("Error deleting event:", processedError);
      }
    }
  };

  return children({
    data: data || [],
    onEdit: handleEdit,
    onDelete: handleDelete,
  });
};

export default DataCollector;
