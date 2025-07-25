import { renderHook, act } from '@testing-library/react';
import useTheme from '../../theme/useTheme';
import { createTheme } from '@mui/material/styles';
import getTheme from '../../theme/getTheme';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

// Mock matchMedia
const mockMatchMedia = (matches: boolean) => {
  return (query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });
};

describe('useTheme', () => {
  // Save original implementations
  const originalLocalStorage = global.localStorage;
  const originalMatchMedia = window.matchMedia;
  
  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
    mockLocalStorage.clear();
    
    // Mock document.body.classList
    document.body.classList.remove('dark-mode');
    
    // Reset mocks
    vi.clearAllMocks();
  });
  
  afterAll(() => {
    // Restore original implementations
    Object.defineProperty(window, 'localStorage', { value: originalLocalStorage });
    window.matchMedia = originalMatchMedia;
  });
  
  it('initializes with light mode by default', () => {
    // Mock localStorage to return null for themeMode
    mockLocalStorage.clear();
    
    // Mock matchMedia to return false for dark mode preference
    window.matchMedia = mockMatchMedia(false) as any;
    
    const { result } = renderHook(() => useTheme());
    
    expect(result.current.mode).toBe('light');
    
    // Instead of comparing the entire theme object, check specific properties
    const expectedTheme = createTheme(getTheme('light'));
    expect(result.current.theme.palette.mode).toBe(expectedTheme.palette.mode);
  });
  
  it('initializes with dark mode when system prefers dark mode', () => {
    // Mock localStorage to return null for themeMode
    mockLocalStorage.clear();
    
    // Mock matchMedia to return true for dark mode preference
    window.matchMedia = mockMatchMedia(true) as any;
    
    const { result } = renderHook(() => useTheme());
    
    // Wait for the useEffect to run
    act(() => {
      // Force the useEffect to run
    });
    
    expect(result.current.mode).toBe('dark');
    
    // Instead of comparing the entire theme object, check specific properties
    const expectedTheme = createTheme(getTheme('dark'));
    expect(result.current.theme.palette.mode).toBe(expectedTheme.palette.mode);
  });
  
  it('initializes with mode from localStorage if available', () => {
    // Set dark mode in localStorage
    mockLocalStorage.setItem('themeMode', 'dark');
    
    // Mock matchMedia to return false for dark mode preference
    window.matchMedia = mockMatchMedia(false) as any;
    
    const { result } = renderHook(() => useTheme());
    
    expect(result.current.mode).toBe('dark');
    
    // Instead of comparing the entire theme object, check specific properties
    const expectedTheme = createTheme(getTheme('dark'));
    expect(result.current.theme.palette.mode).toBe(expectedTheme.palette.mode);
  });
  
  it('toggles between light and dark mode', () => {
    // Start with light mode
    mockLocalStorage.setItem('themeMode', 'light');
    
    const { result } = renderHook(() => useTheme());
    
    // Initial state should be light
    expect(result.current.mode).toBe('light');
    
    // Toggle to dark mode
    act(() => {
      result.current.toggleColorMode();
    });
    
    // Should now be dark mode
    expect(result.current.mode).toBe('dark');
    
    // Instead of comparing the entire theme object, check specific properties
    const expectedTheme = createTheme(getTheme('dark'));
    expect(result.current.theme.palette.mode).toBe(expectedTheme.palette.mode);
    expect(mockLocalStorage.getItem('themeMode')).toBe('dark');
    
    // Toggle back to light mode
    act(() => {
      result.current.toggleColorMode();
    });

    // Should now be light mode again
    expect(result.current.mode).toBe('light');
    
    // Instead of comparing the entire theme object, check specific properties
    const expectedLightTheme = createTheme(getTheme('light'));
    expect(result.current.theme.palette.mode).toBe(expectedLightTheme.palette.mode);
    expect(mockLocalStorage.getItem('themeMode')).toBe('light');
  });
  
  it('adds dark-mode class to body when in dark mode', () => {
    // Start with dark mode
    mockLocalStorage.setItem('themeMode', 'dark');
    
    renderHook(() => useTheme());
    
    // Check if dark-mode class is added to body
    expect(document.body.classList.contains('dark-mode')).toBe(true);
  });
  
  it('removes dark-mode class from body when in light mode', () => {
    // Start with light mode
    mockLocalStorage.setItem('themeMode', 'light');
    
    // Add dark-mode class to body
    document.body.classList.add('dark-mode');
    
    renderHook(() => useTheme());
    
    // Check if dark-mode class is removed from body
    expect(document.body.classList.contains('dark-mode')).toBe(false);
  });
  
  it('handles localStorage errors gracefully', () => {
    // Mock localStorage.setItem to throw an error
    const originalSetItem = mockLocalStorage.setItem;
    mockLocalStorage.setItem = vi.fn().mockImplementation(() => {
      throw new Error('localStorage is not available');
    });
    
    // Mock console.error
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    // Start with light mode
    const { result } = renderHook(() => useTheme());
    
    // Toggle mode should not throw an error
    act(() => {
      result.current.toggleColorMode();
    });
       
    // Restore mocks
    mockLocalStorage.setItem = originalSetItem;
    console.error = originalConsoleError;
  });
});