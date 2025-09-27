/**
 * Multi-Provider AI System for Color Intelligence
 * Provides reliable color palette generation with multiple fallback options
 */

import { Ollama } from 'ollama';
import { wcagContrast } from 'culori';
import {
  generateLocalIntelligencePalette,
  generateRuleBasedPalette,
  type paletteRequest,
  type enhancedPalette
} from '../core/AIProviders.gen.js';
import {
  formatTokens,
  convertStyleDictionaryTokens,
  getTokenFormat,
  detectTokenFormat,
  type TokenFormat,
  type ColorTokens
} from './token-formats.js';


export interface PaletteRequest {
  baseColor: string;
  style: 'professional' | 'vibrant' | 'minimal' | 'warm' | 'cool';
  context?: DesignContext;
  accessibility?: boolean;
  size?: number;
  format?: string;
  namespace?: string;
}

export interface DesignContext {
  industry?: 'tech' | 'healthcare' | 'finance' | 'creative' | 'retail' | 'education' | 'government' | 'nonprofit';
  audience?: 'children' | 'professionals' | 'seniors' | 'general' | 'experts';
  medium?: 'web' | 'print' | 'mobile' | 'display' | 'signage';
  accessibility?: 'standard' | 'high-contrast' | 'color-blind-friendly' | 'comprehensive';
  cultural?: 'western' | 'eastern' | 'global' | 'regional';
  emotional?: 'calm' | 'energetic' | 'trustworthy' | 'playful' | 'professional' | 'innovative';
}

export interface EnhancedPalette {
  tokens: StyleDictionaryTokens;
  metadata: {
    provider: string;
    confidence: number;
    reasoning: string;
    accessibility: AccessibilityAnalysis;
    context?: DesignContext;
  };
}

export interface StyleDictionaryTokens {
  color: {
    primary: Record<string, { value: string }>;
    secondary: Record<string, { value: string }>;
    neutral: Record<string, { value: string }>;
    semantic?: {
      success: { value: string };
      warning: { value: string };
      error: { value: string };
      info: { value: string };
    };
  };
}

export interface AccessibilityAnalysis {
  wcagCompliance: 'AA' | 'AAA' | 'partial' | 'none';
  contrastIssues: string[];
  colorBlindnessCompatible: boolean;
  recommendations: string[];
}

/**
 * Helper function to convert TypeScript PaletteRequest to ReScript format
 */
function convertToReScriptRequest(request: PaletteRequest): paletteRequest {
  return {
    baseColor: request.baseColor,
    style: request.style as any, // ReScript uses polymorphic variants
    context: request.context ? {
      industry: request.context.industry as any,
      audience: request.context.audience as any,
      emotional: request.context.emotional as any,
      // Convert kebab-case to snake_case for ReScript compatibility
      accessibility: request.context.accessibility === 'high-contrast'
        ? 'high_contrast' as any
        : request.context.accessibility === 'color-blind-friendly'
        ? 'color_blind_friendly' as any
        : request.context.accessibility as any
    } : undefined,
    accessibility: request.accessibility,
    size: request.size
  };
}

/**
 * Helper function to convert ReScript EnhancedPalette to TypeScript format
 */
function convertFromReScriptPalette(rsPalette: enhancedPalette): EnhancedPalette {
  return {
    tokens: rsPalette.tokens as StyleDictionaryTokens,
    metadata: {
      provider: rsPalette.metadata.provider,
      confidence: rsPalette.metadata.confidence,
      reasoning: rsPalette.metadata.reasoning,
      accessibility: {
        wcagCompliance: rsPalette.metadata.accessibility.wcagCompliance as AccessibilityAnalysis['wcagCompliance'],
        contrastIssues: rsPalette.metadata.accessibility.contrastIssues,
        colorBlindnessCompatible: rsPalette.metadata.accessibility.colorBlindnessCompatible,
        recommendations: rsPalette.metadata.accessibility.recommendations
      },
      context: rsPalette.metadata.context ? {
        industry: rsPalette.metadata.context.industry as DesignContext['industry'],
        audience: rsPalette.metadata.context.audience as DesignContext['audience'],
        emotional: rsPalette.metadata.context.emotional as DesignContext['emotional'],
        // Convert snake_case back to kebab-case for TypeScript compatibility
        accessibility: rsPalette.metadata.context.accessibility === 'high_contrast'
          ? 'high-contrast'
          : rsPalette.metadata.context.accessibility === 'color_blind_friendly'
          ? 'color-blind-friendly'
          : rsPalette.metadata.context.accessibility as DesignContext['accessibility']
      } : undefined
    }
  };
}

