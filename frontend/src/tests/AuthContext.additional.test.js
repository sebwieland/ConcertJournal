import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { AuthContext } from "../contexts/AuthContext";
// Create a simplified test component
const TestAuthConsumer = () => {
    const authContext = React.useContext(AuthContext);
    if (!authContext) {
        return _jsx("div", { children: "No AuthContext provided" });
    }
    return (_jsxs("div", { children: [_jsx("div", { "data-testid": "is-logged-in", children: authContext.isLoggedIn.toString() }), _jsx("div", { "data-testid": "is-loading", children: authContext.isLoading.toString() }), _jsx("div", { "data-testid": "token", children: authContext.token }), _jsx("div", { "data-testid": "csrf-token", children: authContext.csrfToken })] }));
};
// Create a mock AuthContext provider for testing
const MockAuthProvider = ({ isLoggedIn = false, isLoading = false, token = "", csrfToken = "", children, }) => {
    const mockAuthContext = {
        isLoggedIn,
        isLoading,
        token,
        csrfToken,
        setIsLoggedIn: vi.fn(),
        setAccessToken: vi.fn(),
        fetchCsrfToken: vi.fn(),
        setLoggedOut: vi.fn(),
        refreshTokenApiCall: vi.fn(),
    };
    return (_jsx(AuthContext.Provider, { value: mockAuthContext, children: children }));
};
describe("AuthContext Additional Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it("renders with default values", () => {
        render(_jsx(MockAuthProvider, { children: _jsx(TestAuthConsumer, {}) }));
        expect(screen.getByTestId("is-logged-in").textContent).toBe("false");
        expect(screen.getByTestId("is-loading").textContent).toBe("false");
        expect(screen.getByTestId("token").textContent).toBe("");
        expect(screen.getByTestId("csrf-token").textContent).toBe("");
    });
    it("renders with logged in state", () => {
        render(_jsx(MockAuthProvider, { isLoggedIn: true, token: "test-token", csrfToken: "test-csrf-token", children: _jsx(TestAuthConsumer, {}) }));
        expect(screen.getByTestId("is-logged-in").textContent).toBe("true");
        expect(screen.getByTestId("token").textContent).toBe("test-token");
        expect(screen.getByTestId("csrf-token").textContent).toBe("test-csrf-token");
    });
    it("renders with loading state", () => {
        render(_jsx(MockAuthProvider, { isLoading: true, children: _jsx(TestAuthConsumer, {}) }));
        expect(screen.getByTestId("is-loading").textContent).toBe("true");
    });
    it("handles missing context gracefully", () => {
        // Render without a provider to test the null case
        render(_jsx(TestAuthConsumer, {}));
        expect(screen.getByText("No AuthContext provided")).toBeInTheDocument();
    });
});
//# sourceMappingURL=AuthContext.additional.test.js.map