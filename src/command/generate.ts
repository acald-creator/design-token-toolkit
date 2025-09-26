import { execSync } from 'child_process';

export function generate(options: { config: string }): void {
  try {
    console.log('🎨 Generating design tokens...');
    const startTime = performance.now();

    // Validate config file exists
    if (!options.config) {
      throw new Error('No configuration file specified');
    }

    execSync(`style-dictionary build --config ${options.config}`, {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    const duration = performance.now() - startTime;
    console.log(`✅ Tokens generated successfully! (${duration.toFixed(1)}ms)`);
    console.log(`📁 Output location: src/styles/generated/`);
    console.log(`🔧 Configuration: ${options.config}`);

  } catch (error) {
    console.error('❌ Failed to generate tokens:', error);

    console.log('\n🔧 Troubleshooting:');
    console.log(`   • Check that config file exists: ${options.config}`);
    console.log('   • Ensure Style Dictionary is installed: npm install style-dictionary');
    console.log('   • Verify token files exist in the tokens/ directory');
    console.log('   • Check that all token files are valid JSON');

    if (error instanceof Error && error.message.includes('ENOENT')) {
      console.log('   • The specified config file was not found');
    }

    process.exit(1);
  }
}