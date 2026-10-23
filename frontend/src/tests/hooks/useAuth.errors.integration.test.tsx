import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { AllProviders } from "../utils/test-utils";
import useAuth from "../../hooks/useAuth";
import AccountApi from "../../api/apiAccount";

// Only the HTTP layer is faked. apiAuth, apiAccount, useAuth and the REAL
// handleApiError run together — every layer re-normalises errors, which the
// per-layer unit tests (each mocking the layer below) could not catch.
const mockPost = vi.hoisted(() => vi.fn());
const mockPut = vi.hoisted(() => vi.fn());

vi.mock("../../api/apiClient", () => ({
  default: () => ({
    rootClient: { post: mockPost },
    apiClient: { post: mockPost, put: mockPut, get: vi.fn(), delete: vi.fn() },
  }),
}));

vi.mock("../../api/apiErrors", async () =>
  vi.importActual("../../api/apiErrors"),
);

const axiosError = (status: number, data: unknown) => ({
  isAxiosError: true,
  response: { status, data },
  message: `Request failed with status code ${status}`,
});

describe("auth/account error messages through the real error chain", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows 'Incorrect email or password.' for a wrong password", async () => {
    mockPost.mockRejectedValueOnce(
      axiosError(401, { error: "Bad credentials" }),
    );
    const { result } = renderHook(() => useAuth(), { wrapper: AllProviders });

    await act(async () => {
      await expect(
        result.current.login({ email: "a@b.de", password: "wrong" }),
      ).rejects.toBeDefined();
    });

    await waitFor(() =>
      expect(result.current.error?.message).toBe(
        "Incorrect email or password.",
      ),
    );
  });

  it("shows the duplicate-account message on registration conflict", async () => {
    mockPost.mockRejectedValueOnce(axiosError(409, "User already exists"));
    const { result } = renderHook(() => useAuth(), { wrapper: AllProviders });

    await act(async () => {
      await expect(
        result.current.signUp({
          username: "ada",
          password: "long-enough",
          email: "a@b.de",
          firstName: "Ada",
          lastName: "L",
        }),
      ).rejects.toBeDefined();
    });

    await waitFor(() =>
      expect(result.current.error?.message).toBe(
        "An account with this email already exists.",
      ),
    );
  });

  it("keeps the server's field error for a wrong current password", async () => {
    mockPut.mockRejectedValueOnce(
      axiosError(422, {
        message: "Password is incorrect.",
        errors: { currentPassword: "Password is incorrect." },
      }),
    );
    const { result } = renderHook(() => AccountApi(), {
      wrapper: AllProviders,
    });

    await expect(
      result.current.changePassword(
        { currentPassword: "wrong", newPassword: "long-enough" },
        "token",
      ),
    ).rejects.toMatchObject({
      message: "Password is incorrect.",
      statusCode: 422,
      details: { currentPassword: "Password is incorrect." },
    });
  });
});
