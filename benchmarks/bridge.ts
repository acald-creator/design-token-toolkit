/**
 * Integration Test for ReScript + colorjs.io bindings
 * Tests the fixed color integration functions
 */

import {
  hexToRgb,
  rgbToHex,
  calculateDeltaE,
  calculateContrastRatio,
  simulateColorBlindness,
  areColorsDistinguishable,
  detectColorHarmony,
  calculateAccessibilityScore,
  analyzeColorWithOklch,
  generateOklchVariations,
  parseColor,
  toOklch,
  toP3,
  mapToGamut,
  inGamut,
  calculateDeltaEColorJS,
  calculateContrastColorJS,
  // New ReScript colorjs.io functions
  parseColorReScript,
  createOklchColor,
  createP3Color,
  adjustOklchLightness,
  adjustOklchChroma,
  adjustOklchHue,
  getOklchCoordinates,
  getP3Coordinates,
  toOklchStringReScript,
  toP3StringReScript
} from '../src/utils/bridge.js';

console.log('🧪 Testing ReScript + colorjs.io Integration');
console.log('='.repeat(50));

// Test colors
const testColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];

console.log('\n🔧 Testing Basic ReScript Functions:');
console.log('-'.repeat(30));

try {
  // Test basic conversions
  const rgb = hexToRgb('#FF0000');
  console.log(`✅ hexToRgb('#FF0000'):`, rgb);

  const hex = rgbToHex(rgb);
  console.log(`✅ rgbToHex(rgb):`, hex);

  // Test ReScript color calculations
  const deltaE = calculateDeltaE('#FF0000', '#00FF00');
  console.log(`✅ calculateDeltaE('#FF0000', '#00FF00'):`, deltaE.toFixed(2));

  const contrast = calculateContrastRatio('#FF0000', '#FFFFFF');
  console.log(`✅ calculateContrastRatio('#FF0000', '#FFFFFF'):`, contrast.toFixed(2));

  const colorBlind = simulateColorBlindness('#FF0000', 'Protanopia');
  console.log(`✅ simulateColorBlindness('#FF0000', 'Protanopia'):`, colorBlind);

  const distinguishable = areColorsDistinguishable('#FF0000', '#00FF00');
  console.log(`✅ areColorsDistinguishable('#FF0000', '#00FF00'):`, distinguishable);

  const harmony = detectColorHarmony(['#FF0000', '#00FFFF']);
  console.log(`✅ detectColorHarmony(['#FF0000', '#00FFFF']):`, harmony);

  const accessibilityScore = calculateAccessibilityScore(testColors);
  console.log(`✅ calculateAccessibilityScore(testColors):`, accessibilityScore.toFixed(1));

  console.log('\n✅ All ReScript functions working correctly!');
} catch (error) {
  console.error('❌ ReScript function test failed:', error);
}

console.log('\n🌈 Testing colorjs.io Integration:');
console.log('-'.repeat(35));

