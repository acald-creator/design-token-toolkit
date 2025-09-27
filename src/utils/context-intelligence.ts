/**
 * Context-Aware Color Intelligence
 * Industry-specific, audience-aware, and culturally-sensitive color palette generation
 */

import { interpolate } from 'culori';

export interface ContextualPalette {
  tokens: ContextualTokens;
  metadata: ContextualMetadata;
  guidelines: DesignGuidelines;
  variations: ContextualVariations;
}

export interface ContextualTokens {
  color: {
    primary: Record<string, { value: string }>;
    secondary: Record<string, { value: string }>;
    neutral: Record<string, { value: string }>;
    semantic: {
      success: { value: string };
      warning: { value: string };
      error: { value: string };
      info: { value: string };
    };
    contextual?: Record<string, { value: string }>; // Industry-specific colors
  };
}

export interface ContextualMetadata {
  context: DesignContext;
  reasoning: ContextualReasoning;
  psychology: ColorPsychology;
  cultural: CulturalAnalysis;
  compliance: ComplianceAnalysis;
}

export interface DesignContext {
  industry: IndustryType;
  audience: AudienceType;
  medium: MediumType;
  accessibility: AccessibilityLevel;
  cultural: CulturalContext;
  emotional: EmotionalTone;
  brand?: BrandPersonality;
}

export type IndustryType =
  | 'tech'
  | 'healthcare'
  | 'finance'
  | 'creative'
  | 'retail'
  | 'education'
  | 'government'
  | 'nonprofit'
  | 'entertainment'
  | 'real-estate'
  | 'automotive'
  | 'food-beverage';

export type AudienceType =
  | 'children'
  | 'teenagers'
  | 'young-adults'
  | 'professionals'
  | 'seniors'
  | 'general'
  | 'experts'
  | 'consumers';

export type MediumType =
  | 'web'
  | 'mobile'
  | 'print'
  | 'display'
  | 'signage'
  | 'packaging'
  | 'presentation';

export type AccessibilityLevel =
  | 'standard'
  | 'high-contrast'
  | 'color-blind-friendly'
  | 'low-vision'
  | 'comprehensive';

export type CulturalContext =
  | 'western'
  | 'eastern'
  | 'global'
  | 'regional'
  | 'north-american'
  | 'european'
  | 'asian'
  | 'latin-american'
  | 'middle-eastern'
  | 'african';

export type EmotionalTone =
  | 'calm'
  | 'energetic'
  | 'trustworthy'
  | 'playful'
  | 'professional'
  | 'innovative'
  | 'luxury'
  | 'approachable'
  | 'bold'
  | 'sophisticated';

export interface BrandPersonality {
  archetype: 'innocent' | 'explorer' | 'sage' | 'hero' | 'outlaw' | 'magician' | 'regular' | 'lover' | 'jester' | 'caregiver' | 'creator' | 'ruler';
  traits: string[];
  values: string[];
}

export interface ContextualReasoning {
  industryRationale: string;
  audienceConsiderations: string;
  culturalFactors: string;
  psychologyExplanation: string;
  complianceNotes: string;
}

export interface ColorPsychology {
  primary: PsychologicalImpact;
  secondary: PsychologicalImpact;
  overall: OverallPsychologicalProfile;
}

export interface PsychologicalImpact {
  emotions: string[];
  associations: string[];
  effects: string[];
  warnings: string[];
}

export interface OverallPsychologicalProfile {
  dominantEmotion: string;
  energyLevel: 'low' | 'moderate' | 'high' | 'very-high';
  trustworthiness: number; // 0-100
  approachability: number; // 0-100
  memorability: number; // 0-100
}

export interface CulturalAnalysis {
  meanings: Record<string, string>;
  taboos: string[];
  preferences: string[];
  seasonalRelevance: string[];
  religiousConsiderations: string[];
}

export interface ComplianceAnalysis {
  industryStandards: string[];
  regulatoryRequirements: string[];
  bestPractices: string[];
  accessibility: string[];
}

export interface DesignGuidelines {
  usage: UsageGuidelines;
  combinations: ColorCombinationRules;
  restrictions: ColorRestrictions;
  recommendations: ContextualRecommendations;
}

export interface UsageGuidelines {
  primary: string[];
  secondary: string[];
  backgrounds: string[];
  text: string[];
  accents: string[];
}

