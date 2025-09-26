/**
 * ReScript Color Integration
 * Bridge between TypeScript, ReScript color mathematics, and colorjs.io
 * Provides high-performance color calculations with comprehensive color space support
 */

import chroma from 'chroma-js';
import Color from 'colorjs.io';
import * as ColorMath from '../core/ColorMath.gen.js';
import * as ColorJsIo from '../core/ColorJsIo.gen.js';
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

// Additional types for colorjs.io integration
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
  gamutMapped: boolean;
  inSRGBGamut: boolean;
  inP3Gamut: boolean;
}

/**
 * Convert hex color to RGB object for ReScript consumption
 */
export function hexToRgb(hex: string): ColorMath.color {
  const color = chroma(hex);
  const [r, g, b] = color.rgb();
  return { r, g, b };
}

/**
 * Convert RGB object to hex for external use
 */
export function rgbToHex(rgb: ColorMath.color): string {
  return chroma.rgb(rgb.r, rgb.g, rgb.b).hex();
}

/**
 * Enhanced Delta-E calculation using ReScript implementation
 * More accurate LAB-based calculation than chroma-js
 */
export function calculateDeltaE(color1: string, color2: string): number {
  try {
    return ColorMath.deltaE(hexToRgb(color1), hexToRgb(color2));
  } catch (error) {
    console.warn('ReScript DeltaE calculation failed, using chroma-js fallback:', error);
    return chroma.deltaE(color1, color2);
  }
}

/**
 * WCAG contrast ratio using ReScript implementation
 * More accurate luminance calculation than chroma-js
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  try {
    return ColorMath.contrastRatio(hexToRgb(color1), hexToRgb(color2));
  } catch (error) {
    console.warn('ReScript contrast ratio calculation failed, using chroma-js fallback:', error);
    return chroma.contrast(color1, color2);
  }
}

/**
 * Color blindness simulation using accurate ReScript transformation matrices
 * More precise than chroma-js approximations
 */
export function simulateColorBlindness(
  color: string,
  type: ColorMath.colorBlindnessType
): string {
  try {
    const simulatedRgb = ColorMath.simulateColorBlindness(hexToRgb(color), type);
    return rgbToHex(simulatedRgb);
  } catch (error) {
    console.warn('ReScript color blindness simulation failed, using fallback:', error);
    // Fallback to simplified chroma-js simulation
    const baseColor = chroma(color);
    switch (type) {
      case 'Protanopia':
        return baseColor.set('hsl.h', baseColor.get('hsl.h') * 0.8).hex();
      case 'Deuteranopia':
        return baseColor.set('hsl.s', baseColor.get('hsl.s') * 0.6).hex();
      case 'Tritanopia':
        return baseColor.set('hsl.h', (baseColor.get('hsl.h') + 180) % 360).hex();
      default:
        return color;
    }
  }
}

/**
 * Check if colors are distinguishable for accessibility using ReScript algorithms
 */
export function areColorsDistinguishable(
  color1: string,
  color2: string,
  options: {
    minimumDeltaE?: number;
    minimumContrast?: number;
  } = {}
): boolean {
  const { minimumDeltaE = 10, minimumContrast = 3 } = options;

  try {
    return ColorMath.areColorsDistinguishable(
      hexToRgb(color1),
      hexToRgb(color2),
      minimumDeltaE,
      minimumContrast
    );
  } catch (error) {
    console.warn('ReScript areColorsDistinguishable failed, using fallback:', error);
    const deltaE = calculateDeltaE(color1, color2);
    const contrast = calculateContrastRatio(color1, color2);
    return deltaE >= minimumDeltaE && contrast >= minimumContrast;
  }
}

/**
 * Detect color harmony using ReScript algorithms
 * Analyzes hue relationships in HSL color space
 */
