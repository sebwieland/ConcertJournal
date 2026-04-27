import React from "react";
import { render, screen } from "@testing-library/react";
import { AllProviders } from "./tests/utils/test-utils";

test("renders app content within providers", () => {
  render(
    <AllProviders>
      <div data-testid="app-content">Learn React</div>
    </AllProviders>,
  );

  const linkElement = screen.getByTestId("app-content");
  expect(linkElement).toHaveTextContent(/Learn React/i);
});
