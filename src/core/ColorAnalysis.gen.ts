/* TypeScript file generated from ColorAnalysis.res by genType. */

/* eslint-disable */
/* tslint:disable */

import * as ColorAnalysisJS from './ColorAnalysis.res.mjs';

import type {colorPalette as PaletteGeneration_colorPalette} from './PaletteGeneration.gen';

export type colorProperties = {
  readonly saturation: number; 
  readonly lightness: number; 
  readonly hue: number; 
  readonly accessibility: 
    "good"
  | "fair"
  | "poor"; 
  readonly harmony: string[]
};

export type intelligenceAnalysis = {
  readonly score: number; 
  readonly suggestions: string[]; 
  readonly properties: colorProperties
};

export type paletteStyle = 
    "professional"
  | "vibrant"
  | "minimal"
  | "warm"
  | "cool";

export type harmonyType = 
    "analogous"
  | "complementary"
  | "triadic"
  | "monochromatic";

export type intelligentPaletteOptions = {
  readonly style?: paletteStyle; 
  readonly accessibility?: boolean; 
  readonly size?: number
};

export type intelligentPaletteResult = {
  readonly palette: PaletteGeneration_colorPalette; 
  readonly analysis: intelligenceAnalysis; 
  readonly suggestions: string[]
};

export type brandColors = { readonly primary: string; readonly secondary: (undefined | string) };

export type semanticColorSet = {
  readonly success: string; 
  readonly warning: string; 
  readonly error: string; 
  readonly info: string; 
  readonly neutral: string
};

export type accessibilityResult = {
  readonly isValid: boolean; 
  readonly contrast: number; 
  readonly required: number
};

export const analyzeColorAI: (baseColor:string) => intelligenceAnalysis = ColorAnalysisJS.analyzeColorAI as any;

export const generateHarmonyPalette: (baseColor:string, harmony:harmonyType) => string[] = ColorAnalysisJS.generateHarmonyPalette as any;

export const validateAccessibility: (foreground:string, background:string, level:(undefined | ("AA" | "AAA")), _4:void) => accessibilityResult = ColorAnalysisJS.validateAccessibility as any;

export const generateAccessibleCombination: (backgroundColor:string, textColor:(undefined | (undefined | string)), _3:void) => {
  readonly background: string; 
  readonly contrast: number; 
  readonly text: string
} = ColorAnalysisJS.generateAccessibleCombination as any;

export const generateSemanticColorsAI: (brandColors:brandColors) => {
  readonly accessibility: {[id: string]: boolean}; 
  readonly reasoning: {[id: string]: string}; 
  readonly semantic: semanticColorSet
} = ColorAnalysisJS.generateSemanticColorsAI as any;

export const suggestBrandColorsAI: (baseColor:string) => { readonly analysis: {
  readonly alternatives: string[]; 
  readonly current: intelligenceAnalysis; 
  readonly trends: string[]
}; readonly suggestions: Array<{
  readonly category: 
    "accent"
  | "primary"
  | "secondary"; 
  readonly color: string; 
  readonly confidence: number; 
  readonly reasoning: string
}> } = ColorAnalysisJS.suggestBrandColorsAI as any;

export const analyzeColorIntelligence: (baseColor:string) => intelligenceAnalysis = ColorAnalysisJS.analyzeColorIntelligence as any;

export const generateIntelligentPalette: (baseColor:string, options:(undefined | intelligentPaletteOptions), _3:void) => intelligentPaletteResult = ColorAnalysisJS.generateIntelligentPalette as any;

export const generateColorPaletteEnhanced: (baseColor:string, accessibility:(undefined | boolean), _3:void) => (undefined | PaletteGeneration_colorPalette) = ColorAnalysisJS.generateColorPaletteEnhanced as any;

export const generateHarmoniousPaletteEnhanced: (baseColor:string, harmony:(undefined | harmonyType), _3:void) => string[] = ColorAnalysisJS.generateHarmoniousPaletteEnhanced as any;
