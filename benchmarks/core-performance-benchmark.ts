/**
 * Core Performance Benchmark Suite
 * Consolidates color mathematics and palette generation performance tests
 * Compares TypeScript vs ReScript implementations using centralized configuration
 */

import { performance } from 'perf_hooks';
import chroma from 'chroma-js';
import * as ColorMath from '../src/core/ColorMath.gen.js';
import { hexToRgb } from '../src/utils/bridge.js';
import { generateIntelligentPalette, generateColorPalette, generateHarmoniousPalette } from '../src/utils/color.js';
import {
  generateColorPaletteReScript,
  generateHarmoniousPaletteReScript,
  generateIntelligentPaletteReScript
} from '../src/utils/bridge.js';
import { ConfigManager, EnvironmentDetector, TEST_COLORS, type BenchmarkConfig } from './benchmark-config.js';

interface BenchmarkResult {
  function: string;
  implementation: 'TypeScript' | 'ReScript';
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  operationsPerSecond: number;
}

interface ComparisonResult {
  function: string;
  typescript: BenchmarkResult;
  rescript: BenchmarkResult;
  speedup: number;
  winner: 'TypeScript' | 'ReScript';
}

interface TestCase {
  name: string;
  category: 'color-math' | 'palette-generation';
  iterations: number;
  setup: () => any;
  typescript: (data: any, iteration: number) => any;
  rescript: (data: any, iteration: number) => any;
}

class CorePerformanceBenchmark {
  private config: BenchmarkConfig;
  private results: ComparisonResult[] = [];
  private environment = EnvironmentDetector.getEnvironmentInfo();

  constructor() {
    this.config = ConfigManager.loadConfig();
    console.log(`📋 Using ${process.env.BENCHMARK_CONFIG || 'default'} configuration`);
  }

