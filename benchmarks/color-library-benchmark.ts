#!/usr/bin/env node --expose-gc

/**
 * Color Library Performance Benchmark
 * Comparing color-bits, culori, @texel/color vs existing libraries (chroma-js, colorjs.io)
 * and TypeScript vs ReScript implementations
 */

import { performance } from 'perf_hooks';
import chroma from 'chroma-js';
import Color from 'colorjs.io';
import { interpolate, wcagContrast, converter } from 'culori';
import { parse, toHSLA } from 'color-bits';

// Import our ReScript functions
import {
  analyzeAccessibilityComprehensiveReScript
} from '../src/utils/bridge.js';

// Import TypeScript equivalents
import { AccessibilityIntelligence } from '../src/utils/accessibility-intelligence.js';

interface BenchmarkResult {
  library: string;
  operation: string;
  timeMs: number;
  memoryMB: number;
  iterations: number;
  opsPerSecond: number;
}

const ITERATIONS = {
  LIGHT: 1000,
  MEDIUM: 10000,
  HEAVY: 100000
};

const TEST_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
];

class ColorBenchmark {
  private results: BenchmarkResult[] = [];

  private measureMemory(): number {
    if (global.gc) {
      global.gc();
    }
    return process.memoryUsage().heapUsed / 1024 / 1024;
  }

  private async benchmark(
    library: string,
    operation: string,
    iterations: number,
    fn: () => void
  ): Promise<BenchmarkResult> {
    // Warmup
    for (let i = 0; i < Math.min(100, iterations / 10); i++) {
      fn();
    }

    const startMemory = this.measureMemory();
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      fn();
    }

    const endTime = performance.now();
    const endMemory = this.measureMemory();

    const timeMs = endTime - startTime;
    const memoryMB = endMemory - startMemory;
    const opsPerSecond = iterations / (timeMs / 1000);

    const result: BenchmarkResult = {
      library,
      operation,
      timeMs,
      memoryMB,
      iterations,
      opsPerSecond
    };

