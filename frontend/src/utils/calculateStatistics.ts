import dayjs from "dayjs";

interface Statistics {
    totalCount: number;
    mostSeenArtist: string;
    mostArtistsOnASingleDay: number;
    mostVisitedLocation: string;
}

import { ConcertEvent } from '../types/events';

interface Statistics {
    totalCount: number;
    mostSeenArtist: string;
    mostArtistsOnASingleDay: number;
    mostVisitedLocation: string;
}

const calculateStatistics = (entries: ConcertEvent[] = []): Statistics => {
    if (entries.length === 0) {
        return {
            totalCount: 0,
            mostSeenArtist: "",
            mostArtistsOnASingleDay: 0,
            mostVisitedLocation: "",
        };
    }
    const bandCount: { [bandName: string]: number } = {};
    const locationCount: { [location: string]: number } = {};
    const dailyBandCount: { [date: string]: number } = {};

    entries.forEach((item) => {
        try {
            // Handle date that comes as an array [year, month, day]
            let date;
            if (Array.isArray(item.date)) {
                const [year, month, day] = item.date;
                // Note: month in dayjs is 0-indexed, but our array uses 1-indexed months
                date = dayjs().year(year).month(month - 1).date(day);
            } else if (typeof item.date === 'string' &&
                      item.date.startsWith('[') &&
                      item.date.endsWith(']')) {
                // Handle string representation of array
                try {
                    const dateArray = JSON.parse(item.date);
                    if (Array.isArray(dateArray) && dateArray.length === 3) {
                        const [year, month, day] = dateArray;
                        date = dayjs().year(year).month(month - 1).date(day);
                    } else {
                        date = dayjs(item.date);
                    }
                } catch (error) {
                    if (process.env.NODE_ENV === 'development') {
                        console.error('Error parsing string array date in statistics:', item.date, error);
                    }
                    date = dayjs(item.date);
                }
            } else if (item.date) {
                date = dayjs(item.date);
            } else {
                // Skip items without dates
                if (process.env.NODE_ENV === 'development') {
                    console.warn('Item missing date:', item);
                }
                return;
            }
            
            const dateString = date.toISOString().split('T')[0];
            bandCount[item.bandName] = (bandCount[item.bandName] || 0) + 1;
            locationCount[item.place] = (locationCount[item.place] || 0) + 1;
            dailyBandCount[dateString] = (dailyBandCount[dateString] || 0) + 1;
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Error processing date in statistics:', item.date, error);
            }
        }
    });

    const totalCount = entries.length;
    const mostSeenArtist = Object.keys(bandCount).reduce((a, b) => bandCount[a] > bandCount[b] ? a : b);
    const mostVisitedLocation = Object.keys(locationCount).reduce((a, b) => locationCount[a] > locationCount[b] ? a : b);
    const mostArtistsOnASingleDay = Math.max(...Object.values(dailyBandCount));

    return {
        totalCount: totalCount,
        mostSeenArtist: mostSeenArtist,
        mostArtistsOnASingleDay: mostArtistsOnASingleDay,
        mostVisitedLocation: mostVisitedLocation
    };
}

export default calculateStatistics;

