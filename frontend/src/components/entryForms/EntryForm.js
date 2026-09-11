import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Alert, Autocomplete, Container, TextField, Typography, } from "@mui/material";
import Button from "@mui/material/Button";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import DefaultLayout from "../../theme/DefaultLayout";
import { useNavigate } from "react-router-dom";
import { mbApi } from "../../api/musicBrainzApi";
import { handleApiError } from "../../api/apiErrors";
import { Rating } from "@mui/material";
async function queryArtistSuggestions(artist) {
    const artistsQueryResult = await mbApi.search("artist", {
        query: artist,
        limit: 5,
    });
    return artistsQueryResult.artists.map((value) => value.name);
}
async function fetchArtistDetails(name) {
    const result = await mbApi.search("artist", { query: name, limit: 1 });
    const artist = result.artists[0];
    if (!artist)
        return {};
    const tags = artist.tags ?? [];
    const sortedTags = [...tags].sort((a, b) => b.count - a.count);
    const topGenre = sortedTags[0]?.name;
    return {
        type: artist.type,
        genre: topGenre,
        formationYear: artist["life-span"]?.begin,
        country: artist.country,
    };
}
const EntryForm = ({ onSubmit, bandName, setBandName, place, setPlace, date, setDate, rating, setRating, comment, setComment, message, isSuccess, data, isUpdate, showArtistDetailsButton, }) => {
    const [bandSuggestions, setBandSuggestions] = useState([]);
    const [bandInputValue, setBandInputValue] = useState("");
    const [placeSuggestions, setPlaceSuggestions] = useState([]);
    const [placeInputValue, setPlaceInputValue] = useState("");
    const [artistDetails, setArtistDetails] = useState(null);
    const [showArtistDetails, setShowArtistDetails] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!data)
                return;
            // Get unique local suggestions
            const uniqueLocalNames = Array.from(new Set(data
                .map((event) => event.bandName)
                .filter((name) => name.toLowerCase().includes(bandInputValue.toLowerCase()))));
            try {
                // Get API suggestions
                if (bandInputValue !== "") {
                    const apiSuggestions = await queryArtistSuggestions(bandInputValue);
                    // Combine and deduplicate
                    const allSuggestions = [...uniqueLocalNames, ...apiSuggestions];
                    const uniqueSuggestions = Array.from(new Set(allSuggestions));
                    setBandSuggestions(uniqueSuggestions);
                }
            }
            catch (error) {
                setBandSuggestions(uniqueLocalNames);
                // Removed detailed error logging
                handleApiError(error);
            }
        };
        fetchSuggestions();
    }, [bandInputValue, data]);
    useEffect(() => {
        const fetchSuggestions = () => {
            if (!data)
                return;
            const uniquePlaces = Array.from(new Set(data.map((event) => event.place)));
            const suggestions = uniquePlaces.filter((s) => s.toLowerCase().includes(placeInputValue.toLowerCase()));
            setPlaceSuggestions(suggestions);
        };
        fetchSuggestions();
    }, [placeInputValue, data]);
    const handleSubmit = async () => {
        await onSubmit({
            bandName: bandName || "",
            place: place || "",
            date: date,
            rating: rating || 0,
            comment: comment || "",
        });
    };
    return (_jsx(DefaultLayout, { children: _jsxs(Container, { maxWidth: "sm", sx: { marginTop: "10vh" }, component: "form", children: [_jsx(Typography, { variant: "h4", component: "h1", sx: { mb: 4, textAlign: "center" }, children: isUpdate ? "Update Entry" : "Create New Entry" }), _jsx("div", { style: { marginBottom: "8px" }, children: _jsx(Autocomplete, { options: bandSuggestions, value: bandName, onChange: async (event, newValue) => {
                            setBandName(newValue ?? "");
                            setShowArtistDetails(false);
                            if (newValue) {
                                try {
                                    const details = await fetchArtistDetails(newValue);
                                    setArtistDetails(details);
                                }
                                catch (error) {
                                    setArtistDetails(null);
                                    // Removed detailed error logging
                                    handleApiError(error);
                                }
                            }
                        }, inputValue: bandInputValue, onInputChange: (event, newInputValue) => {
                            setBandInputValue(newInputValue);
                            setBandName(newInputValue);
                        }, autoComplete: true, freeSolo: true, renderInput: (params) => (_jsx(TextField, { ...params, label: "Band", variant: "outlined", fullWidth: true })) }) }), showArtistDetailsButton && (_jsx("div", { style: { marginBottom: "16px" }, children: _jsx(Button, { size: "small", onClick: () => setShowArtistDetails(!showArtistDetails), children: showArtistDetails
                            ? "HIDE ARTIST DETAILS"
                            : "SHOW ARTIST DETAILS" }) })), artistDetails && showArtistDetails && (_jsxs("div", { style: {
                        marginBottom: "16px",
                        padding: "16px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                    }, children: [_jsxs(Typography, { variant: "body2", children: ["Type: ", artistDetails.type || "Unknown"] }), _jsxs(Typography, { variant: "body2", children: ["Genre: ", artistDetails.genre || "Unknown"] }), _jsxs(Typography, { variant: "body2", children: ["Formed: ", artistDetails.formationYear || "Unknown"] }), _jsxs(Typography, { variant: "body2", children: ["Country: ", artistDetails.country || "Unknown"] })] })), _jsx("div", { style: { marginBottom: "8px" }, children: _jsx(Autocomplete, { options: placeSuggestions, value: place, onChange: (event, newValue) => setPlace(newValue ?? ""), inputValue: placeInputValue, onInputChange: (event, newInputValue) => {
                            setPlaceInputValue(newInputValue);
                            setPlace(newInputValue);
                        }, autoComplete: true, freeSolo: true, renderInput: (params) => (_jsx(TextField, { ...params, label: "Place", variant: "outlined", fullWidth: true })) }) }), _jsx("div", { style: { width: "100%", textAlign: "center", marginBottom: "16px" }, children: _jsx(Rating, { name: "Rating", value: rating, onChange: (event, newValue) => {
                            setRating(newValue ?? 0);
                        } }) }), _jsx("div", { style: { marginBottom: "16px" }, children: _jsx(TextField, { label: "Comment", variant: "outlined", fullWidth: true, value: comment, onChange: (event) => setComment(event.target.value) }) }), _jsx("div", { style: { marginBottom: "16px" }, children: _jsx(DatePicker, { label: "Date", value: (() => {
                            try {
                                // Handle undefined or null dates
                                if (!date) {
                                    return dayjs(); // Default to current date
                                }
                                if (Array.isArray(date)) {
                                    return dayjs()
                                        .year(date[0])
                                        .month(date[1] - 1)
                                        .date(date[2]);
                                }
                                else if (typeof date === "string" &&
                                    date.startsWith("[") &&
                                    date.endsWith("]")) {
                                    // Handle string representation of array
                                    try {
                                        const dateArray = JSON.parse(date);
                                        if (Array.isArray(dateArray) && dateArray.length === 3) {
                                            return dayjs()
                                                .year(dateArray[0])
                                                .month(dateArray[1] - 1)
                                                .date(dateArray[2]);
                                        }
                                    }
                                    catch (error) {
                                        return dayjs(); // Default to current date on parsing error
                                    }
                                }
                                else if (date) {
                                    return dayjs(date);
                                }
                                else {
                                    return dayjs();
                                }
                            }
                            catch (error) {
                                return dayjs(); // Default to current date on error
                            }
                        })(), sx: { width: "100%" }, onChange: (newValue) => setDate(newValue ? newValue : dayjs()) }) }), _jsx("div", { style: { marginBottom: "16px" }, children: _jsx(Button, { variant: "contained", color: "primary", fullWidth: true, onClick: handleSubmit, children: isUpdate ? "UPDATE ENTRY" : "CREATE NEW ENTRY" }) }), _jsx("div", { style: { marginBottom: "16px" }, children: _jsx(Button, { variant: "contained", color: "secondary", fullWidth: true, onClick: () => navigate(-1), children: "GO BACK" }) }), _jsx("div", { style: { width: "100%" }, children: message && (_jsx(Alert, { severity: isSuccess ? "success" : "error", sx: { maxWidth: "100%" }, children: message })) })] }) }));
};
export default EntryForm;
//# sourceMappingURL=EntryForm.js.map