export function detectColorHarmony(colors: string[]): ColorMath.harmonyType | null {
  if (colors.length < 2) return null;

  try {
    const rgbColors = colors.map(hexToRgb);
    const harmony = ColorMath.detectHarmony(rgbColors);
    return harmony || null;
  } catch (error) {
    console.warn('ReScript detectColorHarmony failed, using fallback:', error);
    // Fallback - basic harmony detection
    const hues = colors.map(color => chroma(color).get('hsl.h'));

    if (colors.length === 2) {
      const hueDiff = Math.abs(hues[0] - hues[1]);
      const normalizedDiff = hueDiff > 180 ? 360 - hueDiff : hueDiff;

      if (normalizedDiff >= 150 && normalizedDiff <= 210) {
        return 'Complementary';
      } else if (normalizedDiff <= 30) {
        return 'Analogous';
      }
    }

    return null;
  }
}

/**
 * Calculate comprehensive accessibility score using ReScript algorithms
 * Combines WCAG contrast ratios and Delta-E perceptual differences
 */
export function calculateAccessibilityScore(colors: string[]): number {
  if (colors.length < 2) return 50;

  try {
    const rgbColors = colors.map(hexToRgb);
    return ColorMath.calculateAccessibilityScore(rgbColors);
  } catch (error) {
    console.warn('ReScript calculateAccessibilityScore failed, falling back to manual implementation:', error);
    // Fallback implementation
    let totalScore = 0;
    let pairCount = 0;

    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const contrast = calculateContrastRatio(colors[i], colors[j]);
        const deltaE = calculateDeltaE(colors[i], colors[j]);

        let pairScore = 20; // Poor default
        if (contrast >= 7 && deltaE >= 15) {
          pairScore = 100; // Excellent
        } else if (contrast >= 4.5 && deltaE >= 10) {
          pairScore = 80;  // Good
        } else if (contrast >= 3 && deltaE >= 5) {
          pairScore = 60;  // Fair
        }

        totalScore += pairScore;
        pairCount++;
      }
    }

    return totalScore / pairCount;
  }
}

/**
 * Enhanced accessibility analysis combining multiple metrics
 */
export interface AccessibilityAnalysis {
  overallScore: number;
  wcagCompliance: 'AAA' | 'AA' | 'partial' | 'none';
  colorBlindnessCompatible: boolean;
  recommendations: string[];
}

export function analyzeAccessibility(colors: string[]): AccessibilityAnalysis {
  const overallScore = calculateAccessibilityScore(colors);

  // Test color blindness compatibility
  const colorBlindnessTypes: ColorMath.colorBlindnessType[] = ['Protanopia', 'Deuteranopia', 'Tritanopia'];
  let colorBlindnessCompatible = true;

  for (const type of colorBlindnessTypes) {
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const original1 = colors[i];
        const original2 = colors[j];
        const simulated1 = simulateColorBlindness(original1, type);
        const simulated2 = simulateColorBlindness(original2, type);

        const originalDistinguishable = areColorsDistinguishable(original1, original2);
        const simulatedDistinguishable = areColorsDistinguishable(simulated1, simulated2);

        if (originalDistinguishable && !simulatedDistinguishable) {
          colorBlindnessCompatible = false;
          break;
        }
      }
      if (!colorBlindnessCompatible) break;
    }
    if (!colorBlindnessCompatible) break;
  }

  // Determine WCAG compliance
  let wcagCompliance: AccessibilityAnalysis['wcagCompliance'] = 'none';
  if (overallScore >= 95) {
    wcagCompliance = 'AAA';
  } else if (overallScore >= 80) {
    wcagCompliance = 'AA';
  } else if (overallScore >= 60) {
    wcagCompliance = 'partial';
  }

  // Generate recommendations
  const recommendations: string[] = [];
  if (overallScore < 80) {
    recommendations.push('Increase contrast between color pairs to meet WCAG AA standards');
  }
  if (!colorBlindnessCompatible) {
    recommendations.push('Some color combinations may be indistinguishable for color blind users');
  }
  if (colors.length > 7) {
    recommendations.push('Consider reducing the number of colors to improve cognitive accessibility');
  }

  return {
    overallScore,
    wcagCompliance,
    colorBlindnessCompatible,
    recommendations
  };
}

