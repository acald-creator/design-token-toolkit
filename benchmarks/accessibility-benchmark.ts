/**
 * Consolidated Accessibility Performance Benchmark Suite
 * Combines all accessibility-related performance tests
 * Compares TypeScript vs ReScript implementations with comprehensive analysis
 */

import { performance } from 'perf_hooks';
import chroma from 'chroma-js';
import { AccessibilityIntelligence } from '../src/utils/accessibility-intelligence.js';
import {
  deltaE76ReScript,
  calculateRelativeLuminanceReScript,
  calculateContrastRatioReScript,
  simulateColorBlindnessReScript,
  analyzeWCAGComplianceReScript,
  analyzeColorBlindnessBatchReScript,
  analyzeAccessibilityComprehensiveReScript
} from '../src/utils/bridge.js';
import { ConfigManager, EnvironmentDetector, TEST_COLORS, type BenchmarkConfig } from './benchmark-config.js';

interface AccessibilityBenchmarkResult {
  function: string;
  implementation: 'TypeScript' | 'ReScript';
  averageTime: number;
  minTime: number;
  maxTime: number;
  iterations: number;
  operationsPerSecond: number;
  memoryDelta?: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
}

interface AccessibilityComparison {
  function: string;
  typescript: AccessibilityBenchmarkResult;
  rescript: AccessibilityBenchmarkResult;
  speedup: number;
  winner: 'TypeScript' | 'ReScript';
  category: 'core-math' | 'simulation' | 'batch-analysis' | 'comprehensive';
}

class AccessibilityBenchmark {
  private config: BenchmarkConfig;
  private accessibility = new AccessibilityIntelligence();
  private environment = EnvironmentDetector.getEnvironmentInfo();
  private results: AccessibilityComparison[] = [];

  // Test data sets using centralized configuration
  private testColors = {
    small: TEST_COLORS.accessibility.slice(0, 5),
    medium: TEST_COLORS.accessibility,
    large: [...TEST_COLORS.accessibility, ...TEST_COLORS.colorBlindness]
  };

  private blindnessTypes = ['Protanopia', 'Deuteranopia', 'Tritanopia', 'Monochromacy'] as const;
  private backgrounds = ['#ffffff', '#000000', '#f3f4f6', '#1f2937', '#fef3c7'];

  constructor() {
    this.config = ConfigManager.loadConfig();
    console.log(`📋 Using ${process.env.BENCHMARK_CONFIG || 'default'} accessibility configuration`);
  }

  async runBenchmarks(): Promise<void> {
    console.log('🚀 Accessibility Performance Benchmark Suite');
    console.log('TypeScript vs ReScript - Comprehensive Accessibility Analysis');
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

    // Core mathematical functions
    this.results.push(await this.compareDeltaE76());
    this.results.push(await this.compareLuminanceCalculation());
    this.results.push(await this.compareContrastRatio());

    // Color blindness simulation
    this.results.push(await this.compareColorBlindnessSimulation());

    // Batch analysis functions (main optimization targets)
    this.results.push(await this.compareWCAGCompliance());
    this.results.push(await this.compareColorBlindnessBatch());
    this.results.push(await this.compareComprehensiveAnalysis());

    this.displayResults();
    await this.generateReport();
  }

  private async compareDeltaE76(): Promise<AccessibilityComparison> {
    console.log('\n🔬 Benchmarking Delta-E CIE76 Calculation');
    console.log('-'.repeat(50));

    const iterations = this.config.iterations.large;
    const colors = this.testColors.medium;

    // TypeScript implementation (via chroma-js)
    const tsResult = await this.benchmarkFunction(
      'deltaE76',
      'TypeScript',
      iterations,
      (i) => {
        const color1 = colors[i % colors.length];
        const color2 = colors[(i + 1) % colors.length];
        return chroma.deltaE(color1, color2);
      }
    );

    // ReScript implementation
    const rsResult = await this.benchmarkFunction(
      'deltaE76',
      'ReScript',
      iterations,
      (i) => {
        const color1 = colors[i % colors.length];
        const color2 = colors[(i + 1) % colors.length];
        return deltaE76ReScript(color1, color2);
      }
    );

    const speedup = tsResult.averageTime / rsResult.averageTime;
    console.log(`🏆 Speedup: ${speedup.toFixed(2)}x ${speedup > 1 ? 'faster' : 'slower'} with ReScript`);

    return {
      function: 'deltaE76',
      typescript: tsResult,
      rescript: rsResult,
      speedup,
      winner: speedup > 1 ? 'ReScript' : 'TypeScript',
      category: 'core-math'
    };
  }

