import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from "react";
import { sortData } from "../../utils/SortData";
import { TextField, Button, Box, Card, CardContent, Typography, InputAdornment, IconButton, useTheme, useMediaQuery, } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import RatingStars from "../utilities/RatingStars";
import { SwipeableList } from "react-swipeable-list";
import "react-swipeable-list/dist/styles.css";
import { leadingActions, StyledSwipeableListItem, trailingActions, } from "./SwipeableListItem";
const SearchComponent = ({ data, onEdit, onDelete, }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    // Memoize the search function to avoid unnecessary re-renders
    const performSearch = useCallback((searchText, sourceData) => {
        // Log for debugging (development only)
        if (process.env.NODE_ENV === "development") {
            console.log("Performing search");
            console.log("Search term:", searchText);
            console.log("Available data:", sourceData);
        }
        if (!searchText.trim()) {
            setSearchResults([]);
            setHasSearched(false);
            return;
        }
        const term = searchText.toLowerCase();
        // Handle case where data might be undefined or empty
        if (!sourceData || sourceData.length === 0) {
            if (process.env.NODE_ENV === "development") {
                console.log("No data available for search");
            }
            setSearchResults([]);
            setHasSearched(true);
            return;
        }
        try {
            const results = sourceData.filter((event) => {
                // Add null checks to prevent errors
                const bandName = event.bandName?.toLowerCase() || "";
                const place = event.place?.toLowerCase() || "";
                const comment = event.comment?.toLowerCase() || "";
                return (bandName.includes(term) ||
                    place.includes(term) ||
                    comment.includes(term));
            });
            if (process.env.NODE_ENV === "development") {
                console.log("Search results:", results);
            }
            // Sort the results by date in descending order (newest first)
            const sortedResults = sortData(results, "date", "desc");
            setSearchResults(sortedResults);
            setHasSearched(true);
        }
        catch (error) {
            console.error("Error during search:", error);
            setSearchResults([]);
            setHasSearched(true);
        }
    }, []);
    // Re-run search when data changes (e.g., after deletion)
    useEffect(() => {
        if (hasSearched && searchTerm.trim()) {
            if (process.env.NODE_ENV === "development") {
                console.log("Data changed, refreshing search results");
            }
            performSearch(searchTerm, data);
        }
    }, [data, hasSearched, searchTerm, performSearch]);
    const handleSearch = () => {
        performSearch(searchTerm, data);
    };
    const handleClear = () => {
        setSearchTerm("");
        setSearchResults([]);
        setHasSearched(false);
    };
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            if (process.env.NODE_ENV === "development") {
                console.log("Enter key pressed");
            }
            handleSearch();
        }
    };
    const formatDate = (date) => {
        try {
            if (Array.isArray(date)) {
                const [year, month, day] = date;
                return new Date(year, month - 1, day).toLocaleDateString();
            }
            else if (typeof date === "string" &&
                date.startsWith("[") &&
                date.endsWith("]")) {
                try {
                    const dateArray = JSON.parse(date);
                    if (Array.isArray(dateArray) && dateArray.length === 3) {
                        return new Date(dateArray[0], dateArray[1] - 1, dateArray[2]).toLocaleDateString();
                    }
                }
                catch (error) {
                    return "Invalid date format";
                }
            }
            else if (date) {
                return new Date(date).toLocaleDateString();
            }
            else {
                return "No date";
            }
        }
        catch (error) {
            return "Invalid date";
        }
    };
    return (_jsxs(Box, { sx: { width: "100%", mb: 4 }, "data-testid": "search-component", children: [_jsxs(Box, { sx: { display: "flex", mb: 2 }, children: [_jsx(TextField, { fullWidth: true, variant: "outlined", placeholder: "Search for bands, locations, comments...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), onKeyDown: handleKeyDown, "data-testid": "search-input", InputProps: {
                            startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(SearchIcon, {}) })),
                            endAdornment: searchTerm && (_jsx(InputAdornment, { position: "end", children: _jsx(IconButton, { onClick: handleClear, edge: "end", children: _jsx(ClearIcon, {}) }) })),
                        } }), _jsx(Button, { variant: "contained", color: "primary", onClick: handleSearch, "data-testid": "search-button", sx: {
                            ml: 1,
                            px: 3,
                            fontWeight: "bold",
                            "&:hover": {
                                backgroundColor: "primary.dark",
                                transform: "scale(1.05)",
                                transition: "all 0.2s",
                            },
                        }, startIcon: _jsx(SearchIcon, {}), children: "Search" })] }), hasSearched && (_jsxs(Box, { children: [_jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: searchResults.length === 0
                            ? "No results found"
                            : `Found ${searchResults.length} result${searchResults.length !== 1 ? "s" : ""}` }), isMobile ? (
                    // Mobile view with swipeable list items
                    _jsx(Box, { style: { width: "100%" }, children: _jsx(SwipeableList, { style: { width: "100%" }, children: searchResults.map((result) => (_jsx(StyledSwipeableListItem, { leadingActions: onDelete ? leadingActions(onDelete, result.id) : undefined, trailingActions: onEdit ? trailingActions(onEdit, result.id) : undefined, children: _jsx(Card, { sx: {
                                        width: "100%",
                                        height: "100%",
                                        marginBottom: theme.spacing(1),
                                    }, children: _jsxs(CardContent, { sx: { height: "100%" }, children: [_jsx(Typography, { variant: "h5", component: "div", children: result.bandName }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: result.place }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: formatDate(result.date) }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: result.comment }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: _jsx(RatingStars, { rating: result.rating }) })] }) }) }, result.id))) }) })) : (
                    // Desktop view with grid layout
                    _jsx(Box, { sx: { display: "flex", flexWrap: "wrap", gap: 2 }, children: searchResults.map((result) => (_jsx(Box, { sx: { width: { xs: "100%", sm: "45%", md: "30%" } }, children: _jsx(Card, { sx: { height: "100%" }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h5", component: "div", children: result.bandName }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: result.place }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: formatDate(result.date) }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: result.comment }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: _jsx(RatingStars, { rating: result.rating }) })] }) }) }, result.id))) }))] }))] }));
};
export default SearchComponent;
//# sourceMappingURL=SearchComponent.js.map