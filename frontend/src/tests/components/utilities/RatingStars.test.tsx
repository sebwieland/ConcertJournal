import { screen } from '@testing-library/react';
import RatingStars from '../../../components/utilities/RatingStars';
import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '../../utils/test-utils';

describe('RatingStars Component', () => {
  it('renders the component with correct rating', () => {
    renderWithProviders(<RatingStars rating={3} />);
    
    // Check if the component renders
    const container = screen.getByText('Rating: 3');
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('data-rating', '3');
  });

  it('renders with rating 5', () => {
    renderWithProviders(<RatingStars rating={5} />);
    
    // Check if the component renders with rating 5
    const container = screen.getByText('Rating: 5');
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('data-rating', '5');
  });

  it('renders with rating 0', () => {
    renderWithProviders(<RatingStars rating={0} />);
    
    // Check if the component renders with rating 0
    const container = screen.getByText('Rating: 0');
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('data-rating', '0');
  });

  it('handles decimal ratings correctly', () => {
    renderWithProviders(<RatingStars rating={3.7} />);
    
    // Check if the component renders with decimal rating
    const container = screen.getByText('Rating: 3.7');
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('data-rating', '3.7');
  });
});