import React from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import RatingStars from "../utilities/RatingStars";
import { Link as RouterLink } from "react-router-dom";
import parseEventDate from "../../utils/parseEventDate";
import { ConcertEvent } from "../../types/events";

interface DataTableProps {
  data: ConcertEvent[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

class DataTable extends React.Component<DataTableProps, Record<string, never>> {
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
    {
      field: "bandName",
      headerName: "Band",
      width: 160,
      renderCell: (params: GridRenderCellParams) =>
        params.value ? (
          <RouterLink
            to={`/artist/${encodeURIComponent(String(params.value))}`}
            style={{
              color: "inherit",
              textDecoration: "underline",
              fontWeight: 600,
            }}
          >
            {params.value}
          </RouterLink>
        ) : (
          ""
        ),
    },
    {
      field: "place",
      headerName: "Place",
      width: 140,
      renderCell: (params: GridRenderCellParams) =>
        params.value ? (
          <RouterLink
            to={`/venue/${encodeURIComponent(String(params.value))}`}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {params.value}
          </RouterLink>
        ) : (
          ""
        ),
    },
    {
      field: "date",
      headerName: "Date",
      width: 130,
      // v7 valueFormatter receives the raw value first (not a params object)
      valueFormatter: (value: unknown) => {
        const date = parseEventDate(value as never);
        return date ? date.format("DD/MM/YYYY") : "";
      },
      sortComparator: (v1, v2) => {
        const d1 = parseEventDate(v1 as never);
        const d2 = parseEventDate(v2 as never);
        return (d1?.valueOf() ?? 0) - (d2?.valueOf() ?? 0);
      },
    },
    {
      field: "comment",
      headerName: "Comment",
      cellClassName: "comment-cell",
      minWidth: 190,
      flex: 1,
    },
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
