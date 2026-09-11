import { PaletteOptions } from "@mui/material/styles";
export default function getTheme(mode: string): { palette: PaletteOptions } {
  return {
    palette: {
      mode: mode === "dark" ? "dark" : "light",
      primary: {
        main: "#3f51b5",
      },
      secondary: {
        main: "#f50057",
      },
    },
  };
}