/**
 * colorjs.io Integration Functions
 * High-performance OKLCH and P3 color space operations
 */

/**
 * Parse any color string using colorjs.io (supports OKLCH, P3, etc.)
 */
export function parseColor(colorString: string): ColorAnalysis {
  try {
    const color = new Color(colorString);

    // Get sRGB values
    const srgbColor = color.to('srgb');
    const srgb = {
      r: srgbColor.coords[0],
      g: srgbColor.coords[1],
      b: srgbColor.coords[2],
      alpha: srgbColor.alpha ?? 1
    };

    // Get OKLCH values
    const oklchColor = color.to('oklch');
    const oklch: OKLCHColor = {
      l: oklchColor.coords[0],
      c: oklchColor.coords[1],
      h: oklchColor.coords[2] || 0,
      alpha: oklchColor.alpha ?? 1
    };

    // Get P3 values
    const p3Color = color.to('p3');
    const p3: P3Color = {
      r: p3Color.coords[0],
      g: p3Color.coords[1],
      b: p3Color.coords[2],
      alpha: p3Color.alpha ?? 1
    };

    return {
      srgb,
      oklch,
      p3,
      gamutMapped: false, // TODO: implement gamut mapping detection
      inSRGBGamut: color.inGamut('srgb'),
      inP3Gamut: color.inGamut('p3')
    };
  } catch (error) {
    throw new Error(`Failed to parse color "${colorString}": ${error}`);
  }
}

/**
 * Convert color to OKLCH string representation
 */
export function toOklch(colorString: string): string {
  try {
    return new Color(colorString).to('oklch').toString();
  } catch (error) {
    throw new Error(`Failed to convert "${colorString}" to OKLCH: ${error}`);
  }
}

/**
 * Convert color to P3 string representation
 */
export function toP3(colorString: string): string {
  try {
    return new Color(colorString).to('p3').toString();
  } catch (error) {
    throw new Error(`Failed to convert "${colorString}" to P3: ${error}`);
  }
}

/**
 * Map color to target gamut (e.g., sRGB, P3)
 */
export function mapToGamut(colorString: string, targetGamut: 'srgb' | 'p3' | 'rec2020' = 'srgb'): string {
  try {
    const color = new Color(colorString);
    const mappedColor = color.toGamut(targetGamut);
    return mappedColor.toString();
  } catch (error) {
    throw new Error(`Failed to map "${colorString}" to ${targetGamut} gamut: ${error}`);
  }
}

/**
 * Check if color is in specified gamut
 */
export function inGamut(colorString: string, gamut: 'srgb' | 'p3' | 'rec2020' = 'srgb'): boolean {
  try {
    return new Color(colorString).inGamut(gamut);
  } catch (error) {
    console.warn(`Failed to check gamut for "${colorString}": ${error}`);
    return false;
  }
}

/**
 * Calculate Delta-E using colorjs.io (supports different algorithms)
 */
export function calculateDeltaEColorJS(
  color1: string,
  color2: string,
  method: '76' | '2000' | 'OK' | 'CMC' | 'Jz' | 'ITP' | 'HCT' = '2000'
): number {
  try {
    const c1 = new Color(color1);
    const c2 = new Color(color2);
    return c1.deltaE(c2, method);
  } catch (error) {
    console.warn(`colorjs.io Delta-E calculation failed: ${error}`);
    // Fallback to ReScript implementation
    return calculateDeltaE(color1, color2);
  }
}

/**
 * Advanced contrast calculation using colorjs.io
 */
export function calculateContrastColorJS(
  color1: string,
  color2: string,
  method: 'WCAG21' | 'APCA' | 'Michelson' = 'WCAG21'
): number {
  try {
    const c1 = new Color(color1);
    const c2 = new Color(color2);
    return c1.contrast(c2, method);
  } catch (error) {
    console.warn(`colorjs.io contrast calculation failed: ${error}`);
    // Fallback to ReScript implementation
    return calculateContrastRatio(color1, color2);
  }
}