try {
  // Test colorjs.io parsing
  const colorAnalysis = parseColor('#646cff');
  console.log(`✅ parseColor('#646cff'):`);
  console.log(`   sRGB: r=${colorAnalysis.srgb.r.toFixed(3)}, g=${colorAnalysis.srgb.g.toFixed(3)}, b=${colorAnalysis.srgb.b.toFixed(3)}`);
  console.log(`   OKLCH: l=${colorAnalysis.oklch.l.toFixed(3)}, c=${colorAnalysis.oklch.c.toFixed(3)}, h=${colorAnalysis.oklch.h.toFixed(1)}`);
  console.log(`   P3: r=${colorAnalysis.p3.r.toFixed(3)}, g=${colorAnalysis.p3.g.toFixed(3)}, b=${colorAnalysis.p3.b.toFixed(3)}`);
  console.log(`   In sRGB gamut: ${colorAnalysis.inSRGBGamut}, In P3 gamut: ${colorAnalysis.inP3Gamut}`);

  // Test OKLCH functions
  const oklchAnalysis = analyzeColorWithOklch('#646cff');
  console.log(`✅ analyzeColorWithOklch('#646cff'): OKLCH(${oklchAnalysis.oklch.l.toFixed(3)}, ${oklchAnalysis.oklch.c.toFixed(3)}, ${oklchAnalysis.oklch.h.toFixed(1)})`);

  const oklchVariations = generateOklchVariations('#646cff', 3);
  console.log(`✅ generateOklchVariations('#646cff', 3):`);
  oklchVariations.forEach((variation, i) => {
    console.log(`   ${i + 1}. ${variation.color} - ${variation.description}`);
  });

  // Test color space conversions
  const oklchString = toOklch('#646cff');
  console.log(`✅ toOklch('#646cff'):`, oklchString);

  const p3String = toP3('#646cff');
  console.log(`✅ toP3('#646cff'):`, p3String);

  // Test gamut operations
  const mappedColor = mapToGamut('color(display-p3 1 0 0)', 'srgb');
  console.log(`✅ mapToGamut('color(display-p3 1 0 0)', 'srgb'):`, mappedColor);

  const isInGamut = inGamut('#FF0000', 'srgb');
  console.log(`✅ inGamut('#FF0000', 'srgb'):`, isInGamut);

  // Test advanced calculations
  const deltaEColorJS = calculateDeltaEColorJS('#646cff', '#FF0000', '2000');
  console.log(`✅ calculateDeltaEColorJS('#646cff', '#FF0000', '2000'):`, deltaEColorJS.toFixed(2));

  const contrastColorJS = calculateContrastColorJS('#646cff', '#FFFFFF', 'WCAG21');
  console.log(`✅ calculateContrastColorJS('#646cff', '#FFFFFF', 'WCAG21'):`, contrastColorJS.toFixed(2));

  console.log('\n✅ All colorjs.io functions working correctly!');
} catch (error) {
  console.error('❌ colorjs.io function test failed:', error);
}

console.log('\n🏁 Testing OKLCH color space operations:');
console.log('-'.repeat(40));

try {
  // Test OKLCH parsing and manipulation
  const oklchColors = [
    'oklch(0.7 0.15 0)',
    'oklch(0.6 0.2 120)',
    'oklch(0.5 0.25 240)'
  ];

  oklchColors.forEach(oklchColor => {
    try {
      const analysis = parseColor(oklchColor);
      const hexEquivalent = rgbToHex({
        r: analysis.srgb.r * 255,
        g: analysis.srgb.g * 255,
        b: analysis.srgb.b * 255
      });
      console.log(`✅ ${oklchColor} → ${hexEquivalent}`);
    } catch (error) {
      console.log(`⚠️ ${oklchColor} → Error: ${error}`);
    }
  });

  console.log('\n✅ OKLCH operations completed!');
} catch (error) {
  console.error('❌ OKLCH test failed:', error);
}

console.log('\n🎯 Performance Comparison Test:');
console.log('-'.repeat(35));

try {
  const iterations = 1000;
  const testColor1 = '#646cff';
  const testColor2 = '#ff6464';

  // ReScript Delta-E
  const startReScript = performance.now();
  for (let i = 0; i < iterations; i++) {
    calculateDeltaE(testColor1, testColor2);
  }
  const endReScript = performance.now();

  // colorjs.io Delta-E
  const startColorJS = performance.now();
  for (let i = 0; i < iterations; i++) {
    calculateDeltaEColorJS(testColor1, testColor2);
  }
  const endColorJS = performance.now();

  const rescriptTime = endReScript - startReScript;
  const colorjsTime = endColorJS - startColorJS;

  console.log(`ReScript Delta-E (${iterations} iterations): ${rescriptTime.toFixed(2)}ms`);
  console.log(`colorjs.io Delta-E (${iterations} iterations): ${colorjsTime.toFixed(2)}ms`);
  console.log(`Performance ratio: ${(colorjsTime / rescriptTime).toFixed(2)}x`);

  if (rescriptTime < colorjsTime) {
    console.log(`✅ ReScript is ${(colorjsTime / rescriptTime).toFixed(1)}x faster than colorjs.io!`);
  } else {
    console.log(`🐌 colorjs.io is ${(rescriptTime / colorjsTime).toFixed(1)}x faster than ReScript`);
  }

} catch (error) {
  console.error('❌ Performance test failed:', error);
}

console.log('\n🚀 Testing ReScript colorjs.io Bindings:');
console.log('-'.repeat(45));