  // Test cases definition combining both color math and palette generation
  private getTestCases(): TestCase[] {
    return [
    // Color Mathematics Tests
    {
      name: 'deltaE76',
      category: 'color-math',
      iterations: this.config.iterations.medium,
      setup: () => ({
        colorPairs: this.getRandomColorPairs(this.config.iterations.medium)
      }),
      typescript: (data, i) => {
        const [c1, c2] = data.colorPairs[i % data.colorPairs.length];
        return chroma.deltaE(c1, c2);
      },
      rescript: (data, i) => {
        const [c1, c2] = data.colorPairs[i % data.colorPairs.length];
        return ColorMath.deltaE(hexToRgb(c1), hexToRgb(c2));
      }
    },
    {
      name: 'contrastRatio',
      category: 'color-math',
      iterations: this.config.iterations.medium,
      setup: () => ({
        colorPairs: this.getRandomColorPairs(this.config.iterations.medium)
      }),
      typescript: (data, i) => {
        const [c1, c2] = data.colorPairs[i % data.colorPairs.length];
        return chroma.contrast(c1, c2);
      },
      rescript: (data, i) => {
        const [c1, c2] = data.colorPairs[i % data.colorPairs.length];
        return ColorMath.contrastRatio(hexToRgb(c1), hexToRgb(c2));
      }
    },
    {
      name: 'colorBlindnessSimulation',
      category: 'color-math',
      iterations: this.config.iterations.small,
      setup: () => ({
        colors: this.getRandomColors(this.config.iterations.small),
        types: ['Protanopia', 'Deuteranopia', 'Tritanopia'] as const
      }),
      typescript: (data, i) => {
        const color = data.colors[i % data.colors.length];
        const type = data.types[i % data.types.length];
        const baseColor = chroma(color);
        switch (type) {
          case 'Protanopia':
            return baseColor.set('hsl.h', baseColor.get('hsl.h') * 0.8);
          case 'Deuteranopia':
            return baseColor.set('hsl.s', baseColor.get('hsl.s') * 0.6);
          case 'Tritanopia':
            return baseColor.set('hsl.h', (baseColor.get('hsl.h') + 180) % 360);
        }
      },
      rescript: (data, i) => {
        const color = data.colors[i % data.colors.length];
        const type = data.types[i % data.types.length];
        return ColorMath.simulateColorBlindness(hexToRgb(color), type);
      }
    },
    {
      name: 'accessibilityScore',
      category: 'color-math',
      iterations: this.config.iterations.small,
      setup: () => ({
        colorSets: this.getRandomColorSets(this.config.testData.setCount, this.config.testData.colorsPerSet)
      }),
      typescript: (data, i) => {
        const colors = data.colorSets[i % data.colorSets.length];
        let totalScore = 0;
        let pairCount = 0;

        for (let j = 0; j < colors.length; j++) {
          for (let k = j + 1; k < colors.length; k++) {
            const contrast = chroma.contrast(colors[j], colors[k]);
            const deltaE = chroma.deltaE(colors[j], colors[k]);

            let pairScore = 20;
            if (contrast >= 7 && deltaE >= 15) {
              pairScore = 100;
            } else if (contrast >= 4.5 && deltaE >= 10) {
              pairScore = 80;
            } else if (contrast >= 3 && deltaE >= 5) {
              pairScore = 60;
            }

            totalScore += pairScore;
            pairCount++;
          }
        }
        return totalScore / pairCount;
      },
      rescript: (data, i) => {
        const colors = data.colorSets[i % data.colorSets.length];
        const rgbColors = colors.map(hexToRgb);
        return ColorMath.calculateAccessibilityScore(rgbColors);
      }
    },

    // Palette Generation Tests
    {
      name: 'generateColorPalette',
      category: 'palette-generation',
      iterations: this.config.iterations.medium,
      setup: () => ({
        colors: this.getRandomColors(this.config.iterations.medium)
      }),
      typescript: (data, i) => {
        const color = data.colors[i % data.colors.length];
        return generateColorPalette(color, { steps: 10, accessibility: true });
      },
      rescript: (data, i) => {
        const color = data.colors[i % data.colors.length];
        return generateColorPaletteReScript(color, 10);
      }
    },
    {
      name: 'generateHarmoniousPalette',
      category: 'palette-generation',
      iterations: this.config.iterations.medium,
      setup: () => ({
        colors: this.getRandomColors(this.config.iterations.medium),
        harmonies: ['analogous', 'complementary', 'triadic', 'monochromatic'] as const
      }),
      typescript: (data, i) => {
        const color = data.colors[i % data.colors.length];
        const harmony = data.harmonies[i % data.harmonies.length];
        return generateHarmoniousPalette(color, harmony);
      },
      rescript: (data, i) => {
        const color = data.colors[i % data.colors.length];
        const harmony = data.harmonies[i % data.harmonies.length];
        return generateHarmoniousPaletteReScript(color, harmony);
      }
    },
    {
      name: 'generateIntelligentPalette',
      category: 'palette-generation',
      iterations: this.config.iterations.small, // Complex operation
      setup: () => ({
        colors: this.getRandomColors(this.config.iterations.small),
        styles: ['professional', 'vibrant', 'minimal', 'warm', 'cool'] as const
      }),
      typescript: (data, i) => {
        const color = data.colors[i % data.colors.length];
        const style = data.styles[i % data.styles.length];
        return generateIntelligentPalette(color, {
          style: style,
          accessibility: true,
          size: 10
        });
      },
      rescript: (data, i) => {
        const color = data.colors[i % data.colors.length];
        const style = data.styles[i % data.styles.length];
        return generateIntelligentPaletteReScript(color, {
          style: style.charAt(0).toUpperCase() + style.slice(1), // Convert to title case
          accessibility: true,
          size: 10
        });
      }
    }
    ];
  }

