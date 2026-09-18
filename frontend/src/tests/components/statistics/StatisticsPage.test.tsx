import { renderWithProviders } from "../../utils/test-utils";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import StatisticsPage from "../../../components/statistics/StatisticsPage";

// Mock useEvents so the page renders without the real auth/API stack
const mockUseEvents = vi.fn();

vi.mock("../../../hooks/useEvents", () => ({
  default: () => mockUseEvents(),
}));

const event = (
  id: number,
  bandName: string,
  date: string,
  rating: number,
  place: string,
) => ({ id, bandName, place, date, comment: "", rating });

describe("StatisticsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the loading indicator while fetching", () => {
    mockUseEvents.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
    });
    renderWithProviders(<StatisticsPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("renders the error alert on API failure", () => {
    mockUseEvents.mockReturnValue({
      data: undefined,
      error: { message: "Boom" } as never,
      isLoading: false,
    });
    renderWithProviders(<StatisticsPage />);
    expect(screen.getByText("Boom")).toBeInTheDocument();
  });

  it("renders stat cards and chart cards for a populated journal", () => {
    mockUseEvents.mockReturnValue({
      data: [
        event(1, "Die Hosen", "2023-05-15", 5, "Berlin"),
        event(2, "Toten Hosen", "2024-06-20", 4, "Berlin"),
      ],
      error: null,
      isLoading: false,
    });
    renderWithProviders(<StatisticsPage />);

    expect(screen.getByText("Your Statistics")).toBeInTheDocument();
    expect(screen.getByText("Concerts attended:")).toBeInTheDocument();
    expect(screen.getByText("Concerts per year")).toBeInTheDocument();
    expect(screen.getByText("Average rating per year")).toBeInTheDocument();
    expect(screen.getByText("Top 5 artists")).toBeInTheDocument();
    expect(screen.getByText("Top 5 locations")).toBeInTheDocument();
    expect(screen.getByText("Rating distribution")).toBeInTheDocument();
    expect(screen.getByText("Concert weekdays")).toBeInTheDocument();
    // fun stats with data
    expect(screen.getByText("Golden era:")).toBeInTheDocument();
  });

  it("shows friendly hints for an empty journal", () => {
    mockUseEvents.mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
    });
    renderWithProviders(<StatisticsPage />);

    expect(
      screen.getAllByText(/Add an entry to your journal/).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/Rate a few concerts/).length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText(/No artists yet/)).toBeInTheDocument();
    // drought stats are deliberately dash-unknown with a single entry
    expect(screen.getAllByText("–").length).toBeGreaterThan(0);
  });
});