/**
 * Abstract base class for AI providers
 */
export abstract class AIProvider {
  abstract name: string;
  abstract priority: number; // Lower number = higher priority
  abstract isAvailable(): Promise<boolean>;
  abstract generatePalette(request: PaletteRequest): Promise<EnhancedPalette>;
}

/**
 * Ollama AI Provider - Primary AI service
 */
export class OllamaProvider extends AIProvider {
  name = 'Ollama';
  priority = 1;
  private ollama: Ollama;
  private model: string;

  constructor(model: string = 'llama3.1') {
    super();
    this.ollama = new Ollama();
    this.model = model;
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.ollama.list();
      return true;
    } catch {
      return false;
    }
  }

  async generatePalette(request: PaletteRequest): Promise<EnhancedPalette> {
    const contextPrompt = this.buildContextualPrompt(request);
    const stylePrompt = this.buildStylePrompt(request.style);

    const prompt = `${contextPrompt}

Generate a ${request.style} color palette based on the base color ${request.baseColor}.
Create 9 shades (50-900) for primary, secondary, and neutral colors.

${stylePrompt}

Output as valid JSON in this exact format for Style Dictionary:
{
  "color": {
    "primary": {
      "50": { "value": "#f8fafc" },
      "100": { "value": "#f1f5f9" },
      "200": { "value": "#e2e8f0" },
      "300": { "value": "#cbd5e1" },
      "400": { "value": "#94a3b8" },
      "500": { "value": "#64748b" },
      "600": { "value": "#475569" },
      "700": { "value": "#334155" },
      "800": { "value": "#1e293b" },
      "900": { "value": "#0f172a" }
    },
    "secondary": { ... same structure ... },
    "neutral": { ... same structure ... }
  }
}

Ensure all hex codes are valid, harmonious, and ${request.accessibility ? 'meet WCAG AA standards' : 'visually appealing'}.`;

    const response = await this.ollama.generate({
      model: this.model,
      prompt: prompt,
      format: 'json'
    });

    const tokens = JSON.parse(response.response.trim()) as StyleDictionaryTokens;
    const accessibility = this.analyzeAccessibility(tokens);

    return {
      tokens,
      metadata: {
        provider: this.name,
        confidence: 0.85,
        reasoning: `AI-generated ${request.style} palette optimized for ${request.context?.industry || 'general'} use`,
        accessibility,
        context: request.context
      }
    };
  }

  private buildContextualPrompt(request: PaletteRequest): string {
    if (!request.context) return '';

    const { industry, audience, emotional } = request.context;

    let prompt = 'Context considerations:\n';

    if (industry) {
      const industryGuidance = {
        tech: 'Use modern, clean colors. Blues and grays work well. Avoid overly bright colors.',
        healthcare: 'Prioritize trust and calm. Use blues and greens. Avoid aggressive reds except for emergencies.',
        finance: 'Emphasize stability and trust. Use professional blues, grays. Avoid flashy colors.',
        creative: 'Be bold and expressive. Higher saturation acceptable. Unique color combinations encouraged.',
        retail: 'Consider brand personality. If luxury: muted tones. If energetic: brighter colors.',
        education: 'Use encouraging, non-threatening colors. Softer tones for children, professional for adults.',
        government: 'Authoritative, stable colors. Blues, grays, and traditional colors that inspire trust.',
        nonprofit: 'Warm, approachable colors that inspire hope and community. Earth tones and blues work well.'
      };
      prompt += `Industry: ${industry} - ${industryGuidance[industry]}\n`;
    }

    if (audience) {
      const audienceGuidance = {
        children: 'Use brighter, more saturated colors. Avoid dark or scary combinations.',
        professionals: 'Maintain professional appearance. Subtle, sophisticated color choices.',
        seniors: 'Ensure high contrast and clear distinction between colors.',
        general: 'Balanced approach suitable for diverse users.',
        experts: 'Technical precision is key. Clear distinctions and systematic color coding work well.'
      };
      prompt += `Audience: ${audience} - ${audienceGuidance[audience]}\n`;
    }

    if (emotional) {
      const emotionalGuidance = {
        calm: 'Use cooler tones, lower saturation. Blues, greens, soft grays.',
        energetic: 'Use warmer tones, higher saturation. Oranges, reds, bright colors.',
        trustworthy: 'Use stable colors like blues and greens. Avoid flashy combinations.',
        playful: 'Use varied hues, moderate to high saturation. Include complementary accents.',
        professional: 'Use balanced, sophisticated colors. Moderate saturation, avoid extremes.',
        innovative: 'Bold, forward-thinking colors. Unusual combinations and modern palettes work well.'
      };
      prompt += `Emotional tone: ${emotional} - ${emotionalGuidance[emotional]}\n`;
    }

    return prompt;
  }

  private buildStylePrompt(style: string): string {
    const styleGuidance = {
      professional: 'Focus on subtle gradations, avoid high saturation. Prioritize readability and versatility.',
      vibrant: 'Use higher saturation and contrast. Create energetic but harmonious combinations.',
      minimal: 'Use fewer colors, lower saturation. Focus on subtle variations and clean appearance.',
      warm: 'Shift towards warmer hues (reds, oranges, yellows). Create cozy, inviting feeling.',
      cool: 'Shift towards cooler hues (blues, greens, purples). Create calm, modern feeling.'
    };

    return styleGuidance[style as keyof typeof styleGuidance] || styleGuidance.professional;
  }

  private analyzeAccessibility(tokens: StyleDictionaryTokens): AccessibilityAnalysis {
    const issues: string[] = [];
    let wcagCompliance: AccessibilityAnalysis['wcagCompliance'] = 'AA';

    // Check primary color contrast
    const primary500 = tokens.color.primary['500']?.value;
    if (primary500) {
      const contrastWhite = wcagContrast(primary500, '#ffffff');
      const contrastBlack = wcagContrast(primary500, '#000000');

      if (Math.max(contrastWhite, contrastBlack) < 4.5) {
        issues.push('Primary color may have insufficient contrast for text');
        wcagCompliance = 'partial';
      }
    }

    return {
      wcagCompliance,
      contrastIssues: issues,
      colorBlindnessCompatible: true, // TODO: Implement proper color blindness check
      recommendations: issues.length > 0 ? ['Consider adjusting lightness values for better contrast'] : []
    };
  }
}

