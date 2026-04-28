import { parseEventDate } from "./dateUtils";
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
        const date = parseEventDate(item.date);
        const dateString = date.format('YYYY-MM-DD');
        bandCount[item.bandName] = (bandCount[item.bandName] || 0) + 1;
        locationCount[item.place] = (locationCount[item.place] || 0) + 1;
        dailyBandCount[dateString] = (dailyBandCount[dateString] || 0) + 1;
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

