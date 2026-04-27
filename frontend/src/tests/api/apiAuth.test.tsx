import { vi, describe, it, expect, beforeEach } from "vitest";
import { mockLoginData, mockRegistrationData } from "../utils/test-fixtures";
import { ApiErrorType } from "../../types/api";

// Create mock functions using vi.hoisted to avoid hoisting issues
const mockPost = vi.hoisted(() => vi.fn());
const mockHandleApiError = vi.hoisted(() => vi.fn());

// Mock the apiClient module (now a plain module, not a hook)
vi.mock("../../api/apiClient", () => ({
  default: {
    post: mockPost,
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
  setAccessToken: vi.fn(),
  getAccessToken: vi.fn(() => ""),
  setOnLogout: vi.fn(),
}));

// Mock the apiErrors module
vi.mock("../../api/apiErrors", () => ({
  handleApiError: mockHandleApiError,
}));

describe("apiAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPost.mockReset();
    mockHandleApiError.mockReset();
  });

  describe("login", () => {
    it("calls apiClient.post with correct parameters", async () => {
      mockPost.mockResolvedValueOnce({
        status: 200,
        data: {
          accessToken: "new-access-token",
        },
      });

      // Import after mocks are set up
      const { login } = await import("../../api/apiAuth");

      const response = await login(mockLoginData);

      expect(mockPost).toHaveBeenCalledWith(
        "/login",
        "email=test%40example.com&password=password123",
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      expect(response).toEqual({
        accessToken: "new-access-token",
      });
    });

    it("handles login failure", async () => {
      const errorObj = {
        response: {
          status: 401,
          statusText: "Unauthorized",
        },
      };

      mockPost.mockRejectedValueOnce(errorObj);

      mockHandleApiError.mockReturnValue({
        type: ApiErrorType.UNKNOWN_ERROR,
        message: "Unauthorized",
      });

      const { login } = await import("../../api/apiAuth");

      await expect(login(mockLoginData)).rejects.toMatchObject({
        type: ApiErrorType.UNKNOWN_ERROR,
        message: "Unauthorized",
      });

      expect(mockHandleApiError).toHaveBeenCalledWith(errorObj);
    });
  });

  describe("logout", () => {
    it("calls apiClient.post with correct parameters", async () => {
      mockPost.mockResolvedValueOnce({
        status: 200,
      });

      const { logout } = await import("../../api/apiAuth");

      await logout();

      expect(mockPost).toHaveBeenCalledWith("/logout");
    });

    it("handles logout failure", async () => {
      const errorObj = {
        response: {
          status: 500,
          statusText: "Internal Server Error",
        },
      };

      mockPost.mockRejectedValueOnce(errorObj);

      mockHandleApiError.mockReturnValue({
        type: ApiErrorType.UNKNOWN_ERROR,
        message: "Internal Server Error",
      });

      const { logout } = await import("../../api/apiAuth");

      await expect(logout()).rejects.toMatchObject({
        type: ApiErrorType.UNKNOWN_ERROR,
        message: "Internal Server Error",
      });

      expect(mockHandleApiError).toHaveBeenCalledWith(errorObj);
    });
  });

  describe("register", () => {
    it("calls apiClient.post with correct parameters", async () => {
      mockPost.mockResolvedValueOnce({
        status: 200,
        data: {
          accessToken: "new-access-token",
        },
      });

      const { register } = await import("../../api/apiAuth");

      await register(mockRegistrationData);

      expect(mockPost).toHaveBeenCalledWith("/register", mockRegistrationData);
    });

    it("handles registration errors", async () => {
      const errorObj = {
        response: {
          status: 400,
          data: {
            message: "Email already in use",
          },
        },
      };

      mockPost.mockRejectedValueOnce(errorObj);

      mockHandleApiError.mockReturnValue({
        type: ApiErrorType.UNKNOWN_ERROR,
        message: "Email already in use",
      });

      const { register } = await import("../../api/apiAuth");

      await expect(register(mockRegistrationData)).rejects.toMatchObject({
        type: ApiErrorType.UNKNOWN_ERROR,
        message: "Email already in use",
      });

      expect(mockHandleApiError).toHaveBeenCalledWith(errorObj);
    });
  });
});
