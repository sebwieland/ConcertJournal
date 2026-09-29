import getTheme from "../../theme/getTheme";

describe("getTheme", () => {
  it('returns a light theme with the indigo primary when mode is "light"', () => {
    const theme = getTheme("light");
    const palette = theme.palette!;

    expect(palette.mode).toBe("light");
    expect((palette.primary as { main: string }).main).toBe("#4F46E5");
    expect((palette.secondary as { main: string }).main).toBe("#F59E0B");
    expect(
      String((theme.typography as { fontFamily?: string })?.fontFamily),
    ).toContain("InterVariable");
    expect(theme.shape?.borderRadius).toBe(12);
  });

  it('returns a dark theme with a lighter primary when mode is "dark"', () => {
    const theme = getTheme("dark");
    const palette = theme.palette as NonNullable<typeof theme.palette>;

    expect(palette.mode).toBe("dark");
    expect((palette.primary as { main: string }).main).toBe("#818CF8");
  });

  it("defaults to light theme for any other value", () => {
    const theme = getTheme("invalid");
    const palette = theme.palette as NonNullable<typeof theme.palette>;

    expect(palette.mode).toBe("light");
  });

  it("keeps the accent color constant across modes and varies the primary", () => {
    const lightTheme = getTheme("light");
    const darkTheme = getTheme("dark");
    const lightPalette = lightTheme.palette!;
    const darkPalette = darkTheme.palette!;

    expect(
      lightPalette.secondary
        ? (lightPalette.secondary as { main: string }).main
        : undefined,
    ).toBe(
      darkPalette.secondary
        ? (darkPalette.secondary as { main: string }).main
        : undefined,
    );
    expect((lightPalette.primary as { main: string }).main).toBe("#4F46E5");
    expect((darkPalette.primary as { main: string }).main).toBe("#818CF8");
  });
});
