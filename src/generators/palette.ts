import { DesignTokens } from '../types/index.js';
import { generateColorSystem, generateAccessibleTheme } from './color.js';

/**
 * Generate a complete design token palette
 */
export function generateCompletePalette(
  brandColors: { primary: string; secondary?: string },
  options: {
    includeThemes?: boolean;
    framework?: 'react' | 'vue' | 'vanilla';
  } = {}
): DesignTokens {
  const { includeThemes = true, framework = 'vanilla' } = options;

  // Use the imported color generation functions

  const colorSystem = generateColorSystem(brandColors.primary, brandColors.secondary);

  const tokens: DesignTokens = {
    color: colorSystem.color,
    size: {
      font: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem'
      },
      spacing: {
        '0': '0',
        px: '1px',
        '0.5': '0.125rem',
        '1': '0.25rem',
        '1.5': '0.375rem',
        '2': '0.5rem',
        '2.5': '0.625rem',
        '3': '0.75rem',
        '3.5': '0.875rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '7': '1.75rem',
        '8': '2rem',
        '9': '2.25rem',
        '10': '2.5rem',
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem'
      },
      border: {
        radius: {
          none: '0',
          sm: '0.125rem',
          base: '0.25rem',
          md: '0.375rem',
          lg: '0.5rem',
          xl: '0.75rem',
          '2xl': '1rem',
          '3xl': '1.5rem',
          full: '9999px'
        },
        width: {
          '0': '0',
          '1': '1px',
          '2': '2px',
          '4': '4px',
          '8': '8px'
        }
      }
    },
    typography: {
      family: {
        sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        mono: "ui-monospace, SFMono-Regular, 'SF Mono', Monaco, Consolas, monospace"
      },
      weight: {
        thin: '100',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800'
      },
      lineHeight: {
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2'
      },
      letterSpacing: {
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em'
      }
    }
  };

  // Add theme colors if requested
  if (includeThemes && tokens.color.core) {
    const themes = generateAccessibleTheme(tokens.color.core);

    // Merge theme colors into the main color object
    tokens.color = {
      ...tokens.color,
      ...themes.light,
      ...themes.dark
    };
  }

  return tokens;
}

/**
 * Generate framework-specific integrations
 */
export function generateFrameworkIntegration(
  framework: 'react' | 'vue' | 'vanilla',
  tokens: DesignTokens
): string {
  switch (framework) {
    case 'react':
      return generateReactIntegration(tokens);
    case 'vue':
      return generateVueIntegration(tokens);
    case 'vanilla':
    default:
      return generateVanillaIntegration(tokens);
  }
}

function generateReactIntegration(tokens: DesignTokens): string {
  return `
import { createContext, useContext } from 'react';

// Generated theme context
const ThemeContext = createContext(${JSON.stringify(tokens, null, 2)});

export const ThemeProvider = ({ children, theme = 'light' }) => (
  <ThemeContext.Provider value={tokens}>
    <div data-theme={theme}>
      {children}
    </div>
  </ThemeContext.Provider>
);

export const useTheme = () => useContext(ThemeContext);
`;
}

function generateVueIntegration(tokens: DesignTokens): string {
  return `
import { ref, provide, inject } from 'vue';

// Generated theme composable
export const useTheme = () => {
  const theme = ref(${JSON.stringify(tokens, null, 2)});

  const setTheme = (newTheme) => {
    theme.value = newTheme;
  };

  provide('theme', theme);

  return {
    theme: readonly(theme),
    setTheme
  };
};

export const injectTheme = () => inject('theme');
`;
}

function generateVanillaIntegration(tokens: DesignTokens): string {
  return `
// Generated theme utilities
export const themes = ${JSON.stringify(tokens, null, 2)};

export const applyTheme = (themeName = 'light') => {
  const theme = themes[themeName];
  if (!theme) return;

  Object.entries(theme).forEach(([category, values]) => {
    Object.entries(values).forEach(([property, value]) => {
      document.documentElement.style.setProperty(
        \`--\${category}-\${property}\`,
        value
      );
    });
  });
};
`;
}