/**
 * OKLCH Color Analysis using colorjs.io
 * Provides accurate OKLCH and P3 color space analysis
 */
export function analyzeColorWithOklch(baseColor: string): ColorAnalysis {
  try {
    return parseColor(baseColor);
  } catch (error) {
    console.warn(`colorjs.io OKLCH analysis failed for "${baseColor}", using chroma-js fallback:`, error);

    // Fallback to chroma-js
    const chromaColor = chroma(baseColor);
    const [l, c, h] = chromaColor.oklch();
    const alpha = chromaColor.alpha();

    // Normalize values
    const normalizedL = l / 100;
    const normalizedC = c / 0.4;

    return {
      srgb: {
        r: chromaColor.get('rgb.r') / 255,
        g: chromaColor.get('rgb.g') / 255,
        b: chromaColor.get('rgb.b') / 255,
        alpha
      },
      oklch: {
        l: normalizedL,
        c: normalizedC,
        h,
        alpha
      },
      p3: {
        r: chromaColor.get('rgb.r') / 255, // Approximate
        g: chromaColor.get('rgb.g') / 255,
        b: chromaColor.get('rgb.b') / 255,
        alpha
      },
      gamutMapped: false,
      inSRGBGamut: true, // Assume true for fallback
      inP3Gamut: true
    };
  }
}

/**
 * Generate OKLCH-based color variations using colorjs.io
 * Creates perceptually uniform color variations
 */
export function generateOklchVariations(
  baseColor: string,
  variations: number = 5
): Array<{
  color: string;
  oklch: OKLCHColor;
  description: string;
}> {
  try {
    const analysis = analyzeColorWithOklch(baseColor);
    const { l, c, h } = analysis.oklch;
    const variationsArray: Array<{ color: string; oklch: OKLCHColor; description: string }> = [];

    // Lighter variations
    for (let i = 1; i <= Math.ceil(variations / 2); i++) {
      const newL = Math.min(0.95, l + (i * 0.15));
      const oklchString = `oklch(${newL} ${c} ${h})`;
      const hexColor = new Color(oklchString).to('srgb').toString({ format: 'hex' });

      variationsArray.push({
        color: hexColor,
        oklch: { l: newL, c, h },
        description: `Lighter variation ${i}`
      });
    }

    // Base color
    variationsArray.push({
      color: baseColor,
      oklch: { l, c, h },
      description: 'Base color'
    });

    // Darker variations
    for (let i = 1; i <= Math.floor(variations / 2); i++) {
      const newL = Math.max(0.05, l - (i * 0.15));
      const oklchString = `oklch(${newL} ${c} ${h})`;
      const hexColor = new Color(oklchString).to('srgb').toString({ format: 'hex' });

      variationsArray.push({
        color: hexColor,
        oklch: { l: newL, c, h },
        description: `Darker variation ${i}`
      });
    }

    return variationsArray;
  } catch (error) {
    console.warn('colorjs.io OKLCH variations failed, using chroma-js fallback:', error);

    // Fallback using chroma-js
    const analysis = analyzeColorWithOklch(baseColor);
    const { l, c, h } = analysis.oklch;
    const variationsArray: Array<{ color: string; oklch: OKLCHColor; description: string }> = [];

    // Lighter variations
    for (let i = 1; i <= Math.ceil(variations / 2); i++) {
      const newL = Math.min(0.95, l + (i * 0.1));
      const variation = chroma.oklch(newL * 100, c * 0.4, h);
      variationsArray.push({
        color: variation.hex(),
        oklch: { l: newL, c, h },
        description: `Lighter variation ${i}`
      });
    }

    // Base color
    variationsArray.push({
      color: baseColor,
      oklch: { l, c, h },
      description: 'Base color'
    });

    // Darker variations
    for (let i = 1; i <= Math.floor(variations / 2); i++) {
      const newL = Math.max(0.05, l - (i * 0.1));
      const variation = chroma.oklch(newL * 100, c * 0.4, h);
      variationsArray.push({
        color: variation.hex(),
        oklch: { l: newL, c, h },
        description: `Darker variation ${i}`
      });
    }

    return variationsArray;
  }
}

