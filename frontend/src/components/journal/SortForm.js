import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FormControl, InputLabel, MenuItem, Select, Typography, } from "@mui/material";
const SortForm = ({ sortOrder, onSortOrderChange }) => {
    const handleColumnChange = (event) => {
        const newColumn = event.target.value;
        onSortOrderChange({ ...sortOrder, column: newColumn });
    };
    const handleOrderChange = (event) => {
        const newOrder = event.target.value;
        onSortOrderChange({ ...sortOrder, order: newOrder });
    };
    return (_jsxs("div", { children: [_jsxs(FormControl, { fullWidth: true, variant: "outlined", children: [_jsx(InputLabel, { id: "sort-column-label", children: "Sort By" }), _jsxs(Select, { labelId: "sort-column-label", id: "sort-column", value: sortOrder.column, onChange: handleColumnChange, label: "Sort By", children: [_jsx(MenuItem, { value: "date", children: "Date" }), _jsx(MenuItem, { value: "bandName", children: "Band Name" }), _jsx(MenuItem, { value: "place", children: "Place" }), _jsx(MenuItem, { value: "rating", children: "Rating" })] })] }), _jsx(Typography, { variant: "body2", sx: { mt: 1, textAlign: "center" }, children: "Order:" }), _jsx(FormControl, { fullWidth: true, variant: "outlined", sx: { mt: 1 }, children: _jsxs(Select, { labelId: "sort-order-label", id: "sort-order", value: sortOrder.order, onChange: handleOrderChange, children: [_jsx(MenuItem, { value: "asc", children: "Ascending" }), _jsx(MenuItem, { value: "desc", children: "Descending" })] }) })] }));
};
export default SortForm;
//# sourceMappingURL=SortForm.js.map