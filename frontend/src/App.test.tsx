import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider } from './contexts/AuthContext';
import { ConfigProvider } from './contexts/ConfigContext';

test('renders learn react link', async () => {
    // Mock the fetch call to simulate loading the config
    global.fetch = vi.fn(async () =>
        new Response(JSON.stringify({ backendURL: 'http://localhost:8080' }), {
            status: 200,
            headers: { 'Content-type': 'application/json' },
        })
    ) as typeof fetch;

    render(
        <ConfigProvider>
            <AuthProvider>
                <div data-testid="app-content">Learn React</div>
            </AuthProvider>
        </ConfigProvider>
    );

    const linkElement = await screen.findByTestId('app-content');
    expect(linkElement).toHaveTextContent(/Learn React/i);
});

afterEach(() => {
    // Restore the original fetch function after each test
    global.fetch = fetch;
});
