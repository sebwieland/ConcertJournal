import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import DefaultLayout from "../theme/DefaultLayout";
import DataCollector from "./journal/DataCollector";
import calculateStatistics from "../utils/calculateStatistics";
import { ConfirmProvider } from "material-ui-confirm";
import StatCard from "./utilities/StatCard";
import { MusicNote, Group, LocationOn, PlaylistAddCheck, } from "@mui/icons-material";
import { Alert, Divider } from "@mui/material";
import useEvents from "../hooks/useEvents";
import LoadingIndicator from "./utilities/LoadingIndicator";
import SearchComponent from "./journal/SearchComponent";
export default function LandingPage() {
    const { data, error, isLoading } = useEvents();
    useEffect(() => {
        // Component mount logic
        return () => {
            // Component cleanup
        };
    }, []);
    if (isLoading) {
        return (_jsx(DefaultLayout, { children: _jsx(LoadingIndicator, {}) }));
    }
    if (error) {
        return (_jsx(DefaultLayout, { children: _jsx(Alert, { severity: "error", sx: { mt: 2 }, children: error.message }) }));
    }
    const events = data || [];
    const statistics = calculateStatistics(events);
    return (_jsx(DefaultLayout, { children: _jsx(ConfirmProvider, { children: _jsxs("div", { children: [_jsx("h1", { children: "Welcome to your Concert Journal! Nice to have you!" }), _jsxs("div", { style: {
                            display: "flex",
                            flexWrap: "wrap",
                            justifyContent: "center",
                        }, children: [_jsx(StatCard, { title: "Concerts attended", value: statistics.totalCount.toString(), icon: _jsx(PlaylistAddCheck, {}) }), _jsx(StatCard, { title: "Most Seen Artist", value: statistics.mostSeenArtist, icon: _jsx(MusicNote, {}) }), _jsx(StatCard, { title: "Most Artists on a Single Day", value: statistics.mostArtistsOnASingleDay.toString(), icon: _jsx(Group, {}) }), _jsx(StatCard, { title: "Most Visited Location", value: statistics.mostVisitedLocation, icon: _jsx(LocationOn, {}) })] }), _jsx(Divider, { sx: { my: 3 } }), _jsx("h2", { children: "Search Your Journal" }), _jsx("div", { "data-testid": "search-component-container", children: _jsx(DataCollector, { children: ({ onEdit, onDelete }) => (_jsx(SearchComponent, { data: events, onEdit: onEdit, onDelete: onDelete })) }) })] }) }) }));
}
//# sourceMappingURL=LandingPage.js.map