export interface ColorCombinationRules {
  recommended: ColorCombination[];
  avoid: ColorCombination[];
  contextSpecific: Record<string, ColorCombination[]>;
}

export interface ColorCombination {
  colors: string[];
  purpose: string;
  effect: string;
}

export interface ColorRestrictions {
  forbidden: string[];
  limitations: Record<string, string>;
  conditions: Record<string, string>;
}

export interface ContextualRecommendations {
  immediate: string[];
  future: string[];
  alternatives: string[];
  testing: string[];
}

export interface ContextualVariations {
  seasonal: Record<string, ContextualTokens>;
  campaigns: Record<string, ContextualTokens>;
  regions: Record<string, ContextualTokens>;
  products: Record<string, ContextualTokens>;
}

export class ContextIntelligence {
  private industryProfiles: Record<IndustryType, IndustryProfile>;
  private audienceProfiles: Record<AudienceType, AudienceProfile>;
  private culturalProfiles: Record<CulturalContext, CulturalProfile>;

  constructor() {
    this.industryProfiles = this.initializeIndustryProfiles();
    this.audienceProfiles = this.initializeAudienceProfiles();
    this.culturalProfiles = this.initializeCulturalProfiles();
  }

  /**
   * Generate contextually-aware color palette
   */
  generateContextualPalette(
    baseColor: string,
    context: DesignContext
  ): ContextualPalette {
    const industryProfile = this.industryProfiles[context.industry];
    const audienceProfile = this.audienceProfiles[context.audience];
    const culturalProfile = this.culturalProfiles[context.cultural];

    // Adjust base color based on context
    const adjustedBaseColor = this.adjustColorForContext(baseColor, context);

    // Generate contextual color tokens
    const tokens = this.generateContextualTokens(adjustedBaseColor, context);

    // Generate metadata and analysis
    const metadata = this.generateContextualMetadata(tokens, context, {
      industryProfile,
      audienceProfile,
      culturalProfile
    });

    // Generate design guidelines
    const guidelines = this.generateDesignGuidelines(tokens, context);

    // Generate variations
    const variations = this.generateContextualVariations(tokens, context);

    return {
      tokens,
      metadata,
      guidelines,
      variations
    };
  }

  /**
   * Adjust base color for contextual appropriateness
   */
  private adjustColorForContext(baseColor: string, context: DesignContext): string {
    // Simplified - return base color for now
    let adjusted = baseColor;
    const industryProfile = this.industryProfiles[context.industry];

    // Industry-specific adjustments
    if (context.industry === 'healthcare') {
      // Healthcare prefers calmer, less aggressive colors
      adjusted = adjusted.set('hsl.s', Math.min(adjusted.get('hsl.s'), 0.7));
      if (adjusted.get('hsl.h') >= 0 && adjusted.get('hsl.h') <= 30) {
        // Avoid aggressive reds in healthcare
        adjusted = adjusted.set('hsl.h', adjusted.get('hsl.h') + 180);
      }
    } else if (context.industry === 'finance') {
      // Finance prefers professional, trustworthy colors
      adjusted = adjusted.set('hsl.s', Math.max(0.3, Math.min(adjusted.get('hsl.s'), 0.6)));
      // Prefer blues and greens
      const h = adjusted.get('hsl.h');
      if (h < 120 || h > 270) {
        adjusted = adjusted.set('hsl.h', 210); // Professional blue
      }
    } else if (context.industry === 'creative') {
      // Creative industries can handle higher saturation
      adjusted = adjusted.set('hsl.s', Math.min(1.0, adjusted.get('hsl.s') + 0.1));
    }

    // Audience-specific adjustments
    if (context.audience === 'children') {
      // Children respond well to brighter, more saturated colors
      adjusted = adjusted.set('hsl.s', Math.min(1.0, adjusted.get('hsl.s') + 0.2));
      adjusted = adjusted.set('hsl.l', Math.max(0.4, adjusted.get('hsl.l')));
    } else if (context.audience === 'seniors') {
      // Seniors need higher contrast and clearer distinction
      adjusted = adjusted.set('hsl.s', Math.max(0.4, adjusted.get('hsl.s')));
    }

    // Cultural adjustments
    if (context.cultural === 'eastern' && adjusted.get('hsl.h') >= 0 && adjusted.get('hsl.h') <= 30) {
      // Red is lucky in Eastern cultures, enhance it
      adjusted = adjusted.set('hsl.s', Math.min(1.0, adjusted.get('hsl.s') + 0.1));
    }

    return adjusted.hex();
  }

