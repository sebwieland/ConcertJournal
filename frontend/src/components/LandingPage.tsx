import React, { useEffect } from 'react';
import DefaultLayout from '../theme/DefaultLayout';
import DataCollector from './journal/DataCollector';
import calculateStatistics from "../utils/calculateStatistics";
import { ConcertEvent } from "../types/events";
import { ConfirmProvider } from "material-ui-confirm";
import StatCard from './utilities/StatCard';
import { MusicNote, Group, LocationOn, PlaylistAddCheck } from '@mui/icons-material';
import { Alert, Divider } from "@mui/material";
import useEvents from "../hooks/useEvents";
import { handleApiError } from '../api/apiErrors';
import LoadingIndicator from "./utilities/LoadingIndicator";
import SearchComponent from './journal/SearchComponent';

export default function LandingPage() {
    const { data, error, isLoading, refetch } = useEvents();

    useEffect(() => {
        // Component mount logic
        return () => {
            // Component cleanup
        };
    }, []);

    if (isLoading) {
        return <DefaultLayout><LoadingIndicator /></DefaultLayout>;
    }

    if (error) {
        return (
            <DefaultLayout>
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error.message}
                </Alert>
            </DefaultLayout>
        );
    }

    const events = data || [];
    const statistics = calculateStatistics(events);

    return (
        <DefaultLayout>
            <ConfirmProvider>
                <div>
                    <h1>Welcome to your Concert Journal! Nice to have you!</h1>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <StatCard title="Concerts attended" value={statistics.totalCount.toString()} icon={<PlaylistAddCheck />} />
                        <StatCard title="Most Seen Artist" value={statistics.mostSeenArtist} icon={<MusicNote />} />
                        <StatCard title="Most Artists on a Single Day" value={statistics.mostArtistsOnASingleDay.toString()} icon={<Group />} />
                        <StatCard title="Most Visited Location" value={statistics.mostVisitedLocation} icon={<LocationOn />} />
                    </div>
                    
                    <Divider sx={{ my: 3 }} />
                    
                    <h2>Search Your Journal</h2>
                    {/* Force the SearchComponent to be included in all builds */}
                    <div data-testid="search-component-container">
                        <DataCollector>
                            {({ data: collectedData, onEdit, onDelete }) => (
                                <SearchComponent
                                    data={events}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            )}
                        </DataCollector>
                    </div>
                </div>
            </ConfirmProvider>
        </DefaultLayout>
    );
}