/**
 * ReScript colorjs.io Enhanced Functions
 * High-performance OKLCH operations using ReScript bindings
 */

/**
 * Parse color using ReScript colorjs.io bindings (potentially faster)
 */
export function parseColorReScript(colorString: string): ColorJsIo.color {
  try {
    return ColorJsIo.parseColor(colorString);
  } catch (error) {
    throw new Error(`ReScript colorjs.io failed to parse "${colorString}": ${error}`);
  }
}

/**
 * Create OKLCH color using ReScript bindings
 */
export function createOklchColor(l: number, c: number, h: number, alpha = 1.0): ColorJsIo.color {
  return alpha === 1.0
    ? ColorJsIo.oklch(l, c, h)
    : ColorJsIo.oklchWithAlpha(l, c, h, alpha);
}

/**
 * Create P3 color using ReScript bindings
 */
export function createP3Color(r: number, g: number, b: number, alpha = 1.0): ColorJsIo.color {
  return alpha === 1.0
    ? ColorJsIo.p3(r, g, b)
    : ColorJsIo.p3WithAlpha(r, g, b, alpha);
}

/**
 * Enhanced OKLCH manipulations using ReScript
 */
export function adjustOklchLightness(colorString: string, newLightness: number): string {
  try {
    const color = ColorJsIo.parseColor(colorString);
    const adjusted = ColorJsIo.setOklchLightness(color, newLightness);
    return ColorJsIo.toHex(adjusted);
  } catch (error) {
    console.warn('ReScript OKLCH lightness adjustment failed, using colorjs.io fallback:', error);
    const color = new Color(colorString).to('oklch');
    color.coords[0] = newLightness;
    return color.to('srgb').toString({ format: 'hex' });
  }
}

export function adjustOklchChroma(colorString: string, newChroma: number): string {
  try {
    const color = ColorJsIo.parseColor(colorString);
    const adjusted = ColorJsIo.setOklchChroma(color, newChroma);
    return ColorJsIo.toHex(adjusted);
  } catch (error) {
    console.warn('ReScript OKLCH chroma adjustment failed, using colorjs.io fallback:', error);
    const color = new Color(colorString).to('oklch');
    color.coords[1] = newChroma;
    return color.to('srgb').toString({ format: 'hex' });
  }
}

export function adjustOklchHue(colorString: string, newHue: number): string {
  try {
    const color = ColorJsIo.parseColor(colorString);
    const adjusted = ColorJsIo.setOklchHue(color, newHue);
    return ColorJsIo.toHex(adjusted);
  } catch (error) {
    console.warn('ReScript OKLCH hue adjustment failed, using colorjs.io fallback:', error);
    const color = new Color(colorString).to('oklch');
    color.coords[2] = newHue;
    return color.to('srgb').toString({ format: 'hex' });
  }
}

/**
 * Get OKLCH coordinates using ReScript
 */
export function getOklchCoordinates(colorString: string): { l: number; c: number; h: number } {
  try {
    const color = ColorJsIo.parseColor(colorString);
    const coords = ColorJsIo.getOklchCoords(color);
    return {
      l: coords[0],
      c: coords[1],
      h: coords[2]
    };
  } catch (error) {
    console.warn('ReScript OKLCH coordinates failed, using colorjs.io fallback:', error);
    const color = new Color(colorString).to('oklch');
    return {
      l: color.coords[0],
      c: color.coords[1],
      h: color.coords[2]
    };
  }
}

/**
 * Get P3 coordinates using ReScript
 */
export function getP3Coordinates(colorString: string): { r: number; g: number; b: number } {
  try {
    const color = ColorJsIo.parseColor(colorString);
    const coords = ColorJsIo.getP3Coords(color);
    return {
      r: coords[0],
      g: coords[1],
      b: coords[2]
    };
  } catch (error) {
    console.warn('ReScript P3 coordinates failed, using colorjs.io fallback:', error);
    const color = new Color(colorString).to('p3');
    return {
      r: color.coords[0],
      g: color.coords[1],
      b: color.coords[2]
    };
  }
}

