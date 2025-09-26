#!/usr/bin/env node --expose-gc

/**
 * Implementation Performance Benchmark
 * Tests the actual performance of our optimized design token toolkit
 * vs the old implementation to validate our performance gains
 */

import { performance } from 'perf_hooks';
import { parse, toHSLA } from 'color-bits';
import { interpolate, wcagContrast, converter, formatHex } from 'culori';

// Import our ReScript functions
import {
  analyzeAccessibilityComprehensiveReScript,
  generateIntelligentPaletteReScript
} from '../src/utils/bridge.js';

// Import TypeScript equivalents for comparison
import { AccessibilityIntelligence } from '../src/utils/accessibility-intelligence.js';
import { MultiProviderAIService } from '../src/utils/ai-providers.js';

interface BenchmarkResult {
  operation: string;
  implementation: string;
  timeMs: number;
  memoryMB: number;
  iterations: number;
  opsPerSecond: number;
  notes?: string;
}

const ITERATIONS = {
  LIGHT: 100,
  MEDIUM: 1000,
  HEAVY: 10000
};

const TEST_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
  '#f43f5e', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444'
];

class ImplementationBenchmark {
  private results: BenchmarkResult[] = [];

  private measureMemory(): number {
    if (global.gc) {
      global.gc();
    }
    return process.memoryUsage().heapUsed / 1024 / 1024;
  }

  private async benchmark(
    operation: string,
    implementation: string,
    iterations: number,
    fn: () => void | Promise<void>,
    notes?: string
  ): Promise<BenchmarkResult> {
    // Warmup
    for (let i = 0; i < Math.min(50, iterations / 10); i++) {
      await fn();
    }

    const startMemory = this.measureMemory();
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      await fn();
    }

    const endTime = performance.now();
    const endMemory = this.measureMemory();

    const timeMs = endTime - startTime;
    const memoryMB = Math.max(0, endMemory - startMemory);
    const opsPerSecond = iterations / (timeMs / 1000);

    const result: BenchmarkResult = {
      operation,
      implementation,
      timeMs,
      memoryMB,
      iterations,
      opsPerSecond,
      notes
    };