  async runBenchmarks(): Promise<void> {
    console.log('🚀 Core Performance Benchmark Suite');
    console.log('TypeScript vs ReScript - Color Math + Palette Generation');
    console.log('='.repeat(70));

    // Environment check
    const envCheck = EnvironmentDetector.isOptimalEnvironment();
    if (!envCheck.optimal) {
      console.log('\n⚠️  Environment Warnings:');
      envCheck.warnings.forEach(warning => console.log(`  - ${warning}`));
      console.log('');
    }

    console.log(`📊 Configuration: ${this.config.testData.colorCount} test colors, ${this.config.performance.testRuns} test runs`);
    console.log(`🌍 Environment: ${this.environment.platform} ${this.environment.arch}, Node ${this.environment.node}\n`);

    for (const testCase of this.getTestCases()) {
      console.log(`\n🔬 Testing: ${testCase.name} (${testCase.category})`);
      console.log('-'.repeat(60));

      const data = testCase.setup();

      // Warmup phase
      console.log(`⚡ Warming up (${this.config.performance.warmupRuns} runs)...`);
      for (let i = 0; i < this.config.performance.warmupRuns; i++) {
        testCase.typescript(data, i);
        testCase.rescript(data, i);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        await new Promise(resolve => setTimeout(resolve, this.config.memory.stabilizationDelay));
      }

      // Benchmark both implementations
      const tsResult = await this.benchmarkFunction(
        testCase.name,
        'TypeScript',
        testCase.iterations,
        (i) => testCase.typescript(data, i)
      );

      const rsResult = await this.benchmarkFunction(
        testCase.name,
        'ReScript',
        testCase.iterations,
        (i) => testCase.rescript(data, i)
      );

      const speedup = tsResult.averageTime / rsResult.averageTime;
      const winner = speedup > 1 ? 'ReScript' : 'TypeScript';

      const comparison: ComparisonResult = {
        function: testCase.name,
        typescript: tsResult,
        rescript: rsResult,
        speedup,
        winner
      };

      this.results.push(comparison);
      this.displayComparison(comparison);
    }

    await this.generateReport();
  }

  private async benchmarkFunction(
    name: string,
    implementation: 'TypeScript' | 'ReScript',
    iterations: number,
    fn: (iteration: number) => void
  ): Promise<BenchmarkResult> {
    const times: number[] = [];

    console.log(`${implementation}: Running ${iterations} iterations...`);

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      fn(i);
      const endTime = performance.now();
      times.push(endTime - startTime);

      // Periodic cleanup to prevent memory buildup
      if (i % 100 === 0 && global.gc) {
        global.gc();
      }
    }

    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const averageTime = totalTime / iterations;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const operationsPerSecond = 1000 / averageTime;

    console.log(`  Average: ${averageTime.toFixed(this.config.reporting.precision)}ms`);
    console.log(`  Range: ${minTime.toFixed(this.config.reporting.precision)}ms - ${maxTime.toFixed(this.config.reporting.precision)}ms`);
    console.log(`  Throughput: ${operationsPerSecond.toFixed(0)} ops/sec`);