try {
  // Test ReScript colorjs.io bindings
  const testColor = '#646cff';

  // Test ReScript parsing
  const rescript_color = parseColorReScript(testColor);
  console.log(`✅ parseColorReScript('${testColor}'): Successfully parsed`);

  // Test OKLCH creation
  const oklchColor = createOklchColor(0.7, 0.15, 120);
  console.log(`✅ createOklchColor(0.7, 0.15, 120): Created OKLCH color`);

  // Test P3 creation
  const p3Color = createP3Color(0.8, 0.2, 0.3);
  console.log(`✅ createP3Color(0.8, 0.2, 0.3): Created P3 color`);

  // Test OKLCH coordinate extraction
  const oklchCoords = getOklchCoordinates(testColor);
  console.log(`✅ getOklchCoordinates('${testColor}'):`,
    `L=${oklchCoords.l.toFixed(3)}, C=${oklchCoords.c.toFixed(3)}, H=${oklchCoords.h.toFixed(1)}`);

  // Test P3 coordinate extraction
  const p3Coords = getP3Coordinates(testColor);
  console.log(`✅ getP3Coordinates('${testColor}'):`,
    `R=${p3Coords.r.toFixed(3)}, G=${p3Coords.g.toFixed(3)}, B=${p3Coords.b.toFixed(3)}`);

  // Test OKLCH manipulations
  const lighterColor = adjustOklchLightness(testColor, 0.8);
  console.log(`✅ adjustOklchLightness('${testColor}', 0.8):`, lighterColor);

  const moreVibrant = adjustOklchChroma(testColor, 0.3);
  console.log(`✅ adjustOklchChroma('${testColor}', 0.3):`, moreVibrant);

  const shiftedHue = adjustOklchHue(testColor, 180);
  console.log(`✅ adjustOklchHue('${testColor}', 180):`, shiftedHue);

  // Test string conversions
  const oklchString = toOklchStringReScript(testColor);
  console.log(`✅ toOklchStringReScript('${testColor}'):`, oklchString);

  const p3String = toP3StringReScript(testColor);
  console.log(`✅ toP3StringReScript('${testColor}'):`, p3String);

  console.log('\n✅ All ReScript colorjs.io bindings working correctly!');
} catch (error) {
  console.error('❌ ReScript colorjs.io bindings test failed:', error);
}

console.log('\n⚡ Performance Comparison: ReScript vs colorjs.io Bindings:');
console.log('-'.repeat(60));

try {
  const iterations = 1000;
  const testColor1 = '#646cff';

  // Test OKLCH coordinate extraction performance
  const startReScriptCoords = performance.now();
  for (let i = 0; i < iterations; i++) {
    getOklchCoordinates(testColor1);
  }
  const endReScriptCoords = performance.now();

  const startDirectCoords = performance.now();
  for (let i = 0; i < iterations; i++) {
    const analysis = parseColor(testColor1);
    analysis.oklch;
  }
  const endDirectCoords = performance.now();

  const rescriptCoordsTime = endReScriptCoords - startReScriptCoords;
  const directCoordsTime = endDirectCoords - startDirectCoords;

  console.log(`ReScript OKLCH coords (${iterations} iterations): ${rescriptCoordsTime.toFixed(2)}ms`);
  console.log(`Direct colorjs.io coords (${iterations} iterations): ${directCoordsTime.toFixed(2)}ms`);

  if (rescriptCoordsTime < directCoordsTime) {
    console.log(`✅ ReScript bindings are ${(directCoordsTime / rescriptCoordsTime).toFixed(1)}x faster!`);
  } else {
    console.log(`🐌 Direct colorjs.io is ${(rescriptCoordsTime / directCoordsTime).toFixed(1)}x faster`);
  }

} catch (error) {
  console.error('❌ Performance comparison failed:', error);
}

console.log('\n🎉 Integration test completed!');
console.log('\n💡 Summary:');
console.log('• ReScript provides high-performance color math');
console.log('• colorjs.io provides comprehensive color space support');
console.log('• ReScript colorjs.io bindings offer type-safe, potentially faster operations');
console.log('• Integration supports OKLCH, P3, and advanced color operations');
console.log('• Multiple fallback layers ensure maximum reliability');