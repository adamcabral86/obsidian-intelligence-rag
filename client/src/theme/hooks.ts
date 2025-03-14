import { useTheme } from '@mui/material/styles';
import { colors } from './theme';

/**
 * Custom hook that provides access to the current theme's colors
 * based on the current mode (light or dark)
 */
export const useThemeColors = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return {
    // Theme mode
    isDarkMode,
    
    // Direct access to all color constants
    colors,
    
    // Context-aware colors based on current theme mode
    background: isDarkMode ? colors.backgroundDark : colors.backgroundLight,
    surface: isDarkMode ? colors.surfaceDark : colors.surfaceLight,
    textPrimary: isDarkMode ? colors.textPrimaryDark : colors.textPrimaryLight,
    textSecondary: isDarkMode ? colors.textSecondaryDark : colors.textSecondaryLight,
    border: isDarkMode ? colors.borderDark : colors.borderLight,
    
    // Material UI theme access
    primary: theme.palette.primary.main,
    primaryLight: theme.palette.primary.light,
    primaryDark: theme.palette.primary.dark,
    secondary: theme.palette.secondary.main,
    secondaryLight: theme.palette.secondary.light,
    secondaryDark: theme.palette.secondary.dark,
    
    // Utility function to get appropriate text color based on background
    getTextColorForBackground: (bgColor: string) => {
      // Check if background is dark and return appropriate text color
      // This is a simplified version - in a real app you might want to check color contrast
      return bgColor.toLowerCase() === colors.backgroundDark ||
             bgColor.toLowerCase() === colors.surfaceDark
        ? colors.textPrimaryDark
        : colors.textPrimaryLight;
    }
  };
}; 