    return {
      function: name,
      implementation,
      iterations,
      totalTime,
      averageTime,
      minTime,
      maxTime,
      operationsPerSecond
    };
  }

  private displayComparison(comparison: ComparisonResult): void {
    const percentage = Math.abs(((comparison.speedup - 1) * 100)).toFixed(1);
    const emoji = comparison.winner === 'ReScript' ? '🚀' : '🐢';

    console.log(`\n📊 Results:`);
    console.log(`  TypeScript: ${comparison.typescript.averageTime.toFixed(3)}ms avg (${comparison.typescript.operationsPerSecond.toFixed(0)} ops/sec)`);
    console.log(`  ReScript:   ${comparison.rescript.averageTime.toFixed(3)}ms avg (${comparison.rescript.operationsPerSecond.toFixed(0)} ops/sec)`);
    console.log(`  ${emoji} Winner: ${comparison.winner} (${comparison.speedup.toFixed(2)}x speedup, ${percentage}% ${comparison.speedup > 1 ? 'faster' : 'slower'})`);
  }

  private async generateReport(): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    // lowercase for technical performance data
    const reportPath = `benchmarks/results/core-performance-${timestamp}.json`;

    const colorMathResults = this.results.filter(r =>
      ['deltaE76', 'contrastRatio', 'colorBlindnessSimulation', 'accessibilityScore'].includes(r.function)
    );

    const paletteResults = this.results.filter(r =>
      ['generateColorPalette', 'generateHarmoniousPalette', 'generateIntelligentPalette'].includes(r.function)
    );

    const summary = this.generateSummary();

    const report = {
      timestamp: new Date().toISOString(),
      purpose: 'Core performance comparison: TypeScript vs ReScript implementations',
      configuration: this.config,
      environment: this.environment,
      results: {
        colorMath: colorMathResults,
        paletteGeneration: paletteResults,
        all: this.results
      },
      summary: {
        ...summary,
        categories: {
          colorMath: this.getCategorySummary(colorMathResults),
          paletteGeneration: this.getCategorySummary(paletteResults)
        }
      },
      analysis: this.generateAnalysis(summary)
    };

    // Save JSON report
    await import('fs/promises').then(fs =>
      fs.writeFile(reportPath, JSON.stringify(report, null, 2))
    );

    // Generate markdown report if configured
    if (this.config.reporting.generateMarkdown) {
      const markdownPath = `benchmarks/results/core-performance-${timestamp}.md`;
      const markdown = this.generateMarkdownReport(report);
      await import('fs/promises').then(fs =>
        fs.writeFile(markdownPath, markdown)
      );
      console.log(`📖 Markdown report: ${markdownPath}`);
    }

    this.displaySummary(summary);
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }

  private generateSummary() {
    let rescriptWins = 0;
    let totalSpeedup = 0;
    const testCount = this.results.length;

    this.results.forEach(result => {
      if (result.winner === 'ReScript') rescriptWins++;
      totalSpeedup += result.speedup;
    });

    return {
      rescriptWins,
      typescriptWins: testCount - rescriptWins,
      totalTests: testCount,
      averageSpeedup: totalSpeedup / testCount,
      maxSpeedup: Math.max(...this.results.map(r => r.speedup)),
      minSpeedup: Math.min(...this.results.map(r => r.speedup))
    };
  }

  private getCategorySummary(results: ComparisonResult[]) {
    const rescriptWins = results.filter(r => r.winner === 'ReScript').length;
    const avgSpeedup = results.reduce((sum, r) => sum + r.speedup, 0) / results.length;

    return {
      rescriptWins,
      totalTests: results.length,
      averageSpeedup: avgSpeedup
    };
  }

  private generateAnalysis(summary: any) {
    const analysis = {
      performanceVerdict: summary.averageSpeedup >= 3.0 ? 'EXCELLENT' :
                         summary.averageSpeedup >= 2.0 ? 'GOOD' :
                         summary.averageSpeedup >= 1.5 ? 'MODERATE' : 'POOR',

      recommendations: [] as string[],

      keyFindings: [] as string[]
    };

    // Generate recommendations based on results
    if (summary.averageSpeedup < 2.0) {
      analysis.recommendations.push('Profile ReScript compilation output for optimization opportunities');
      analysis.recommendations.push('Review functional programming patterns in ReScript implementation');
    } else if (summary.averageSpeedup >= 3.0) {
      analysis.recommendations.push('Excellent performance gains achieved - expand ReScript usage');
      analysis.recommendations.push('Consider migrating additional performance-critical functions');
    }

    // Key findings
    analysis.keyFindings.push(`ReScript wins ${summary.rescriptWins}/${summary.totalTests} performance tests`);
    analysis.keyFindings.push(`Average ${summary.averageSpeedup.toFixed(2)}x speedup with ReScript`);
    analysis.keyFindings.push(`Best case: ${summary.maxSpeedup.toFixed(2)}x speedup`);

    return analysis;
  }

  private generateMarkdownReport(report: any): string {
    return `# Core Performance Benchmark Report

Generated: ${new Date().toISOString()}

## Summary

- **ReScript Wins**: ${report.summary.rescriptWins}/${report.summary.totalTests} tests
- **Average Speedup**: ${report.summary.averageSpeedup.toFixed(2)}x
- **Performance Verdict**: ${report.analysis.performanceVerdict}

## Results by Category

### Color Mathematics
- ReScript wins: ${report.summary.categories.colorMath.rescriptWins}/${report.summary.categories.colorMath.totalTests}
- Average speedup: ${report.summary.categories.colorMath.averageSpeedup.toFixed(2)}x

### Palette Generation
- ReScript wins: ${report.summary.categories.paletteGeneration.rescriptWins}/${report.summary.categories.paletteGeneration.totalTests}
- Average speedup: ${report.summary.categories.paletteGeneration.averageSpeedup.toFixed(2)}x

## Detailed Results

| Function | TypeScript (ms) | ReScript (ms) | Speedup | Winner |
|----------|-----------------|---------------|---------|--------|
${report.results.all.map((r: ComparisonResult) =>
  `| ${r.function} | ${r.typescript.averageTime.toFixed(3)} | ${r.rescript.averageTime.toFixed(3)} | ${r.speedup.toFixed(2)}x | ${r.winner} |`
).join('\n')}

## Environment

- **Platform**: ${report.environment.platform} ${report.environment.arch}
- **Node.js**: ${report.environment.node}
- **CPUs**: ${report.environment.cpuCount}x ${report.environment.cpus}
- **Memory**: ${report.environment.totalMemory}

## Analysis

### Key Findings
${report.analysis.keyFindings.map((finding: string) => `- ${finding}`).join('\n')}

### Recommendations
${report.analysis.recommendations.map((rec: string) => `- ${rec}`).join('\n')}
`;
  }

  private displaySummary(summary: any): void {
    console.log('\n🎯 Benchmark Summary');
    console.log('='.repeat(60));
    console.log(`ReScript wins: ${summary.rescriptWins}/${summary.totalTests} tests`);
    console.log(`Average speedup: ${summary.averageSpeedup.toFixed(2)}x`);
    console.log(`Best case: ${summary.maxSpeedup.toFixed(2)}x speedup`);

    if (summary.averageSpeedup >= 3.0) {
      console.log('✅ EXCELLENT: ReScript optimization targets exceeded');
    } else if (summary.averageSpeedup >= 2.0) {
      console.log('✅ GOOD: Significant performance improvements achieved');
    } else if (summary.averageSpeedup >= 1.5) {
      console.log('⚠️  MODERATE: Some performance gain but below targets');
    } else {
      console.log('❌ POOR: ReScript not showing expected performance benefits');
    }
  }

  // Helper methods for test data generation
  private getRandomColors(count: number): string[] {
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      colors.push(TEST_COLORS.extended[Math.floor(Math.random() * TEST_COLORS.extended.length)]);
    }
    return colors;
  }

  private getRandomColorPairs(count: number): [string, string][] {
    const pairs: [string, string][] = [];
    for (let i = 0; i < count; i++) {
      const c1 = TEST_COLORS.extended[Math.floor(Math.random() * TEST_COLORS.extended.length)];
      const c2 = TEST_COLORS.extended[Math.floor(Math.random() * TEST_COLORS.extended.length)];
      pairs.push([c1, c2]);
    }
    return pairs;
  }

  private getRandomColorSets(setCount: number, colorsPerSet: number): string[][] {
    const sets: string[][] = [];
    for (let i = 0; i < setCount; i++) {
      sets.push(this.getRandomColors(colorsPerSet));
    }
    return sets;
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const benchmark = new CorePerformanceBenchmark();
  benchmark.runBenchmarks().catch(console.error);
}

export { CorePerformanceBenchmark };