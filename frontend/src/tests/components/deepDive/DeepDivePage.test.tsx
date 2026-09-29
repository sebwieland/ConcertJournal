import { render, screen, within } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "react-query";
import { AuthContext } from "../../../contexts/AuthContext";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DeepDivePage from "../../../components/deepDive/DeepDivePage";

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

const renderAt = (path: string) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={
          {
            token: "t",
            isLoading: false,
            isLoggedIn: true,
          } as never
        }
      >
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/artist/:name" element={<DeepDivePage />} />
            <Route path="/venue/:name" element={<DeepDivePage />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

describe("DeepDivePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows an empty state when no events match the artist", () => {
    mockUseEvents.mockReturnValue({
      data: [event(1, "Other Band", "2023-01-01", 3, "Hamburg")],
      error: null,
      isLoading: false,
    });
    renderAt("/artist/Die%20Hosen");

    expect(screen.getByText(/No journal entries found/i)).toBeInTheDocument();
    expect(screen.getByText(/Go to your journal/i)).toBeInTheDocument();
  });

  it("renders artist stats and ordered concerts", () => {
    mockUseEvents.mockReturnValue({
      data: [
        event(1, "Die Hosen", "2022-01-01", 3, "Berlin"),
        event(2, "Die Hosen", "2024-06-20", 5, "Hamburg"),
      ],
      error: null,
      isLoading: false,
    });
    renderAt("/artist/Die%20Hosen");

    expect(screen.getByText("Die Hosen")).toBeInTheDocument();
    expect(screen.getByText("2 concerts in your journal")).toBeInTheDocument();
    expect(screen.getByText("Average rating")).toBeInTheDocument();
    // ordered chronologically
    const rows = screen.getAllByText(/Berlin|Hamburg/);
    expect(rows[0]).toHaveTextContent("Berlin");
    expect(rows[1]).toHaveTextContent("Hamburg");
  });

  it("renders the venue view with band names as cross-links", () => {
    mockUseEvents.mockReturnValue({
      data: [event(1, "Die Hosen", "2022-01-01", 3, "Berlin")],
      error: null,
      isLoading: false,
    });
    renderAt("/venue/Berlin");

    expect(screen.getByText("Berlin")).toBeInTheDocument();
    expect(screen.getByText("1 concert in your journal")).toBeInTheDocument();
  });

  it("shows a rating chart when several rated concerts exist", () => {
    mockUseEvents.mockReturnValue({
      data: [
        event(1, "Die Hosen", "2022-01-01", 2, "Berlin"),
        event(2, "Die Hosen", "2024-06-20", 5, "Berlin"),
      ],
      error: null,
      isLoading: false,
    });
    const { container } = renderAt("/artist/Die%20Hosen");
    expect(within(container).getByText("Ratings over time")).toBeInTheDocument();
  });
});
