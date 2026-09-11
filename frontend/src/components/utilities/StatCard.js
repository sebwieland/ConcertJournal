import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Card, CardContent, Typography } from "@mui/material";
import Box from "@mui/material/Box";
const StatCard = ({ title, value, icon }) => {
    return (_jsx(Card, { style: { margin: "20px", width: "300px" }, children: _jsxs(CardContent, { sx: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
            }, children: [_jsxs(Box, { sx: { display: "flex", alignItems: "center" }, children: [icon, _jsxs(Typography, { variant: "h5", component: "h2", sx: { marginLeft: "10px" }, children: [title, ":"] })] }), _jsx(Typography, { variant: "h5", component: "p", sx: { marginTop: "10px" }, children: value })] }) }));
};
export default StatCard;
//# sourceMappingURL=StatCard.js.map