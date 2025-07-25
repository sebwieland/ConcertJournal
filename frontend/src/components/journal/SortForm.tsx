import React from "react";
import { FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import { SelectChangeEvent } from '@mui/material/Select';

interface SortFormProps {
    sortOrder: { column: string; order: 'asc' | 'desc' };
    onSortOrderChange: (newSortOrder: { column: string; order: 'asc' | 'desc' }) => void;
}

const SortForm = ({ sortOrder, onSortOrderChange }: SortFormProps) => {
    const handleColumnChange = (event: SelectChangeEvent<string>) => {
        const newColumn = event.target.value;
        onSortOrderChange({ ...sortOrder, column: newColumn });
    };

    const handleOrderChange = (event: SelectChangeEvent<'asc' | 'desc'>) => {
        const newOrder = event.target.value as 'asc' | 'desc';
        onSortOrderChange({ ...sortOrder, order: newOrder });
    };

    return (
        <div>
            <FormControl fullWidth variant="outlined">
                <InputLabel id="sort-column-label">Sort By</InputLabel>
                <Select
                    labelId="sort-column-label"
                    id="sort-column"
                    value={sortOrder.column}
                    onChange={handleColumnChange}
                    label="Sort By"
                >
                    <MenuItem value="date">Date</MenuItem>
                    <MenuItem value="bandName">Band Name</MenuItem>
                    <MenuItem value="place">Place</MenuItem>
                    <MenuItem value="rating">Rating</MenuItem>
                </Select>
            </FormControl>
            
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                Order:
            </Typography>
            
            <FormControl fullWidth variant="outlined" sx={{ mt: 1 }}>
                <Select
                    labelId="sort-order-label"
                    id="sort-order"
                    value={sortOrder.order}
                    onChange={handleOrderChange}
                >
                    <MenuItem value="asc">Ascending</MenuItem>
                    <MenuItem value="desc">Descending</MenuItem>
                </Select>
            </FormControl>
        </div>
    );
};

export default SortForm;