/**
 * Local Intelligence Provider - Sophisticated fallback using existing algorithms
 */
export class LocalIntelligenceProvider extends AIProvider {
  name = 'Local Intelligence';
  priority = 2;

  async isAvailable(): Promise<boolean> {
    return true; // Always available
  }

  async generatePalette(request: PaletteRequest): Promise<EnhancedPalette> {
    console.log(`🧠 Using ReScript-powered Local Intelligence for palette generation...`);

    // Convert to ReScript format and call high-performance ReScript function
    const rsRequest = convertToReScriptRequest(request);
    const rsPalette = generateLocalIntelligencePalette(rsRequest);

    // Convert back to TypeScript format
    return convertFromReScriptPalette(rsPalette);
  }

}

/**
 * Rule-Based Provider - Simple, reliable fallback
 */
export class RuleBasedProvider extends AIProvider {
  name = 'Rule-Based';
  priority = 3;

  async isAvailable(): Promise<boolean> {
    return true; // Always available
  }

  async generatePalette(request: PaletteRequest): Promise<EnhancedPalette> {
    console.log(`⚙️ Using ReScript-powered Rule-Based generation...`);

    // Convert to ReScript format and call high-performance ReScript function
    const rsRequest = convertToReScriptRequest(request);
    const rsPalette = generateRuleBasedPalette(rsRequest);

    // Convert back to TypeScript format
    return convertFromReScriptPalette(rsPalette);
  }
}