  /**
   * Generate contextual color tokens
   */
  private generateContextualTokens(
    baseColor: string,
    context: DesignContext
  ): ContextualTokens {
    const primary = this.generateColorScale(baseColor);
    const secondaryColor = this.generateContextualSecondary(baseColor, context);
    const secondary = this.generateColorScale(secondaryColor);
    const neutral = this.generateContextualNeutral(context);
    const semantic = this.generateContextualSemantic(context);
    const contextual = this.generateIndustrySpecificColors(context);

    return {
      color: {
        primary,
        secondary,
        neutral,
        semantic,
        contextual
      }
    };
  }

  /**
   * Generate contextually appropriate secondary color
   */
  private generateContextualSecondary(baseColor: string, context: DesignContext): string {
    // Simplified - generate basic secondary color

    switch (context.industry) {
      case 'healthcare':
        // Healthcare benefits from calming green secondary
        return '#4ade80'; // green-400 equivalent

      case 'finance':
        // Finance uses conservative complementary or analogous
        return '#3b82f6'; // blue-500 conservative

      case 'creative':
        // Creative can use bold complementary colors
        return '#f59e0b'; // amber-500 creative

      default:
        return '#6366f1'; // indigo-500 default
    }
  }

  /**
   * Generate contextual neutral colors
   */
  private generateContextualNeutral(context: DesignContext): Record<string, { value: string }> {
    let baseNeutral = '#6b7280'; // gray-500 default

    // Warm neutrals for approachable contexts
    if (context.emotional === 'approachable' || context.audience === 'children') {
      baseNeutral = '#78716c'; // stone-500 warmer
    }

    // Cool neutrals for professional contexts
    if (context.industry === 'tech' || context.industry === 'finance') {
      baseNeutral = '#64748b'; // slate-500 cool
    }

    return this.generateColorScale(baseNeutral);
  }

  /**
   * Generate contextual semantic colors
   */
  private generateContextualSemantic(context: DesignContext): {
    success: { value: string };
    warning: { value: string };
    error: { value: string };
    info: { value: string };
  } {
    const defaults = {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    };

    // Healthcare-specific semantic colors
    if (context.industry === 'healthcare') {
      return {
        success: { value: '#059669' }, // Medical green
        warning: { value: '#d97706' }, // Medical amber
        error: { value: '#dc2626' }, // Medical red
        info: { value: '#0369a1' } // Medical blue
      };
    }

    // Finance-specific semantic colors
    if (context.industry === 'finance') {
      return {
        success: { value: '#16a34a' }, // Growth green
        warning: { value: '#ca8a04' }, // Caution gold
        error: { value: '#dc2626' }, // Loss red
        info: { value: '#2563eb' } // Information blue
      };
    }

    // Education-specific semantic colors
    if (context.industry === 'education') {
      return {
        success: { value: '#22c55e' }, // Achievement green
        warning: { value: '#eab308' }, // Attention yellow
        error: { value: '#f87171' }, // Softer error red
        info: { value: '#60a5fa' } // Friendly blue
      };
    }

    // Return defaults for other contexts
    return Object.entries(defaults).reduce((acc, [key, value]) => {
      acc[key as keyof typeof acc] = { value };
      return acc;
    }, {} as any);
  }

  /**
   * Generate industry-specific contextual colors
   */
  private generateIndustrySpecificColors(context: DesignContext): Record<string, { value: string }> {
    switch (context.industry) {
      case 'healthcare':
        return {
          'medical-emergency': { value: '#dc2626' },
          'medical-safe': { value: '#10b981' },
          'medical-neutral': { value: '#6b7280' },
          'hospital-blue': { value: '#0369a1' }
        };

      case 'finance':
        return {
          'profit': { value: '#16a34a' },
          'loss': { value: '#dc2626' },
          'neutral': { value: '#6b7280' },
          'premium': { value: '#7c3aed' }
        };

      case 'education':
        return {
          'grade-a': { value: '#16a34a' },
          'grade-b': { value: '#65a30d' },
          'grade-c': { value: '#eab308' },
          'grade-d': { value: '#f59e0b' },
          'grade-f': { value: '#ef4444' }
        };

      default:
        return {};
    }
  }

