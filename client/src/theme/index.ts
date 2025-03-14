// Export all theme-related utilities
export * from './theme';
export * from './hooks';

// Re-export commonly used theme utilities for convenience
import { colors, createAppTheme, lightTheme, darkTheme } from './theme';
import { useThemeColors } from './hooks';

export {
  // Theme constants
  colors,
  
  // Theme creation
  createAppTheme,
  
  // Pre-created themes
  lightTheme,
  darkTheme,
  
  // Hooks
  useThemeColors,
}; 