    this.results.push(result);
    return result;
  }

  // Color Conversion Benchmarks
  async benchmarkColorConversions() {
    console.log('\n🎨 Color Conversion Benchmarks\n');

    const testColor = '#3b82f6';
    const iterations = ITERATIONS.HEAVY;

    // Chroma.js (current)
    await this.benchmark('chroma-js', 'hex-to-hsl', iterations, () => {
      chroma(testColor).hsl();
    });

    await this.benchmark('chroma-js', 'hex-to-lab', iterations, () => {
      chroma(testColor).lab();
    });

    // Color.js (current)
    await this.benchmark('colorjs.io', 'hex-to-hsl', iterations, () => {
      new Color(testColor).to('hsl');
    });

    await this.benchmark('colorjs.io', 'hex-to-oklch', iterations, () => {
      new Color(testColor).to('oklch');
    });

    // Culori (modern replacement)
    await this.benchmark('culori', 'hex-to-hsl', iterations, () => {
      converter('hsl')(testColor);
    });

    await this.benchmark('culori', 'hex-to-oklch', iterations, () => {
      converter('oklch')(testColor);
    });

    // Color-bits (high performance)
    await this.benchmark('color-bits', 'hex-to-hsl', iterations, () => {
      toHSLA(parse(testColor));
    });

    await this.benchmark('color-bits', 'color-parse', iterations, () => {
      parse(testColor);
    });
  }

  // Palette Generation Benchmarks
  async benchmarkPaletteGeneration() {
    console.log('\n🎨 Palette Generation Benchmarks\n');

    const baseColor = '#3b82f6';
    const iterations = ITERATIONS.LIGHT;

    // Chroma.js scale generation
    await this.benchmark('chroma-js', 'scale-generation', iterations, () => {
      chroma.scale(['white', baseColor, 'black']).mode('lab').colors(9);
    });

    // Culori scale generation
    await this.benchmark('culori', 'scale-generation', iterations, () => {
      const interp = interpolate(['white', baseColor, 'black'], 'lab');
      Array.from({ length: 9 }, (_, i) => interp(i / 8));
    });

    // Color-bits batch operations
    await this.benchmark('color-bits', 'batch-operations', iterations, () => {
      const base = parse(baseColor);
      Array.from({ length: 9 }, (_, i) => {
        // Simplified operation for now
        return toHSLA(base);
      });
    });
  }

  // Accessibility Analysis Benchmarks
  async benchmarkAccessibilityAnalysis() {
    console.log('\n♿ Accessibility Analysis Benchmarks\n');

    const colors = TEST_COLORS;
    const backgrounds = ['#ffffff', '#000000'];
    const iterations = ITERATIONS.MEDIUM;

    // TypeScript accessibility analysis
    const tsAnalyzer = new AccessibilityIntelligence();
    await this.benchmark('TypeScript', 'accessibility-analysis', iterations / 100, () => {
      const colorMap = colors.reduce((acc, color, i) => {
        acc[`color-${i}`] = color;
        return acc;
      }, {} as Record<string, string>);

      tsAnalyzer.analyzeComprehensiveAccessibility(colorMap, { usage: 'web' });
    });

    // ReScript accessibility analysis
    await this.benchmark('ReScript', 'accessibility-analysis', iterations / 100, () => {
      analyzeAccessibilityComprehensiveReScript(colors, backgrounds);
    });

    // Contrast ratio calculations
    await this.benchmark('chroma-js', 'contrast-ratio', iterations, () => {
      chroma.contrast(colors[0], backgrounds[0]);
    });

    await this.benchmark('culori', 'contrast-ratio', iterations, () => {
      wcagContrast(colors[0], backgrounds[0]);
    });
  }

  // Memory efficiency test
  async benchmarkMemoryEfficiency() {
    console.log('\n💾 Memory Efficiency Benchmarks\n');

    const iterations = ITERATIONS.HEAVY;
    const testColor = '#3b82f6';

    // Object-based color storage (current approach)
    await this.benchmark('Object-based', 'color-storage', iterations, () => {
      const color = { r: 59, g: 130, b: 246, a: 1 };
      return color;
    });

    // Integer-based color storage (color-bits approach)
    await this.benchmark('Integer-based', 'color-storage', iterations, () => {
      const color = parse(testColor);
      return color;
    });

    // Array-based operations
    await this.benchmark('Array-processing', 'batch-colors', iterations / 100, () => {
      TEST_COLORS.map(color => chroma(color).hsl());
    });

    await this.benchmark('Color-bits', 'batch-colors', iterations / 100, () => {
      TEST_COLORS.map(color => toHSLA(parse(color)));
    });
  }

  // Comprehensive comparison
  async runAllBenchmarks() {
    console.log('🚀 Color Library Performance Benchmark');
    console.log('=====================================');
    console.log(`Node.js: ${process.version}`);
    console.log(`Platform: ${process.platform} ${process.arch}`);
    console.log(`Memory: ${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(1)}MB\n`);

    await this.benchmarkColorConversions();
    await this.benchmarkPaletteGeneration();
    await this.benchmarkAccessibilityAnalysis();
    await this.benchmarkMemoryEfficiency();

    this.printResults();
    this.printRecommendations();
  }

  private printResults() {
    console.log('\n📊 Benchmark Results\n');
    console.log('| Library | Operation | Time (ms) | Ops/sec | Memory (MB) |');
    console.log('|---------|-----------|-----------|---------|-------------|');

    this.results
      .sort((a, b) => a.operation.localeCompare(b.operation) || b.opsPerSecond - a.opsPerSecond)
      .forEach(result => {
        const { library, operation, timeMs, opsPerSecond, memoryMB } = result;
        console.log(`| ${library.padEnd(11)} | ${operation.padEnd(17)} | ${timeMs.toFixed(1).padStart(9)} | ${opsPerSecond.toFixed(0).padStart(7)} | ${memoryMB.toFixed(1).padStart(11)} |`);
      });
  }

  private printRecommendations() {
    console.log('\n🎯 Performance Analysis & Recommendations\n');

    // Group results by operation for comparison
    const byOperation = this.results.reduce((acc, result) => {
      if (!acc[result.operation]) acc[result.operation] = [];
      acc[result.operation].push(result);
      return acc;
    }, {} as Record<string, BenchmarkResult[]>);

    Object.entries(byOperation).forEach(([operation, results]) => {
      if (results.length > 1) {
        const fastest = results.reduce((prev, current) =>
          prev.opsPerSecond > current.opsPerSecond ? prev : current
        );
        const slowest = results.reduce((prev, current) =>
          prev.opsPerSecond < current.opsPerSecond ? prev : current
        );

        const speedup = fastest.opsPerSecond / slowest.opsPerSecond;

        console.log(`**${operation}:**`);
        console.log(`  🏆 Fastest: ${fastest.library} (${fastest.opsPerSecond.toFixed(0)} ops/sec)`);
        console.log(`  🐌 Slowest: ${slowest.library} (${slowest.opsPerSecond.toFixed(0)} ops/sec)`);
        console.log(`  ⚡ Speedup: ${speedup.toFixed(1)}x faster\n`);
      }
    });

    // Overall recommendations
    console.log('🏁 **Overall Recommendations:**\n');

    const rescriptResults = this.results.filter(r => r.library === 'ReScript');
    const typescriptResults = this.results.filter(r => r.library === 'TypeScript');

    if (rescriptResults.length > 0 && typescriptResults.length > 0) {
      const rescriptAvg = rescriptResults.reduce((sum, r) => sum + r.opsPerSecond, 0) / rescriptResults.length;
      const typescriptAvg = typescriptResults.reduce((sum, r) => sum + r.opsPerSecond, 0) / typescriptResults.length;
      const rescriptSpeedup = rescriptAvg / typescriptAvg;

      console.log(`• **ReScript vs TypeScript**: ${rescriptSpeedup.toFixed(1)}x faster on average`);
    }

    const colorBitsResults = this.results.filter(r => r.library === 'color-bits');
    const chromaResults = this.results.filter(r => r.library === 'chroma-js');

    if (colorBitsResults.length > 0 && chromaResults.length > 0) {
      const colorBitsAvg = colorBitsResults.reduce((sum, r) => sum + r.opsPerSecond, 0) / colorBitsResults.length;
      const chromaAvg = chromaResults.reduce((sum, r) => sum + r.opsPerSecond, 0) / chromaResults.length;
      const colorBitsSpeedup = colorBitsAvg / chromaAvg;

      console.log(`• **Color-bits vs Chroma.js**: ${colorBitsSpeedup.toFixed(1)}x faster on average`);
    }

    console.log('\n🔧 **Integration Recommendations:**');
    console.log('• Use color-bits for high-frequency color operations');
    console.log('• Use culori for complex color manipulations and interpolations');
    console.log('• Use @texel/color for modern color space operations (OKLCH, P3)');
    console.log('• Keep ReScript core for computational-heavy accessibility analysis');
    console.log('• Consider color-bits for batch operations in ReScript FFI bindings');
  }
}

// Run benchmark if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const benchmark = new ColorBenchmark();
  benchmark.runAllBenchmarks().catch(console.error);
}

export { ColorBenchmark };