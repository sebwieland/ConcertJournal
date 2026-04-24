import { renderHook } from "@testing-library/react";
import useApiClient from "../../api/apiClient";
import { vi, describe, it, expect } from "vitest";

// Mock axios
vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}));

// Mock apiErrors
vi.mock("../../api/apiErrors", () => ({
  handleApiError: vi.fn(),
}));

describe("useApiClient", () => {
  it("returns an apiClient object with /api baseURL", () => {
    const { result } = renderHook(() => useApiClient());

    expect(result.current).toHaveProperty("apiClient");
  });
});
