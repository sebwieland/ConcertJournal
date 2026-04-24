import React from "react";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "./contexts/AuthContext";

test("renders learn react link", () => {
  render(
    <AuthProvider>
      <div data-testid="app-content">Learn React</div>
    </AuthProvider>,
  );

  const linkElement = screen.getByTestId("app-content");
  expect(linkElement).toHaveTextContent(/Learn React/i);
});
