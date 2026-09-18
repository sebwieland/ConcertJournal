import React from "react";
import DefaultLayout from "../../theme/DefaultLayout";
import StatCard from "../utilities/StatCard";
import LoadingIndicator from "../utilities/LoadingIndicator";
import useEvents from "../../hooks/useEvents";
import computeStatistics from "../../utils/statistics";
import calculateStatistics from "../../utils/calculateStatistics";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Divider,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { BarChart, LineChart } from "@mui/x-charts";
import {
  AcUnit,
  CalendarMonth,
  EmojiEvents,
  LocationOn,
  MusicNote,
  PlaylistAddCheck,
  TimerOutlined,
} from "@mui/icons-material";

const UNKNOWN = "–";
const CHART_HEIGHT = 250;

const chartCard = (title: string, chart: React.ReactNode): React.ReactNode => (
  <Card sx={{ mb: 3 }}>
    <CardContent>
      <Typography variant="h6">{title}</Typography>
      <Box sx={{ mt: 2 }}>{chart}</Box>
    </CardContent>
  </Card>
);

const hint = (text: string) => (
  <Typography variant="body2" color="text.secondary">
    {text}
  </Typography>
);

const StatisticsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { data, error, isLoading } = useEvents();

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
  const stats = computeStatistics(events);
  const overview = calculateStatistics(events);

  const concertsPerYear = chartCard(
    "Concerts per year",
    stats.perYear.length === 0 ? (
      hint("Add an entry to your journal to see this.")
    ) : (
      <BarChart
        height={CHART_HEIGHT}
        xAxis={[
          {
            scaleType: "band",
            data: stats.perYear.map((y) => y.year),
          },
        ]}
        series={[
          { data: stats.perYear.map((y) => y.count), label: "Concerts" },
        ]}
      />
    ),
  );

  const ratingPerYear = chartCard(
    "Average rating per year",
    stats.avgRatingPerYear.length === 0 ? (
      hint("Rate a few concerts to see this.")
    ) : (
      <LineChart
        height={CHART_HEIGHT}
        xAxis={[
          {
            scaleType: "point",
            data: stats.avgRatingPerYear.map((y) => y.year),
          },
        ]}
        series={[
          {
            data: stats.avgRatingPerYear.map((y) => y.avg),
            label: "Average rating",
            curve: "linear",
          },
        ]}
        yAxis={[{ min: 0, max: 5 }]}
      />
    ),
  );

  const topArtists = chartCard(
    "Top 5 artists",
    stats.topArtists.length === 0 ? (
      hint("No artists yet.")
    ) : (
      <BarChart
        height={220}
        xAxis={[
          {
            scaleType: "band",
            data: stats.topArtists.map((a) => a.name),
          },
        ]}
        series={[
          { data: stats.topArtists.map((a) => a.count), label: "Seen" },
        ]}
      />
    ),
  );

  const topLocations = chartCard(
    "Top 5 locations",
    stats.topLocations.length === 0 ? (
      hint("No locations yet.")
    ) : (
      <BarChart
        height={220}
        xAxis={[
          {
            scaleType: "band",
            data: stats.topLocations.map((l) => l.name),
          },
        ]}
        series={[
          { data: stats.topLocations.map((l) => l.count), label: "Visited" },
        ]}
      />
    ),
  );

  const ratingDistribution = chartCard(
    "Rating distribution",
    stats.ratingDistribution.every((r) => r.count === 0) ? (
      hint("Rate a few concerts to see this.")
    ) : (
      <BarChart
        height={200}
        xAxis={[
          {
            scaleType: "band",
            data: stats.ratingDistribution.map((r) => r.rating),
          },
        ]}
        series={[
          {
            data: stats.ratingDistribution.map((r) => r.count),
            label: "Concerts",
          },
        ]}
      />
    ),
  );

  const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekdayChart = chartCard(
    "Concert weekdays",
    stats.weekdayProfile.every((d) => d.count === 0) ? (
      hint("Add an entry to your journal to see this.")
    ) : (
      <BarChart
        height={200}
        xAxis={[{ scaleType: "band", data: weekdayLabels }]}
        series={[
          { data: stats.weekdayProfile.map((d) => d.count), label: "Concerts" },
        ]}
      />
    ),
  );

  return (
    <DefaultLayout>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4">Your Statistics</Typography>
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
        <StatCard
          title="Concerts attended"
          value={overview.totalCount.toString()}
          icon={<PlaylistAddCheck />}
        />
        <StatCard
          title="Longest drought"
          value={
            stats.longestDroughtDays === null
              ? UNKNOWN
              : `${stats.longestDroughtDays} days`
          }
          icon={<AcUnit />}
        />
        <StatCard
          title="Current drought"
          value={
            stats.currentDroughtDays === null
              ? UNKNOWN
              : `${stats.currentDroughtDays} ${stats.currentDroughtDays === 1 ? "day" : "days"}`
          }
          icon={<TimerOutlined />}
        />
        <StatCard
          title="Golden era"
          value={
            stats.goldenEra
              ? `${stats.goldenEra.year} (Ø ${stats.goldenEra.avg})`
              : UNKNOWN
          }
          icon={<EmojiEvents />}
        />
        <StatCard
          title="Most Seen Artist"
          value={overview.mostSeenArtist || UNKNOWN}
          icon={<MusicNote />}
        />
        <StatCard
          title="Most Visited Location"
          value={overview.mostVisitedLocation || UNKNOWN}
          icon={<LocationOn />}
        />
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          "& > *": {
            flex: "1 1 420px",
            minWidth: isMobile ? "100%" : "420px",
          },
        }}
      >
        {concertsPerYear}
        {ratingPerYear}
        {topArtists}
        {topLocations}
        {ratingDistribution}
        {weekdayChart}
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mt: 2,
        }}
      >
        <CalendarMonth color="disabled" fontSize="small" />
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
          Based on {events.length} journal{" "}
          {events.length === 1 ? "entry" : "entries"}
        </Typography>
      </Box>
    </DefaultLayout>
  );
};

export default StatisticsPage;
