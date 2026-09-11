import { jsx as _jsx } from "react/jsx-runtime";
import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
const AddButton = () => {
    const navigate = useNavigate();
    return (_jsx(Fab, { color: "primary", "aria-label": "add", onClick: () => navigate("/new-entry"), sx: {
            position: "fixed",
            bottom: 32,
            right: 32,
        }, children: _jsx(AddIcon, {}) }));
};
export default AddButton;
//# sourceMappingURL=AddButton.js.map