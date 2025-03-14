import { createTheme, PaletteOptions, ThemeOptions } from '@mui/material';

// Color constants
export const colors = {
  // Primary colors
  primary:              'rgba(249, 162, 27, 1)',    // Orange/amber color
  primaryLight:         'rgba(249, 162, 27, 0.8)',
  primaryDark:          'rgba(209, 136, 23, 1)',
  
  // Secondary colors
  secondary:            'rgba(84, 89, 95, 1)',      // Medium gray
  secondaryLight:       'rgba(122, 127, 133, 1)',
  secondaryDark:        'rgba(58, 63, 69, 1)',
  
  // Background colors
  backgroundLight:      'rgba(245, 245, 245, 1)',
  backgroundDark:       'rgba(18, 18, 18, 1)',
  
  // Surface colors
  surfaceLight:         'rgba(255, 255, 255, 1)',
  surfaceDark:          'rgba(30, 30, 30, 1)',
  
  // Accent colors
  accent1:              'rgba(33, 150, 243, 1)',    // Blue
  accent2:              'rgba(76, 175, 80, 1)',     // Green
  accent3:              'rgba(244, 67, 54, 1)',     // Red
  accent4:              'rgba(156, 39, 176, 1)',    // Purple
  
  // Status colors
  success:              'rgba(76, 175, 80, 1)',     // Green
  error:                'rgba(244, 67, 54, 1)',     // Red
  warning:              'rgba(255, 152, 0, 1)',     // Orange
  info:                 'rgba(33, 150, 243, 1)',    // Blue
  
  // Text colors
  textPrimaryLight:     'rgba(0, 0, 0, 0.87)',
  textSecondaryLight:   'rgba(0, 0, 0, 0.6)',
  textPrimaryDark:      'rgba(255, 255, 255, 0.87)',
  textSecondaryDark:    'rgba(255, 255, 255, 0.6)',
  
  // Border and divider
  borderLight:          'rgba(0, 0, 0, 0.12)',
  borderDark:           'rgba(255, 255, 255, 0.12)',
};

// Typography settings
const typography = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: '2.5rem',
    fontWeight: 500,
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 500,
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 500,
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 500,
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 500,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 500,
  },
};

// Component overrides
const components = {
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: '0px 2px 4px -1px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 4,
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
    },
  },
};

// Function to get palette options based on dark mode
const getPalette = (darkMode: boolean): PaletteOptions => ({
  mode: darkMode ? 'dark' : 'light',
  primary: {
    main: colors.primary,
    light: colors.primaryLight,
    dark: colors.primaryDark,
  },
  secondary: {
    main: colors.secondary,
    light: colors.secondaryLight,
    dark: colors.secondaryDark,
  },
  success: {
    main: colors.success,
  },
  error: {
    main: colors.error,
  },
  warning: {
    main: colors.warning,
  },
  info: {
    main: colors.info,
  },
  background: {
    default: darkMode ? colors.backgroundDark : colors.backgroundLight,
    paper: darkMode ? colors.surfaceDark : colors.surfaceLight,
  },
  text: {
    primary: darkMode ? colors.textPrimaryDark : colors.textPrimaryLight,
    secondary: darkMode ? colors.textSecondaryDark : colors.textSecondaryLight,
  },
  divider: darkMode ? colors.borderDark : colors.borderLight,
});

// Create and export theme generation function
export const createAppTheme = (darkMode: boolean) => {
  const themeOptions: ThemeOptions = {
    palette: getPalette(darkMode),
    typography,
    components,
  };
  
  return createTheme(themeOptions);
};

// Export default themes
export const lightTheme = createAppTheme(false);
export const darkTheme = createAppTheme(true); 