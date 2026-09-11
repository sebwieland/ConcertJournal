import getTheme from "../../theme/getTheme";

describe("getTheme", () => {
  it('returns a light theme when mode is "light"', () => {
    const theme = getTheme("light");

    expect(theme.palette.mode).toBe("light");
    expect((theme.palette.primary as { main: string }).main).toBe("#3f51b5");
    expect((theme.palette.secondary as { main: string }).main).toBe("#f50057");
  });

  it('returns a dark theme when mode is "dark"', () => {
    const theme = getTheme("dark");

    expect(theme.palette.mode).toBe("dark");
    expect((theme.palette.primary as { main: string }).main).toBe("#3f51b5");
    expect((theme.palette.secondary as { main: string }).main).toBe("#f50057");
  });

  it("defaults to light theme for any other value", () => {
    const theme = getTheme("invalid");

    expect(theme.palette.mode).toBe("light");
  });

  it("returns the same color values regardless of mode", () => {
    const lightTheme = getTheme("light");
    const darkTheme = getTheme("dark");

    expect((lightTheme.palette.primary as { main: string }).main).toBe(
      (darkTheme.palette.primary as { main: string }).main,
    );
    expect((lightTheme.palette.secondary as { main: string }).main).toBe(
      (darkTheme.palette.secondary as { main: string }).main,
    );
  });
});