/**
 * Convert to OKLCH string using ReScript
 */
export function toOklchStringReScript(colorString: string): string {
  try {
    const color = ColorJsIo.parseColor(colorString);
    return ColorJsIo.toOklchString(color);
  } catch (error) {
    console.warn('ReScript OKLCH string conversion failed, using colorjs.io fallback:', error);
    return new Color(colorString).to('oklch').toString();
  }
}

/**
 * Convert to P3 string using ReScript
 */
export function toP3StringReScript(colorString: string): string {
  try {
    const color = ColorJsIo.parseColor(colorString);
    return ColorJsIo.toP3String(color);
  } catch (error) {
    console.warn('ReScript P3 string conversion failed, using colorjs.io fallback:', error);
    return new Color(colorString).to('p3').toString();
  }
}

/**
 * ReScript Palette Generation Integration
 * High-performance palette functions using ReScript optimization
 */

/**
 * Generate color palette using optimized ReScript implementation
 * Expected 3-5x performance improvement over TypeScript
 */
export function generateColorPaletteReScript(
  baseColor: string,
  steps: number = 10
): PaletteGeneration.colorPalette | null {
  try {
    const result = PaletteGeneration.generateColorPalette(baseColor, steps);
    return result || null;
  } catch (error) {
    console.warn('ReScript generateColorPalette failed, using TypeScript fallback:', error);
    return null;
  }
}

/**
 * Generate harmonious palette using ReScript implementation
 * Expected 4-6x performance improvement over TypeScript
 */
export function generateHarmoniousPaletteReScript(
  baseColor: string,
  harmonyType: 'analogous' | 'complementary' | 'triadic' | 'monochromatic'
): string[] {
  try {
    return PaletteGeneration.generateHarmoniousPalette(baseColor, harmonyType);
  } catch (error) {
    console.warn('ReScript generateHarmoniousPalette failed, using TypeScript fallback:', error);
    // Simple fallback
    const base = chroma(baseColor);
    switch (harmonyType) {
      case 'analogous':
        return [
          base.set('hsl.h', '-30').hex(),
          baseColor,
          base.set('hsl.h', '+30').hex()
        ];
      case 'complementary':
        return [baseColor, base.set('hsl.h', '+180').hex()];
      case 'triadic':
        return [
          baseColor,
          base.set('hsl.h', '+120').hex(),
          base.set('hsl.h', '+240').hex()
        ];
      default:
        return [baseColor];
    }
  }
}

/**
 * Generate intelligent palette with style awareness using ReScript
 * Main performance optimization target - expected 3-5x improvement
 */
export function generateIntelligentPaletteReScript(
  baseColor: string,
  options: {
    style: 'Professional' | 'Vibrant' | 'Minimal' | 'Warm' | 'Cool';
    accessibility: boolean;
    size: number;
  }
): PaletteGeneration.colorPalette | null {
  try {
    const paletteOptions: PaletteGeneration.paletteOptions = {
      style: options.style as PaletteGeneration.paletteStyle,
      accessibility: options.accessibility,
      size: options.size
    };
    const result = PaletteGeneration.generateIntelligentPalette(baseColor, paletteOptions);
    return result || null;
  } catch (error) {
    console.warn('ReScript generateIntelligentPalette failed, using fallback:', error);
    return null;
  }
}

/**
 * Calculate relative luminance using high-performance AccessibilityAnalysis implementation
 */
export function calculateRelativeLuminanceReScript(color: string): number {
  try {
    const rgb = hexToRgb(color);
    return AccessibilityAnalysisRS.calculateRelativeLuminance(rgb);
  } catch (error) {
    console.warn('ReScript calculateRelativeLuminance failed, using fallback:', error);
    const c = chroma(color);
    return c.luminance();
  }
}

