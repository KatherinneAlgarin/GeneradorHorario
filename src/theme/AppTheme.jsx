import { createTheme } from '@mui/material/styles';


export const AppTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // color principal de Figma
    },
    secondary: {
      main: '#dc004e', //color secundario de Figma
    },
    background: {
      default: '#f4f6f8', // El color de fondo de toda la app
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', // fuente de Figma
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
    },
  },
  components: {
    //cambiar cómo se ven todos los botones o inputs
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});