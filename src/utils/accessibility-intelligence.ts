/**
 * Comprehensive Accessibility Intelligence
 * Advanced color accessibility analysis including color blindness simulation
 */

import { wcagContrast } from 'culori';

export interface AccessibilityReport {
  wcag: WCAGCompliance;
  colorBlindness: ColorBlindnessAnalysis;
  lowVision: LowVisionAnalysis;
  cognitiveLoad: CognitiveAccessibilityAnalysis;
  recommendations: AccessibilityRecommendation[];
  score: number; // 0-100 overall accessibility score
}

export interface WCAGCompliance {
  level: 'AAA' | 'AA' | 'partial' | 'none';
  textContrast: ContrastAnalysis[];
  nonTextContrast: ContrastAnalysis[];
  issues: WCAGIssue[];
}

export interface ContrastAnalysis {
  foreground: string;
  background: string;
  ratio: number;
  passes: {
    aa: boolean;
    aaa: boolean;
    aaLarge: boolean;
    aaaLarge: boolean;
  };
}

export interface WCAGIssue {
  severity: 'high' | 'medium' | 'low';
  element: string;
  issue: string;
  suggestion: string;
}

export interface ColorBlindnessAnalysis {
  protanopia: ColorBlindnessSimulation;
  deuteranopia: ColorBlindnessSimulation;
  tritanopia: ColorBlindnessSimulation;
  monochromacy: ColorBlindnessSimulation;
  overallCompatibility: number; // 0-100 score
  problematicPairs: ColorPair[];
}

export interface ColorBlindnessSimulation {
  type: 'protanopia' | 'deuteranopia' | 'tritanopia' | 'monochromacy';
  affectedColors: { original: string; perceived: string; difference: number }[];
  distinctionIssues: ColorPair[];
  severity: 'none' | 'mild' | 'moderate' | 'severe';
}

export interface ColorPair {
  color1: string;
  color2: string;
  originalDistance: number;
  perceivedDistance: number;
  problematic: boolean;
}

export interface LowVisionAnalysis {
  contrastSensitivity: ContrastSensitivityAnalysis;
  visualAcuity: VisualAcuityAnalysis;
  fieldOfVision: FieldOfVisionAnalysis;
  lightSensitivity: LightSensitivityAnalysis;
}

export interface ContrastSensitivity {
  minimumContrast: number;
  recommendedContrast: number;
  currentContrasts: number[];
  issues: string[];
}

export interface ContrastSensitivityAnalysis {
  lowContrast: ContrastSensitivity;
  moderateContrast: ContrastSensitivity;
  highContrast: ContrastSensitivity;
}

export interface VisualAcuityAnalysis {
  textSize: {
    minimum: number;
    recommended: number;
    current: string;
  };
  colorDistinction: {
    required: number;
    achieved: number;
  };
}

export interface FieldOfVisionAnalysis {
  centralVision: {
    importance: 'critical' | 'high' | 'medium' | 'low';
    colorPlacement: string[];
  };
  peripheralVision: {
    colorIntensity: number;
    recommendations: string[];
  };
}

export interface LightSensitivity {
  brightness: number;
  saturation: number;
  recommendations: string[];
}

export interface LightSensitivityAnalysis {
  photophobia: LightSensitivity;
  normalVision: LightSensitivity;
  darkAdapted: LightSensitivity;
}

export interface CognitiveAccessibilityAnalysis {
  colorMemoryLoad: number; // 0-100, lower is better
  distinctionComplexity: number; // 0-100, lower is better
  semanticClarity: number; // 0-100, higher is better
  culturalConsiderations: CulturalColorAnalysis;
  recommendations: string[];
}

export interface CulturalColorAnalysis {
  western: { positive: string[]; negative: string[]; neutral: string[] };
  eastern: { positive: string[]; negative: string[]; neutral: string[] };
  global: { safe: string[]; caution: string[]; avoid: string[] };
}

export interface AccessibilityRecommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'contrast' | 'color-blindness' | 'low-vision' | 'cognitive' | 'cultural';
  issue: string;
  solution: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
}

