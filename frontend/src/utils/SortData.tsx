import dayjs from 'dayjs';

/**
 * General utility function to sort data by various criteria
 */
export const sortData = (data: any[], sortCriteria: string, sortOrder: 'asc' | 'desc') => {
    if (!data || data.length === 0) {
        return [];
    }

    return [...data].sort((a, b) => {
        let comparison = 0;

        switch (sortCriteria) {
            case 'date':
                // Handle different date formats
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
                
                const date1 = getDate(a.date);
                const date2 = getDate(b.date);
                
                comparison = date1.diff(date2);
                break;
                
            case 'bandName':
                comparison = (a.bandName || '').localeCompare(b.bandName || '');
                break;
                
            case 'place':
                comparison = (a.place || '').localeCompare(b.place || '');
                break;
                
            case 'rating':
                comparison = (a.rating || 0) - (b.rating || 0);
                break;
                
            default:
                comparison = 0;
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
    });
};