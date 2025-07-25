export default function getTheme(mode: string): { palette: any } {
  return {
    palette: {
      mode: mode === 'dark' ? 'dark' : 'light',
      primary: {
        main: '#3f51b5',
      },
      secondary: {
        main: '#f50057',
      },
    },
  };
}