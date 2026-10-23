import { vi, describe, it, expect } from "vitest";
import { ApiErrorType } from "../../types/api";

// vitest.setup.ts mocks apiErrors globally (and apiErrors.test.ts re-mocks
// it), so exercise the real implementation explicitly here.
const { handleApiError } = await vi.importActual<
  typeof import("../../api/apiErrors")
>("../../api/apiErrors");

const axiosError = (status: number, data: unknown) => ({
  isAxiosError: true,
  response: { status, data },
  message: `Request failed with status code ${status}`,
});

describe("handleApiError (real implementation)", () => {
  it("surfaces the backend's joined field messages on 422", () => {
    const error = axiosError(422, {
      status: 422,
      message: "Band Name is required.",
      errors: { bandName: "Band Name is required." },
    });

    const result = handleApiError(error);

    expect(result.type).toBe(ApiErrorType.VALIDATION_ERROR);
    expect(result.message).toBe("Band Name is required.");
    expect(result.details).toEqual({ bandName: "Band Name is required." });
  });

  it("falls back to a generic message on 422 without a message", () => {
    const result = handleApiError(axiosError(422, {}));

    expect(result.message).toBe("Validation error. Please check your input.");
  });

  it("uses plain-string bodies for unmapped statuses (e.g. 409 on register)", () => {
    const result = handleApiError(axiosError(409, "User already exists"));

    expect(result.type).toBe(ApiErrorType.UNKNOWN_ERROR);
    expect(result.message).toBe("Error: User already exists");
  });
});