  private async compareLuminanceCalculation(): Promise<AccessibilityComparison> {
    console.log('\n💡 Benchmarking Relative Luminance Calculation');
    console.log('-'.repeat(50));

    const iterations = this.config.iterations.large;
    const colors = this.testColors.medium;

    // TypeScript implementation (via chroma-js)
    const tsResult = await this.benchmarkFunction(
      'relativeLuminance',
      'TypeScript',
      iterations,
      (i) => {
        const color = colors[i % colors.length];
        return chroma(color).luminance();
      }
    );

    // ReScript implementation
    const rsResult = await this.benchmarkFunction(
      'relativeLuminance',
      'ReScript',
      iterations,
      (i) => {
        const color = colors[i % colors.length];
        return calculateRelativeLuminanceReScript(color);
      }
    );

    const speedup = tsResult.averageTime / rsResult.averageTime;
    console.log(`🏆 Speedup: ${speedup.toFixed(2)}x ${speedup > 1 ? 'faster' : 'slower'} with ReScript`);

    return {
      function: 'relativeLuminance',
      typescript: tsResult,
      rescript: rsResult,
      speedup,
      winner: speedup > 1 ? 'ReScript' : 'TypeScript',
      category: 'core-math'
    };
  }

  private async compareContrastRatio(): Promise<AccessibilityComparison> {
    console.log('\n📊 Benchmarking WCAG Contrast Ratio Calculation');
    console.log('-'.repeat(50));

    const iterations = this.config.iterations.large;
    const colors = this.testColors.medium;

    // TypeScript implementation (via chroma-js)
    const tsResult = await this.benchmarkFunction(
      'contrastRatio',
      'TypeScript',
      iterations,
      (i) => {
        const color1 = colors[i % colors.length];
        const color2 = colors[(i + 1) % colors.length];
        return chroma.contrast(color1, color2);
      }
    );

    // ReScript implementation
    const rsResult = await this.benchmarkFunction(
      'contrastRatio',
      'ReScript',
      iterations,
      (i) => {
        const color1 = colors[i % colors.length];
        const color2 = colors[(i + 1) % colors.length];
        return calculateContrastRatioReScript(color1, color2);
      }
    );

    const speedup = tsResult.averageTime / rsResult.averageTime;
    console.log(`🏆 Speedup: ${speedup.toFixed(2)}x ${speedup > 1 ? 'faster' : 'slower'} with ReScript`);

    return {
      function: 'contrastRatio',
      typescript: tsResult,
      rescript: rsResult,
      speedup,
      winner: speedup > 1 ? 'ReScript' : 'TypeScript',
      category: 'core-math'
    };
  }

  private async compareColorBlindnessSimulation(): Promise<AccessibilityComparison> {
    console.log('\n👁️ Benchmarking Color Blindness Simulation');
    console.log('-'.repeat(50));

    const iterations = this.config.iterations.medium;
    const colors = this.testColors.medium;

    // TypeScript implementation
    const tsResult = await this.benchmarkFunction(
      'colorBlindnessSimulation',
      'TypeScript',
      iterations,
      (i) => {
        const color = colors[i % colors.length];
        const type = this.blindnessTypes[i % this.blindnessTypes.length];
        const accessibility = this.accessibility as any;
        return accessibility.simulateColorBlindness([color], type.toLowerCase());
      }
    );

    // ReScript implementation
    const rsResult = await this.benchmarkFunction(
      'colorBlindnessSimulation',
      'ReScript',
      iterations,
      (i) => {
        const color = colors[i % colors.length];
        const type = this.blindnessTypes[i % this.blindnessTypes.length];
        return simulateColorBlindnessReScript(color, type);
      }
    );

    const speedup = tsResult.averageTime / rsResult.averageTime;
    console.log(`🏆 Speedup: ${speedup.toFixed(2)}x ${speedup > 1 ? 'faster' : 'slower'} with ReScript`);

    return {
      function: 'colorBlindnessSimulation',
      typescript: tsResult,
      rescript: rsResult,
      speedup,
      winner: speedup > 1 ? 'ReScript' : 'TypeScript',
      category: 'simulation'
    };
  }

