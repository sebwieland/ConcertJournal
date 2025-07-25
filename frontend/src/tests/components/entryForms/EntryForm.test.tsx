import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '../../../tests/utils/test-utils';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import EntryForm from '../../../components/entryForms/EntryForm';
import { mockEntryFormProps } from '../../../tests/utils/test-fixtures';
import { resetAllMocks } from '../../../tests/utils/test-mocks';

describe('EntryForm Component', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  it('renders the form with all fields', async () => {
    await act(async () => {
      render(<EntryForm {...mockEntryFormProps} />);
    });
    
    // Check for form elements
    expect(screen.getByLabelText(/band/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/place/i)).toBeInTheDocument();
    
    // Date field is present - use getAllByText since there might be multiple elements
    expect(screen.getAllByText(/date/i).length).toBeGreaterThan(0);
    
    expect(screen.getByLabelText(/comment/i)).toBeInTheDocument();
    
    // Check for Rating component - MUI Rating uses radio inputs
    expect(screen.getByRole('radio', { name: /1 star/i })).toBeInTheDocument();
    
    // The submit button is "Create New Entry" in the form
    expect(screen.getByRole('button', { name: /create new entry/i })).toBeInTheDocument();
  });

  it('calls the onSubmit function when the form is submitted', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <EntryForm 
        {...mockEntryFormProps} 
        onSubmit={onSubmit}
        bandName="Test Band"
        place="Test Place"
        date={[2023, 5, 15]}
        rating={4}
        comment="Great show"
      />
    );
    
    // Submit the form - the button is "Create New Entry"
    const submitButton = screen.getByRole('button', { name: /create new entry/i });
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    // Check if onSubmit was called
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  it('displays success message when isSuccess is true', async () => {
    await act(async () => {
      render(
        <EntryForm
          {...mockEntryFormProps}
          isSuccess={true}
          message="Successfully saved!"
        />
      );
    });
    
    expect(screen.getByText('Successfully saved!')).toBeInTheDocument();
  });

  it('displays error message when isSuccess is false and message is provided', async () => {
    await act(async () => {
      render(
        <EntryForm
          {...mockEntryFormProps}
          isSuccess={false}
          message="Error saving data"
        />
      );
    });
    
    expect(screen.getByText('Error saving data')).toBeInTheDocument();
  });

  it('updates band name when input changes', async () => {
    const setBandName = vi.fn();
    render(
      <EntryForm 
        {...mockEntryFormProps} 
        setBandName={setBandName}
      />
    );
    
    const bandNameInput = screen.getByLabelText(/band/i);
    await act(async () => {
      fireEvent.change(bandNameInput, { target: { value: 'New Band Name' } });
    });
    
    expect(setBandName).toHaveBeenCalledWith('New Band Name');
  });

  it('updates place when input changes', async () => {
    const setPlace = vi.fn();
    render(
      <EntryForm 
        {...mockEntryFormProps} 
        setPlace={setPlace}
      />
    );
    
    const placeInput = screen.getByLabelText(/place/i);
    await act(async () => {
      fireEvent.change(placeInput, { target: { value: 'New Place' } });
    });
    
    expect(setPlace).toHaveBeenCalledWith('New Place');
  });

  it('updates comment when input changes', async () => {
    const setComment = vi.fn();
    render(
      <EntryForm 
        {...mockEntryFormProps} 
        setComment={setComment}
      />
    );
    
    const commentInput = screen.getByLabelText(/comment/i);
    await act(async () => {
      fireEvent.change(commentInput, { target: { value: 'New Comment' } });
    });
    
    expect(setComment).toHaveBeenCalledWith('New Comment');
  });

  it('updates rating when rating changes', async () => {
    const setRating = vi.fn();
    render(
      <EntryForm 
        {...mockEntryFormProps} 
        setRating={setRating}
      />
    );
    
    // Find the rating component and simulate a rating change
    const ratingElement = screen.getByLabelText('3 Stars');
    await act(async () => {
      fireEvent.click(ratingElement);
    });
    
    expect(setRating).toHaveBeenCalledWith(3);
  });

  it('shows artist details button when showArtistDetailsButton is true', async () => {
    await act(async () => {
      render(
        <EntryForm
          {...mockEntryFormProps}
          showArtistDetailsButton={true}
          bandName="Test Band"
        />
      );
    });
    
    expect(screen.getByRole('button', { name: /artist details/i })).toBeInTheDocument();
  });

  it('does not show artist details button when showArtistDetailsButton is false', async () => {
    await act(async () => {
      render(
        <EntryForm
          {...mockEntryFormProps}
          showArtistDetailsButton={false}
          bandName="Test Band"
        />
      );
    });
    
    expect(screen.queryByRole('button', { name: /artist details/i })).not.toBeInTheDocument();
  });

  it('shows artist details button when bandName is provided', async () => {
    await act(async () => {
      render(
        <EntryForm
          {...mockEntryFormProps}
          bandName="Test Artist"
          showArtistDetailsButton={true}
        />
      );
    });
    
    // Verify the button is present
    expect(screen.getByRole('button', { name: /artist details/i })).toBeInTheDocument();
  });
});