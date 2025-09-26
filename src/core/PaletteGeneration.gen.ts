/* TypeScript file generated from PaletteGeneration.res by genType. */

/* eslint-disable */
/* tslint:disable */

import * as PaletteGenerationJS from './PaletteGeneration.res.mjs';

/** * PaletteGeneration.res - High-Performance Palette Generation
 * Optimized ReScript implementation for color palette algorithms
 * Expected 3-5x performance improvement over TypeScript */
export type rgb = {
  readonly r: number; 
  readonly g: number; 
  readonly b: number
};

export type paletteStyle = 
    "Professional"
  | "Vibrant"
  | "Minimal"
  | "Warm"
  | "Cool";

export type paletteOptions = {
  readonly style: paletteStyle; 
  readonly accessibility: boolean; 
  readonly size: number
};

export type colorPalette = {
  readonly "100": string; 
  readonly "200": string; 
  readonly "300": string; 
  readonly "400": string; 
  readonly "500": string; 
  readonly "600": string; 
  readonly "700": string; 
  readonly "800": string; 
  readonly "900": string; 
  readonly "1000": string
};

export const generateColorPalette: (baseColor:string, _steps:number) => (undefined | colorPalette) = PaletteGenerationJS.generateColorPalette as any;

export const generateHarmoniousPalette: (baseColor:string, harmonyType:string) => string[] = PaletteGenerationJS.generateHarmoniousPalette as any;

export const generateIntelligentPalette: (baseColor:string, options:paletteOptions) => (undefined | colorPalette) = PaletteGenerationJS.generateIntelligentPalette as any;

export const calculateRelativeLuminance: (color:rgb) => number = PaletteGenerationJS.calculateRelativeLuminance as any;

export const calculateContrastRatio: (color1:rgb, color2:rgb) => number = PaletteGenerationJS.calculateContrastRatio as any;

export const validatePaletteAccessibility: (palette:colorPalette) => boolean = PaletteGenerationJS.validatePaletteAccessibility as any;
