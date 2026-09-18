import dayjs, { Dayjs } from "dayjs";
import parseEventDate from "./parseEventDate";
import { ConcertEvent } from "../types/events";

export interface YearCount {
  year: number;
  count: number;
}

export interface YearRating {
  year: number;
  avg: number;
  count: number;
}

export interface NameCount {
  name: string;
  count: number;
}

export interface RatingCount {
  rating: number;
  count: number;
}

export interface StatisticsData {
  perYear: YearCount[];
  avgRatingPerYear: YearRating[];
  topArtists: NameCount[];
  topLocations: NameCount[];
  ratingDistribution: RatingCount[];
  /** Longest gap (in days) between two consecutive concerts; null when < 2 entries */
  longestDroughtDays: number | null;
  /** Days since the most recent concert; relative to today */
  currentDroughtDays: number | null;
  /** Concerts per weekday, 1 (Monday) .. 7 (Sunday) */
  weekdayProfile: { weekday: number; count: number }[];
  /** Best year by average rating; null when no ratings present */
  goldenEra: { year: number; avg: number } | null;
}

const EMPTY = (): StatisticsData => ({
  perYear: [],
  avgRatingPerYear: [],
  topArtists: [],
  topLocations: [],
  ratingDistribution: [1, 2, 3, 4, 5].map((rating) => ({ rating, count: 0 })),
  longestDroughtDays: null,
  currentDroughtDays: null,
  weekdayProfile: [1, 2, 3, 4, 5, 6, 7].map((weekday) => ({ weekday, count: 0 })),
  goldenEra: null,
});

const sortedDates = (entries: ConcertEvent[]): Dayjs[] =>
  entries
    .map((e) => parseEventDate(e.date))
    .filter((d): d is Dayjs => !!d)
    .sort((a, b) => a.valueOf() - b.valueOf());

const computeStatistics = (entries: ConcertEvent[] = []): StatisticsData => {
  if (entries.length === 0) {
    return EMPTY();
  }

  const dates = sortedDates(entries);

  // ----- per-year count + average rating -----
  const yearCounts = new Map<number, number>();
  const yearRatings = new Map<number, { sum: number; count: number }>();
  entries.forEach((entry) => {
    const date = parseEventDate(entry.date);
    if (!date) {
      return;
    }
    const year = date.year();
    yearCounts.set(year, (yearCounts.get(year) || 0) + 1);
    if (typeof entry.rating === "number" && entry.rating > 0) {
      const acc = yearRatings.get(year) || { sum: 0, count: 0 };
      yearRatings.set(year, {
        sum: acc.sum + entry.rating,
        count: acc.count + 1,
      });
    }
  });

  const perYear = [...yearCounts.entries()]
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year - b.year);

  const avgRatingPerYear = [...yearRatings.entries()]
    .map(([year, { sum, count }]) => ({
      year,
      avg: Math.round((sum / count) * 10) / 10,
      count,
    }))
    .sort((a, b) => a.year - b.year);

  // ----- top lists -----
  const countBy = <T extends string>(
    keyOf: (e: ConcertEvent) => T,
  ): Map<T, number> => {
    const map = new Map<T, number>();
    entries.forEach((e) => {
      const key = keyOf(e);
      if (key) {
        map.set(key, (map.get(key) || 0) + 1);
      }
    });
    return map;
  };

  const asTopList = (map: Map<string, number>, n: number): NameCount[] =>
    [...map.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, n);

  const topArtists = asTopList(countBy((e) => e.bandName), 5);
  const topLocations = asTopList(countBy((e) => e.place), 5);

  // ----- rating distribution (1..5) -----
  const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
    rating,
    count: entries.filter((e) => e.rating === rating).length,
  }));

  // ----- droughts -----
  let longestDroughtDays: number | null = null;
  for (let i = 1; i < dates.length; i++) {
    const gap = dates[i].diff(dates[i - 1], "day");
    if (longestDroughtDays === null || gap > longestDroughtDays) {
      longestDroughtDays = gap;
    }
  }

  const latest = dates.length > 0 ? dates[dates.length - 1] : null;
  const currentDroughtDays =
    latest !== null ? Math.max(0, dayjs().startOf("day").diff(latest.startOf("day"), "day")) : null;

  // ----- weekday profile (dayjs: 0 = Sunday .. 6 = Saturday) -----
  const weekdayCounts = new Map<number, number>();
  dates.forEach((d) => {
    weekdayCounts.set(d.day(), (weekdayCounts.get(d.day()) || 0) + 1);
  });
  const weekdayProfile = [1, 2, 3, 4, 5, 6, 0] // Monday..Sunday display order
    .map((d) => ({ weekday: d === 0 ? 7 : d, count: weekdayCounts.get(d) || 0 }));

  // ----- golden era -----
  const goldenEraCandidate = [...avgRatingPerYear].sort(
    (a, b) => b.avg - a.avg || a.year - b.year,
  )[0];
  const goldenEra = goldenEraCandidate
    ? { year: goldenEraCandidate.year, avg: goldenEraCandidate.avg }
    : null;

  return {
    perYear,
    avgRatingPerYear,
    topArtists,
    topLocations,
    ratingDistribution,
    longestDroughtDays,
    currentDroughtDays,
    weekdayProfile,
    goldenEra,
  };
};

export default computeStatistics;
