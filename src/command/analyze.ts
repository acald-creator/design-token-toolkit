import { analyzeColorIntelligence, generateIntelligentPalette, suggestBrandColorsAI } from "../utils/color.js";

export async function analyze(color: string, options: { style: string }): Promise<void> {
  try {
    console.log(`🎨 AI-Powered Color Analysis for ${color}`);
    console.log('=' .repeat(50));

    // Basic color intelligence with ReScript optimization
    console.log('🧠 Analyzing color intelligence...');
    const startTime = performance.now();
    const intelligence = analyzeColorIntelligence(color);
    const analysisTime = performance.now() - startTime;

    console.log('\n📊 Color Intelligence:');
    console.log(`   Score: ${intelligence.score}/100`);
    console.log(`   Saturation: ${(intelligence.properties.saturation * 100).toFixed(1)}%`);
    console.log(`   Lightness: ${(intelligence.properties.lightness * 100).toFixed(1)}%`);
    console.log(`   Accessibility: ${intelligence.properties.accessibility.toUpperCase()}`);
    console.log(`⚡ Analysis: ${analysisTime.toFixed(1)}ms (ReScript optimization)`);

    console.log('\n💡 Suggestions:');
    intelligence.suggestions.forEach(suggestion => {
      console.log(`   • ${suggestion}`);
    });

    console.log('\n🎭 Color Psychology:');
    intelligence.properties.harmony.forEach(trait => {
      console.log(`   • ${trait}`);
    });

    // AI-powered palette generation with error handling
    console.log('\n' + '=' .repeat(50));
    console.log(`🎨 AI-Generated ${options.style.toUpperCase()} Palette:`);

    try {
      const paletteStartTime = performance.now();
      const paletteResult = generateIntelligentPalette(color, {
        style: options.style as any,
        accessibility: true
      });
      const paletteTime = performance.now() - paletteStartTime;

      console.log('\n🖼️  Generated Palette:');
      Object.entries(paletteResult.palette).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });

      console.log('\n💡 AI Palette Suggestions:');
      paletteResult.suggestions.forEach(suggestion => {
        console.log(`   • ${suggestion}`);
      });

      console.log(`⚡ Palette generation: ${paletteTime.toFixed(1)}ms (ReScript optimization)`);

    } catch (paletteError) {
      console.log('⚠️  Palette generation failed, using fallback');
      console.warn('Palette error:', paletteError);
      console.log('   • Unable to generate intelligent palette for this color');
      console.log('   • Try using a valid hex color (e.g., #646cff)');
    }

    // Brand color suggestions with error handling
    console.log('\n' + '=' .repeat(50));
    console.log('🚀 AI Brand Color Suggestions:');

    try {
      const brandStartTime = performance.now();
      const brandSuggestions = suggestBrandColorsAI(color);
      const brandTime = performance.now() - brandStartTime;

      console.log('\n📈 Current Trends:');
      brandSuggestions.analysis.trends.forEach(trend => {
        console.log(`   • ${trend}`);
      });

      console.log('\n💡 Smart Suggestions:');
      brandSuggestions.suggestions.forEach(suggestion => {
        const category = suggestion.category.toUpperCase();
        console.log(`   ${category}: ${suggestion.color} (${(suggestion.confidence * 100).toFixed(0)}% confidence)`);
        console.log(`      ${suggestion.reasoning}`);
      });

      console.log('\n🎯 Alternative Colors:');
      brandSuggestions.analysis.alternatives.forEach(alt => {
        console.log(`   • ${alt}`);
      });

      console.log(`⚡ Brand analysis: ${brandTime.toFixed(1)}ms (ReScript optimization)`);

    } catch (brandError) {
      console.log('⚠️  Brand analysis failed, using fallback');
      console.warn('Brand analysis error:', brandError);
      console.log('   • Unable to generate brand suggestions for this color');
      console.log('   • Basic color analysis completed successfully above');
    }

    console.log('\n' + '=' .repeat(50));
    console.log('✨ Analysis complete! Use these insights to create harmonious, accessible color systems.');

  } catch (error) {
    console.error('❌ Critical error in color analysis:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   • Ensure the color is in valid hex format (e.g., #646cff)');
    console.log('   • Check that ReScript modules are properly compiled');
    console.log('   • Try running `bun run build` to rebuild the project');
    throw error;
  }
}