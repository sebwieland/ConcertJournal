import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "./contexts/AuthContext";
test("renders learn react link", () => {
    render(_jsx(AuthProvider, { children: _jsx("div", { "data-testid": "app-content", children: "Learn React" }) }));
    const linkElement = screen.getByTestId("app-content");
    expect(linkElement).toHaveTextContent(/Learn React/i);
});
//# sourceMappingURL=App.test.js.map