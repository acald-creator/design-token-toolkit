/* TypeScript file generated from AccessibilityAnalysis.res by genType. */

/* eslint-disable */
/* tslint:disable */

import * as AccessibilityAnalysisJS from './AccessibilityAnalysis.res.mjs';

/** * AccessibilityAnalysis.res - High-Performance Accessibility Analysis
 * Optimized ReScript implementation for WCAG compliance and color blindness analysis
 * Expected 5-8x performance improvement over TypeScript */
export type rgb = {
  readonly r: number; 
  readonly g: number; 
  readonly b: number
};

export type wcagLevel = "AAA" | "AA" | "Partial" | "None";

export type contrastAnalysis = {
  readonly foreground: string; 
  readonly background: string; 
  readonly ratio: number; 
  readonly passesAA: boolean; 
  readonly passesAAA: boolean; 
  readonly passesAALarge: boolean; 
  readonly passesAAALarge: boolean
};

export type colorPair = {
  readonly color1: string; 
  readonly color2: string; 
  readonly originalDistance: number; 
  readonly perceivedDistance: number; 
  readonly problematic: boolean
};

export type affectedColor = {
  readonly original: string; 
  readonly perceived: string; 
  readonly difference: number
};

export type colorBlindnessSimulation = {
  readonly affectedColors: affectedColor[]; 
  readonly distinctionIssues: colorPair[]; 
  readonly severity: number
};

export type accessibilityAnalysis = {
  readonly overallScore: number; 
  readonly wcagCompliance: wcagLevel; 
  readonly colorBlindnessScore: number; 
  readonly contrastIssues: contrastAnalysis[]; 
  readonly problematicPairs: colorPair[]
};

export const deltaE76: (color1:rgb, color2:rgb) => number = AccessibilityAnalysisJS.deltaE76 as any;

export const calculateRelativeLuminance: (color:rgb) => number = AccessibilityAnalysisJS.calculateRelativeLuminance as any;

export const calculateContrastRatio: (color1:rgb, color2:rgb) => number = AccessibilityAnalysisJS.calculateContrastRatio as any;

export const simulateColorBlindness: (color:rgb, blindnessType:string) => rgb = AccessibilityAnalysisJS.simulateColorBlindness as any;

export const analyzeWCAGCompliance: (colors:string[], backgrounds:string[]) => contrastAnalysis[] = AccessibilityAnalysisJS.analyzeWCAGCompliance as any;

export const analyzeColorBlindnessBatch: (colors:string[]) => colorBlindnessSimulation = AccessibilityAnalysisJS.analyzeColorBlindnessBatch as any;

export const analyzeAccessibilityComprehensive: (colors:string[], backgrounds:string[]) => accessibilityAnalysis = AccessibilityAnalysisJS.analyzeAccessibilityComprehensive as any;
