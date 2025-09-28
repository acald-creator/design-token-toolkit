/**
 * ReScript Color Integration
 * Bridge between TypeScript, ReScript color mathematics, and optimized color libraries
 * Provides high-performance color calculations with color-bits and culori integration
 */

import { parse, toHSLA } from 'color-bits';
import { wcagContrast, interpolate } from 'culori';
import * as ColorMath from '../core/ColorMath.gen.js';
import * as Culori from '../core/Culori.gen.js';
import * as PaletteGeneration from '../core/PaletteGeneration.gen.js';
import * as AccessibilityAnalysisRS from '../core/AccessibilityAnalysis.gen.js';

// Import ReScript-generated types
export type {
  color as RGBColor,
  hslColor as HSLColor,
  labColor as LABColor,
  colorBlindnessType as ColorBlindnessType,
  harmonyType as HarmonyType
} from '@rescript/math';

// Additional types for culori integration
interface OKLCHColor {
  l: number;  // 0-1
  c: number;  // 0-0.4
  h: number;  // 0-360
  alpha?: number;
}

interface P3Color {
  r: number;  // 0-1
  g: number;  // 0-1
  b: number;  // 0-1
  alpha?: number;
}

interface ColorAnalysis {
  srgb: { r: number; g: number; b: number; alpha: number };
  oklch: OKLCHColor;
  p3: P3Color;
  inSRGBGamut: boolean;
  inP3Gamut: boolean;
  inRec2020Gamut: boolean;
}

interface AccessibilityAnalysis {
  wcagAACompliant: boolean;
  wcagAAACompliant: boolean;
  contrastRatios: { background: string; ratio: number }[];
  colorBlindnessIssues: string[];
  recommendations: string[];
}

/**
 * Essential Bridge Functions
 * Only the functions actually used by the application
 */

/**
 * Convert hex to RGB - simple implementation
 */
export function hexToRgb(hex: string): ColorMath.color {
  // Simple hex to RGB conversion
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    };
  }
  return { r: 0, g: 0, b: 0 }; // Fallback to black
}

/**
 * Convert RGB object to hex for external use
 */
export function rgbToHex(rgb: ColorMath.color): string {
  // Use simple hex conversion
  const r = Math.round(rgb.r * 255);
  const g = Math.round(rgb.g * 255);
  const b = Math.round(rgb.b * 255);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Enhanced Delta-E calculation using ReScript implementation
 */
export function calculateDeltaE(color1: string, color2: string): number {
  try {
    // Convert hex to RGB first
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    return ColorMath.deltaE(rgb1, rgb2);
  } catch (error) {
    console.warn('ReScript DeltaE calculation failed:', error);
    return 50.0; // Default fallback value
  }
}

/**
 * Enhanced contrast calculation using ReScript implementation
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  try {
    // Convert hex to RGB first
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    return ColorMath.contrastRatio(rgb1, rgb2);
  } catch (error) {
    console.warn('ReScript contrast calculation failed, using culori fallback:', error);
    try {
      return wcagContrast(color1, color2) || 1.0;
    } catch {
      return 1.0; // Default fallback
    }
  }
}

/**
 * Comprehensive accessibility analysis using ReScript implementation
 * Expected 3.3x speedup over TypeScript
 */
export function analyzeAccessibilityComprehensiveReScript(
  colors: string[],
  backgrounds: string[] = ['#ffffff', '#000000']
): AccessibilityAnalysisRS.accessibilityAnalysis {
  try {
    return AccessibilityAnalysisRS.analyzeAccessibilityComprehensive(colors, backgrounds);
  } catch (error) {
    console.warn('ReScript accessibility analysis failed:', error);
    // Return minimal fallback structure
    return {
      overallScore: 50,
      wcagCompliance: 'Partial' as any,
      colorBlindnessScore: 50,
      contrastIssues: [],
      problematicPairs: []
    };
  }
}

/**
 * Generate color palette using ReScript implementation
 */
export function generateIntelligentPaletteReScript(
  baseColor: string,
  options: PaletteGeneration.paletteOptions
): PaletteGeneration.colorPalette | undefined {
  try {
    return PaletteGeneration.generateIntelligentPalette(baseColor, options);
  } catch (error) {
    console.warn('ReScript palette generation failed:', error);
    return undefined;
  }
}

/**
 * Culori OKLCH functions using our optimized bindings
 */
export function oklchToHex(l: number, c: number, h: number): string {
  try {
    return Culori.oklchToHex(l, c, h);
  } catch (error) {
    console.warn('Culori OKLCH to hex conversion failed:', error);
    return '#000000'; // Fallback
  }
}

export function parseToOklch(hexString: string): Culori.color {
  try {
    return Culori.parseToOklch(hexString);
  } catch (error) {
    console.warn('Culori parse to OKLCH failed:', error);
    // Return fallback color structure
    return {
      mode: 'oklch',
      l: { tag: 'Some', _0: 0.5 },
      c: { tag: 'Some', _0: 0.1 },
      h: { tag: 'Some', _0: 0.0 },
      r: { tag: 'None' },
      g: { tag: 'None' },
      b: { tag: 'None' },
      alpha: { tag: 'Some', _0: 1.0 }
    } as any;
  }
}

/**
 * High-performance contrast calculation using culori
 */
export function wcagContrastOptimized(color1: string, color2: string): number {
  try {
    return wcagContrast(color1, color2) || 1.0;
  } catch (error) {
    console.warn('Culori WCAG contrast calculation failed:', error);
    return 1.0;
  }
}

/**
 * Color parsing using color-bits for maximum performance
 */
export function parseColorOptimized(colorString: string): any {
  try {
    return parse(colorString);
  } catch (error) {
    console.warn('color-bits parsing failed:', error);
    return null;
  }
}

/**
 * Simple color validation
 */
export function isValidColor(color: string): boolean {
  try {
    return parse(color) !== null;
  } catch {
    return false;
  }
}

// Re-export key ReScript types and functions for convenience
export { PaletteGeneration, ColorMath, Culori, AccessibilityAnalysisRS };