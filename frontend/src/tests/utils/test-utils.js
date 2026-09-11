import { jsx as _jsx } from "react/jsx-runtime";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { AuthContext } from "../../contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "react-query";
// Default mock values for AuthContext
export const mockAuthContextValues = {
    token: "test-token",
    isLoading: false,
    isLoggedIn: true,
    setIsLoggedIn: vi.fn(),
    setAccessToken: vi.fn(),
    csrfToken: "test-csrf-token",
    fetchCsrfToken: vi.fn(),
    setLoggedOut: vi.fn(),
    refreshTokenApiCall: vi.fn(),
};
// Create a new QueryClient for each test
const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});
// Wrapper component that provides all necessary providers for tests
export const AllProviders = ({ children, authContextValues = {}, queryClient = createTestQueryClient(), }) => {
    const mergedAuthValues = { ...mockAuthContextValues, ...authContextValues };
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsx(AuthContext.Provider, { value: mergedAuthValues, children: _jsx(BrowserRouter, { children: _jsx(LocalizationProvider, { dateAdapter: AdapterDayjs, children: children }) }) }) }));
};
// Custom render function that includes all providers
export function renderWithProviders(ui, options) {
    const { authContextValues, queryClient = createTestQueryClient(), ...renderOptions } = options || {};
    return render(ui, {
        wrapper: (props) => (_jsx(AllProviders, { ...props, authContextValues: authContextValues, queryClient: queryClient })),
        ...renderOptions,
    });
}
// Export everything from testing-library
export * from "@testing-library/react";
export { renderWithProviders as render };
//# sourceMappingURL=test-utils.js.map