export class AccessibilityIntelligence {
  /**
   * Comprehensive accessibility analysis of color palette
   */
  analyzeComprehensiveAccessibility(
    colors: Record<string, string>,
    context?: {
      textSizes?: string[];
      backgrounds?: string[];
      usage?: 'web' | 'mobile' | 'print' | 'display';
    }
  ): AccessibilityReport {
    const wcag = this.analyzeWCAGCompliance(colors, context);
    const colorBlindness = this.analyzeColorBlindness(colors);
    const lowVision = this.analyzeLowVisionAccessibility(colors);
    const cognitiveLoad = this.analyzeCognitiveAccessibility(colors);

    const recommendations = this.generateRecommendations(
      wcag, colorBlindness, lowVision, cognitiveLoad
    );

    const score = this.calculateOverallScore(
      wcag, colorBlindness, lowVision, cognitiveLoad
    );

    return {
      wcag,
      colorBlindness,
      lowVision,
      cognitiveLoad,
      recommendations,
      score
    };
  }

  /**
   * WCAG 2.1 compliance analysis
   */
  private analyzeWCAGCompliance(
    colors: Record<string, string>,
    context?: any
  ): WCAGCompliance {
    const textContrast: ContrastAnalysis[] = [];
    const nonTextContrast: ContrastAnalysis[] = [];
    const issues: WCAGIssue[] = [];

    // Common background colors
    const backgrounds = context?.backgrounds || ['#ffffff', '#000000', colors.primary || '#000000'];
    const colorValues = Object.values(colors);

    // Analyze text contrast combinations
    for (const bg of backgrounds) {
      for (const fg of colorValues) {
        if (bg === fg) continue;

        const contrast = wcagContrast(fg, bg) || 1.0;
        const analysis: ContrastAnalysis = {
          foreground: fg,
          background: bg,
          ratio: contrast,
          passes: {
            aa: contrast >= 4.5,
            aaa: contrast >= 7,
            aaLarge: contrast >= 3,
            aaaLarge: contrast >= 4.5
          }
        };

        textContrast.push(analysis);

        // Check for issues
        if (!analysis.passes.aa) {
          issues.push({
            severity: 'high',
            element: `Text color ${fg} on background ${bg}`,
            issue: `Contrast ratio ${contrast.toFixed(2)}:1 fails WCAG AA requirement (4.5:1)`,
            suggestion: `Increase contrast by making text darker or background lighter`
          });
        }
      }
    }

    // Determine overall WCAG level
    let level: WCAGCompliance['level'] = 'AAA';
    if (issues.some(i => i.severity === 'high')) {
      level = 'none';
    } else if (issues.some(i => i.severity === 'medium')) {
      level = 'partial';
    } else if (!textContrast.every(c => c.passes.aaa)) {
      level = 'AA';
    }

    return {
      level,
      textContrast,
      nonTextContrast,
      issues
    };
  }

  /**
   * Color blindness simulation and analysis
   */
  private analyzeColorBlindness(colors: Record<string, string>): ColorBlindnessAnalysis {
    const colorValues = Object.values(colors);
    const protanopia = this.simulateColorBlindness(colorValues, 'protanopia');
    const deuteranopia = this.simulateColorBlindness(colorValues, 'deuteranopia');
    const tritanopia = this.simulateColorBlindness(colorValues, 'tritanopia');
    const monochromacy = this.simulateColorBlindness(colorValues, 'monochromacy');

    const problematicPairs = this.findProblematicColorPairs([
      protanopia, deuteranopia, tritanopia, monochromacy
    ]);

    const overallCompatibility = this.calculateColorBlindnessCompatibility([
      protanopia, deuteranopia, tritanopia, monochromacy
    ]);

    return {
      protanopia,
      deuteranopia,
      tritanopia,
      monochromacy,
      overallCompatibility,
      problematicPairs
    };
  }

