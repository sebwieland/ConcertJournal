import React from "react";
import {
  Link as RouterLink,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import DefaultLayout from "../../theme/DefaultLayout";
import LoadingIndicator from "../utilities/LoadingIndicator";
import RatingStars from "../utilities/RatingStars";
import useEvents from "../../hooks/useEvents";
import parseEventDate from "../../utils/parseEventDate";
import { ConcertEvent } from "../../types/events";
import { Dayjs } from "dayjs";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Typography,
} from "@mui/material";
import { LineChart } from "@mui/x-charts";
import {
  ArrowBack,
  CalendarToday,
  LocationOn,
  MusicNote,
  Star,
} from "@mui/icons-material";

type DeepDiveKind = "artist" | "venue";

interface DeepDiveMatch {
  event: ConcertEvent;
  date: Dayjs;
}

const matchesKind = (
  kind: DeepDiveKind,
  event: ConcertEvent,
  name: string,
): boolean => (kind === "artist" ? event.bandName : event.place) === name;

const DeepDivePage: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const { pathname } = useLocation();
  // The route is a literal path segment (/artist/:name, /venue/:name) —
  // derive the deep-dive kind from the URL instead of a param
  const kind: DeepDiveKind = pathname.startsWith("/artist")
    ? "artist"
    : "venue";
  const navigate = useNavigate();
  const { data, error, isLoading } = useEvents();

  if (kind !== "artist" && kind !== "venue") {
    return (
      <DefaultLayout>
        <Alert severity="error">Unknown deep dive type.</Alert>
      </DefaultLayout>
    );
  }

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

  const label = kind === "artist" ? "Artist" : "Venue";
  const kindIcon = kind === "artist" ? <MusicNote /> : <LocationOn />;
  const allEvents = (data || []) as ConcertEvent[];
  const dives: DeepDiveMatch[] = allEvents
    .map((event) => ({ event, date: parseEventDate(event.date) }))
    .filter(
      (m): m is DeepDiveMatch =>
        m.date !== null && matchesKind(kind, m.event, name ?? ""),
    )
    .sort((a, b) => a.date.valueOf() - b.date.valueOf());

  const ratings = dives
    .map((m) => m.event.rating)
    .filter((r) => typeof r === "number" && r > 0);
  const avgRating =
    ratings.length > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) /
        10
      : null;
  const first = dives[0];
  const last = dives[dives.length - 1];

  return (
    <DefaultLayout>
      <Box sx={{ py: 3, maxWidth: 880, mx: "auto", width: "100%" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{ textTransform: "none" }}
          >
            Back
          </Button>
        </Box>
        <Box sx={{ mb: 3 }}>
          <Chip
            icon={kindIcon}
            label={label}
            color="primary"
            variant="outlined"
            sx={{ mb: 1 }}
          />
          <Typography variant="h4">{name}</Typography>
          <Typography variant="body1" color="text.secondary">
            {dives.length} {dives.length === 1 ? "concert" : "concerts"} in your
            journal
          </Typography>
        </Box>

        {dives.length === 0 ? (
          <Card>
            <CardContent>
              <Typography>
                No journal entries found for &quot;{name}&quot;.
              </Typography>
              <Button
                component={RouterLink}
                to="/your-journal"
                sx={{ mt: 2, textTransform: "none" }}
              >
                Go to your journal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 1,
                mb: 3,
              }}
            >
              {[
                {
                  icon: <Star />,
                  label: "Average rating",
                  value: avgRating?.toFixed(1) ?? "–",
                },
                {
                  icon: <CalendarToday />,
                  label: "First concert",
                  value: first ? first.date.format("YYYY-MM-DD") : "–",
                },
                {
                  icon: <CalendarToday />,
                  label: "Latest concert",
                  value: last ? last.date.format("YYYY-MM-DD") : "–",
                },
              ].map((card) => (
                <Card
                  key={card.label}
                  sx={{ minWidth: 220, flex: "1 1 220px" }}
                >
                  <CardContent sx={{ textAlign: "center" }}>
                    <Box sx={{ color: "primary.main", mb: 1 }}>{card.icon}</Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      {card.label}
                    </Typography>
                    <Typography variant="h6">{card.value}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {ratings.length > 1 && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6">Ratings over time</Typography>
                  <LineChart
                    height={220}
                    xAxis={[
                      {
                        scaleType: "point",
                        data: dives
                          .filter((m) => m.event.rating > 0)
                          .map((m) => m.date.format("YYYY-MM-DD")),
                      },
                    ]}
                    series={[
                      {
                        data: dives
                          .filter((m) => m.event.rating > 0)
                          .map((m) => m.event.rating),
                        label: "Rating",
                        curve: "linear",
                      },
                    ]}
                    yAxis={[{ min: 0, max: 5 }]}
                  />
                </CardContent>
              </Card>
            )}

            <Typography variant="h6" sx={{ mb: 1 }}>
              Every {label.toLowerCase()} concert, in order
            </Typography>
            {dives.map((m, index) => (
              <Box key={m.event.id}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    py: 1.5,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography sx={{ width: 110 }}>
                    {m.date.format("DD/MM/YYYY")}
                  </Typography>
                  <Typography
                    component={RouterLink}
                    to={
                      kind === "artist"
                        ? `/venue/${encodeURIComponent(m.event.place)}`
                        : `/artist/${encodeURIComponent(m.event.bandName)}`
                    }
                    sx={{
                      flex: 1,
                      minWidth: 160,
                      color: "primary.main",
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {kind === "artist" ? m.event.place : m.event.bandName}
                  </Typography>
                  <RatingStars rating={m.event.rating} />
                  {m.event.comment && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ flexBasis: "100%" }}
                    >
                      {m.event.comment}
                    </Typography>
                  )}
                </Box>
                {index < dives.length - 1 && <Divider />}
              </Box>
            ))}
          </>
        )}
      </Box>
    </DefaultLayout>
  );
};

export default DeepDivePage;