  /**
   * Generate color scale (50-900) from base color
   */
  private generateColorScale(baseColor: string): Record<string, { value: string }> {
    // Simplified scale generation using predefined values
    const scale: Record<string, { value: string }> = {};
    const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

    // Generate basic lightness variations - simplified approach
    steps.forEach((step, index) => {
      // Use the base color for 500, and generate lighter/darker variants
      if (step === 500) {
        scale[step.toString()] = { value: baseColor };
      } else {
        // Simple approach: use the base color for all steps for now
        // In a real implementation, you'd want proper lightness calculations
        scale[step.toString()] = { value: baseColor };
      }
    });

    return scale;
  }

  /**
   * Generate contextual metadata
   */
  private generateContextualMetadata(
    tokens: ContextualTokens,
    context: DesignContext,
    profiles: {
      industryProfile: IndustryProfile;
      audienceProfile: AudienceProfile;
      culturalProfile: CulturalProfile;
    }
  ): ContextualMetadata {
    const reasoning: ContextualReasoning = {
      industryRationale: profiles.industryProfile.reasoning,
      audienceConsiderations: profiles.audienceProfile.considerations,
      culturalFactors: profiles.culturalProfile.factors,
      psychologyExplanation: this.generatePsychologyExplanation(tokens),
      complianceNotes: profiles.industryProfile.compliance.join(', ')
    };

    const psychology = this.analyzePsychology(tokens);
    const cultural = this.analyzeCultural(tokens, context);
    const compliance = this.analyzeCompliance(context);

    return {
      context,
      reasoning,
      psychology,
      cultural,
      compliance
    };
  }

  // Helper methods for initialization and analysis
  private initializeIndustryProfiles(): Record<IndustryType, IndustryProfile> {
    return {
      tech: {
        preferredColors: ['#3b82f6', '#10b981', '#6366f1'],
        avoidColors: ['#ef4444'],
        reasoning: 'Tech industry favors modern, clean colors that convey innovation and reliability',
        compliance: ['WCAG AA', 'Color blind friendly'],
        characteristics: ['modern', 'clean', 'innovative']
      },
      healthcare: {
        preferredColors: ['#0369a1', '#059669', '#6b7280'],
        avoidColors: ['#ef4444', '#f59e0b'],
        reasoning: 'Healthcare requires calming, trustworthy colors that reduce anxiety',
        compliance: ['WCAG AAA', 'High contrast', 'Medical device standards'],
        characteristics: ['calming', 'trustworthy', 'professional']
      },
      finance: {
        preferredColors: ['#1e40af', '#059669', '#374151'],
        avoidColors: ['#f59e0b', '#ef4444'],
        reasoning: 'Finance sector emphasizes stability, trust, and conservative professionalism',
        compliance: ['WCAG AA', 'Financial regulations', 'Brand consistency'],
        characteristics: ['stable', 'trustworthy', 'conservative']
      },
      // Add other industries...
      creative: { preferredColors: [], avoidColors: [], reasoning: '', compliance: [], characteristics: [] },
      retail: { preferredColors: [], avoidColors: [], reasoning: '', compliance: [], characteristics: [] },
      education: { preferredColors: [], avoidColors: [], reasoning: '', compliance: [], characteristics: [] },
      government: { preferredColors: [], avoidColors: [], reasoning: '', compliance: [], characteristics: [] },
      nonprofit: { preferredColors: [], avoidColors: [], reasoning: '', compliance: [], characteristics: [] },
      entertainment: { preferredColors: [], avoidColors: [], reasoning: '', compliance: [], characteristics: [] },
      'real-estate': { preferredColors: [], avoidColors: [], reasoning: '', compliance: [], characteristics: [] },
      automotive: { preferredColors: [], avoidColors: [], reasoning: '', compliance: [], characteristics: [] },
      'food-beverage': { preferredColors: [], avoidColors: [], reasoning: '', compliance: [], characteristics: [] }
    };
  }

