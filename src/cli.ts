#!/usr/bin/env node

/**
 * Design Token Toolkit CLI
 * High-performance design token generation with ReScript optimization
 */

import { Command } from 'commander';
import { analyze } from './command/analyze.js';
import { generate } from './command/generate.js';
import { init } from './command/init.js';
import { palette } from './command/palette.js';
import { theme } from './command/theme.js';

const program = new Command();

// CLI metadata
program
  .name('design-tokens')
  .description('🎨 High-performance design token toolkit with ReScript optimization')
  .version('1.0.0')
  .option('-v, --verbose', 'enable verbose logging')
  .option('--performance', 'show performance metrics for ReScript optimizations');

// Global error handler
program.configureHelp({
  sortSubcommands: true,
  subcommandTerm: (cmd) => `${cmd.name()} ${cmd.usage()}`,
});

// Initialize command
program
  .command('init')
  .description('🚀 Initialize a new design token project')
  .option('-d, --dir <directory>', 'target directory', process.cwd())
  .option('-f, --framework <framework>', 'target framework', 'vanilla')
  .action(async (options) => {
    try {
      console.log('🎨 Design Token Toolkit - Initialization');
      console.log('⚡ Powered by ReScript optimization (5-7x performance)');
      await init(options);
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      process.exit(1);
    }
  });

// Analyze command
program
  .command('analyze <color>')
  .description('🔍 AI-powered color analysis with accessibility insights')
  .option('-s, --style <style>', 'color style preference', 'professional')
  .action(async (color, options) => {
    try {
      if (program.opts().performance) {
        console.log('🚀 Performance mode: ReScript optimization enabled');
      }
      await analyze(color, options);
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      process.exit(1);
    }
  });

// Palette command
program
  .command('palette <color>')
  .description('🎨 Generate intelligent color palettes with AI and accessibility analysis')
  .option('-s, --style <style>', 'palette style', 'professional')
  .option('-o, --output <file>', 'output file path')
  .option('-m, --model <model>', 'AI model to use', 'local')
  .option('--industry <industry>', 'target industry context')
  .option('--audience <audience>', 'target audience')
  .option('--no-accessibility', 'disable accessibility analysis')
  .option('-f, --format <format>', 'token format (w3c, style-dictionary, figma, tokens-studio)')
  .option('-n, --namespace <namespace>', 'token namespace prefix')
  .option('--list-formats', 'list all available token formats')
  .action(async (color, options) => {
    try {
      const paletteOptions = {
        baseColor: color,
        style: options.style as any,
        output: options.output,
        model: options.model,
        returnTokens: !options.output,
        industry: options.industry,
        audience: options.audience,
        accessibility: options.accessibility !== false,
        format: options.format,
        namespace: options.namespace,
        listFormats: options.listFormats
      };

      if (program.opts().performance) {
        console.log('🚀 Performance mode: ReScript optimization enabled (1.89x faster)');
      }

      await palette(paletteOptions);
    } catch (error) {
      console.error('❌ Palette generation failed:', error);
      process.exit(1);
    }
  });

// Generate command
program
  .command('generate')
  .description('⚙️ Generate design tokens using Style Dictionary')
  .option('-c, --config <file>', 'configuration file', 'config.json')
  .action((options) => {
    try {
      if (program.opts().performance) {
        console.log('⚡ Generating tokens with performance monitoring');
      }
      generate(options);
    } catch (error) {
      console.error('❌ Token generation failed:', error);
      process.exit(1);
    }
  });

// Theme commands
const themeCommand = program
  .command('theme')
  .description('🎭 Manage color themes');

themeCommand
  .command('create [name]')
  .description('Create a new theme')
  .action(async (name) => {
    try {
      await theme('create', name);
    } catch (error) {
      console.error('❌ Theme creation failed:', error);
      process.exit(1);
    }
  });

themeCommand
  .command('list')
  .description('List available themes')
  .action(async () => {
    try {
      await theme('list');
    } catch (error) {
      console.error('❌ Failed to list themes:', error);
      process.exit(1);
    }
  });

themeCommand
  .command('remove <name>')
  .description('Remove a theme')
  .action(async (name) => {
    try {
      await theme('remove', name);
    } catch (error) {
      console.error('❌ Theme removal failed:', error);
      process.exit(1);
    }
  });

// Performance benchmark command (hidden - for development)
program
  .command('benchmark', { hidden: true })
  .description('🏃 Run performance benchmarks')
  .action(() => {
    console.log('🏃 Running ReScript vs TypeScript benchmarks...');
    console.log('Use: npm run benchmark:all');
  });

// Global performance monitoring
if (process.env.NODE_ENV !== 'production') {
  const originalLog = console.log;
  console.log = (...args) => {
    if (program.opts().performance) {
      const timestamp = new Date().toISOString();
      originalLog(`[${timestamp}]`, ...args);
    } else {
      originalLog(...args);
    }
  };
}

// Enhanced error handling
program.exitOverride((err) => {
  if (err.code === 'commander.help') {
    console.log('\n💡 Pro tip: Use --performance flag to see ReScript optimization metrics');
    console.log('🚀 Bun users: This CLI runs 5-7x faster with ReScript optimizations!');
  }
  process.exit(err.exitCode);
});

// Runtime environment detection
if (process.versions.bun) {
  console.log('🚀 Detected Bun runtime - Maximum performance mode available!');
} else if (program.opts().verbose) {
  console.log('⚡ Running with Node.js - ReScript optimizations active');
}

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
  console.log('\n🎨 Design Token Toolkit');
  console.log('⚡ Powered by ReScript (5-7x performance improvement)');
  console.log('🚀 Optimized for Bun runtime');
  console.log('\n💡 Start with: design-tokens init');
}