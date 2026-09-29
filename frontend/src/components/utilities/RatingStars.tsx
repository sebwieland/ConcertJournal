import Rating from "@mui/material/Rating";

function RatingStars(props: { rating: number }) {
  return (
    <Rating
      value={props.rating}
      readOnly
      size="small"
      sx={{
        color: "warning.main",
        "& .MuiRating-iconEmpty": {
          color: (theme) =>
            theme.palette.mode === "dark" ? "#475569" : "#CBD5E1",
        },
      }}
    />
  );
}

export default RatingStars;