  private async compareWCAGCompliance(): Promise<AccessibilityComparison> {
    console.log('\n📋 Benchmarking WCAG Compliance Analysis');
    console.log('-'.repeat(50));

    const iterations = this.config.iterations.small;

    // TypeScript implementation
    const tsResult = await this.benchmarkFunction(
      'wcagCompliance',
      'TypeScript',
      iterations,
      (i) => {
        const colorSet = i % 3 === 0 ? this.testColors.small :
                       i % 3 === 1 ? this.testColors.medium : this.testColors.large;
        const accessibility = this.accessibility as any;
        const colorDict = Object.fromEntries(colorSet.map((color, idx) => [`color${idx}`, color]));
        return accessibility.analyzeWCAGCompliance(colorDict, { backgrounds: this.backgrounds });
      }
    );

    // ReScript implementation
    const rsResult = await this.benchmarkFunction(
      'wcagCompliance',
      'ReScript',
      iterations,
      (i) => {
        const colorSet = i % 3 === 0 ? this.testColors.small :
                       i % 3 === 1 ? this.testColors.medium : this.testColors.large;
        return analyzeWCAGComplianceReScript(colorSet, this.backgrounds);
      }
    );

    const speedup = tsResult.averageTime / rsResult.averageTime;
    console.log(`🏆 Speedup: ${speedup.toFixed(2)}x ${speedup > 1 ? 'faster' : 'slower'} with ReScript`);

    return {
      function: 'wcagCompliance',
      typescript: tsResult,
      rescript: rsResult,
      speedup,
      winner: speedup > 1 ? 'ReScript' : 'TypeScript',
      category: 'batch-analysis'
    };
  }

  private async compareColorBlindnessBatch(): Promise<AccessibilityComparison> {
    console.log('\n🧠 Benchmarking Color Blindness Batch Analysis');
    console.log('-'.repeat(50));

    const iterations = this.config.iterations.small;

    // TypeScript implementation
    const tsResult = await this.benchmarkFunction(
      'colorBlindnessBatch',
      'TypeScript',
      iterations,
      (i) => {
        const colorSet = i % 3 === 0 ? this.testColors.small :
                       i % 3 === 1 ? this.testColors.medium : this.testColors.large;
        const colorDict = Object.fromEntries(colorSet.map((color, idx) => [`color${idx}`, color]));
        const accessibility = this.accessibility as any;
        return accessibility.analyzeColorBlindness(colorDict);
      }
    );

    // ReScript implementation
    const rsResult = await this.benchmarkFunction(
      'colorBlindnessBatch',
      'ReScript',
      iterations,
      (i) => {
        const colorSet = i % 3 === 0 ? this.testColors.small :
                       i % 3 === 1 ? this.testColors.medium : this.testColors.large;
        return analyzeColorBlindnessBatchReScript(colorSet);
      }
    );

    const speedup = tsResult.averageTime / rsResult.averageTime;
    console.log(`🏆 Speedup: ${speedup.toFixed(2)}x ${speedup > 1 ? 'faster' : 'slower'} with ReScript`);

    return {
      function: 'colorBlindnessBatch',
      typescript: tsResult,
      rescript: rsResult,
      speedup,
      winner: speedup > 1 ? 'ReScript' : 'TypeScript',
      category: 'batch-analysis'
    };
  }

