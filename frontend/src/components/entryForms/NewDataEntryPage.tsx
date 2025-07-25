import React, { useState, useEffect } from 'react';
import dayjs from "dayjs";
import useEvents from "../../hooks/useEvents";
import EntryForm from "./EntryForm";
import { ConcertEvent, CreateEventData } from "../../types/events";
import { ApiError, handleApiError } from "../../api/apiErrors";

const CreateNewEntryFormPage = () => {
    const { data, createEvent } = useEvents();
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [bandName, setBandName] = useState('');
    const [place, setPlace] = useState('');
    const [date, setDate] = useState(dayjs().toISOString().split('T')[0]);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('CreateNewEntryFormPage component mounted');
        }
        return () => {
            if (process.env.NODE_ENV === 'development') {
                console.log('CreateNewEntryFormPage component unmounted');
            }
        };
    }, []);

    const handleSubmit = async (data: CreateEventData) => {
        if (!data.bandName.trim()) {
            setMessage('Please enter a band name');
            setIsSuccess(false);
            return;
        }
        try {
            await createEvent({
                bandName: data.bandName,
                place: data.place,
                date: data.date,
                rating: data.rating,
                comment: data.comment
            });
            setMessage('New entry created successfully!');
            setIsSuccess(true);
            setPlace('');
            setBandName('');
            setDate(dayjs().toISOString().split('T')[0]);
            setRating(0);
            setComment('');
        } catch (error) {
            const processedError = handleApiError(error);
            setMessage(`Error creating new entry: ${processedError.message}`);
            setIsSuccess(false);
            if (process.env.NODE_ENV === 'development') {
                console.error("Error creating new entry:", processedError);
            }
        }
    };

    return (
        <EntryForm
            onSubmit={async (formData) => {
                const formattedData: CreateEventData = {
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
            setDate={(newDate: dayjs.Dayjs) => setDate(newDate.format('YYYY-MM-DD'))}
            rating={rating}
            setRating={setRating}
            comment={comment}
            setComment={setComment}
            message={message}
            isSuccess={isSuccess}
            data={data || []}
            showArtistDetailsButton={true}
        />
    );
};

export default CreateNewEntryFormPage;