import React from 'react';
import { vi } from 'vitest';

// Mock the DefaultLayout component
export const MockDefaultLayout = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="default-layout">{children}</div>
);

// Mock the RatingStars component
export const MockRatingStars = ({ rating }: { rating: number }) => (
  <div data-testid="rating-stars" data-rating={rating}>
    Rating: {rating}
  </div>
);

// Setup JSX mocks
export const setupJsxMocks = () => {
  vi.mock('../../theme/DefaultLayout', () => ({
    default: MockDefaultLayout
  }));

  vi.mock('../../components/utilities/RatingStars', () => ({
    default: MockRatingStars
  }));
};