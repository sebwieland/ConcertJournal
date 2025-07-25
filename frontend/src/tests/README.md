# Testing Guidelines

This document outlines the testing approach and best practices for the Concert Journal App.

## Test Structure

The test suite is organized as follows:

```
src/tests/
├── README.md                 # This file
├── setup.ts                  # Test setup for Jest/Testing Library
├── api/                      # API tests
├── components/               # Component tests
│   ├── entryForms/           # Tests for entry form components
│   ├── journal/              # Tests for journal components
│   ├── signIn/               # Tests for sign-in components
│   └── utilities/            # Tests for utility components
├── hooks/                    # Hook tests
├── theme/                    # Theme tests
└── utils/                    # Test utilities
    ├── test-utils.tsx        # Common test utilities and custom render functions
    ├── test-fixtures.ts      # Test fixtures and mock data
    ├── test-mocks.ts         # Common mock implementations
    └── jsx-mocks.tsx         # JSX mock components
```

## Testing Utilities

### `test-utils.tsx`

Provides common utilities for testing, including:

- `renderWithProviders`: A custom render function that wraps components with all necessary providers
- `AllProviders`: A component that provides all necessary context providers for tests
- Mock context values for AuthContext and ConfigContext

Example usage:

```tsx
import { render, screen } from '../utils/test-utils';
import MyComponent from '../../components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('My Component')).toBeInTheDocument();
  });
});
```

### `test-fixtures.ts`

Provides common test data and fixtures, including:

- `mockEventData`: Mock event data for testing
- `mockUserData`: Mock user data for testing
- `mockLoginData`: Mock login data for testing
- `mockRegistrationData`: Mock registration data for testing
- `mockApiResponses`: Mock API responses for testing
- `mockFunctions`: Common mock functions
- `mockEntryFormProps`: Common props for EntryForm component

### `test-mocks.ts`

Provides common mock implementations, including:

- Mocks for react-router-dom
- Mocks for apiClient
- Mocks for musicBrainzApi
- Mocks for apiErrors
- Functions to reset all mocks
- Functions to set up common mock responses

### `jsx-mocks.tsx`

Provides JSX mock components, including:

- `MockDefaultLayout`: Mock for DefaultLayout component
- `MockRatingStars`: Mock for RatingStars component

## Best Practices

1. **Use the provided utilities**: Use the provided utilities to reduce duplication and ensure consistency.
2. **Test one thing at a time**: Each test should test one specific behavior or aspect of the component.
3. **Use descriptive test names**: Test names should clearly describe what is being tested.
4. **Mock external dependencies**: Mock external dependencies to isolate the component being tested.
5. **Reset mocks between tests**: Use `beforeEach` to reset mocks between tests.
6. **Use test fixtures**: Use test fixtures to provide consistent test data.
7. **Test edge cases**: Test edge cases and error conditions.
8. **Test user interactions**: Test user interactions like clicks, form submissions, etc.
9. **Test accessibility**: Test accessibility features like ARIA attributes, keyboard navigation, etc.
10. **Keep tests simple**: Keep tests simple and focused on the behavior being tested.

## Example Test

```tsx
import { render, screen, fireEvent } from '../utils/test-utils';
import { mockEntryFormProps } from '../utils/test-fixtures';
import EntryForm from '../../components/entryForms/EntryForm';

describe('EntryForm Component', () => {
  it('renders the form with all fields', () => {
    render(<EntryForm {...mockEntryFormProps} />);
    
    expect(screen.getByLabelText(/band/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/place/i)).toBeInTheDocument();
    expect(screen.getAllByText(/date/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/comment/i)).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /1 star/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create new entry/i })).toBeInTheDocument();
  });
});