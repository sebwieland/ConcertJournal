import { ThemeOptions } from "@mui/material/styles";

// Local-bound variable font (no external CDN, CSP-friendly, offline-capable)
export const FONT_FAMILY =
  '"InterVariable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif';

export default function getTheme(mode: string): ThemeOptions {
  // indigo-600 — fresh primary; amber as the "concert energy" accent
  return {
    palette: {
      mode: mode === "dark" ? "dark" : "light",
      primary: {
        main: mode === "dark" ? "#818CF8" : "#4F46E5",
      },
      secondary: {
        main: "#F59E0B",
      },
      ...(mode === "dark" ? {} : { background: { default: "#F8FAFC" } }),
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: FONT_FAMILY,
      h1: { fontWeight: 800, letterSpacing: "-0.02em" },
      h2: { fontWeight: 700, letterSpacing: "-0.02em" },
      h3: { fontWeight: 700, letterSpacing: "-0.01em" },
      h4: { fontWeight: 700, letterSpacing: "-0.01em" },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: "none", fontWeight: 600 },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 10, paddingInline: "18px" },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            ...(mode === "dark"
              ? {}
              : {
                  border: "1px solid rgba(15, 23, 42, 0.06)",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
                }),
          },
        },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 600 } },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: "none" } },
      },
    },
  };
}
