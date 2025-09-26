/**
 * Token Format Configuration System
 * Supports multiple design token formats for maximum ecosystem compatibility
 */

export interface TokenFormat {
  name: string;
  displayName: string;
  valueKey: '$value' | 'value';
  typeKey: '$type' | 'type' | null;
  rootKey: string;
  nested: boolean;
  description: string;
  commonUse: string[];
}

export interface TokenOutput {
  [key: string]: any;
}

export interface ColorTokens {
  primary?: Record<string, string>;
  secondary?: Record<string, string>;
  neutral?: Record<string, string>;
  semantic?: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

/**
 * Supported token format presets
 */
export const TOKEN_FORMATS: Record<string, TokenFormat> = {
  'w3c': {
    name: 'w3c',
    displayName: 'W3C Design Token Community Group',
    valueKey: '$value',
    typeKey: '$type',
    rootKey: 'colors',
    nested: true,
    description: 'Modern W3C Design Token Community Group specification',
    commonUse: ['Future-proof projects', 'W3C compliance', 'Modern toolchains']
  },

  'style-dictionary': {
    name: 'style-dictionary',
    displayName: 'Style Dictionary v3/v4',
    valueKey: 'value',
    typeKey: null,
    rootKey: 'color',
    nested: true,
    description: 'Amazon Style Dictionary format (most common)',
    commonUse: ['Existing Style Dictionary projects', 'Multi-platform apps', 'Design systems']
  },

  'figma': {
    name: 'figma',
    displayName: 'Figma Variables',
    valueKey: 'value',
    typeKey: 'type',
    rootKey: 'tokens',
    nested: false,
    description: 'Figma Variables and design tool integration',
    commonUse: ['Figma workflows', 'Design-to-dev handoff', 'Creative teams']
  },

  'tokens-studio': {
    name: 'tokens-studio',
    displayName: 'Tokens Studio (Figma Plugin)',
    valueKey: 'value',
    typeKey: 'type',
    rootKey: 'global',
    nested: true,
    description: 'Tokens Studio Figma plugin format',
    commonUse: ['Figma + Tokens Studio', 'Design system teams', 'Collaborative workflows']
  }
};

/**
 * Convert color tokens to specified format
 */
export function formatTokens(
  colorTokens: ColorTokens,
  format: TokenFormat,
  options: {
    namespace?: string;
    description?: string;
    includeMetadata?: boolean;
  } = {}
): TokenOutput {
  const { namespace = 'ai-generated', description, includeMetadata = true } = options;
  const output: TokenOutput = {};

  // Build tokens according to format specification
  if (format.nested) {
    // Nested format (W3C, Style Dictionary, Tokens Studio)
    const colorSection: any = {};

    // Add format-specific metadata
    if (format.typeKey && includeMetadata) {
      colorSection[format.typeKey] = 'color';
    }

    if (description && format.name === 'w3c') {
      colorSection['$description'] = description;
    }

    // Add color scales
    if (colorTokens.primary) {
      colorSection[`${namespace}-primary`] = formatColorScale(colorTokens.primary, format);
    }

    if (colorTokens.secondary) {
      colorSection[`${namespace}-secondary`] = formatColorScale(colorTokens.secondary, format);
    }

    if (colorTokens.neutral) {
      colorSection[`${namespace}-neutral`] = formatColorScale(colorTokens.neutral, format);
    }

    if (colorTokens.semantic) {
      colorSection[`${namespace}-semantic`] = formatSemanticColors(colorTokens.semantic, format);
    }

    output[format.rootKey] = colorSection;

  } else {
    // Flat format (Figma)
    const rootSection: any = {};

    if (colorTokens.primary) {
      Object.entries(colorTokens.primary).forEach(([scale, value]) => {
        rootSection[`${namespace}-primary-${scale}`] = {
          [format.valueKey]: value,
          ...(format.typeKey && { [format.typeKey]: 'color' })
        };
      });
    }

    if (colorTokens.secondary) {
      Object.entries(colorTokens.secondary).forEach(([scale, value]) => {
        rootSection[`${namespace}-secondary-${scale}`] = {
          [format.valueKey]: value,
          ...(format.typeKey && { [format.typeKey]: 'color' })
        };
      });
    }

    if (colorTokens.neutral) {
      Object.entries(colorTokens.neutral).forEach(([scale, value]) => {
        rootSection[`${namespace}-neutral-${scale}`] = {
          [format.valueKey]: value,
          ...(format.typeKey && { [format.typeKey]: 'color' })
        };
      });
    }

    output[format.rootKey] = rootSection;
  }

  return output;
}

/**
 * Format a color scale (50, 100, 200, etc.)
 */
function formatColorScale(colorScale: Record<string, string>, format: TokenFormat): any {
  const scale: any = {};

  Object.entries(colorScale).forEach(([weight, value]) => {
    scale[weight] = {
      [format.valueKey]: value,
      ...(format.typeKey && format.nested && { [format.typeKey]: 'color' })
    };
  });

  return scale;
}

/**
 * Format semantic colors (success, warning, error, info)
 */
function formatSemanticColors(semanticColors: NonNullable<ColorTokens['semantic']>, format: TokenFormat): any {
  const semantic: any = {};

  Object.entries(semanticColors).forEach(([role, value]) => {
    semantic[role] = {
      [format.valueKey]: value,
      ...(format.typeKey && format.nested && { [format.typeKey]: 'color' })
    };
  });

  return semantic;
}

/**
 * Auto-detect token format from existing files
 */
export async function detectTokenFormat(tokenDir: string): Promise<TokenFormat | null> {
  try {
    const fs = await import('fs-extra');
    const path = await import('path');

    // Look for existing token files
    const tokenFiles = await fs.readdir(tokenDir);
    const jsonFiles = tokenFiles.filter(file => file.endsWith('.json'));

    for (const file of jsonFiles) {
      try {
        const filePath = path.join(tokenDir, file);
        const content = await fs.readJson(filePath);

        // Check for W3C format patterns
        if (content.colors && hasW3CPatterns(content)) {
          return TOKEN_FORMATS['w3c'];
        }

        // Check for Style Dictionary patterns
        if (content.color && hasStyleDictionaryPatterns(content)) {
          return TOKEN_FORMATS['style-dictionary'];
        }

        // Check for Figma/Tokens Studio patterns
        if (content.global || content.tokens) {
          if (content.global) {
            return TOKEN_FORMATS['tokens-studio'];
          } else {
            return TOKEN_FORMATS['figma'];
          }
        }

      } catch (error) {
        // Skip invalid JSON files
        continue;
      }
    }

    return null; // No format detected

  } catch (error) {
    return null;
  }
}

/**
 * Check for W3C Design Token patterns
 */
function hasW3CPatterns(content: any): boolean {
  return (
    hasDeepProperty(content, '$value') ||
    hasDeepProperty(content, '$type') ||
    hasDeepProperty(content, '$description')
  );
}

/**
 * Check for Style Dictionary patterns
 */
function hasStyleDictionaryPatterns(content: any): boolean {
  return (
    hasDeepProperty(content, 'value') &&
    !hasDeepProperty(content, '$value') &&
    !hasDeepProperty(content, 'type')
  );
}

/**
 * Recursively check if object has a property
 */
function hasDeepProperty(obj: any, prop: string): boolean {
  if (!obj || typeof obj !== 'object') return false;

  if (obj.hasOwnProperty(prop)) return true;

  for (const key in obj) {
    if (hasDeepProperty(obj[key], prop)) return true;
  }

  return false;
}

/**
 * Get format by name with fallback
 */
export function getTokenFormat(formatName?: string): TokenFormat {
  if (!formatName) {
    return TOKEN_FORMATS['w3c']; // Default to W3C for future-proofing
  }

  const format = TOKEN_FORMATS[formatName.toLowerCase()];
  if (!format) {
    console.warn(`Unknown format "${formatName}", falling back to W3C format`);
    return TOKEN_FORMATS['w3c'];
  }

  return format;
}

/**
 * List available formats for CLI help
 */
export function listAvailableFormats(): string {
  return Object.values(TOKEN_FORMATS)
    .map(format => {
      const structure = `${format.rootKey} → ${format.valueKey}`;
      const commonUse = format.commonUse.slice(0, 2).join(', ');
      return `  ${format.name.padEnd(15)} - ${format.displayName}
    Structure: ${structure.padEnd(20)} | Common use: ${commonUse}`;
    })
    .join('\n\n');
}

/**
 * Convert Style Dictionary tokens to target format
 */
export function convertStyleDictionaryTokens(
  tokens: { color: any },
  targetFormat: TokenFormat,
  options: { namespace?: string } = {}
): TokenOutput {
  const colorTokens: ColorTokens = {
    primary: extractColorScale(tokens.color.primary),
    secondary: extractColorScale(tokens.color.secondary),
    neutral: extractColorScale(tokens.color.neutral),
    semantic: tokens.color.semantic ? {
      success: tokens.color.semantic.success?.value || '#10b981',
      warning: tokens.color.semantic.warning?.value || '#f59e0b',
      error: tokens.color.semantic.error?.value || '#ef4444',
      info: tokens.color.semantic.info?.value || '#3b82f6'
    } : undefined
  };

  return formatTokens(colorTokens, targetFormat, options);
}

/**
 * Extract color scale from Style Dictionary format
 */
function extractColorScale(scale: any): Record<string, string> | undefined {
  if (!scale) return undefined;

  const result: Record<string, string> = {};
  Object.entries(scale).forEach(([key, token]: [string, any]) => {
    if (token && typeof token === 'object' && token.value) {
      result[key] = token.value;
    }
  });

  return Object.keys(result).length > 0 ? result : undefined;
}