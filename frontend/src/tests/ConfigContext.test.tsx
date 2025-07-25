import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { ConfigProvider } from '../contexts/ConfigContext';
import { ConfigContext } from '../contexts/ConfigContext';
import { handleApiError } from '../api/apiErrors';

const TestComponent = () => {
    const config = React.useContext(ConfigContext);
    if (!config) {
        throw new Error('ConfigContext is not provided');
    }
    return <div data-testid="backend-url">{config.backendURL}</div>;
};

describe('ConfigContext', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        // Mock the fetch call to simulate loading the config
        global.fetch = vi.fn(async () =>
            new Response(JSON.stringify({ backendURL: 'http://localhost:8080' }), {
                status: 200,
                headers: { 'Content-type': 'application/json' },
            })
        ) as typeof fetch;
    });

    afterEach(() => {
        // Restore the original fetch function after each test
        global.fetch = fetch;
    });

    it('should load the config from public/config.json', async () => {
        render(
            <ConfigProvider>
                <TestComponent />
            </ConfigProvider>
        );

        const backendUrlElement = await screen.findByTestId('backend-url');
        expect(backendUrlElement).toHaveTextContent('http://localhost:8080');
    });

    it('should use cached config from localStorage if available', async () => {
        // Cache the config in localStorage
        localStorage.setItem('app_config', JSON.stringify({ backendURL: 'http://localhost:8080' }));

        // Mock the fetch call to fail
        global.fetch = vi.fn(async () =>
            new Response(null, {
                status: 404,
                headers: { 'Content-type': 'application/json' },
            })
        ) as typeof fetch;

        render(
            <ConfigProvider>
                <TestComponent />
            </ConfigProvider>
        );

        const backendUrlElement = await screen.findByTestId('backend-url');
        expect(backendUrlElement).toHaveTextContent('http://localhost:8080');
    });
});