/**
 * Calculate contrast ratio using high-performance AccessibilityAnalysis implementation
 */
export function calculateContrastRatioReScript(color1: string, color2: string): number {
  try {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    return AccessibilityAnalysisRS.calculateContrastRatio(rgb1, rgb2);
  } catch (error) {
    console.warn('ReScript calculateContrastRatio failed, using fallback:', error);
    return chroma.contrast(color1, color2);
  }
}

/**
 * Validate palette accessibility using ReScript implementation
 */
export function validatePaletteAccessibilityReScript(palette: PaletteGeneration.colorPalette): boolean {
  try {
    return PaletteGeneration.validatePaletteAccessibility(palette);
  } catch (error) {
    console.warn('ReScript validatePaletteAccessibility failed, using fallback:', error);
    // Simple fallback - check if at least 70% of colors meet basic contrast
    const colors = Object.values(palette);
    const white = '#ffffff';
    const black = '#000000';

    let accessibleCount = 0;
    for (const color of colors) {
      const contrastWhite = chroma.contrast(color, white);
      const contrastBlack = chroma.contrast(color, black);
      const maxContrast = Math.max(contrastWhite, contrastBlack);
      if (maxContrast >= 4.5) accessibleCount++;
    }

    return (accessibleCount / colors.length) >= 0.7;
  }
}

// Export additional types
export type { OKLCHColor, P3Color, ColorAnalysis };

// Re-export ReScript palette types for convenience
export type {
  rgb as ReScriptPaletteRGB,
  paletteStyle as ReScriptPaletteStyle,
  paletteOptions as ReScriptPaletteOptions,
  colorPalette as ReScriptColorPalette
} from '../core/PaletteGeneration.gen.js';

// Re-export ReScript colorjs.io types for convenience
export type {
  color as ReScriptColor,
  colorSpace as ReScriptColorSpace,
  coords as ReScriptCoords
} from '../core/ColorJsIo.gen.js';

/**
 * ReScript Accessibility Analysis Integration
 * High-performance accessibility functions using ReScript optimization
 */

/**
 * Calculate Delta-E CIE76 using optimized ReScript implementation
 * Expected 6x speedup over chroma-js
 */
export function deltaE76ReScript(color1: string, color2: string): number {
  try {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    return AccessibilityAnalysisRS.deltaE76(rgb1, rgb2);
  } catch (error) {
    console.warn('ReScript deltaE76 failed, using fallback:', error);
    return chroma.deltaE(color1, color2);
  }
}


/**
 * Simulate color blindness using accurate transformation matrices
 * Expected 10x speedup over TypeScript
 */
export function simulateColorBlindnessReScript(
  color: string,
  blindnessType: 'Protanopia' | 'Deuteranopia' | 'Tritanopia' | 'Monochromacy' | 'Protanomaly' | 'Deuteranomaly' | 'Tritanomaly'
): string {
  try {
    const rgb = hexToRgb(color);
    const simulated = AccessibilityAnalysisRS.simulateColorBlindness(rgb, blindnessType);
    return rgbToHex(simulated);
  } catch (error) {
    console.warn('ReScript simulateColorBlindness failed, using fallback:', error);
    // Fallback to simplified chroma-js simulation
    const baseColor = chroma(color);
    switch (blindnessType) {
      case 'Protanopia':
        return baseColor.set('hsl.h', baseColor.get('hsl.h') * 0.8).hex();
      case 'Deuteranopia':
        return baseColor.set('hsl.s', baseColor.get('hsl.s') * 0.6).hex();
      case 'Tritanopia':
        return baseColor.set('hsl.h', (baseColor.get('hsl.h') + 180) % 360).hex();
      default:
        return color;
    }
  }
}

/**
 * Analyze WCAG compliance for multiple color-background pairs
 * Expected 4-6x speedup over TypeScript
 */
