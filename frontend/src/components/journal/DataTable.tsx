import React from 'react';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowId } from '@mui/x-data-grid';
import dayjs from "dayjs";
import Button from "@mui/material/Button";
import RatingStars from "../utilities/RatingStars";
import { Alert } from "@mui/material";

interface DataTableProps {
    data: any[];
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
}

class DataTable extends React.Component<DataTableProps, {}> {
    componentDidMount() {
        if (process.env.NODE_ENV === 'development') {
            console.log('DataTable component mounted');
        }
    }

    componentWillUnmount() {
        if (process.env.NODE_ENV === 'development') {
            console.log('DataTable component unmounted');
        }
    }

    columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'bandName', headerName: 'Band', width: 130 },
        { field: 'place', headerName: 'Place', width: 130 },
        {
            field: 'date', headerName: 'Date', width: 130,
            type: 'date' as const,
            sortComparator: (v1, v2) => {
                try {
                    // Handle dates that come as arrays [year, month, day]
                    const getDate = (value: any) => {
                        // Handle undefined or null values
                        if (value === undefined || value === null) {
                            return dayjs(); // Default to current date
                        }
                        
                        if (Array.isArray(value)) {
                            if (value.length !== 3) {
                                return dayjs(); // Default to current date for invalid arrays
                            }
                            
                            const [year, month, day] = value;
                            // Note: month in dayjs is 0-indexed, but our array uses 1-indexed months
                            return dayjs().year(year).month(month - 1).date(day);
                        }
                        
                        // Handle string representation of array
                        if (typeof value === 'string' &&
                            value.startsWith('[') &&
                            value.endsWith(']')) {
                            try {
                                const dateArray = JSON.parse(value);
                                if (Array.isArray(dateArray) && dateArray.length === 3) {
                                    const [year, month, day] = dateArray;
                                    return dayjs().year(year).month(month - 1).date(day);
                                } else {
                                    return dayjs(); // Default to current date for invalid arrays
                                }
                            } catch (error) {
                                return dayjs(); // Default to current date on parsing error
                            }
                        }
                        
                        return dayjs(value);
                    };
                    
                    const date1 = getDate(v1);
                    const date2 = getDate(v2);
                    
                    return date1.diff(date2);
                } catch (error) {
                    if (process.env.NODE_ENV === 'development') {
                        console.error('Error comparing dates:', v1, v2, error);
                    }
                    return 0; // Return 0 if comparison fails
                }
            },
            valueFormatter: (params: any) => {
                // Handle case where params is directly the date array
                if (Array.isArray(params)) {
                    const [year, month, day] = params;
                    const date = dayjs().year(year).month(month - 1).date(day);
                    return date.format('DD/MM/YYYY');
                }
                
                // Defensive check for date value
                if (!params || params.value === undefined || params.value === null) {
                    return 'Unknown date';
                }
                
                try {
                    // Handle date that comes as an array [year, month, day]
                    if (Array.isArray(params.value)) {
                        const [year, month, day] = params.value;
                        // Note: month in dayjs is 0-indexed, but our array uses 1-indexed months
                        const date = dayjs().year(year).month(month - 1).date(day);
                        return date.format('DD/MM/YYYY');
                    }
                    
                    // Handle date that comes as a string representation of an array
                    if (typeof params.value === 'string' &&
                        params.value.startsWith('[') &&
                        params.value.endsWith(']')) {
                        try {
                            const dateArray = JSON.parse(params.value);
                            if (Array.isArray(dateArray) && dateArray.length === 3) {
                                const [year, month, day] = dateArray;
                                const date = dayjs().year(year).month(month - 1).date(day);
                                return date.format('DD/MM/YYYY');
                            }
                        } catch (error) {
                            return 'Invalid date';
                        }
                    }
                    
                    // Handle date that comes as a regular string
                    const date = dayjs(params.value);
                    return date.format('DD/MM/YYYY');
                } catch (error) {
                    return 'Invalid date';
                }
            }
        },
        { field: 'comment', headerName: 'Comment', width: 130 },
        {
            field: 'rating', headerName: 'Rating', width: 130,
            renderCell: (params: GridRenderCellParams) => {
                // Add defensive check for rating value
                if (params.value === undefined || params.value === null) {
                    // Only log warning in development mode
                    if (process.env.NODE_ENV === 'development') {
                        console.warn('Missing rating value for row:', params);
                    }
                    return <RatingStars rating={0} />;
                }
                return <RatingStars rating={params.value} />;
            },
        },
        // Removed appUser column as requested by the user
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            renderCell: (params: GridRenderCellParams) => {
                // Add defensive check for params.id
                if (params.id === undefined || params.id === null) {
                    // Only log warning in development mode
                    if (process.env.NODE_ENV === 'development') {
                        console.warn('Missing id for row:', params);
                    }
                    return (
                        <div>
                            <Button variant="contained" color="primary" disabled>Edit</Button>
                            <Button variant="contained" color="error" style={{ marginLeft: 10 }} disabled>Delete</Button>
                        </div>
                    );
                }
                
                const id = typeof params.id === 'number' ? params.id : parseInt(params.id as string, 10);
                return (
                    <div>
                        <Button variant="contained" color="primary"
                                onClick={() => this.props.onEdit(id)}>Edit</Button>
                        <Button variant="contained" color="error" style={{ marginLeft: 10 }}
                                onClick={() => this.props.onDelete(id)}>Delete</Button>
                    </div>
                );
            }
        }
    ];

    render() {
        const { data } = this.props;
        return (
            <div style={{ height: 600, width: '100%' }}>
                <DataGrid
                    autoHeight={true}
                    rows={data}
                    columns={this.columns}
                    pageSizeOptions={[5, 10, 25]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    // paginationMode="server"
                    // checkboxSelection
                />
            </div>
        );
    }
}

export default DataTable;