  private async compareComprehensiveAnalysis(): Promise<AccessibilityComparison> {
    console.log('\n🎯 Benchmarking Comprehensive Analysis (Primary Optimization Target)');
    console.log('-'.repeat(50));

    const iterations = Math.max(25, this.config.iterations.small / 4); // Lower due to complexity

    // TypeScript implementation
    const tsResult = await this.benchmarkFunction(
      'comprehensiveAnalysis',
      'TypeScript',
      iterations,
      (i) => {
        const colorSet = i % 3 === 0 ? this.testColors.small :
                       i % 3 === 1 ? this.testColors.medium : this.testColors.large;
        const colorDict = Object.fromEntries(colorSet.map((color, idx) => [`color${idx}`, color]));
        return this.accessibility.analyzeComprehensiveAccessibility(colorDict, {
          usage: 'web',
          textSizes: ['14px', '16px', '18px'],
          backgrounds: this.backgrounds
        });
      }
    );

    // ReScript implementation
    const rsResult = await this.benchmarkFunction(
      'comprehensiveAnalysis',
      'ReScript',
      iterations,
      (i) => {
        const colorSet = i % 3 === 0 ? this.testColors.small :
                       i % 3 === 1 ? this.testColors.medium : this.testColors.large;
        return analyzeAccessibilityComprehensiveReScript(colorSet, this.backgrounds);
      }
    );

    const speedup = tsResult.averageTime / rsResult.averageTime;
    console.log(`🏆 Speedup: ${speedup.toFixed(2)}x ${speedup > 1 ? 'faster' : 'slower'} with ReScript`);

    return {
      function: 'comprehensiveAnalysis',
      typescript: tsResult,
      rescript: rsResult,
      speedup,
      winner: speedup > 1 ? 'ReScript' : 'TypeScript',
      category: 'comprehensive'
    };
  }

  private async benchmarkFunction(
    functionName: string,
    implementation: 'TypeScript' | 'ReScript',
    iterations: number,
    testFunction: (iteration: number) => any
  ): Promise<AccessibilityBenchmarkResult> {
    const times: number[] = [];
    let memoryBefore: NodeJS.MemoryUsage | undefined;
    let memoryAfter: NodeJS.MemoryUsage | undefined;

    // Force garbage collection and stabilize
    if (global.gc) {
      global.gc();
      await new Promise(resolve => setTimeout(resolve, this.config.memory.stabilizationDelay));
      memoryBefore = process.memoryUsage();
    }

    console.log(`${implementation}: Running ${iterations} iterations...`);

    // Warmup
    for (let i = 0; i < this.config.performance.warmupRuns; i++) {
      testFunction(i);
    }

    // Actual benchmark
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      testFunction(i);
      const endTime = performance.now();
      times.push(endTime - startTime);

      // Periodic cleanup
      if (i % 50 === 0 && global.gc) {
        global.gc();
      }
    }

    // Final memory measurement
    if (global.gc && memoryBefore) {
      global.gc();
      await new Promise(resolve => setTimeout(resolve, this.config.memory.stabilizationDelay));
      memoryAfter = process.memoryUsage();
    }

    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const operationsPerSecond = 1000 / averageTime;

    console.log(`  Average: ${averageTime.toFixed(this.config.reporting.precision)}ms`);
    console.log(`  Range: ${minTime.toFixed(this.config.reporting.precision)}ms - ${maxTime.toFixed(this.config.reporting.precision)}ms`);
    console.log(`  Throughput: ${operationsPerSecond.toFixed(0)} ops/sec`);

    if (memoryBefore && memoryAfter) {
      const memoryDelta = {
        heapUsed: memoryAfter.heapUsed - memoryBefore.heapUsed,
        heapTotal: memoryAfter.heapTotal - memoryBefore.heapTotal,
        external: memoryAfter.external - memoryBefore.external
      };
      console.log(`  Memory Δ: ${EnvironmentDetector.formatBytes(memoryDelta.heapUsed)} heap`);
    }

