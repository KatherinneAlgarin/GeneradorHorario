import { createTheme } from '@mui/material/styles';

const paletaColores = {
  50: "#FBE9E9",
  100: "#F5C2C2",
  200: "#EE9B9B",
  300: "#E77373",
  400: "#E14C4C",
  500: "#DA2525",
  600: "#B31E1E",
  700: "#8C1818",
  800: "#631111",
  900: "#3D0A0A",
  950: "#160404"
};

export const AppTheme = createTheme({
  palette: {
    primary: {
      main: universityRed[500],
      light: universityRed[300],
      dark: universityRed[700],
      contrastText: '#ffffff',
    },
    secondary: {
      main: universityRed[900],
    },
    background: {
      default: '#F4F6F8',
      paper: '#ffffff',
    },
    customRed: universityRed,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});