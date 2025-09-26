/**
 * Benchmark Configuration
 * Centralized settings for performance and memory benchmarks
 *
 * File Naming Convention:
 * - UPPERCASE: Executive/summary files (CONSOLIDATED_ANALYSIS, EXECUTIVE_SUMMARY, BENCHMARK_REPORT)
 * - lowercase: Technical/data files (core-performance, accessibility-benchmark, website-showcase-data)
 */

export interface BenchmarkConfig {
  iterations: {
    small: number;
    medium: number;
    large: number;
  };
  testData: {
    colorCount: number;
    pairCount: number;
    setCount: number;
    colorsPerSet: number;
  };
  memory: {
    monitoringInterval: number;
    stabilizationDelay: number;
    warmupRuns: number;
  };
  performance: {
    warmupRuns: number;
    testRuns: number;
  };
  reporting: {
    precision: number;
    includeEnvironment: boolean;
    generateMarkdown: boolean;
  };
}

export const DEFAULT_CONFIG: BenchmarkConfig = {
  iterations: {
    small: 100,
    medium: 1000,
    large: 10000
  },
  testData: {
    colorCount: 10000,
    pairCount: 5000,
    setCount: 500,
    colorsPerSet: 8
  },
  memory: {
    monitoringInterval: 10, // milliseconds
    stabilizationDelay: 50, // milliseconds
    warmupRuns: 3
  },
  performance: {
    warmupRuns: 10,
    testRuns: 100
  },
  reporting: {
    precision: 3, // decimal places
    includeEnvironment: true,
    generateMarkdown: true
  }
};

// Predefined configurations for different scenarios
export const QUICK_CONFIG: BenchmarkConfig = {
  ...DEFAULT_CONFIG,
  iterations: {
    small: 50,
    medium: 200,
    large: 1000
  },
  testData: {
    colorCount: 1000,
    pairCount: 500,
    setCount: 100,
    colorsPerSet: 5
  },
  performance: {
    warmupRuns: 5,
    testRuns: 50
  }
};

export const COMPREHENSIVE_CONFIG: BenchmarkConfig = {
  ...DEFAULT_CONFIG,
  iterations: {
    small: 500,
    medium: 5000,
    large: 50000
  },
  testData: {
    colorCount: 50000,
    pairCount: 25000,
    setCount: 2000,
    colorsPerSet: 12
  },
  performance: {
    warmupRuns: 20,
    testRuns: 200
  }
};

export const MEMORY_INTENSIVE_CONFIG: BenchmarkConfig = {
  ...DEFAULT_CONFIG,
  testData: {
    colorCount: 100000,
    pairCount: 50000,
    setCount: 5000,
    colorsPerSet: 15
  },
  memory: {
    monitoringInterval: 5,
    stabilizationDelay: 100,
    warmupRuns: 5
  }
};

// Test color palettes for different scenarios
export const TEST_COLORS = {
  basic: [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#800000', '#008000', '#000080', '#808000', '#800080', '#008080'
  ],
  extended: [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#800000', '#008000', '#000080', '#808000', '#800080', '#008080',
    '#FFA500', '#A020F0', '#FFC0CB', '#40E0D0', '#EE82EE', '#90EE90',
    '#F0E68C', '#DDA0DD', '#98FB98', '#F0FFF0', '#FFE4E1', '#E0FFFF'
  ],
  accessibility: [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#C0C0C0', '#808080',
    '#800000', '#008000', '#000080', '#808000', '#800080', '#008080'
  ],
  colorBlindness: [
    '#E8002F', '#00A651', '#0047AB', '#F47C00', '#662D91',
    '#009CDE', '#8DC63F', '#FFED00', '#F7931E', '#C5007A'
  ]
};

// Environment detection utilities
import * as os from 'os';

export class EnvironmentDetector {
  static getEnvironmentInfo() {

    return {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      cpus: os.cpus()[0].model,
      cpuCount: os.cpus().length,
      totalMemory: this.formatBytes(os.totalmem()),
      freeMemory: this.formatBytes(os.freemem()),
      v8Version: process.versions.v8,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      nodeOptions: process.execArgv.join(' ')
    };
  }

  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static isOptimalEnvironment(): { optimal: boolean; warnings: string[] } {
    const warnings: string[] = [];

    // Check if garbage collection is enabled
    if (!global.gc) {
      warnings.push('Garbage collection not exposed. Use --expose-gc flag for accurate memory measurements.');
    }

    // Check available memory
    const freeMemGB = os.freemem() / (1024 * 1024 * 1024);
    if (freeMemGB < 2) {
      warnings.push('Less than 2GB free memory available. Results may be affected by system pressure.');
    }

    // Check CPU load
    const loadAverage = os.loadavg()[0];
    const cpuCount = os.cpus().length;
    if (loadAverage > cpuCount * 0.8) {
      warnings.push('High system load detected. Consider running benchmarks when system is less busy.');
    }

    return {
      optimal: warnings.length === 0,
      warnings
    };
  }
}

// Configuration loader with environment-based selection
export class ConfigManager {
  static loadConfig(): BenchmarkConfig {
    const env = process.env.BENCHMARK_CONFIG?.toLowerCase();

    switch (env) {
      case 'quick':
        return QUICK_CONFIG;
      case 'comprehensive':
        return COMPREHENSIVE_CONFIG;
      case 'memory':
        return MEMORY_INTENSIVE_CONFIG;
      default:
        return DEFAULT_CONFIG;
    }
  }

  static validateConfig(config: BenchmarkConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.iterations.small <= 0) {
      errors.push('Small iteration count must be positive');
    }

    if (config.testData.colorCount <= 0) {
      errors.push('Color count must be positive');
    }

    if (config.memory.monitoringInterval <= 0) {
      errors.push('Memory monitoring interval must be positive');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default DEFAULT_CONFIG;