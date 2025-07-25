import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import SortForm from '../../../components/journal/SortForm';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderWithProviders } from '../../utils/test-utils';

describe('SortForm', () => {
  const mockOnSortOrderChange = vi.fn();
  const defaultSortOrder = { column: 'date', order: 'desc' as const };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with the correct initial values', () => {
    renderWithProviders(
      <SortForm 
        sortOrder={defaultSortOrder} 
        onSortOrderChange={mockOnSortOrderChange} 
      />
    );
    
    // Check if the component renders with the correct labels
    expect(screen.getByLabelText('Sort By')).toBeInTheDocument();
    expect(screen.getByText('Order:')).toBeInTheDocument();
    
    // Check if the initial values are set correctly
    // For MUI Select components, we need to check the displayed text instead of value
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Descending')).toBeInTheDocument();
  });

  it('calls onSortOrderChange when column selection changes', async () => {
    renderWithProviders(
      <SortForm 
        sortOrder={defaultSortOrder} 
        onSortOrderChange={mockOnSortOrderChange} 
      />
    );
    
    // Open the column select dropdown
    const columnSelect = screen.getByLabelText('Sort By');
    fireEvent.mouseDown(columnSelect);
    
    // Select a different option
    const bandNameOption = screen.getByText('Band Name');
    fireEvent.click(bandNameOption);
    
    // Check if the callback was called with the correct parameters
    expect(mockOnSortOrderChange).toHaveBeenCalledTimes(1);
    expect(mockOnSortOrderChange).toHaveBeenCalledWith({
      column: 'bandName',
      order: 'desc'
    });
  });

  it('calls onSortOrderChange when order selection changes', async () => {
    renderWithProviders(
      <SortForm
        sortOrder={defaultSortOrder}
        onSortOrderChange={mockOnSortOrderChange}
      />
    );
    
    // Use a more specific selector for MUI Select components
    const orderSelect = document.querySelectorAll('.MuiSelect-select')[1];
    fireEvent.mouseDown(orderSelect);
    
    // Select a different option
    const ascendingOption = screen.getByText('Ascending');
    fireEvent.click(ascendingOption);
    
    // Check if the callback was called with the correct parameters
    expect(mockOnSortOrderChange).toHaveBeenCalledTimes(1);
    expect(mockOnSortOrderChange).toHaveBeenCalledWith({
      column: 'date',
      order: 'asc'
    });
  });

  it('renders all available column options', () => {
    renderWithProviders(
      <SortForm
        sortOrder={defaultSortOrder}
        onSortOrderChange={mockOnSortOrderChange}
      />
    );
    
    // Open the column select dropdown
    const columnSelect = screen.getByLabelText('Sort By');
    fireEvent.mouseDown(columnSelect);
    
    // Check if all options are rendered using more specific selectors
    const options = screen.getAllByRole('option');
    
    // Verify all expected options are present
    const optionTexts = options.map(option => option.textContent);
    expect(optionTexts).toContain('Date');
    expect(optionTexts).toContain('Band Name');
    expect(optionTexts).toContain('Place');
    expect(optionTexts).toContain('Rating');
  });

  it('renders both order options', () => {
    renderWithProviders(
      <SortForm
        sortOrder={defaultSortOrder}
        onSortOrderChange={mockOnSortOrderChange}
      />
    );
    
    // Open the order select dropdown using a more specific selector
    const orderSelect = document.querySelectorAll('.MuiSelect-select')[1];
    fireEvent.mouseDown(orderSelect);
    
    // Check if both options are rendered - use getAllByText for elements that appear multiple times
    const ascendingOptions = screen.getAllByText('Ascending');
    const descendingOptions = screen.getAllByText('Descending');
    
    expect(ascendingOptions.length).toBeGreaterThan(0);
    expect(descendingOptions.length).toBeGreaterThan(0);
  });
});