    this.results.push(result);
    return result;
  }

  // Test basic color operations
  async benchmarkColorOperations() {
    console.log('\n🎨 Basic Color Operations Benchmark\n');

    const testColor = '#3b82f6';
    const iterations = ITERATIONS.HEAVY;

    // Color-bits optimized operations
    await this.benchmark('color-parsing', 'color-bits', iterations, () => {
      parse(testColor);
    }, 'Integer-based color storage');

    await this.benchmark('color-conversion', 'color-bits', iterations, () => {
      const parsed = parse(testColor);
      toHSLA(parsed);
    }, 'Hex to HSLA conversion');

    // Culori operations
    await this.benchmark('color-parsing', 'culori', iterations, () => {
      converter('oklch')(testColor);
    }, 'OKLCH conversion');

    await this.benchmark('color-formatting', 'culori', iterations, () => {
      const oklch = converter('oklch')(testColor);
      formatHex(oklch);
    }, 'Color formatting to hex');

    // Batch color operations
    await this.benchmark('batch-operations', 'color-bits', iterations / 10, () => {
      TEST_COLORS.map(color => {
        const parsed = parse(color);
        return toHSLA(parsed);
      });
    }, 'Batch processing 15 colors');

    await this.benchmark('batch-operations', 'culori', iterations / 10, () => {
      TEST_COLORS.map(color => {
        return converter('oklch')(color);
      });
    }, 'Batch OKLCH conversion');
  }

  // Test ReScript vs TypeScript accessibility analysis
  async benchmarkAccessibilityAnalysis() {
    console.log('\n♿ Accessibility Analysis Benchmark\n');

    const colors = TEST_COLORS;
    const backgrounds = ['#ffffff', '#000000'];
    const iterations = ITERATIONS.MEDIUM;

    // ReScript accessibility analysis
    await this.benchmark('accessibility-analysis', 'rescript-optimized', iterations / 10, () => {
      analyzeAccessibilityComprehensiveReScript(colors, backgrounds);
    }, 'Optimized ReScript with new libraries');

    // TypeScript accessibility analysis
    const tsAnalyzer = new AccessibilityIntelligence();
    await this.benchmark('accessibility-analysis', 'typescript-original', iterations / 10, () => {
      const colorMap = colors.reduce((acc, color, i) => {
        acc[`color-${i}`] = color;
        return acc;
      }, {} as Record<string, string>);

      tsAnalyzer.analyzeComprehensiveAccessibility(colorMap, { usage: 'web' });
    }, 'Original TypeScript implementation');

    // WCAG contrast calculations with new library
    await this.benchmark('contrast-calculation', 'culori-wcag', iterations, () => {
      wcagContrast(colors[0], backgrounds[0]);
    }, 'Culori WCAG contrast');
  }

  // Test palette generation performance
  async benchmarkPaletteGeneration() {
    console.log('\n🎨 Palette Generation Benchmark\n');

    const baseColor = '#3b82f6';
    const iterations = ITERATIONS.LIGHT;

    // ReScript optimized palette generation
    await this.benchmark('palette-generation', 'rescript-optimized', iterations, async () => {
      generateIntelligentPaletteReScript(baseColor, {
        style: 'Professional',
        accessibility: true,
        size: 10
      });
    }, 'ReScript with optimized libraries');

    // TypeScript palette generation for comparison
    const aiService = new MultiProviderAIService();
    await this.benchmark('palette-generation', 'typescript-fallback', iterations / 2, async () => {
      try {
        await aiService.generatePalette({
          baseColor,
          style: 'professional',
          size: 10,
          context: {
            industry: 'tech',
            audience: 'professionals'
          }
        });
      } catch {
        // Expected to fallback to rule-based
      }
    }, 'TypeScript with fallback to rule-based');

    // Pure culori palette generation
    await this.benchmark('palette-generation', 'culori-interpolation', iterations, () => {
      const interp = interpolate(['white', baseColor, 'black'], 'oklch');
      Array.from({ length: 10 }, (_, i) => interp(i / 9));
    }, 'Culori color interpolation');
  }

  // Test memory efficiency
  async benchmarkMemoryEfficiency() {
    console.log('\n💾 Memory Efficiency Benchmark\n');

    const iterations = ITERATIONS.HEAVY;

    // Memory test: color-bits vs object storage
    await this.benchmark('memory-storage', 'color-bits-integers', iterations, () => {
      TEST_COLORS.map(color => parse(color));
    }, 'Integer-based color storage');

    await this.benchmark('memory-storage', 'object-based', iterations, () => {
      TEST_COLORS.map(color => {
        return { hex: color, parsed: true, timestamp: Date.now() };
      });
    }, 'Object-based color storage');

    // Large batch operations
    const largeColorSet = Array.from({ length: 100 }, () =>
      `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
    );

    await this.benchmark('large-batch', 'color-bits', iterations / 100, () => {
      largeColorSet.map(color => {
        const parsed = parse(color);
        return toHSLA(parsed);
      });
    }, '100 colors batch processing');

    await this.benchmark('large-batch', 'culori', iterations / 100, () => {
      largeColorSet.map(color => {
        return converter('oklch')(color);
      });
    }, '100 colors OKLCH conversion');
  }

  // Test end-to-end CLI operations
  async benchmarkEndToEnd() {
    console.log('\n🚀 End-to-End CLI Operations Benchmark\n');

    const iterations = 10; // CLI operations are expensive

    // Full palette generation with accessibility analysis
    await this.benchmark('cli-palette-generation', 'full-pipeline', iterations, async () => {
      // Simulate the full CLI pipeline
      const colors = TEST_COLORS;
      const backgrounds = ['#ffffff', '#000000'];

      // 1. Parse colors (color-bits)
      colors.map(color => parse(color));

      // 2. Convert to OKLCH (culori)
      colors.map(color => converter('oklch')(color));

      // 3. Accessibility analysis (ReScript)
      analyzeAccessibilityComprehensiveReScript(colors, backgrounds);

      // 4. Generate palette variations (culori)
      colors.map(color => {
        const interp = interpolate(['white', color, 'black'], 'oklch');
        return Array.from({ length: 5 }, (_, i) => interp(i / 4));
      });
    }, 'Complete palette generation pipeline');

    // Memory pressure test
    await this.benchmark('memory-pressure', 'large-operation', 5, () => {
      const largeSet = Array.from({ length: 1000 }, () =>
        `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
      );

      // Process large set with all operations
      const parsed = largeSet.map(color => parse(color));
      largeSet.map(color => converter('oklch')(color));
      parsed.map(color => toHSLA(color));
    }, '1000 colors comprehensive processing');
  }

  // Run all benchmarks
  async runAllBenchmarks() {
    console.log('🚀 Implementation Performance Benchmark');
    console.log('=====================================');
    console.log(`Node.js: ${process.version}`);
    console.log(`Platform: ${process.platform} ${process.arch}`);
    console.log(`Memory: ${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(1)}MB`);
    console.log(`Libraries: color-bits v1.1.1, culori v4.0.2`);

    await this.benchmarkColorOperations();
    await this.benchmarkAccessibilityAnalysis();
    await this.benchmarkPaletteGeneration();
    await this.benchmarkMemoryEfficiency();
    await this.benchmarkEndToEnd();

    this.printResults();
    this.printPerformanceAnalysis();
  }

  private printResults() {
    console.log('\n📊 Benchmark Results\n');
    console.log('| Operation | Implementation | Time (ms) | Ops/sec | Memory (MB) | Notes |');
    console.log('|-----------|----------------|-----------|---------|-------------|-------|');

    this.results
      .sort((a, b) => a.operation.localeCompare(b.operation) || b.opsPerSecond - a.opsPerSecond)
      .forEach(result => {
        const { operation, implementation, timeMs, opsPerSecond, memoryMB, notes } = result;
        console.log(`| ${operation.padEnd(13)} | ${implementation.padEnd(14)} | ${timeMs.toFixed(1).padStart(9)} | ${opsPerSecond.toFixed(0).padStart(7)} | ${memoryMB.toFixed(1).padStart(11)} | ${(notes || '').substring(0, 20)} |`);
      });
  }

  private printPerformanceAnalysis() {
    console.log('\n🔬 Performance Analysis\n');

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
        const memoryDiff = slowest.memoryMB - fastest.memoryMB;

        console.log(`**${operation}:**`);
        console.log(`  🏆 Fastest: ${fastest.implementation} (${fastest.opsPerSecond.toFixed(0)} ops/sec)`);
        console.log(`  🐌 Slowest: ${slowest.implementation} (${slowest.opsPerSecond.toFixed(0)} ops/sec)`);
        console.log(`  ⚡ Speedup: ${speedup.toFixed(1)}x faster`);
        if (memoryDiff > 0.1) {
          console.log(`  💾 Memory saved: ${memoryDiff.toFixed(1)}MB`);
        }
        console.log('');
      }
    });

    // Overall performance summary
    console.log('🏁 **Overall Performance Summary:**\n');

    const rescriptResults = this.results.filter(r => r.implementation.includes('rescript'));
    const typescriptResults = this.results.filter(r => r.implementation.includes('typescript'));

    if (rescriptResults.length > 0 && typescriptResults.length > 0) {
      const rescriptAvg = rescriptResults.reduce((sum, r) => sum + r.opsPerSecond, 0) / rescriptResults.length;
      const typescriptAvg = typescriptResults.reduce((sum, r) => sum + r.opsPerSecond, 0) / typescriptResults.length;
      const rescriptSpeedup = rescriptAvg / typescriptAvg;

      console.log(`• **ReScript vs TypeScript**: ${rescriptSpeedup.toFixed(1)}x faster on average`);
    }

    const colorBitsResults = this.results.filter(r => r.implementation.includes('color-bits'));
    const culoriResults = this.results.filter(r => r.implementation.includes('culori'));

    if (colorBitsResults.length > 0 && culoriResults.length > 0) {
      const colorBitsAvg = colorBitsResults.reduce((sum, r) => sum + r.opsPerSecond, 0) / colorBitsResults.length;
      const culoriAvg = culoriResults.reduce((sum, r) => sum + r.opsPerSecond, 0) / culoriResults.length;

      console.log(`• **Color-bits performance**: ${colorBitsAvg.toFixed(0)} ops/sec average`);
      console.log(`• **Culori performance**: ${culoriAvg.toFixed(0)} ops/sec average`);
    }

    // Memory efficiency analysis
    const memoryResults = this.results.filter(r => r.operation.includes('memory') || r.operation.includes('batch'));
    if (memoryResults.length > 0) {
      const avgMemory = memoryResults.reduce((sum, r) => sum + r.memoryMB, 0) / memoryResults.length;
      console.log(`• **Average memory usage**: ${avgMemory.toFixed(1)}MB`);
    }

    console.log('\n🎯 **Optimization Opportunities:**');

    // Find slowest operations
    const slowestOps = this.results
      .sort((a, b) => a.opsPerSecond - b.opsPerSecond)
      .slice(0, 3);

    slowestOps.forEach(op => {
      console.log(`• **${op.operation}** (${op.implementation}): ${op.opsPerSecond.toFixed(0)} ops/sec - potential optimization target`);
    });
  }
}

// Run benchmark if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const benchmark = new ImplementationBenchmark();
  benchmark.runAllBenchmarks().catch(console.error);
}

export { ImplementationBenchmark };