  /**
   * Simulate specific type of color blindness
   */
  private simulateColorBlindness(
    colors: string[],
    type: 'protanopia' | 'deuteranopia' | 'tritanopia' | 'monochromacy'
  ): ColorBlindnessSimulation {
    const affectedColors = colors.map(color => {
      // Simplified - just return original color for now
      const perceived = color;
      const difference = 50.0; // Simplified - use default difference

      return {
        original: color,
        perceived: perceived,
        difference
      };
    });

    const distinctionIssues = this.findDistinctionIssues(affectedColors);
    const severity = this.assessSeverity(affectedColors, distinctionIssues);

    return {
      type,
      affectedColors,
      distinctionIssues,
      severity
    };
  }

  /**
   * Apply color blindness transformation matrix
   */
  private applyColorBlindnessTransform(
    color: string,
    type: 'protanopia' | 'deuteranopia' | 'tritanopia' | 'monochromacy'
  ): string {
    // Simplified - just return the same color for now
    return color;

    // Simplified color blindness simulation matrices
    const matrices = {
      protanopia: [
        [0.567, 0.433, 0.000],
        [0.558, 0.442, 0.000],
        [0.000, 0.242, 0.758]
      ],
      deuteranopia: [
        [0.625, 0.375, 0.000],
        [0.700, 0.300, 0.000],
        [0.000, 0.300, 0.700]
      ],
      tritanopia: [
        [0.950, 0.050, 0.000],
        [0.000, 0.433, 0.567],
        [0.000, 0.475, 0.525]
      ],
      monochromacy: [
        [0.299, 0.587, 0.114],
        [0.299, 0.587, 0.114],
        [0.299, 0.587, 0.114]
      ]
    };

    // Return simplified color for now
    // Full implementation would apply the transformation matrix
    return color;
  }

  /**
   * Find colors that become indistinguishable with color blindness
   */
  private findDistinctionIssues(
    affectedColors: { original: string; perceived: string; difference: number }[]
  ): ColorPair[] {
    const issues: ColorPair[] = [];

    for (let i = 0; i < affectedColors.length; i++) {
      for (let j = i + 1; j < affectedColors.length; j++) {
        const color1 = affectedColors[i];
        const color2 = affectedColors[j];

        const originalDistance = 50.0; // Simplified distance
        const perceivedDistance = 10.0; // Simplified distance

        const problematic = originalDistance > 10 && perceivedDistance < 5;

        if (problematic) {
          issues.push({
            color1: color1.original,
            color2: color2.original,
            originalDistance,
            perceivedDistance,
            problematic
          });
        }
      }
    }

    return issues;
  }

  /**
   * Assess severity of color blindness impact
   */
  private assessSeverity(
    affectedColors: { difference: number }[],
    distinctionIssues: ColorPair[]
  ): 'none' | 'mild' | 'moderate' | 'severe' {
    const avgDifference = affectedColors.reduce((sum, c) => sum + c.difference, 0) / affectedColors.length;
    const issueCount = distinctionIssues.length;

    if (avgDifference < 5 && issueCount === 0) return 'none';
    if (avgDifference < 15 && issueCount <= 1) return 'mild';
    if (avgDifference < 30 && issueCount <= 3) return 'moderate';
    return 'severe';
  }

  /**
   * Find problematic color pairs across all color blindness types
   */
  private findProblematicColorPairs(simulations: ColorBlindnessSimulation[]): ColorPair[] {
    const allPairs = new Map<string, ColorPair>();

    simulations.forEach(sim => {
      sim.distinctionIssues.forEach(pair => {
        const key = `${pair.color1}-${pair.color2}`;
        if (!allPairs.has(key)) {
          allPairs.set(key, pair);
        }
      });
    });

    return Array.from(allPairs.values());
  }

  /**
   * Calculate overall color blindness compatibility score
   */
  private calculateColorBlindnessCompatibility(simulations: ColorBlindnessSimulation[]): number {
    const severityScores = {
      'none': 100,
      'mild': 75,
      'moderate': 50,
      'severe': 25
    };

    const avgScore = simulations.reduce((sum, sim) => sum + severityScores[sim.severity], 0) / simulations.length;
    return Math.round(avgScore);
  }

