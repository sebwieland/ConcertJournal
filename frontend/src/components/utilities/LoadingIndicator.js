import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
export default function LoadingIndicator() {
    return (_jsxs(Box, { sx: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
        }, children: [_jsx(CircularProgress, { color: "primary", size: 60 }), _jsx(Box, { sx: { mt: 2 }, children: "Loading..." })] }));
}
//# sourceMappingURL=LoadingIndicator.js.map