import React from "react";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowId,
} from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import { parseEventDate, formatEventDate } from "../../utils/dateUtils";
import RatingStars from "../utilities/RatingStars";
import { Alert } from "@mui/material";

interface DataTableProps {
  data: any[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

class DataTable extends React.Component<DataTableProps, {}> {
  componentDidMount() {
    if (process.env.NODE_ENV === "development") {
      console.log("DataTable component mounted");
    }
  }

  componentWillUnmount() {
    if (process.env.NODE_ENV === "development") {
      console.log("DataTable component unmounted");
    }
  }

  columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "bandName", headerName: "Band", width: 130 },
    { field: "place", headerName: "Place", width: 130 },
    {
      field: "date",
      headerName: "Date",
      width: 130,
      type: "date" as const,
      sortComparator: (v1, v2) => {
        return parseEventDate(v1).diff(parseEventDate(v2));
      },
      valueFormatter: (params: any) => {
        // params may be the value directly or an object with .value
        const value = params?.value !== undefined ? params.value : params;
        return formatEventDate(value);
      },
    },
    { field: "comment", headerName: "Comment", width: 130 },
    {
      field: "rating",
      headerName: "Rating",
      width: 130,
      renderCell: (params: GridRenderCellParams) => {
        // Add defensive check for rating value
        if (params.value === undefined || params.value === null) {
          // Only log warning in development mode
          if (process.env.NODE_ENV === "development") {
            console.warn("Missing rating value for row:", params);
          }
          return <RatingStars rating={0} />;
        }
        return <RatingStars rating={params.value} />;
      },
    },
    // Removed appUser column as requested by the user
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params: GridRenderCellParams) => {
        // Add defensive check for params.id
        if (params.id === undefined || params.id === null) {
          // Only log warning in development mode
          if (process.env.NODE_ENV === "development") {
            console.warn("Missing id for row:", params);
          }
          return (
            <div>
              <Button variant="contained" color="primary" disabled>
                Edit
              </Button>
              <Button
                variant="contained"
                color="error"
                style={{ marginLeft: 10 }}
                disabled
              >
                Delete
              </Button>
            </div>
          );
        }

        const id =
          typeof params.id === "number"
            ? params.id
            : parseInt(params.id as string, 10);
        return (
          <div>
            <Button
              variant="contained"
              color="primary"
              onClick={() => this.props.onEdit(id)}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              color="error"
              style={{ marginLeft: 10 }}
              onClick={() => this.props.onDelete(id)}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  render() {
    const { data } = this.props;
    return (
      <div style={{ height: 600, width: "100%" }}>
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