    return {
      function: functionName,
      implementation,
      averageTime,
      minTime,
      maxTime,
      iterations,
      operationsPerSecond,
      memoryDelta: memoryBefore && memoryAfter ? {
        heapUsed: memoryAfter.heapUsed - memoryBefore.heapUsed,
        heapTotal: memoryAfter.heapTotal - memoryBefore.heapTotal,
        external: memoryAfter.external - memoryBefore.external
      } : undefined
    };
  }

  private displayResults(): void {
    console.log('\n📊 Accessibility Performance Analysis Summary');
    console.log('='.repeat(70));

    const categoryResults = this.getCategoryResults();

    Object.entries(categoryResults).forEach(([category, results]) => {
      console.log(`\n🔍 ${category.toUpperCase().replace('-', ' ')}:`);
      results.forEach(result => {
        console.log(`  ${result.function}:`);
        console.log(`    TypeScript: ${result.typescript.averageTime.toFixed(3)}ms`);
        console.log(`    ReScript:   ${result.rescript.averageTime.toFixed(3)}ms`);
        console.log(`    🏆 Winner:  ${result.winner} (${result.speedup.toFixed(2)}x)`);
      });
    });

    const summary = this.generateSummary();
    console.log('\n🎯 Overall Results:');
    console.log(`  ReScript wins: ${summary.rescriptWins}/${summary.totalTests} functions`);
    console.log(`  Average speedup: ${summary.averageSpeedup.toFixed(2)}x`);
    console.log(`  Best performance: ${summary.maxSpeedup.toFixed(2)}x speedup`);

    this.displayPerformanceAssessment(summary);
  }

  private getCategoryResults() {
    return {
      'core-math': this.results.filter(r => r.category === 'core-math'),
      'simulation': this.results.filter(r => r.category === 'simulation'),
      'batch-analysis': this.results.filter(r => r.category === 'batch-analysis'),
      'comprehensive': this.results.filter(r => r.category === 'comprehensive')
    };
  }

  private generateSummary() {
    const rescriptWins = this.results.filter(r => r.winner === 'ReScript').length;
    const totalSpeedup = this.results.reduce((sum, r) => sum + r.speedup, 0);
    const avgSpeedup = totalSpeedup / this.results.length;

    return {
      rescriptWins,
      typescriptWins: this.results.length - rescriptWins,
      totalTests: this.results.length,
      averageSpeedup: avgSpeedup,
      maxSpeedup: Math.max(...this.results.map(r => r.speedup)),
      minSpeedup: Math.min(...this.results.map(r => r.speedup))
    };
  }

  private displayPerformanceAssessment(summary: any): void {
    console.log('\n📈 Performance Assessment:');

    if (summary.averageSpeedup >= 5.0) {
      console.log('  ✅ OUTSTANDING: Exceeds 5x performance improvement target');
      console.log('  📋 ADR-005 STATUS: Target significantly exceeded');
    } else if (summary.averageSpeedup >= 3.0) {
      console.log('  ✅ EXCELLENT: Achieves 3-5x performance improvement target');
      console.log('  📋 ADR-005 STATUS: Target achieved');
    } else if (summary.averageSpeedup >= 2.0) {
      console.log('  ⚠️  GOOD: Significant improvement but below 3x target');
      console.log('  📋 ADR-005 STATUS: Partial success');
    } else {
      console.log('  ❌ NEEDS IMPROVEMENT: Below 2x performance target');
      console.log('  📋 ADR-005 STATUS: Review optimization approach');
    }

    // Special assessment for comprehensive analysis (primary target)
    const comprehensiveResult = this.results.find(r => r.function === 'comprehensiveAnalysis');
    if (comprehensiveResult) {
      console.log(`\n🎯 Primary Target (comprehensiveAnalysis): ${comprehensiveResult.speedup.toFixed(2)}x speedup`);
      console.log(`    Expected: 5-8x (per ADR-005 accessibility optimization goals)`);

      if (comprehensiveResult.speedup >= 5.0) {
        console.log('    ✅ PRIMARY TARGET: Achieved');
      } else {
        console.log('    ⚠️  PRIMARY TARGET: Review nested loop optimization opportunities');
      }
    }
  }

  private async generateReport(): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = `benchmarks/results/accessibility-benchmark-${timestamp}.json`;

    const summary = this.generateSummary();
    const categoryResults = this.getCategoryResults();

    const report = {
      timestamp: new Date().toISOString(),
      purpose: 'Comprehensive accessibility performance analysis: TypeScript vs ReScript',
      adrReference: 'ADR-005: AccessibilityAnalysis.res optimization for 5-8x performance improvement',
      configuration: this.config,
      environment: this.environment,
      results: {
        byCategory: categoryResults,
        all: this.results
      },
      summary: {
        ...summary,
        byCategory: Object.fromEntries(
          Object.entries(categoryResults).map(([cat, results]) => [
            cat,
            {
              rescriptWins: results.filter(r => r.winner === 'ReScript').length,
              totalTests: results.length,
              averageSpeedup: results.reduce((sum, r) => sum + r.speedup, 0) / results.length
            }
          ])
        )
      },
      analysis: {
        performanceVerdict: this.getPerformanceVerdict(summary.averageSpeedup),
        targetAchievement: {
          overall: summary.averageSpeedup >= 3.0,
          comprehensive: this.results.find(r => r.function === 'comprehensiveAnalysis')?.speedup ?? 0 >= 5.0
        },
        recommendations: this.generateRecommendations(summary),
        keyFindings: this.generateKeyFindings(summary)
      }
    };

    // Save JSON report
    await import('fs/promises').then(fs =>
      fs.writeFile(reportPath, JSON.stringify(report, null, 2))
    );

    // Generate markdown report if configured
    if (this.config.reporting.generateMarkdown) {
      const markdownPath = `benchmarks/results/accessibility-benchmark-${timestamp}.md`;
      const markdown = this.generateMarkdownReport(report);
      await import('fs/promises').then(fs =>
        fs.writeFile(markdownPath, markdown)
      );
      console.log(`📖 Markdown report: ${markdownPath}`);
    }

    console.log(`\n📄 Detailed accessibility analysis saved to: ${reportPath}`);
  }

  private getPerformanceVerdict(avgSpeedup: number): string {
    if (avgSpeedup >= 5.0) return 'OUTSTANDING';
    if (avgSpeedup >= 3.0) return 'EXCELLENT';
    if (avgSpeedup >= 2.0) return 'GOOD';
    return 'NEEDS_IMPROVEMENT';
  }

  private generateRecommendations(summary: any): string[] {
    const recommendations: string[] = [];

    if (summary.averageSpeedup < 2.0) {
      recommendations.push('Profile ReScript compiled output for accessibility function optimizations');
      recommendations.push('Review color blindness simulation matrix calculations');
      recommendations.push('Consider optimizing nested loop structures in batch analysis functions');
    } else if (summary.averageSpeedup >= 5.0) {
      recommendations.push('Outstanding performance achieved - expand ReScript usage to remaining functions');
      recommendations.push('Consider implementing ContextIntelligence.res as next optimization target');
      recommendations.push('Update project documentation to reflect achieved performance improvements');
    } else if (summary.averageSpeedup >= 3.0) {
      recommendations.push('Good performance improvements achieved');
      recommendations.push('Focus optimization efforts on comprehensiveAnalysis function if below target');
      recommendations.push('Consider batch pre-processing of color space conversions');
    }

    const comprehensiveResult = this.results.find(r => r.function === 'comprehensiveAnalysis');
    if (comprehensiveResult && comprehensiveResult.speedup < 5.0) {
      recommendations.push('Optimize nested iteration patterns in comprehensive accessibility analysis');
      recommendations.push('Consider caching frequently computed accessibility metrics');
      recommendations.push('Review ReScript pattern matching efficiency in accessibility rules');
    }

    return recommendations;
  }

  private generateKeyFindings(summary: any): string[] {
    const findings: string[] = [];

    findings.push(`ReScript wins ${summary.rescriptWins} out of ${summary.totalTests} accessibility performance tests`);
    findings.push(`Average ${summary.averageSpeedup.toFixed(2)}x performance improvement with ReScript`);
    findings.push(`Best case scenario: ${summary.maxSpeedup.toFixed(2)}x speedup achieved`);

    const comprehensiveResult = this.results.find(r => r.function === 'comprehensiveAnalysis');
    if (comprehensiveResult) {
      findings.push(`Primary target (comprehensiveAnalysis): ${comprehensiveResult.speedup.toFixed(2)}x speedup`);
    }

    const categoryResults = this.getCategoryResults();
    const bestCategory = Object.entries(categoryResults)
      .map(([name, results]) => ({
        name,
        avgSpeedup: results.reduce((sum, r) => sum + r.speedup, 0) / results.length
      }))
      .sort((a, b) => b.avgSpeedup - a.avgSpeedup)[0];

    findings.push(`Best performing category: ${bestCategory.name} (${bestCategory.avgSpeedup.toFixed(2)}x avg speedup)`);

    return findings;
  }

  private generateMarkdownReport(report: any): string {
    const categoryTables = Object.entries(report.results.byCategory)
      .map(([category, results]: [string, any]) => {
        const tableRows = results.map((r: AccessibilityComparison) =>
          `| ${r.function} | ${r.typescript.averageTime.toFixed(3)} | ${r.rescript.averageTime.toFixed(3)} | ${r.speedup.toFixed(2)}x | ${r.winner} |`
        ).join('\n');

        return `### ${category.toUpperCase().replace('-', ' ')}

| Function | TypeScript (ms) | ReScript (ms) | Speedup | Winner |
|----------|-----------------|---------------|---------|--------|
${tableRows}

**Category Summary:**
- ReScript wins: ${report.summary.byCategory[category].rescriptWins}/${report.summary.byCategory[category].totalTests}
- Average speedup: ${report.summary.byCategory[category].averageSpeedup.toFixed(2)}x
`;
      }).join('\n');

    return `# Accessibility Performance Benchmark Report

Generated: ${new Date().toISOString()}

## Executive Summary

- **Overall Performance**: ${report.analysis.performanceVerdict}
- **ReScript Wins**: ${report.summary.rescriptWins}/${report.summary.totalTests} tests
- **Average Speedup**: ${report.summary.averageSpeedup.toFixed(2)}x
- **ADR-005 Target Achievement**: ${report.analysis.targetAchievement.overall ? '✅ Achieved' : '⚠️ Partial'}

## Results by Category

${categoryTables}

## Key Performance Indicators

### Primary Target Analysis
${report.results.all.find((r: AccessibilityComparison) => r.function === 'comprehensiveAnalysis') ?
`- **comprehensiveAnalysis**: ${report.results.all.find((r: AccessibilityComparison) => r.function === 'comprehensiveAnalysis').speedup.toFixed(2)}x speedup
- **Target**: 5-8x (ADR-005)
- **Status**: ${report.analysis.targetAchievement.comprehensive ? '✅ Achieved' : '⚠️ Review needed'}` :
'- Primary target not found in results'}

### Performance Range
- **Best**: ${report.summary.maxSpeedup.toFixed(2)}x speedup
- **Worst**: ${report.summary.minSpeedup.toFixed(2)}x speedup
- **Consistency**: ${report.summary.maxSpeedup / report.summary.minSpeedup < 3 ? 'Good' : 'Variable'} performance across functions

## Environment

- **Platform**: ${report.environment.platform} ${report.environment.arch}
- **Node.js**: ${report.environment.node}
- **CPUs**: ${report.environment.cpuCount}x ${report.environment.cpus}
- **Memory**: ${report.environment.totalMemory}
- **Configuration**: ${process.env.BENCHMARK_CONFIG || 'default'}

## Analysis

### Key Findings
${report.analysis.keyFindings.map((finding: string) => `- ${finding}`).join('\n')}

### Recommendations
${report.analysis.recommendations.map((rec: string) => `- ${rec}`).join('\n')}

### Next Steps

1. **If performance targets achieved**: Expand ReScript usage to additional accessibility functions
2. **If targets not met**: Profile specific bottlenecks and optimize ReScript implementations
3. **Continuous monitoring**: Implement regression testing for performance improvements
4. **Documentation**: Update ADR-005 with final performance results

---
*Report generated by Accessibility Performance Benchmark Suite*
*ADR Reference: ADR-005 AccessibilityAnalysis.res optimization*
`;
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const benchmark = new AccessibilityBenchmark();
  benchmark.runBenchmarks().catch(console.error);
}

export { AccessibilityBenchmark };