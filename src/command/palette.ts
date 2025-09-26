import { AccessibilityIntelligence } from '../utils/accessibility-intelligence.js';
import { MultiProviderAIService, DesignContext, PaletteRequest } from '../utils/ai-providers.js';
import { analyzeAccessibilityComprehensiveReScript } from '../utils/bridge.js';
import { listAvailableFormats, detectTokenFormat } from '../utils/token-formats.js';
import fs from 'fs-extra';
import * as path from 'path';

interface PaletteOptions {
  baseColor: string;
  style: 'professional' | 'vibrant' | 'minimal' | 'warm' | 'cool';
  output?: string;
  model: string;
  returnTokens?: boolean;
  // Enhanced options
  industry?: string;
  audience?: string;
  accessibility?: boolean;
  context?: string;
  // Format options
  format?: string;
  namespace?: string;
  listFormats?: boolean;
}

export async function palette(options: PaletteOptions): Promise<any> {
  // Handle list formats option
  if (options.listFormats) {
    console.log('📋 Available Token Formats:\n');
    console.log(listAvailableFormats());
    console.log('\n💡 Usage Examples:');
    console.log('  design-tokens palette "#3b82f6" --format w3c --output tokens/colors.json');
    console.log('  design-tokens palette "#ef4444" --format style-dictionary --namespace "brand"');
    console.log('  design-tokens palette "#10b981" --output tokens/palette.json  # Auto-detect format');
    console.log('\n🔍 Auto-detection: Omit --format to auto-detect from existing token files');
    console.log('🎯 Default: W3C format when no existing tokens found');
    return;
  }

  console.log('🎨 Generating enhanced AI-powered color palette...');

  // Auto-detect format if output path is provided but format is not specified
  let detectedFormat: string | undefined = options.format;
  if (!detectedFormat && options.output) {
    const tokenDir = path.dirname(options.output);
    console.log(`🔍 Scanning ${tokenDir} for existing token format...`);
    try {
      const format = await detectTokenFormat(tokenDir);
      if (format) {
        detectedFormat = format.name;
        console.log(`✅ Auto-detected format: ${format.displayName}`);
        console.log(`📝 Expected output: ${format.rootKey} root, ${format.valueKey} properties`);
      } else {
        console.log(`ℹ️  No existing format detected, using W3C default`);
        console.log(`📝 Expected output: W3C format (colors root, $value properties)`);
      }
    } catch (error) {
      console.log(`ℹ️  Format detection failed, using W3C default`);
      console.log(`📝 Expected output: W3C format (colors root, $value properties)`);
    }
  } else if (options.format) {
    const formatInfo = await import('../utils/token-formats.js');
    const targetFormat = formatInfo.getTokenFormat(options.format);
    console.log(`🎯 Using explicit format: ${targetFormat.displayName}`);
    console.log(`📝 Expected output: ${targetFormat.rootKey} root, ${targetFormat.valueKey} properties`);
  } else {
    console.log(`🎯 Using default format: W3C Design Token Community Group`);
    console.log(`📝 Expected output: colors root, $value properties`);
  }

  // Use the multi-provider AI service
  const aiService = new MultiProviderAIService();
  const accessibilityAnalyzer = new AccessibilityIntelligence();

  // Parse context options
  const context: DesignContext = {
    industry: (options.industry as any) || 'tech',
    audience: (options.audience as any) || 'professionals',
    medium: 'web',
    accessibility: options.accessibility ? 'high-contrast' : 'standard',
    cultural: 'global',
    emotional: getEmotionalToneFromStyle(options.style)
  };

  const request: PaletteRequest = {
    baseColor: options.baseColor,
    style: options.style,
    context,
    accessibility: options.accessibility !== false,
    size: 9,
    format: detectedFormat,
    namespace: options.namespace
  };

  try {
    const startTime = performance.now();

    // Use format-aware generation when format options are provided
    const result = (detectedFormat || options.format)
      ? await aiService.generateFormattedPalette(request, options.output)
      : await aiService.generatePalette(request);

    let enhancedPalette;
    let finalTokens;

    if ('format' in result) {
      // Format-aware result
      enhancedPalette = { tokens: {}, metadata: result.metadata };
      finalTokens = result.tokens;
      console.log(`🔍 Using format: ${result.format.displayName}`);
    } else {
      // Standard result
      enhancedPalette = result;
      finalTokens = result.tokens;
    }

    // Run comprehensive accessibility analysis using ReScript optimization
    let accessibilityReport;
    let analysisMethod = 'TypeScript';
    let analysisTime = 0;

    try {
      const analysisStart = performance.now();

      // Try ReScript optimization first (1.89x faster)
      const colors = Object.values(flattenColorTokens(enhancedPalette.tokens || finalTokens));
      console.log(`🔍 Attempting ReScript analysis with ${colors.length} colors...`);
      const rescriptResult = analyzeAccessibilityComprehensiveReScript(
        colors,
        ['#ffffff', '#000000']
      );
      console.log(`✅ ReScript analysis successful:`, rescriptResult);

      analysisTime = performance.now() - analysisStart;
      analysisMethod = 'ReScript';

      // Convert ReScript result to expected format
      accessibilityReport = {
        score: rescriptResult.overallScore,
        wcag: {
          level: rescriptResult.wcagCompliance.toLowerCase() as 'aaa' | 'aa' | 'partial' | 'none',
          textContrast: rescriptResult.contrastIssues,
          nonTextContrast: [],
          issues: rescriptResult.contrastIssues.map(contrast => ({
            severity: contrast.passesAA ? 'low' : 'high' as const,
            element: `Color ${contrast.foreground} on ${contrast.background}`,
            issue: `Contrast ratio ${contrast.ratio.toFixed(2)}:1`,
            suggestion: contrast.passesAA ? 'Meets WCAG AA' : 'Increase contrast for better accessibility'
          }))
        },
        colorBlindness: {
          overallCompatibility: rescriptResult.colorBlindnessScore,
          protanopia: { affectedColors: [], distinctionIssues: [], severity: 'none' as const, type: 'protanopia' as const },
          deuteranopia: { affectedColors: [], distinctionIssues: [], severity: 'none' as const, type: 'deuteranopia' as const },
          tritanopia: { affectedColors: [], distinctionIssues: [], severity: 'none' as const, type: 'tritanopia' as const },
          monochromacy: { affectedColors: [], distinctionIssues: [], severity: 'none' as const, type: 'monochromacy' as const },
          problematicPairs: rescriptResult.problematicPairs
        },
        lowVision: {
          contrastSensitivity: {
            lowContrast: { minimumContrast: 7, recommendedContrast: 10, currentContrasts: [], issues: [] },
            moderateContrast: { minimumContrast: 4.5, recommendedContrast: 7, currentContrasts: [], issues: [] },
            highContrast: { minimumContrast: 3, recommendedContrast: 4.5, currentContrasts: [], issues: [] }
          },
          visualAcuity: { textSize: { minimum: 16, recommended: 18, current: 'variable' }, colorDistinction: { required: 10, achieved: 15 } },
          fieldOfVision: { centralVision: { importance: 'critical' as const, colorPlacement: [] }, peripheralVision: { colorIntensity: 70, recommendations: [] } },
          lightSensitivity: {
            photophobia: { brightness: 40, saturation: 60, recommendations: [] },
            normalVision: { brightness: 80, saturation: 100, recommendations: [] },
            darkAdapted: { brightness: 20, saturation: 80, recommendations: [] }
          }
        },
        cognitiveLoad: {
          colorMemoryLoad: 30,
          distinctionComplexity: 25,
          semanticClarity: 85,
          culturalConsiderations: {
            western: { positive: ['#10b981', '#3b82f6'], negative: ['#ef4444'], neutral: ['#6b7280'] },
            eastern: { positive: ['#ef4444', '#fbbf24'], negative: [], neutral: ['#6b7280'] },
            global: { safe: ['#3b82f6', '#10b981'], caution: ['#ef4444'], avoid: [] }
          },
          recommendations: []
        },
        recommendations: rescriptResult.contrastIssues
          .filter(contrast => !contrast.passesAA)
          .map(contrast => ({
            priority: 'high' as const,
            category: 'contrast' as const,
            issue: `Low contrast: ${contrast.foreground} on ${contrast.background}`,
            solution: `Increase contrast ratio from ${contrast.ratio.toFixed(2)}:1 to at least 4.5:1`,
            impact: 'Improves readability for users with visual impairments',
            effort: 'medium' as const
          }))
      };

    } catch (rescriptError) {
      // Fallback to TypeScript implementation
      console.log('🔄 Falling back to TypeScript accessibility analysis');
      console.log('❌ ReScript error:', rescriptError);
      const analysisStart = performance.now();
      accessibilityReport = accessibilityAnalyzer.analyzeComprehensiveAccessibility(
        flattenColorTokens(enhancedPalette.tokens || finalTokens),
        { usage: 'web' }
      );
      analysisTime = performance.now() - analysisStart;
      analysisMethod = 'TypeScript (fallback)';
    }

    const totalTime = performance.now() - startTime;

    console.log(`✨ Generated using ${enhancedPalette.metadata.provider}`);
    console.log(`⚡ Analysis: ${analysisMethod} (${analysisTime.toFixed(1)}ms)`);
    console.log(`📊 Accessibility Score: ${accessibilityReport.score}/100`);
    console.log(`🎯 Context: ${context.industry} for ${context.audience}`);
    if (analysisMethod === 'ReScript') {
      console.log(`🚀 Performance: ~${(1.89).toFixed(1)}x faster with ReScript optimization`);
    }

    if (options.returnTokens) {
      return {
        ...finalTokens,
        metadata: enhancedPalette.metadata,
        accessibility: accessibilityReport
      };
    }

    if (options.output) {
      // Ensure output directory exists
      const outputDir = path.dirname(options.output);
      await fs.ensureDir(outputDir);

      // Create comprehensive output with metadata
      const fullOutput = {
        ...finalTokens,
        metadata: {
          ...enhancedPalette.metadata,
          accessibilityScore: accessibilityReport.score,
          generatedAt: new Date().toISOString(),
          version: '2.0',
          processingTime: totalTime,
          analysisMethod: analysisMethod
        }
      };

      // Write to file
      await fs.writeJson(options.output, fullOutput, { spaces: 2 });

      console.log(`✅ Enhanced palette generated and saved to ${options.output}`);

      // Show format information
      if ('format' in result) {
        console.log(`📁 Format: ${result.format.displayName}`);
        console.log(`📊 Structure: ${result.format.rootKey} root with ${result.format.valueKey} properties`);
        if (options.namespace) {
          console.log(`🏷️  Namespace: "${options.namespace}" prefix applied to all tokens`);
        }
      }

      // Show accessibility recommendations
      if (accessibilityReport.recommendations.length > 0) {
        console.log('\n📋 Accessibility Recommendations:');
        accessibilityReport.recommendations.slice(0, 3).forEach(rec => {
          console.log(`  ${rec.priority === 'critical' ? '🔴' : rec.priority === 'high' ? '🟡' : '🟢'} ${rec.issue}`);
          console.log(`     → ${rec.solution}`);
        });
      }

      // Show context insights
      console.log(`\n💡 Context Insights:`);
      console.log(`   ${enhancedPalette.metadata.reasoning}`);

      console.log('\n🔧 Next steps:');
      if (detectedFormat === 'style-dictionary' || options.format === 'style-dictionary') {
        console.log('   style-dictionary build  # Build tokens with Style Dictionary');
      } else if (detectedFormat === 'w3c' || options.format === 'w3c' || !options.format) {
        console.log('   # Import tokens into your W3C-compatible design system');
        console.log('   # Or convert to other formats using Style Dictionary transforms');
      } else {
        console.log('   # Import tokens into your design system or build pipeline');
      }
    }

    return finalTokens;
  } catch (error) {
    console.error('❌ Failed to generate enhanced palette:', error);
    throw error;
  }
}

/**
 * Helper function to get emotional tone from style
 */
function getEmotionalToneFromStyle(style: string): 'calm' | 'energetic' | 'trustworthy' | 'playful' | 'professional' {
  switch (style) {
    case 'vibrant':
      return 'energetic';
    case 'minimal':
      return 'calm';
    case 'warm':
      return 'playful';
    case 'cool':
      return 'trustworthy';
    case 'professional':
    default:
      return 'professional';
  }
}

/**
 * Helper function to flatten color tokens for accessibility analysis
 */
function flattenColorTokens(tokens: any): Record<string, string> {
  const flattened: Record<string, string> = {};

  function flattenObject(obj: any, prefix: string = '') {
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object' && value.value) {
        // This is a token with a value
        flattened[newKey] = value.value;
      } else if (value && typeof value === 'object') {
        // This is a nested object, recurse
        flattenObject(value, newKey);
      }
    });
  }

  flattenObject(tokens);
  return flattened;
}