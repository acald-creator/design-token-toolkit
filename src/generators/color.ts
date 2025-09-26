import { generateSemanticColorsAI, suggestBrandColorsAI, generateAccessibleCombination } from "../core/ColorAnalysis.gen.js";
import { generateColorPalette } from "../core/PaletteGeneration.gen.js";
import type { ColorGenerationOptions, DesignTokens, ColorPalette } from "../types/index.js";

/**
 * Generate a fallback palette when ReScript function returns undefined
 */
function generateFallbackPalette(baseColor: string): ColorPalette {
  return {
    50: baseColor,
    100: baseColor,
    200: baseColor,
    300: baseColor,
    400: baseColor,
    500: baseColor,
    600: baseColor,
    700: baseColor,
    800: baseColor,
    900: baseColor
  };
}

/**
 * Generate a complete color system from brand colors
 */
export function generateColorSystem(
  primaryColor: string,
  secondaryColor?: string,
  options: Partial<ColorGenerationOptions> = {}
): Pick<DesignTokens, 'color'> {
  const steps = options.steps || 10;
  const primaryPalette = generateColorPalette(primaryColor, steps);
  const secondaryPalette = secondaryColor
    ? generateColorPalette(secondaryColor, steps)
    : generateColorPalette(primaryColor, steps);

  // Generate neutral palette (grays)
  const neutralPalette = generateColorPalette('#6b7280', steps);

  // Convert ReScript colorPalette to TypeScript ColorPalette (add missing "50")
  const toColorPalette = (rescriptPalette: any): ColorPalette => {
    if (!rescriptPalette) return generateFallbackPalette(primaryColor);
    return {
      50: rescriptPalette["100"] || primaryColor, // Use 100 as fallback for 50
      100: rescriptPalette["100"] || primaryColor,
      200: rescriptPalette["200"] || primaryColor,
      300: rescriptPalette["300"] || primaryColor,
      400: rescriptPalette["400"] || primaryColor,
      500: rescriptPalette["500"] || primaryColor,
      600: rescriptPalette["600"] || primaryColor,
      700: rescriptPalette["700"] || primaryColor,
      800: rescriptPalette["800"] || primaryColor,
      900: rescriptPalette["900"] || primaryColor
    };
  };

  // Use AI-powered semantic color generation
  const semanticColorsAI = generateSemanticColorsAI({
    primary: primaryColor,
    secondary: secondaryColor
  });

  // Convert to expected format
  const semanticColors = {
    brand: {
      primary: primaryColor,
      'primary-hover': primaryPalette?.["600"] || primaryColor,
      'primary-light': primaryPalette?.["400"] || primaryColor,
      'primary-dark': primaryPalette?.["700"] || primaryColor,
      secondary: secondaryColor || (primaryPalette?.["700"] || primaryColor)
    },
    semantic: {
      success: semanticColorsAI.semantic.success,
      warning: semanticColorsAI.semantic.warning,
      error: semanticColorsAI.semantic.error,
      info: semanticColorsAI.semantic.info
    }
  };

  return {
    color: {
      core: {
        primary: toColorPalette(primaryPalette),
        secondary: toColorPalette(secondaryPalette),
        neutral: toColorPalette(neutralPalette)
      },
      semantic: semanticColors
    }
  };
}

/**
 * Generate theme-specific color mappings
 */
export function generateThemeColors(
  theme: 'light' | 'dark',
  coreColors: DesignTokens['color']['core']
): Pick<DesignTokens['color'], 'background' | 'text' | 'border'> {
  if (theme === 'light') {
    return {
      background: {
        primary: coreColors.neutral[50],
        secondary: coreColors.neutral[100],
        elevated: '#ffffff'
      },
      text: {
        primary: coreColors.neutral[900],
        secondary: coreColors.neutral[600],
        disabled: coreColors.neutral[400]
      },
      border: {
        default: coreColors.neutral[200],
        focus: coreColors.primary[500]
      }
    };
  } else {
    return {
      background: {
        primary: coreColors.neutral[900],
        secondary: coreColors.neutral[800],
        elevated: coreColors.neutral[800]
      },
      text: {
        primary: coreColors.neutral[50],
        secondary: coreColors.neutral[300],
        disabled: coreColors.neutral[500]
      },
      border: {
        default: coreColors.neutral[700],
        focus: coreColors.primary[400]
      }
    };
  }
}

/**
 * Generate accessible color combinations for themes
 */
export function generateAccessibleTheme(
  coreColors: DesignTokens['color']['core']
): {
  light: Pick<DesignTokens['color'], 'background' | 'text' | 'border'>;
  dark: Pick<DesignTokens['color'], 'background' | 'text' | 'border'>;
} {
  return {
    light: generateThemeColors('light', coreColors),
    dark: generateThemeColors('dark', coreColors)
  };
}

/**
 * Suggest brand colors based on color theory
 */
export function suggestBrandColors(baseColor: string): {
  primary: string;
  secondary: string;
  suggestions: string[];
  ai: ReturnType<typeof suggestBrandColorsAI>;
} {
  const ai = suggestBrandColorsAI(baseColor);

  return {
    primary: baseColor,
    secondary: ai.suggestions.find(s => s.category === 'secondary')?.color || generateAccessibleCombination(baseColor, undefined, undefined).text,
    suggestions: ai.suggestions.map(s => s.color),
    ai
  };
}