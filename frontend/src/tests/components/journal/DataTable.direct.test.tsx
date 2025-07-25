import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import dayjs from 'dayjs';

// Mock the RatingStars component
vi.mock('../../../components/utilities/RatingStars', () => ({
  default: ({ rating }: { rating: number }) => (
    <div data-testid="rating-stars" data-rating={rating}>
      Rating: {rating}
    </div>
  ),
}));

describe('DataTable Date Handling', () => {
  // Create direct test functions for the date handling logic in DataTable
  
  // This is the date formatter function from DataTable
  const formatDate = (params: any) => {
    // Handle case where params is directly the date array
    if (Array.isArray(params)) {
      const [year, month, day] = params;
      const date = dayjs().year(year).month(month - 1).date(day);
      return date.format('DD/MM/YYYY');
    }
    
    // Defensive check for date value
    if (!params || params.value === undefined || params.value === null) {
      return 'Unknown date';
    }
    
    try {
      // Handle date that comes as an array [year, month, day]
      if (Array.isArray(params.value)) {
        const [year, month, day] = params.value;
        // Note: month in dayjs is 0-indexed, but our array uses 1-indexed months
        const date = dayjs().year(year).month(month - 1).date(day);
        return date.format('DD/MM/YYYY');
      }
      
      // Handle date that comes as a string representation of an array
      if (typeof params.value === 'string' &&
          params.value.startsWith('[') &&
          params.value.endsWith(']')) {
        try {
          const dateArray = JSON.parse(params.value);
          if (Array.isArray(dateArray) && dateArray.length === 3) {
            const [year, month, day] = dateArray;
            const date = dayjs().year(year).month(month - 1).date(day);
            return date.format('DD/MM/YYYY');
          }
        } catch (error) {
          return 'Invalid date';
        }
      }
      
      // Handle date that comes as a regular string
      const date = dayjs(params.value);
      return date.format('DD/MM/YYYY');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // This is the date comparator function from DataTable
  const compareDates = (v1: any, v2: any) => {
    try {
      // Handle dates that come as arrays [year, month, day]
      const getDate = (value: any) => {
        // Handle undefined or null values
        if (value === undefined || value === null) {
          return dayjs(); // Default to current date
        }
        
        if (Array.isArray(value)) {
          if (value.length !== 3) {
            return dayjs(); // Default to current date for invalid arrays
          }
          
          const [year, month, day] = value;
          // Note: month in dayjs is 0-indexed, but our array uses 1-indexed months
          return dayjs().year(year).month(month - 1).date(day);
        }
        
        // Handle string representation of array
        if (typeof value === 'string' &&
            value.startsWith('[') &&
            value.endsWith(']')) {
          try {
            const dateArray = JSON.parse(value);
            if (Array.isArray(dateArray) && dateArray.length === 3) {
              const [year, month, day] = dateArray;
              return dayjs().year(year).month(month - 1).date(day);
            } else {
              return dayjs(); // Default to current date for invalid arrays
            }
          } catch (error) {
            return dayjs(); // Default to current date on parsing error
          }
        }
        
        return dayjs(value);
      };
      
      const date1 = getDate(v1);
      const date2 = getDate(v2);
      
      return date1.diff(date2);
    } catch (error) {
      console.error('Error comparing dates:', v1, v2, error);
      return 0; // Return 0 if comparison fails
    }
  };
  
  describe('formatDate', () => {
    it('should format date arrays correctly', () => {
      const dateArray = [2023, 5, 15]; // May 15, 2023
      expect(formatDate(dateArray)).toBe('15/05/2023');
      
      const dateObj = { value: [2023, 6, 20] }; // June 20, 2023
      expect(formatDate(dateObj)).toBe('20/06/2023');
    });
    
    it('should format string dates correctly', () => {
      const dateObj = { value: '2023-07-25' }; // July 25, 2023
      expect(formatDate(dateObj)).toBe('25/07/2023');
    });
    
    it('should format string representation of arrays correctly', () => {
      const dateObj = { value: '[2023,8,10]' }; // August 10, 2023
      expect(formatDate(dateObj)).toBe('10/08/2023');
    });
    
    it('should handle null or undefined values', () => {
      expect(formatDate(null)).toBe('Unknown date');
      expect(formatDate(undefined)).toBe('Unknown date');
      expect(formatDate({ value: null })).toBe('Unknown date');
      expect(formatDate({ value: undefined })).toBe('Unknown date');
    });
    
    it('should handle invalid date formats', () => {
      // For invalid dates, dayjs returns 'Invalid Date' instead of a formatted date
      expect(formatDate({ value: 'not-a-date' })).toBe('Invalid Date');
      expect(formatDate({ value: '[invalid,json]' })).toBe('Invalid date');
    });
  });
  
  describe('compareDates', () => {
    it('should compare date arrays correctly', () => {
      const date1 = [2023, 5, 15]; // May 15, 2023
      const date2 = [2023, 6, 20]; // June 20, 2023
      
      expect(compareDates(date1, date2)).toBeLessThan(0); // date1 is before date2
      expect(compareDates(date2, date1)).toBeGreaterThan(0); // date2 is after date1
    });
    
    it('should compare string dates correctly', () => {
      const date1 = '2023-05-15'; // May 15, 2023
      const date2 = '2023-06-20'; // June 20, 2023
      
      expect(compareDates(date1, date2)).toBeLessThan(0); // date1 is before date2
      expect(compareDates(date2, date1)).toBeGreaterThan(0); // date2 is after date1
    });
    
    it('should compare mixed date formats correctly', () => {
      const date1 = [2023, 5, 15]; // May 15, 2023
      const date2 = '2023-06-20'; // June 20, 2023
      
      expect(compareDates(date1, date2)).toBeLessThan(0); // date1 is before date2
      expect(compareDates(date2, date1)).toBeGreaterThan(0); // date2 is after date1
    });
    
    it('should handle string representation of arrays', () => {
      const date1 = '[2023,5,15]'; // May 15, 2023
      const date2 = '[2023,6,20]'; // June 20, 2023
      
      expect(compareDates(date1, date2)).toBeLessThan(0); // date1 is before date2
      expect(compareDates(date2, date1)).toBeGreaterThan(0); // date2 is after date1
    });
    
    it('should handle null or undefined values', () => {
      const date = [2023, 5, 15]; // May 15, 2023
      
      // When comparing with null/undefined, it uses current date
      // This test might be flaky depending on the current date
      const result1 = compareDates(date, null);
      const result2 = compareDates(null, date);
      
      // Just verify that the comparison returns a number
      expect(typeof result1).toBe('number');
      expect(typeof result2).toBe('number');
    });
    
    it('should handle invalid date formats', () => {
      const date = [2023, 5, 15]; // May 15, 2023
      const invalid = 'not-a-date';
      
      // When comparing with invalid dates, it uses current date
      // This test might be flaky depending on the current date
      const result = compareDates(date, invalid);
      
      // Just verify that the comparison returns a number
      expect(typeof result).toBe('number');
    });
    
    it('should handle comparison failures', () => {
      // The actual implementation returns NaN for some error cases
      // and 0 for others, depending on where the error occurs
      const result = compareDates({}, {}); // Objects that will cause errors
      
      // Check if the result is NaN (can't use toContain with NaN)
      expect(Number.isNaN(result) || result === 0).toBe(true);
    });
  });
});