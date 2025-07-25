import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useEvents from '../../hooks/useEvents';
import EventsApi from '../../api/apiEvents';
import useAuth from '../../hooks/useAuth';
import dayjs from "dayjs";
import EntryForm from "./EntryForm";
import { ConcertEvent, UpdateEventData } from "../../types/events";
import { ApiError, handleApiError } from "../../api/apiErrors";

const EditEntryFormPage = () => {
    const eventsApi = EventsApi();
    const { id } = useParams<{ id: string }>();
    const { data, refetch } = useEvents();
    const { token } = useAuth();
    const [bandName, setBandName] = useState('');
    const [place, setPlace] = useState('');
    const [date, setDate] = useState<string | number[]>('');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchEvent = async () => {
            if (!id || !data) {
                return;
            }
            try {
                const eventId = parseInt(id, 10);
                const event = data.find((event: ConcertEvent) => event.id === eventId);
                if (!event) {
                    return;
                }
                setBandName(event.bandName);
                setPlace(event.place);
                // Handle date that could be string or array
                setDate(event.date);
                setRating(event.rating);
                setComment(event.comment);
            } catch (error) {
                const processedError = handleApiError(error);
                if (process.env.NODE_ENV === 'development') {
                    console.error('Error fetching event:', processedError);
                }
            }
        };
        fetchEvent();
    }, [id, data]);

    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('EditEntryFormPage component mounted');
        }
        return () => {
            if (process.env.NODE_ENV === 'development') {
                console.log('EditEntryFormPage component unmounted');
            }
        };
    }, []);

    const handleSubmit = async (formData: UpdateEventData) => {
        const formattedData: UpdateEventData = {
            bandName: formData.bandName || '',
            place: formData.place || '',
            date: formData.date || '',
            rating: formData.rating || 0,
            comment: formData.comment || ''
        };
        try {
            await eventsApi.updateEvent(parseInt(id!, 10), formattedData, token);
            refetch();
            setMessage('Entry updated successfully!');
            setIsSuccess(true);
        } catch (error) {
            const processedError = handleApiError(error);
            setMessage(`Error updating entry: ${processedError.message}`);
            setIsSuccess(false);
            if (process.env.NODE_ENV === 'development') {
                console.error("Error updating entry:", processedError);
            }
        }
    };

    return (
        <EntryForm
            onSubmit={async (formData) => {
                const formattedData: UpdateEventData = {
                    bandName: formData.bandName || '',
                    place: formData.place || '',
                    date: formData.date || '',
                    rating: formData.rating || 0,
                    comment: formData.comment || ''
                };
                await handleSubmit(formattedData);
            }}
            bandName={bandName}
            setBandName={setBandName}
            place={place}
            setPlace={setPlace}
            date={date}
            setDate={(newDate: dayjs.Dayjs) => {
                // Convert the dayjs object to ISO string format (YYYY-MM-DD)
                const isoDate = newDate.toISOString().split('T')[0];
                setDate(isoDate);
            }}
            rating={rating}
            setRating={setRating}
            comment={comment}
            setComment={setComment}
            message={message}
            isSuccess={isSuccess}
            data={data || []}
            isUpdate={true}
            showArtistDetailsButton={false}
        />
    );
};

export default EditEntryFormPage;