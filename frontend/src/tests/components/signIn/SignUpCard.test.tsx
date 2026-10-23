import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import SignUpCard from "../../../components/signIn/SignUpCard";
import { renderWithProviders } from "../../utils/test-utils";

const baseProps = {
  username: "",
  setUsername: vi.fn(),
  password: "",
  setPassword: vi.fn(),
  email: "",
  setEmail: vi.fn(),
  firstName: "",
  setFirstName: vi.fn(),
  lastName: "",
  setLastName: vi.fn(),
  handleSignUp: vi.fn(),
  isLoading: false,
};

describe("SignUpCard", () => {
  it("shows the password rule as a neutral hint while typing", () => {
    renderWithProviders(<SignUpCard {...baseProps} password="abc" />);

    const passwordInput = screen.getByLabelText("Password");
    expect(screen.getByText("At least 6 characters")).toBeInTheDocument();
    expect(passwordInput).not.toHaveAttribute("aria-invalid", "true");
  });

  it("flags a too-short password only after the field is left", () => {
    renderWithProviders(<SignUpCard {...baseProps} password="abc" />);

    const passwordInput = screen.getByLabelText("Password");
    fireEvent.blur(passwordInput);

    expect(passwordInput).toHaveAttribute("aria-invalid", "true");
  });

  it("flags an invalid email only after the field is left", () => {
    renderWithProviders(<SignUpCard {...baseProps} email="a@b" />);

    expect(
      screen.queryByText("Please enter a valid email address."),
    ).not.toBeInTheDocument();
    fireEvent.blur(screen.getByLabelText("Email"));
    expect(
      screen.getByText("Please enter a valid email address."),
    ).toBeInTheDocument();
  });

  it("shows the registration error inside the card", () => {
    renderWithProviders(
      <SignUpCard
        {...baseProps}
        errorMessage="An account with this email already exists."
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "An account with this email already exists.",
    );
  });
});
