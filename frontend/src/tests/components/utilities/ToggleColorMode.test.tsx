import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ToggleColorMode from '../../../components/utilities/ToggleColorMode';

describe('ToggleColorMode Component', () => {
  it('renders sun icon in dark mode', () => {
    const mockToggleColorMode = vi.fn();
    
    render(
      <ToggleColorMode 
        mode="dark" 
        toggleColorMode={mockToggleColorMode} 
      />
    );
    
    // In dark mode, it should show the sun icon
    const sunIcon = document.querySelector('svg[data-testid="WbSunnyRoundedIcon"]');
    expect(sunIcon).toBeInTheDocument();
    
    // And should not show the moon icon
    const moonIcon = document.querySelector('svg[data-testid="ModeNightRoundedIcon"]');
    expect(moonIcon).not.toBeInTheDocument();
  });

  it('renders moon icon in light mode', () => {
    const mockToggleColorMode = vi.fn();
    
    render(
      <ToggleColorMode 
        mode="light" 
        toggleColorMode={mockToggleColorMode} 
      />
    );
    
    // In light mode, it should show the moon icon
    const moonIcon = document.querySelector('svg[data-testid="ModeNightRoundedIcon"]');
    expect(moonIcon).toBeInTheDocument();
    
    // And should not show the sun icon
    const sunIcon = document.querySelector('svg[data-testid="WbSunnyRoundedIcon"]');
    expect(sunIcon).not.toBeInTheDocument();
  });

  it('calls toggleColorMode when clicked', () => {
    const mockToggleColorMode = vi.fn();
    
    render(
      <ToggleColorMode 
        mode="light" 
        toggleColorMode={mockToggleColorMode} 
      />
    );
    
    const button = screen.getByRole('button', { name: 'Theme toggle button' });
    fireEvent.click(button);
    
    expect(mockToggleColorMode).toHaveBeenCalledTimes(1);
  });

  it('passes additional props to the IconButton', () => {
    const mockToggleColorMode = vi.fn();
    const testId = 'test-toggle-button';
    
    render(
      <ToggleColorMode 
        mode="light" 
        toggleColorMode={mockToggleColorMode} 
        data-testid={testId}
      />
    );
    
    const button = screen.getByTestId(testId);
    expect(button).toBeInTheDocument();
  });
});