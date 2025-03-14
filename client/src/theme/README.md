# Theme System Documentation

This directory contains the theme system for the Intelligence RAG Application. It provides a centralized place for managing colors, typography, and other design elements.

## Files

- `theme.ts`: Contains all the color constants, theme configuration, and theme creation functions.
- `hooks.ts`: Contains custom hooks for accessing theme colors and other utilities.
- `index.ts`: Re-exports everything from the theme system for easy imports.

## Usage

### Basic Usage

Import theme utilities where needed:

```tsx
import { useThemeColors } from '../theme';

const MyComponent = () => {
  const themeColors = useThemeColors();
  
  return (
    <div style={{ backgroundColor: themeColors.background }}>
      <p style={{ color: themeColors.textPrimary }}>
        This text will use the appropriate color for the current theme mode.
      </p>
    </div>
  );
};
```

### Accessing Color Constants

If you need to access the raw color values:

```tsx
import { colors } from '../theme';

// Use colors directly
const PRIMARY_COLOR = colors.primary;
```

### Creating Custom Themed Components

Use the theme hook to create components that respect the current theme:

```tsx
import { useThemeColors } from '../theme';

const ThemedCard = ({ children }) => {
  const themeColors = useThemeColors();
  
  return (
    <div
      style={{
        backgroundColor: themeColors.surface,
        color: themeColors.textPrimary,
        padding: '16px',
        borderRadius: '8px',
        boxShadow: `0 2px 8px ${themeColors.isDarkMode ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)'}`,
        border: `1px solid ${themeColors.border}`
      }}
    >
      {children}
    </div>
  );
};
```

## Customizing the Theme

### Adding New Colors

To add new colors to the theme, update the `colors` object in `theme.ts`:

```ts
export const colors = {
  // ... existing colors
  
  // Add new colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FFC107',
  info: '#2196F3',
};
```

### Modifying Existing Colors

To change existing colors, simply update their values in the `colors` object in `theme.ts`.

## Best Practices

1. **Always use the theme system** for colors rather than hardcoding color values.
2. **Use the `useThemeColors` hook** for components that need theme-aware colors.
3. **Add new colors to the theme system** rather than defining them in individual components.
4. **Use semantic color names** that describe the purpose rather than the actual color (e.g., use `primary` instead of `orange`). 