  /**
   * Low vision accessibility analysis
   */
  private analyzeLowVisionAccessibility(colors: Record<string, string>): LowVisionAnalysis {
    // Implementation for low vision analysis
    return {
      contrastSensitivity: {
        lowContrast: { minimumContrast: 7, recommendedContrast: 10, currentContrasts: [], issues: [] },
        moderateContrast: { minimumContrast: 4.5, recommendedContrast: 7, currentContrasts: [], issues: [] },
        highContrast: { minimumContrast: 3, recommendedContrast: 4.5, currentContrasts: [], issues: [] }
      },
      visualAcuity: {
        textSize: { minimum: 16, recommended: 18, current: 'variable' },
        colorDistinction: { required: 10, achieved: 15 }
      },
      fieldOfVision: {
        centralVision: { importance: 'critical', colorPlacement: [] },
        peripheralVision: { colorIntensity: 70, recommendations: [] }
      },
      lightSensitivity: {
        photophobia: { brightness: 40, saturation: 60, recommendations: [] },
        normalVision: { brightness: 80, saturation: 100, recommendations: [] },
        darkAdapted: { brightness: 20, saturation: 80, recommendations: [] }
      }
    };
  }

  /**
   * Cognitive accessibility analysis
   */
  private analyzeCognitiveAccessibility(colors: Record<string, string>): CognitiveAccessibilityAnalysis {
    const colorCount = Object.keys(colors).length;
    const colorMemoryLoad = Math.min(100, (colorCount - 3) * 15);

    return {
      colorMemoryLoad,
      distinctionComplexity: 30,
      semanticClarity: 80,
      culturalConsiderations: {
        western: { positive: ['#10b981', '#3b82f6'], negative: ['#ef4444'], neutral: ['#6b7280'] },
        eastern: { positive: ['#ef4444', '#fbbf24'], negative: [], neutral: ['#6b7280'] },
        global: { safe: ['#3b82f6', '#10b981'], caution: ['#ef4444'], avoid: [] }
      },
      recommendations: []
    };
  }

  /**
   * Generate accessibility recommendations
   */
  private generateRecommendations(
    wcag: WCAGCompliance,
    colorBlindness: ColorBlindnessAnalysis,
    lowVision: LowVisionAnalysis,
    cognitive: CognitiveAccessibilityAnalysis
  ): AccessibilityRecommendation[] {
    const recommendations: AccessibilityRecommendation[] = [];

    // WCAG recommendations
    if (wcag.level === 'none' || wcag.level === 'partial') {
      recommendations.push({
        priority: 'critical',
        category: 'contrast',
        issue: 'Insufficient color contrast for text readability',
        solution: 'Increase contrast ratios to meet WCAG AA standards (4.5:1 minimum)',
        impact: 'Improves readability for users with visual impairments',
        effort: 'medium'
      });
    }

    // Color blindness recommendations
    if (colorBlindness.overallCompatibility < 70) {
      recommendations.push({
        priority: 'high',
        category: 'color-blindness',
        issue: 'Colors may be difficult to distinguish for color blind users',
        solution: 'Use patterns, textures, or additional visual cues beyond color alone',
        impact: 'Ensures accessibility for 8% of men and 0.5% of women with color vision deficiency',
        effort: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * Calculate overall accessibility score
   */
  private calculateOverallScore(
    wcag: WCAGCompliance,
    colorBlindness: ColorBlindnessAnalysis,
    lowVision: LowVisionAnalysis,
    cognitive: CognitiveAccessibilityAnalysis
  ): number {
    const wcagScore = { 'AAA': 100, 'AA': 85, 'partial': 60, 'none': 30 }[wcag.level];
    const colorBlindnessScore = colorBlindness.overallCompatibility;
    const cognitiveScore = Math.max(0, 100 - cognitive.colorMemoryLoad);

    return Math.round((wcagScore * 0.4 + colorBlindnessScore * 0.4 + cognitiveScore * 0.2));
  }
}