/* TypeScript file generated from AIProviders.res by genType. */

/* eslint-disable */
/* tslint:disable */

import * as AIProvidersJS from './AIProviders.res.mjs';

import type {paletteStyle as ColorAnalysis_paletteStyle} from './ColorAnalysis.gen';

export type industryType = 
    "tech"
  | "healthcare"
  | "finance"
  | "creative"
  | "retail"
  | "education"
  | "government"
  | "nonprofit";

export type audienceType = 
    "children"
  | "professionals"
  | "seniors"
  | "general"
  | "experts";

export type emotionalTone = 
    "calm"
  | "energetic"
  | "trustworthy"
  | "playful"
  | "professional"
  | "innovative";

export type accessibilityLevel = 
    "standard"
  | "high_contrast"
  | "color_blind_friendly"
  | "comprehensive";

export type wcagLevel = "AA" | "AAA" | "partial" | "none";

export type designContext = {
  readonly industry?: industryType; 
  readonly audience?: audienceType; 
  readonly emotional?: emotionalTone; 
  readonly accessibility?: accessibilityLevel
};

export type styleDictionaryToken = { readonly value: string };

export type styleDictionaryTokens = { readonly color: {
  readonly primary: {[id: string]: styleDictionaryToken}; 
  readonly secondary: {[id: string]: styleDictionaryToken}; 
  readonly neutral: {[id: string]: styleDictionaryToken}; 
  readonly semantic?: {
    readonly success: styleDictionaryToken; 
    readonly warning: styleDictionaryToken; 
    readonly error: styleDictionaryToken; 
    readonly info: styleDictionaryToken
  }
} };

export type accessibilityAnalysis = {
  readonly wcagCompliance: wcagLevel; 
  readonly contrastIssues: string[]; 
  readonly colorBlindnessCompatible: boolean; 
  readonly recommendations: string[]
};

export type enhancedPaletteMetadata = {
  readonly provider: string; 
  readonly confidence: number; 
  readonly reasoning: string; 
  readonly accessibility: accessibilityAnalysis; 
  readonly context?: designContext
};

export type enhancedPalette = { readonly tokens: styleDictionaryTokens; readonly metadata: enhancedPaletteMetadata };

export type paletteRequest = {
  readonly baseColor: string; 
  readonly style: ColorAnalysis_paletteStyle; 
  readonly context?: designContext; 
  readonly accessibility?: boolean; 
  readonly size?: number
};

export const generateLocalIntelligencePalette: (request:paletteRequest) => enhancedPalette = AIProvidersJS.generateLocalIntelligencePalette as any;

export const generateRuleBasedPalette: (request:paletteRequest) => enhancedPalette = AIProvidersJS.generateRuleBasedPalette as any;