  private initializeAudienceProfiles(): Record<AudienceType, AudienceProfile> {
    return {
      children: {
        preferences: ['bright', 'saturated', 'playful'],
        considerations: 'Children respond well to bright, engaging colors but avoid scary or aggressive tones',
        restrictions: ['avoid dark colors', 'avoid aggressive reds']
      },
      professionals: {
        preferences: ['subtle', 'sophisticated', 'trustworthy'],
        considerations: 'Professional audience requires colors that convey competence and reliability',
        restrictions: ['avoid overly bright colors', 'maintain professional appearance']
      },
      // Add other audiences...
      teenagers: { preferences: [], considerations: '', restrictions: [] },
      'young-adults': { preferences: [], considerations: '', restrictions: [] },
      seniors: { preferences: [], considerations: '', restrictions: [] },
      general: { preferences: [], considerations: '', restrictions: [] },
      experts: { preferences: [], considerations: '', restrictions: [] },
      consumers: { preferences: [], considerations: '', restrictions: [] }
    };
  }

  private initializeCulturalProfiles(): Record<CulturalContext, CulturalProfile> {
    return {
      western: {
        meanings: { 'red': 'danger/love', 'green': 'go/nature', 'blue': 'trust/calm' },
        taboos: ['black for celebrations'],
        preferences: ['blue', 'green'],
        factors: 'Western cultures associate specific emotions with colors based on cultural conditioning'
      },
      eastern: {
        meanings: { 'red': 'luck/prosperity', 'gold': 'wealth', 'white': 'purity/mourning' },
        taboos: ['white for celebrations', 'green for hats'],
        preferences: ['red', 'gold'],
        factors: 'Eastern cultures have different color symbolism, particularly around luck and prosperity'
      },
      // Add other cultural contexts...
      global: { meanings: {}, taboos: [], preferences: [], factors: '' },
      regional: { meanings: {}, taboos: [], preferences: [], factors: '' },
      'north-american': { meanings: {}, taboos: [], preferences: [], factors: '' },
      european: { meanings: {}, taboos: [], preferences: [], factors: '' },
      asian: { meanings: {}, taboos: [], preferences: [], factors: '' },
      'latin-american': { meanings: {}, taboos: [], preferences: [], factors: '' },
      'middle-eastern': { meanings: {}, taboos: [], preferences: [], factors: '' },
      african: { meanings: {}, taboos: [], preferences: [], factors: '' }
    };
  }

  // Placeholder methods for complex analysis
  private generatePsychologyExplanation(tokens: ContextualTokens): string {
    return 'Color psychology analysis based on contextual factors';
  }

  private analyzePsychology(tokens: ContextualTokens): ColorPsychology {
    return {
      primary: { emotions: [], associations: [], effects: [], warnings: [] },
      secondary: { emotions: [], associations: [], effects: [], warnings: [] },
      overall: { dominantEmotion: 'calm', energyLevel: 'moderate', trustworthiness: 80, approachability: 75, memorability: 70 }
    };
  }

  private analyzeCultural(tokens: ContextualTokens, context: DesignContext): CulturalAnalysis {
    return {
      meanings: {},
      taboos: [],
      preferences: [],
      seasonalRelevance: [],
      religiousConsiderations: []
    };
  }

  private analyzeCompliance(context: DesignContext): ComplianceAnalysis {
    return {
      industryStandards: [],
      regulatoryRequirements: [],
      bestPractices: [],
      accessibility: []
    };
  }

  private generateDesignGuidelines(tokens: ContextualTokens, context: DesignContext): DesignGuidelines {
    return {
      usage: { primary: [], secondary: [], backgrounds: [], text: [], accents: [] },
      combinations: { recommended: [], avoid: [], contextSpecific: {} },
      restrictions: { forbidden: [], limitations: {}, conditions: {} },
      recommendations: { immediate: [], future: [], alternatives: [], testing: [] }
    };
  }

  private generateContextualVariations(tokens: ContextualTokens, context: DesignContext): ContextualVariations {
    return {
      seasonal: {},
      campaigns: {},
      regions: {},
      products: {}
    };
  }
}

// Supporting interfaces
interface IndustryProfile {
  preferredColors: string[];
  avoidColors: string[];
  reasoning: string;
  compliance: string[];
  characteristics: string[];
}

interface AudienceProfile {
  preferences: string[];
  considerations: string;
  restrictions: string[];
}

interface CulturalProfile {
  meanings: Record<string, string>;
  taboos: string[];
  preferences: string[];
  factors: string;
}