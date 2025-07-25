import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AuthContext } from '../../contexts/AuthContext';
import { ConfigContext } from '../../contexts/ConfigContext';
import { QueryClient, QueryClientProvider } from 'react-query';

// Default mock values for AuthContext
export const mockAuthContextValues = {
  token: 'test-token',
  isLoading: false,
  isLoggedIn: true,
  setIsLoggedIn: vi.fn(),
  setAccessToken: vi.fn(),
  csrfToken: 'test-csrf-token',
  fetchCsrfToken: vi.fn(),
  setLoggedOut: vi.fn(),
  refreshTokenApiCall: vi.fn(),
};

// Default mock values for ConfigContext
export const mockConfigContextValues = {
  backendURL: 'http://localhost:8080',
};

// Create a new QueryClient for each test
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Interface for the AllProviders props
interface AllProvidersProps {
  children: React.ReactNode;
  authContextValues?: Partial<typeof mockAuthContextValues>;
  configContextValues?: Partial<typeof mockConfigContextValues>;
  queryClient?: QueryClient;
}

// Wrapper component that provides all necessary providers for tests
export const AllProviders = ({
  children,
  authContextValues = {},
  configContextValues = {},
  queryClient = createTestQueryClient(),
}: AllProvidersProps) => {
  const mergedAuthValues = { ...mockAuthContextValues, ...authContextValues };
  const mergedConfigValues = { ...mockConfigContextValues, ...configContextValues };

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigContext.Provider value={mergedConfigValues}>
        <AuthContext.Provider value={mergedAuthValues}>
          <BrowserRouter>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              {children}
            </LocalizationProvider>
          </BrowserRouter>
        </AuthContext.Provider>
      </ConfigContext.Provider>
    </QueryClientProvider>
  );
};

// Custom render function that includes all providers
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    authContextValues?: Partial<typeof mockAuthContextValues>;
    configContextValues?: Partial<typeof mockConfigContextValues>;
    queryClient?: QueryClient;
  }
) {
  const { 
    authContextValues, 
    configContextValues, 
    queryClient = createTestQueryClient(),
    ...renderOptions 
  } = options || {};
  
  return render(ui, {
    wrapper: (props) => (
      <AllProviders
        {...props}
        authContextValues={authContextValues}
        configContextValues={configContextValues}
        queryClient={queryClient}
      />
    ),
    ...renderOptions,
  });
}

// Export everything from testing-library
export * from '@testing-library/react';
export { renderWithProviders as render };