export function analyzeWCAGComplianceReScript(
  colors: string[],
  backgrounds: string[]
): AccessibilityAnalysisRS.contrastAnalysis[] {
  try {
    return AccessibilityAnalysisRS.analyzeWCAGCompliance(colors, backgrounds);
  } catch (error) {
    console.warn('ReScript analyzeWCAGCompliance failed, using fallback:', error);
    // Simple fallback implementation
    const results: AccessibilityAnalysisRS.contrastAnalysis[] = [];
    for (const bg of backgrounds) {
      for (const fg of colors) {
        const contrast = chroma.contrast(fg, bg);
        results.push({
          foreground: fg,
          background: bg,
          ratio: contrast,
          passesAA: contrast >= 4.5,
          passesAAA: contrast >= 7.0,
          passesAALarge: contrast >= 3.0,
          passesAAALarge: contrast >= 4.5
        });
      }
    }
    return results;
  }
}

/**
 * Analyze color blindness for all types with distinction issues
 * Expected 5-8x speedup over TypeScript nested loops
 */
export function analyzeColorBlindnessBatchReScript(
  colors: string[]
): AccessibilityAnalysisRS.colorBlindnessSimulation {
  try {
    return AccessibilityAnalysisRS.analyzeColorBlindnessBatch(colors);
  } catch (error) {
    console.warn('ReScript analyzeColorBlindnessBatch failed, using fallback:', error);
    // Simplified fallback
    const affectedColors: AccessibilityAnalysisRS.affectedColor[] = [];
    const distinctionIssues: AccessibilityAnalysisRS.colorPair[] = [];

    colors.forEach(color => {
      ['Protanopia', 'Deuteranopia', 'Tritanopia'].forEach(type => {
        const perceived = simulateColorBlindnessReScript(color, type as any);
        const difference = chroma.deltaE(color, perceived);
        affectedColors.push({ original: color, perceived, difference });
      });
    });

    return {
      affectedColors,
      distinctionIssues,
      severity: 75.0 // Default moderate severity
    };
  }
}

/**
 * Comprehensive accessibility analysis (main optimization target)
 * Expected 5-8x speedup over TypeScript
 */
export function analyzeAccessibilityComprehensiveReScript(
  colors: string[],
  backgrounds: string[] = ['#ffffff', '#000000']
): AccessibilityAnalysisRS.accessibilityAnalysis {
  try {
    return AccessibilityAnalysisRS.analyzeAccessibilityComprehensive(colors, backgrounds);
  } catch (error) {
    console.warn('ReScript analyzeAccessibilityComprehensive failed, using fallback:', error);
    // Simplified fallback
    const wcagAnalysis = analyzeWCAGComplianceReScript(colors, backgrounds);
    const colorBlindnessAnalysis = analyzeColorBlindnessBatchReScript(colors);

    const passedAA = wcagAnalysis.every(a => a.passesAA);
    const wcagLevel = passedAA ? 'AA' : 'Partial';
    const wcagScore = wcagLevel === 'AA' ? 85 : 60;
    const overallScore = (wcagScore * 0.6) + (colorBlindnessAnalysis.severity * 0.4);

    return {
      overallScore,
      wcagCompliance: wcagLevel as AccessibilityAnalysisRS.wcagLevel,
      colorBlindnessScore: colorBlindnessAnalysis.severity,
      contrastIssues: wcagAnalysis.filter(a => !a.passesAA),
      problematicPairs: colorBlindnessAnalysis.distinctionIssues
    };
  }
}

// Re-export ReScript accessibility types for convenience
export type {
  rgb as ReScriptAccessibilityRGB,
  wcagLevel as ReScriptWCAGLevel,
  contrastAnalysis as ReScriptContrastAnalysis,
  colorPair as ReScriptColorPair,
  affectedColor as ReScriptAffectedColor,
  colorBlindnessSimulation as ReScriptColorBlindnessSimulation,
  accessibilityAnalysis as ReScriptAccessibilityAnalysis
} from '../core/AccessibilityAnalysis.gen.js';

// Test compilation
console.log('Enhanced ReScript accessibility analysis integration loaded');