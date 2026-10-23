import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { renderWithProviders } from "../../utils/test-utils";
import SettingsPage from "../../../components/settings/SettingsPage";

const mockExportData = vi.hoisted(() => vi.fn());
const mockChangePassword = vi.hoisted(() => vi.fn());
const mockDeleteAccount = vi.hoisted(() => vi.fn());
const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("../../../api/apiAccount", () => ({
  default: () => ({
    exportData: mockExportData,
    changePassword: mockChangePassword,
    deleteAccount: mockDeleteAccount,
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const setLoggedOut = vi.fn();

const renderPage = () =>
  renderWithProviders(<SettingsPage />, {
    authContextValues: { token: "test-token", setLoggedOut },
  });

describe("SettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the three account sections", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Change password" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Export your data" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Delete account" }),
    ).toBeInTheDocument();
  });

  it("checks length and confirmation before calling the API", async () => {
    renderPage();

    await userEvent.type(screen.getByLabelText(/^Current password/), "old");
    await userEvent.type(screen.getByLabelText(/^New password/), "short");
    await userEvent.type(
      screen.getByLabelText(/^Confirm new password/),
      "different",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Change password" }),
    );

    expect(
      screen.getByText("New password must be at least 8 characters."),
    ).toBeInTheDocument();
    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
    expect(mockChangePassword).not.toHaveBeenCalled();
  });

  it("changes the password and confirms success", async () => {
    mockChangePassword.mockResolvedValue(undefined);
    renderPage();

    await userEvent.type(screen.getByLabelText(/^Current password/), "old-pw");
    await userEvent.type(
      screen.getByLabelText(/^New password/),
      "brand-new-password",
    );
    await userEvent.type(
      screen.getByLabelText(/^Confirm new password/),
      "brand-new-password",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Change password" }),
    );

    await waitFor(() =>
      expect(screen.getByText("Password changed.")).toBeInTheDocument(),
    );
    expect(mockChangePassword).toHaveBeenCalledWith(
      { currentPassword: "old-pw", newPassword: "brand-new-password" },
      "test-token",
    );
  });

  it("shows the server's field error for a wrong current password", async () => {
    mockChangePassword.mockRejectedValue({
      type: "VALIDATION_ERROR",
      message: "Password is incorrect.",
      details: { currentPassword: "Password is incorrect." },
    });
    renderPage();

    await userEvent.type(screen.getByLabelText(/^Current password/), "wrong");
    await userEvent.type(
      screen.getByLabelText(/^New password/),
      "brand-new-password",
    );
    await userEvent.type(
      screen.getByLabelText(/^Confirm new password/),
      "brand-new-password",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Change password" }),
    );

    // Shown both as the field hint and in the alert
    await waitFor(() =>
      expect(screen.getAllByText("Password is incorrect.")).toHaveLength(2),
    );
  });

  it("downloads the export as a JSON file", async () => {
    mockExportData.mockResolvedValue({ email: "a@b.c", events: [{}, {}] });
    const createObjectURL = vi.fn(() => "blob:export");
    const revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    renderPage();

    await userEvent.click(
      screen.getByRole("button", { name: "Download my data" }),
    );

    await waitFor(() =>
      expect(screen.getByText("Exported 2 entries.")).toBeInTheDocument(),
    );
    expect(mockExportData).toHaveBeenCalledWith("test-token");
    expect(createObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    click.mockRestore();
  });

  it("deletes the account only after password and confirmation, then signs out", async () => {
    mockDeleteAccount.mockResolvedValue(undefined);
    renderPage();

    const deleteButton = screen.getByRole("button", { name: "Delete account" });
    expect(deleteButton).toBeDisabled();

    await userEvent.type(
      screen.getByLabelText("Confirm with your password"),
      "my-password",
    );
    await userEvent.click(deleteButton);
    expect(mockDeleteAccount).not.toHaveBeenCalled();

    await userEvent.click(
      screen.getByRole("button", { name: "Delete permanently" }),
    );

    await waitFor(() => expect(setLoggedOut).toHaveBeenCalled());
    expect(mockDeleteAccount).toHaveBeenCalledWith("my-password", "test-token");
    expect(mockNavigate).toHaveBeenCalledWith("/sign-in");
  });

  it("keeps the user signed in when the deletion password is wrong", async () => {
    mockDeleteAccount.mockRejectedValue({
      type: "VALIDATION_ERROR",
      message: "Password is incorrect.",
      details: { password: "Password is incorrect." },
    });
    renderPage();

    await userEvent.type(
      screen.getByLabelText("Confirm with your password"),
      "wrong",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Delete account" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Delete permanently" }),
    );

    await waitFor(() =>
      expect(screen.getByText("Password is incorrect.")).toBeInTheDocument(),
    );
    expect(setLoggedOut).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
