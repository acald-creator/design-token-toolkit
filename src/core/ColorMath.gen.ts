/* TypeScript file generated from ColorMath.res by genType. */

/* eslint-disable */
/* tslint:disable */

import * as ColorMathJS from './ColorMath.res.mjs';

export type color = {
  readonly r: number; 
  readonly g: number; 
  readonly b: number
};

export type hslColor = {
  readonly h: number; 
  readonly s: number; 
  readonly l: number
};

export type labColor = {
  readonly l: number; 
  readonly a: number; 
  readonly b: number
};

export type colorBlindnessType = 
    "Protanopia"
  | "Deuteranopia"
  | "Tritanopia"
  | "Normal";

export type harmonyType = 
    "Complementary"
  | "Analogous"
  | "Triadic"
  | "Monochromatic";

export const deltaE: (color1:color, color2:color) => number = ColorMathJS.deltaE as any;

export const contrastRatio: (color1:color, color2:color) => number = ColorMathJS.contrastRatio as any;

export const simulateColorBlindness: (color:color, blindnessType:colorBlindnessType) => color = ColorMathJS.simulateColorBlindness as any;

export const areColorsDistinguishable: (color1:color, color2:color, minimumDeltaE:(undefined | number), minimumContrast:(undefined | number)) => boolean = ColorMathJS.areColorsDistinguishable as any;

export const detectHarmony: (colors:color[]) => (undefined | harmonyType) = ColorMathJS.detectHarmony as any;

export const calculateAccessibilityScore: (colors:color[]) => number = ColorMathJS.calculateAccessibilityScore as any;
