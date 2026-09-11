import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import DefaultLayout from "../../theme/DefaultLayout";
import { useState, useEffect } from "react";
import DataCollector from "./DataCollector";
import DataTable from "./DataTable";
import { ConfirmProvider } from "material-ui-confirm";
import { Card, CardContent, Grid, useMediaQuery, useTheme, Alert, } from "@mui/material";
import Typography from "@mui/material/Typography";
import RatingStars from "../utilities/RatingStars";
import { sortData } from "../../utils/SortData";
import { SwipeableList } from "react-swipeable-list";
import "react-swipeable-list/dist/styles.css";
import SortForm from "./SortForm";
import { leadingActions, StyledSwipeableListItem, trailingActions, } from "./SwipeableListItem";
import useEvents from "../../hooks/useEvents";
import LoadingIndicator from "../utilities/LoadingIndicator";
const Journal = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [sortOrder, setSortOrder] = useState(() => {
        const saved = localStorage.getItem("journalSortOrder");
        return saved ? JSON.parse(saved) : { column: "date", order: "desc" };
    });
    const { error, isLoading } = useEvents();
    useEffect(() => {
        // Component mounted
        return () => {
            // Component unmountedCreateNewEntryFormPage component mounted
        };
    }, []);
    const handleSortChange = (newSortOrder) => {
        setSortOrder(newSortOrder);
        localStorage.setItem("journalSortOrder", JSON.stringify(newSortOrder));
    };
    if (isLoading) {
        return (_jsx(DefaultLayout, { children: _jsx(LoadingIndicator, {}) }));
    }
    if (error) {
        return (_jsx(DefaultLayout, { children: _jsx(Alert, { severity: "error", sx: { mt: 2 }, children: error.message }) }));
    }
    if (isMobile) {
        return (_jsx(DefaultLayout, { children: _jsx(ConfirmProvider, { children: _jsx(DataCollector, { children: ({ data, onEdit, onDelete }) => (_jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { style: { width: "100%" }, children: _jsx(SortForm, { sortOrder: sortOrder, onSortOrderChange: handleSortChange }) }), _jsx(Grid, { style: { width: "100%" }, children: _jsx(SwipeableList, { style: { width: "100%" }, children: sortData(data, sortOrder.column, sortOrder.order).map((item) => (_jsx(StyledSwipeableListItem, { leadingActions: leadingActions(onDelete, item.id), trailingActions: trailingActions(onEdit, item.id), children: _jsx(Card, { sx: {
                                                width: "100%",
                                                height: "100%",
                                                marginBottom: theme.spacing(1),
                                            }, children: _jsxs(CardContent, { sx: { height: "100%" }, children: [_jsx(Typography, { variant: "h5", component: "div", children: item.bandName }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: item.place }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: (() => {
                                                            try {
                                                                if (Array.isArray(item.date)) {
                                                                    return new Date(item.date[0], item.date[1] - 1, item.date[2]).toLocaleDateString();
                                                                }
                                                                else if (typeof item.date === "string" &&
                                                                    item.date.startsWith("[") &&
                                                                    item.date.endsWith("]")) {
                                                                    // Handle string representation of array
                                                                    try {
                                                                        const dateArray = JSON.parse(item.date);
                                                                        if (Array.isArray(dateArray) &&
                                                                            dateArray.length === 3) {
                                                                            return new Date(dateArray[0], dateArray[1] - 1, dateArray[2]).toLocaleDateString();
                                                                        }
                                                                    }
                                                                    catch (error) {
                                                                        // Error handling without logging
                                                                        return "Invalid date format";
                                                                    }
                                                                }
                                                                else if (item.date) {
                                                                    return new Date(item.date).toLocaleDateString();
                                                                }
                                                                else {
                                                                    return "No date";
                                                                }
                                                            }
                                                            catch (error) {
                                                                // Error handling without logging
                                                                return "Invalid date";
                                                            }
                                                        })() }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: item.comment }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: _jsx(RatingStars, { rating: item.rating }) })] }) }) }, item.id))) }) })] })) }) }) }));
    }
    else {
        return (_jsx(DefaultLayout, { children: _jsx(ConfirmProvider, { children: _jsx(DataCollector, { children: ({ data, onEdit, onDelete }) => {
                        // Final validation before passing to DataTable
                        const validatedData = data.map((item) => {
                            // Create a copy to avoid mutating the original
                            const validatedItem = { ...item };
                            // Ensure date is valid
                            if (validatedItem.date === undefined ||
                                validatedItem.date === null) {
                                // Use current date as default
                                const today = new Date();
                                validatedItem.date = [
                                    today.getFullYear(),
                                    today.getMonth() + 1,
                                    today.getDate(),
                                ];
                            }
                            return validatedItem;
                        });
                        return (_jsx(DataTable, { data: validatedData, onEdit: onEdit, onDelete: onDelete }));
                    } }) }) }));
    }
};
export default Journal;
//# sourceMappingURL=Journal.js.map