/**
 * Multi-Provider AI Service - Orchestrates multiple providers
 */
export class MultiProviderAIService {
  private providers: AIProvider[] = [];

  constructor() {
    // Register providers in priority order
    this.providers = [
      new OllamaProvider(),
      new LocalIntelligenceProvider(),
      new RuleBasedProvider()
    ].sort((a, b) => a.priority - b.priority);
  }

  async generatePalette(request: PaletteRequest): Promise<EnhancedPalette> {
    const availableProviders = [];

    // Check provider availability
    for (const provider of this.providers) {
      if (await provider.isAvailable()) {
        availableProviders.push(provider);
      }
    }

    if (availableProviders.length === 0) {
      throw new Error('No AI providers available');
    }

    // Try providers in order until success
    for (const provider of availableProviders) {
      try {
        console.log(`🎨 Generating palette using ${provider.name}...`);
        const result = await provider.generatePalette(request);

        if (provider.name !== 'Ollama' && availableProviders[0].name === 'Ollama') {
          console.log(`⚠️  Primary AI service unavailable, using ${provider.name} fallback`);
        }

        return result;
      } catch (error) {
        console.warn(`${provider.name} failed:`, error);
        continue;
      }
    }

    throw new Error('All AI providers failed to generate palette');
  }

  async getAvailableProviders(): Promise<string[]> {
    const available = [];
    for (const provider of this.providers) {
      if (await provider.isAvailable()) {
        available.push(provider.name);
      }
    }
    return available;
  }

  /**
   * Generate palette with specific token format
   */
  async generateFormattedPalette(
    request: PaletteRequest,
    outputPath?: string
  ): Promise<{ tokens: any; metadata: any; format: TokenFormat }> {
    // Generate base palette
    const basePalette = await this.generatePalette(request);

    // Determine target format
    let targetFormat: TokenFormat;

    if (request.format) {
      targetFormat = getTokenFormat(request.format);
    } else if (outputPath) {
      // Try to auto-detect from existing files in the same directory
      const path = await import('path');
      const tokenDir = path.dirname(outputPath);
      const detectedFormat = await detectTokenFormat(tokenDir);
      targetFormat = detectedFormat || getTokenFormat('w3c');
    } else {
      targetFormat = getTokenFormat('w3c'); // Default to W3C
    }

    // Convert Style Dictionary format to ColorTokens
    const colorTokens: ColorTokens = {
      primary: extractColorScale(basePalette.tokens.color.primary),
      secondary: extractColorScale(basePalette.tokens.color.secondary),
      neutral: extractColorScale(basePalette.tokens.color.neutral),
      semantic: basePalette.tokens.color.semantic ? {
        success: basePalette.tokens.color.semantic.success.value,
        warning: basePalette.tokens.color.semantic.warning.value,
        error: basePalette.tokens.color.semantic.error.value,
        info: basePalette.tokens.color.semantic.info.value
      } : undefined
    };

    // Format tokens
    const formattedTokens = formatTokens(colorTokens, targetFormat, {
      namespace: request.namespace || 'ai-generated',
      description: `AI-generated ${request.style} palette optimized for ${request.context?.industry || 'general'} use`,
      includeMetadata: true
    });

    return {
      tokens: formattedTokens,
      metadata: {
        ...basePalette.metadata,
        format: targetFormat.name,
        formatDisplayName: targetFormat.displayName
      },
      format: targetFormat
    };
  }
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