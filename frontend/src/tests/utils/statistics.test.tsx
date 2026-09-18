import { describe, expect, it } from "vitest";
import computeStatistics from "../../utils/statistics";
import { ConcertEvent } from "../../types/events";

const event = (
  id: number,
  bandName: string,
  date?: string | number[],
  rating?: number,
  place?: string,
): ConcertEvent => ({
  id,
  bandName,
  place: place ?? "Berlin",
  date: date ?? "",
  comment: "",
  rating: rating ?? 0,
});

describe("computeStatistics", () => {
  it("returns empty structure for an empty journal", () => {
    const stats = computeStatistics([]);
    expect(stats.perYear).toEqual([]);
    expect(stats.topArtists).toEqual([]);
    expect(stats.ratingDistribution).toEqual([
      { rating: 1, count: 0 },
      { rating: 2, count: 0 },
      { rating: 3, count: 0 },
      { rating: 4, count: 0 },
      { rating: 5, count: 0 },
    ]);
    expect(stats.longestDroughtDays).toBeNull();
    expect(stats.currentDroughtDays).toBeNull();
    expect(stats.goldenEra).toBeNull();
    expect(stats.weekdayProfile).toHaveLength(7);
    expect(stats.weekdayProfile.every((d) => d.count === 0)).toBe(true);
  });

  it("counts concerts per year from ISO dates", () => {
    const stats = computeStatistics([
      event(1, "A", "2023-05-15"),
      event(2, "B", "2023-07-01"),
      event(3, "C", "2024-01-02"),
    ]);
    expect(stats.perYear).toEqual([
      { year: 2023, count: 2 },
      { year: 2024, count: 1 },
    ]);
  });

  it("tolerates legacy array dates", () => {
    const stats = computeStatistics([
      event(1, "A", [2022, 12, 31]),
      event(2, "B", "[2022, 8, 1]"),
    ]);
    expect(stats.perYear).toEqual([{ year: 2022, count: 2 }]);
  });

  it("computes average rating per year and golden era", () => {
    const stats = computeStatistics([
      event(1, "A", "2022-03-01", 5),
      event(2, "B", "2022-09-01", 3),
      event(3, "C", "2023-02-10", 4),
    ]);
    expect(stats.avgRatingPerYear).toEqual([
      { year: 2022, avg: 4, count: 2 },
      { year: 2023, avg: 4, count: 1 },
    ]);
    expect(stats.goldenEra).toEqual({ year: 2022, avg: 4 });
  });

  it("ranks top artists and locations", () => {
    const stats = computeStatistics([
      event(1, "Die Hosen", "2023-01-01", 5, "Berlin"),
      event(2, "Die Hosen", "2023-02-01", 4, "Hamburg"),
      event(3, "Toten", "2023-03-01", 3, "Berlin"),
    ]);
    expect(stats.topArtists).toEqual([
      { name: "Die Hosen", count: 2 },
      { name: "Toten", count: 1 },
    ]);
    expect(stats.topLocations).toEqual([
      { name: "Berlin", count: 2 },
      { name: "Hamburg", count: 1 },
    ]);
  });

  it("builds the rating distribution 1..5", () => {
    const stats = computeStatistics([
      event(1, "A", "2023-01-01", 5),
      event(2, "B", "2023-01-02", 5),
      event(3, "C", "2023-01-03", 1),
    ]);
    expect(stats.ratingDistribution).toEqual([
      { rating: 1, count: 1 },
      { rating: 2, count: 0 },
      { rating: 3, count: 0 },
      { rating: 4, count: 0 },
      { rating: 5, count: 2 },
    ]);
  });

  it("computes the longest drought between consecutive concerts", () => {
    const stats = computeStatistics([
      event(1, "A", "2023-01-01"),
      event(2, "B", "2023-01-31"),
      event(3, "C", "2023-05-31"),
    ]);
    // Jan 31 -> May 31 = 120 days
    expect(stats.longestDroughtDays).toBe(120);
  });

  it("returns null drought for a single entry", () => {
    const stats = computeStatistics([event(1, "A", "2023-01-01")]);
    expect(stats.longestDroughtDays).toBeNull();
  });

  it("computes the current drought in whole days", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 3);
    const pad = (n: number) => String(n).padStart(2, "0");
    const isoYMD = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`;
    const stats = computeStatistics([event(1, "A", isoYMD)]);
    expect(stats.currentDroughtDays).toBe(3);
  });

  it("skips events without parseable dates", () => {
    const stats = computeStatistics([
      event(1, "A"),
      event(2, "B", "2023-01-01"),
    ]);
    expect(stats.perYear).toEqual([{ year: 2023, count: 1 }]);
  });
});
