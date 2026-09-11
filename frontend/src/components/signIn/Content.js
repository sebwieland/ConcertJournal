import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AutoFixHighRoundedIcon from "@mui/icons-material/AutoFixHighRounded";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";
import SettingsSuggestRoundedIcon from "@mui/icons-material/SettingsSuggestRounded";
import ThumbUpAltRoundedIcon from "@mui/icons-material/ThumbUpAltRounded";
const items = [
    {
        icon: _jsx(ThumbUpAltRoundedIcon, { sx: { color: "text.secondary" } }),
        title: "Your Concert History",
        description: "Keep track of the concerts you've attended and relive the memories.",
    },
    {
        icon: _jsx(SettingsSuggestRoundedIcon, { sx: { color: "text.secondary" } }),
        title: "Personalized Recommendations*",
        description: "Get suggestions for upcoming concerts based on your favorite bands and artists.",
    },
    {
        icon: _jsx(ConstructionRoundedIcon, { sx: { color: "text.secondary" } }),
        title: "Build Your Music Community*",
        description: "Connect with fellow music lovers and share your concert experiences.",
    },
    {
        icon: _jsx(AutoFixHighRoundedIcon, { sx: { color: "text.secondary" } }),
        title: "Discover New Music*",
        description: "Find new bands and artists to love based on your concert history and preferences.",
    },
];
export default function Content() {
    return (_jsxs(Stack, { sx: {
            flexDirection: "column",
            alignSelf: "center",
            gap: 4,
            maxWidth: 450,
        }, children: [_jsx(Box, { sx: { display: { xs: "none", md: "flex" } }, children: _jsx("img", { src: "/ConcertJournal_logo.png", alt: "Logo", width: "50", height: "50" }) }), items.map((item, index) => (_jsxs(Stack, { direction: "row", sx: { gap: 2 }, children: [item.icon, _jsxs("div", { children: [_jsx(Typography, { gutterBottom: true, sx: { fontWeight: "medium" }, children: item.title }), _jsx(Typography, { variant: "body2", sx: { color: "text.secondary" }, children: item.description })] })] }, index))), _jsxs(Typography, { variant: "body2", sx: { color: "text.secondary", mt: 2 }, children: [_jsx("span", { children: "*" }), " At some Point in the future...maybe.."] })] }));
}
//# sourceMappingURL=Content.js.map