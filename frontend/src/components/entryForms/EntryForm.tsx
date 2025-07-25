import React, { useEffect, useState } from 'react';
import { ConcertEvent, CreateEventData, UpdateEventData } from '../../types/events';
import { Alert, Autocomplete, Container, TextField, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import DefaultLayout from "../../theme/DefaultLayout";
import { useNavigate } from "react-router-dom";
import { mbApi } from "../../api/musicBrainzApi";
import { handleApiError } from '../../api/apiErrors';
import { Rating } from "@mui/material";

declare module 'musicbrainz-api' {
    interface IArtist {
        tags?: Array<{
            count: number;
            name: string;
        }>;
    }

    interface IArtistMatch extends IArtist {
    }
}

interface EntryFormProps {
    onSubmit: (data: CreateEventData | UpdateEventData) => Promise<void>;
    bandName: string;
    setBandName: (bandName: string) => void;
    place: string;
    setPlace: (place: string) => void;
    date: string | number[];
    setDate: (date: dayjs.Dayjs) => void;
    rating: number;
    setRating: (rating: number) => void;
    comment: string;
    setComment: (comment: string) => void;
    message: string;
    isSuccess: boolean;
    data: ConcertEvent[];
    isUpdate?: boolean;
    showArtistDetailsButton?: boolean;
}

interface ArtistTag {
    count: number;
    name: string;
}

interface ArtistDetails {
    type?: string;
    genre?: string;
    formationYear?: string;
    country?: string;
    tags?: ArtistTag[];
}

async function queryArtistSuggestions(artist: string) {
    const artistsQueryResult = await mbApi.search("artist", { query: artist, limit: 5 });
    return artistsQueryResult.artists.map(value => value.name);
}

async function fetchArtistDetails(name: string): Promise<ArtistDetails> {
    const result = await mbApi.search("artist", { query: name, limit: 1 });
    const artist = result.artists[0];
    if (!artist) return {};

    const tags = artist.tags ?? [];
    const sortedTags = [...tags].sort((a, b) => b.count - a.count);
    const topGenre = sortedTags[0]?.name;

    return {
        type: artist.type,
        genre: topGenre,
        formationYear: artist["life-span"]?.begin,
        country: artist.country
    };
}

const EntryForm: React.FC<EntryFormProps> = ({
    onSubmit,
    bandName,
    setBandName,
    place,
    setPlace,
    date,
    setDate,
    rating,
    setRating,
    comment,
    setComment,
    message,
    isSuccess,
    data,
    isUpdate,
    showArtistDetailsButton
}) => {
    const [bandSuggestions, setBandSuggestions] = useState<string[]>([]);
    const [bandInputValue, setBandInputValue] = useState('');
    const [placeSuggestions, setPlaceSuggestions] = useState<string[]>([]);
    const [placeInputValue, setPlaceInputValue] = useState('');
    const [artistDetails, setArtistDetails] = useState<ArtistDetails | null>(null);
    const [showArtistDetails, setShowArtistDetails] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!data) return;
            // Get unique local suggestions
            const uniqueLocalNames = Array.from(new Set(
                data.map(event => event.bandName)
                    .filter(name => name.toLowerCase().includes(bandInputValue.toLowerCase()))
            ));

            try {
                // Get API suggestions
                if (bandInputValue !== '') {
                    const apiSuggestions = await queryArtistSuggestions(bandInputValue);

                    // Combine and deduplicate
                    const allSuggestions = [...uniqueLocalNames, ...apiSuggestions];
                    const uniqueSuggestions = Array.from(new Set(allSuggestions));

                    setBandSuggestions(uniqueSuggestions);
                }
            } catch (error) {
                setBandSuggestions(uniqueLocalNames);
                // Removed detailed error logging
                handleApiError(error);
            }
        };

        fetchSuggestions();
    }, [bandInputValue, data]);

    useEffect(() => {
        const fetchSuggestions = () => {
            if (!data) return;
            const uniquePlaces: string[] = Array.from(new Set(data.map((event: ConcertEvent) => event.place)));
            const suggestions: string[] = uniquePlaces.filter(s => s.toLowerCase().includes(placeInputValue.toLowerCase()));
            setPlaceSuggestions(suggestions);
        };
        fetchSuggestions();
    }, [placeInputValue, data]);

    const handleSubmit = async () => {
        await onSubmit({
            bandName: bandName || '',
            place: place || '',
            date: date,
            rating: rating || 0,
            comment: comment || ''
        });
    };

    return (
        <DefaultLayout>
            <Container maxWidth="sm" sx={{ marginTop: "10vh" }} component="form">
                <Typography variant="h4" component="h1" sx={{ mb: 4, textAlign: 'center' }}>
                    {isUpdate ? 'Update Entry' : 'Create New Entry'}
                </Typography>
                
                {/* Band field */}
                <div style={{ marginBottom: '8px' }}>
                    <Autocomplete
                        options={bandSuggestions}
                        value={bandName}
                        onChange={async (event, newValue) => {
                            setBandName(newValue ?? '');
                            setShowArtistDetails(false);
                            if (newValue) {
                                try {
                                    const details = await fetchArtistDetails(newValue);
                                    setArtistDetails(details);
                                } catch (error) {
                                    setArtistDetails(null);
                                    // Removed detailed error logging
                                    handleApiError(error);
                                }
                            }
                        }}
                        inputValue={bandInputValue}
                        onInputChange={(event, newInputValue) => {
                            setBandInputValue(newInputValue);
                            setBandName(newInputValue);
                        }}
                        autoComplete
                        freeSolo
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Band"
                                variant="outlined"
                                fullWidth
                            />
                        )}
                    />
                </div>
                
                {/* Show Artist Details button */}
                {showArtistDetailsButton && (
                    <div style={{ marginBottom: '16px' }}>
                        <Button
                            size="small"
                            onClick={() => setShowArtistDetails(!showArtistDetails)}
                        >
                            {showArtistDetails ? 'HIDE ARTIST DETAILS' : 'SHOW ARTIST DETAILS'}
                        </Button>
                    </div>
                )}
                
                {/* Artist Details display */}
                {artistDetails && showArtistDetails && (
                    <div style={{ marginBottom: '16px', padding: '16px', border: '1px solid #ddd', borderRadius: '4px' }}>
                        <Typography variant="body2">Type: {artistDetails.type || 'Unknown'}</Typography>
                        <Typography variant="body2">Genre: {artistDetails.genre || 'Unknown'}</Typography>
                        <Typography variant="body2">Formed: {artistDetails.formationYear || 'Unknown'}</Typography>
                        <Typography variant="body2">Country: {artistDetails.country || 'Unknown'}</Typography>
                    </div>
                )}
                
                {/* Place field */}
                <div style={{ marginBottom: '8px' }}>
                    <Autocomplete
                        options={placeSuggestions}
                        value={place}
                        onChange={(event, newValue) => setPlace(newValue ?? '')}
                        inputValue={placeInputValue}
                        onInputChange={(event, newInputValue) => {
                            setPlaceInputValue(newInputValue);
                            setPlace(newInputValue);
                        }}
                        autoComplete
                        freeSolo
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Place"
                                variant="outlined"
                                fullWidth
                            />
                        )}
                    />
                </div>
                
                {/* Rating stars */}
                <div style={{ width: '100%', textAlign: 'center', marginBottom: '16px' }}>
                    <Rating
                        name="Rating"
                        value={rating}
                        onChange={(event, newValue) => {
                            setRating(newValue ?? 0);
                        }}
                    />
                </div>
                
                {/* Comment field */}
                <div style={{ marginBottom: '16px' }}>
                    <TextField
                        label="Comment"
                        variant="outlined"
                        fullWidth
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                    />
                </div>
                
                {/* Date picker */}
                <div style={{ marginBottom: '16px' }}>
                    <DatePicker
                        label="Date"
                        value={(() => {
                            try {
                                // Handle undefined or null dates
                                if (!date) {
                                    return dayjs(); // Default to current date
                                }
                                
                                if (Array.isArray(date)) {
                                    return dayjs().year(date[0]).month(date[1] - 1).date(date[2]);
                                } else if (typeof date === 'string' &&
                                          date.startsWith('[') &&
                                          date.endsWith(']')) {
                                    // Handle string representation of array
                                    try {
                                        const dateArray = JSON.parse(date);
                                        if (Array.isArray(dateArray) && dateArray.length === 3) {
                                            return dayjs().year(dateArray[0]).month(dateArray[1] - 1).date(dateArray[2]);
                                        }
                                    } catch (error) {
                                        return dayjs(); // Default to current date on parsing error
                                    }
                                } else if (date) {
                                    return dayjs(date);
                                } else {
                                    return dayjs();
                                }
                            } catch (error) {
                                return dayjs(); // Default to current date on error
                            }
                        })()}
                        sx={{ width: '100%' }}
                        onChange={(newValue) => setDate(newValue ? newValue : dayjs())}
                    />
                </div>
                
                {/* Submit button */}
                <div style={{ marginBottom: '16px' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleSubmit}
                    >
                        {isUpdate ? 'UPDATE ENTRY' : 'CREATE NEW ENTRY'}
                    </Button>
                </div>
                
                {/* Go Back button */}
                <div style={{ marginBottom: '16px' }}>
                    <Button
                        variant="contained"
                        color="secondary"
                        fullWidth
                        onClick={() => navigate(-1)}
                    >
                        GO BACK
                    </Button>
                </div>
                
                {/* Alert message */}
                <div style={{ width: '100%' }}>
                    {message &&
                        <Alert
                            severity={isSuccess ? 'success' : 'error'} sx={{ maxWidth: '100%' }}>
                            {message}
                        </Alert>}
                </div>
            </Container>
        </DefaultLayout>
    );
};

export default EntryForm;