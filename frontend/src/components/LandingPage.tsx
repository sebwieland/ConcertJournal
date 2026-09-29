import React, { useEffect } from "react";
import DefaultLayout from "../theme/DefaultLayout";
import DataCollector from "./journal/DataCollector";
import calculateStatistics from "../utils/calculateStatistics";

import { ConfirmProvider } from "material-ui-confirm";
import StatCard from "./utilities/StatCard";
import {
  MusicNote,
  Group,
  LocationOn,
  PlaylistAddCheck,
} from "@mui/icons-material";
import { Alert, Box, Divider, Typography } from "@mui/material";
import useEvents from "../hooks/useEvents";

import LoadingIndicator from "./utilities/LoadingIndicator";
import SearchComponent from "./journal/SearchComponent";

export default function LandingPage() {
  const { data, error, isLoading } = useEvents();

  useEffect(() => {
    // Component mount logic
    return () => {
      // Component cleanup
    };
  }, []);

  if (isLoading) {
    return (
      <DefaultLayout>
        <LoadingIndicator />
      </DefaultLayout>
    );
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
        <Box sx={{ py: 3, maxWidth: 1100, mx: "auto" }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome to your{" "}
            <Box component="span" sx={{ color: "primary.main" }}>
              Concert Journal
            </Box>
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Every show you've seen — searchable, rated, and stat-driven.
          </Typography>
          <Box
            sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}
          >
            <StatCard
              title="Concerts attended"
              value={statistics.totalCount.toString()}
              icon={<PlaylistAddCheck />}
            />
            {statistics.mostSeenArtist && (
              <StatCard
                title="Most Seen Artist"
                value={statistics.mostSeenArtist}
                icon={<MusicNote />}
                linkTo={`/artist/${encodeURIComponent(statistics.mostSeenArtist)}`}
              />
            )}
            <StatCard
              title="Most Artists on a Single Day"
              value={statistics.mostArtistsOnASingleDay.toString()}
              icon={<Group />}
            />
            {statistics.mostVisitedLocation && (
              <StatCard
                title="Most Visited Location"
                value={statistics.mostVisitedLocation}
                icon={<LocationOn />}
                linkTo={`/venue/${encodeURIComponent(statistics.mostVisitedLocation)}`}
              />
            )}
          </Box>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
            Search Your Journal
          </Typography>
          {/* Force the SearchComponent to be included in all builds */}
          <div data-testid="search-component-container">
            <DataCollector>
              {({ onEdit, onDelete }) => (
                <SearchComponent
                  data={events}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              )}
            </DataCollector>
          </div>
        </Box>
      </ConfirmProvider>
    </DefaultLayout>
  );
}
