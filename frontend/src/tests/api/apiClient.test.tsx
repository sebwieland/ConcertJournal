import { describe, it, expect, vi } from "vitest";

// Use importOriginal to get the real module, not a mock from other tests
vi.mock("../../api/apiClient", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../api/apiClient")>();
  return {
    ...actual,
  };
});

import apiClient, { setAccessToken, getAccessToken } from "../../api/apiClient";

describe("apiClient", () => {
  it("exports a default apiClient axios instance", () => {
    expect(apiClient).toBeDefined();
  });

  it("manages access token via setAccessToken/getAccessToken", () => {
    setAccessToken("test-token-123");
    expect(getAccessToken()).toBe("test-token-123");

    setAccessToken("");
    expect(getAccessToken()).toBe("");
  });
});
