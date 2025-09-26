import * as fs from 'fs-extra';
import * as path from 'path';
import inquirer from 'inquirer';
import { generateCompletePalette, generateFrameworkIntegration as generateFrameworkCode } from '../generators/palette.js';
import { InitOptions } from '../types/index.js';
import { createTokenDirectories, writeTokenFiles, writeStyleDictionaryConfig } from '../utils/file.js';
import { generateHarmoniousPalette } from '../utils/color.js';

export async function init(options: InitOptions): Promise<void> {
  const { dir, framework } = options;

  console.log('🚀 Initializing Design Token Toolkit...');

  // Get user input for brand colors
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'primaryColor',
      message: 'What is your primary brand color? (hex, rgb, or hsl)',
      default: '#646cff',
      validate: (input) => {
        // Basic color validation
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^rgb\(.*\)$|^hsl\(.*\)$/.test(input) ||
               'Please enter a valid color (hex: #646cff, rgb: rgb(100, 108, 255), hsl: hsl(240, 100%, 65%))';
      }
    },
    {
      type: 'input',
      name: 'secondaryColor',
      message: 'What is your secondary brand color? (optional)',
      default: (answers: any) => {
        // Suggest a complementary color
        const primary = answers.primaryColor || '#646cff';
        return suggestSecondaryColor(primary);
      }
    },
    {
      type: 'list',
      name: 'theme',
      message: 'Which themes would you like to generate?',
      choices: [
        { name: 'Light theme only', value: 'light' },
        { name: 'Dark theme only', value: 'dark' },
        { name: 'Both light and dark themes', value: 'both' }
      ],
      default: 'both'
    },
    {
      type: 'confirm',
      name: 'includeAI',
      message: 'Would you like AI-assisted color generation and accessibility checking?',
      default: true
    }
  ]);

  const { primaryColor, secondaryColor, theme } = answers;

  // Create directory structure
  await createTokenDirectories(dir);

  // Generate complete token palette
  const tokens = generateCompletePalette(
    { primary: primaryColor, secondary: secondaryColor },
    { includeThemes: theme !== 'none', framework }
  );

  // Write token files
  await writeTokenFiles(tokens, path.join(dir, 'tokens'));

  // Generate Style Dictionary config
  const config = generateStyleDictionaryConfig(theme, framework);
  await writeStyleDictionaryConfig(config, path.join(dir, 'config.json'));

  // Create theme-specific configs if needed
  if (theme === 'both' || theme === 'light') {
    const lightConfig = generateThemeConfig('light', framework);
    await writeStyleDictionaryConfig(lightConfig, path.join(dir, 'config.light.json'));
  }

  if (theme === 'both' || theme === 'dark') {
    const darkConfig = generateThemeConfig('dark', framework);
    await writeStyleDictionaryConfig(darkConfig, path.join(dir, 'config.dark.json'));
  }

  // Generate framework-specific integration
  const integration = generateFrameworkIntegration(framework, tokens);
  await fs.writeFile(path.join(dir, `src/theme.${framework === 'vanilla' ? 'js' : 'ts'}`), integration);

  // Create package.json scripts
  await updatePackageJson(dir);

  // Create README
  await createReadme(dir, { primaryColor, secondaryColor, theme, framework });

  console.log('✅ Design token system initialized!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Run `npm run tokens:build` to generate CSS/JS files');
  console.log('2. Import and use your tokens in your components');
  console.log('3. Customize tokens in the `tokens/` directory as needed');
}

function suggestSecondaryColor(primaryColor: string): string {
  try {
    // Use ReScript-backed harmonious palette generation for complementary color
    const harmoniousColors = generateHarmoniousPalette(primaryColor, 'complementary');

    // Return the complementary color (second in the array)
    if (harmoniousColors.length >= 2) {
      return harmoniousColors[1];
    }

    // Fallback: Generate analogous color if complementary fails
    const analogousColors = generateHarmoniousPalette(primaryColor, 'analogous');
    if (analogousColors.length >= 2) {
      return analogousColors[1];
    }

    // Final fallback
    return '#535bf2';
  } catch (error) {
    console.warn('Color suggestion failed, using fallback:', error);
    return '#535bf2';
  }
}

function generateStyleDictionaryConfig(_theme: string, framework: string) {
  const platforms: any = {
    css: {
      transformGroup: 'css',
      buildPath: 'src/styles/generated/',
      files: [{
        destination: 'tokens.css',
        format: 'css/variables',
        options: { outputReferences: true }
      }]
    },
    js: {
      transformGroup: 'js',
      buildPath: 'src/styles/generated/',
      files: [{
        destination: 'tokens.js',
        format: 'javascript/es6'
      }]
    }
  };

  if (framework === 'react' || framework === 'vue') {
    platforms.js.files.push({
      destination: 'tokens.d.ts',
      format: 'typescript/es6-declarations'
    });
  }

  return {
    source: ['tokens/**/*.json'],
    platforms
  };
}

function generateThemeConfig(themeName: string, _framework: string) {
  return {
    source: [
      'tokens/color/core.json',
      'tokens/color/semantic.json',
      'tokens/size/base.json',
      'tokens/typography/base.json',
      `tokens/theme/${themeName}.json`
    ],
    platforms: {
      css: {
        transformGroup: 'css',
        buildPath: `src/styles/generated/themes/`,
        files: [{
          destination: `${themeName}.css`,
          format: 'css/variables',
          options: { outputReferences: true }
        }]
      }
    }
  };
}

function generateFrameworkIntegration(framework: string, tokens: any): string {
  try {
    // Use the existing framework integration generator from palette.ts
    const validFramework = ['react', 'vue', 'vanilla'].includes(framework)
      ? framework as 'react' | 'vue' | 'vanilla'
      : 'vanilla';
    return generateFrameworkCode(validFramework, tokens);
  } catch (error) {
    console.warn('Framework integration generation failed, using fallback:', error);

    // Enhanced fallback with actual integration code
    switch (framework) {
      case 'react':
        return `import React, { createContext, useContext } from 'react';

// Generated design tokens
const tokens = ${JSON.stringify(tokens, null, 2)};

// Theme context
const ThemeContext = createContext(tokens);

export const ThemeProvider = ({ children, theme = 'light' }) => (
  <ThemeContext.Provider value={tokens}>
    <div data-theme={theme} className="theme-provider">
      {children}
    </div>
  </ThemeContext.Provider>
);

export const useTheme = () => {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return theme;
};

export { tokens };
`;

      case 'vue':
        return `import { ref, provide, inject, readonly } from 'vue';

// Generated design tokens
const tokens = ${JSON.stringify(tokens, null, 2)};

// Theme composable
export const useTheme = () => {
  const theme = ref(tokens);

  const setTheme = (newTheme) => {
    theme.value = { ...theme.value, ...newTheme };
  };

  provide('theme', theme);

  return {
    theme: readonly(theme),
    setTheme,
    tokens
  };
};

export const injectTheme = () => {
  const theme = inject('theme');
  if (!theme) {
    throw new Error('injectTheme must be used within a component that provides theme');
  }
  return theme;
};

export { tokens };
`;

      case 'vanilla':
      default:
        return `// Generated design tokens
export const tokens = ${JSON.stringify(tokens, null, 2)};

// Theme utilities
export const applyTheme = (themeName = 'light') => {
  const theme = tokens[themeName] || tokens;

  // Apply CSS custom properties
  Object.entries(theme).forEach(([category, values]) => {
    if (typeof values === 'object' && values !== null) {
      Object.entries(values).forEach(([property, value]) => {
        const cssVar = \`--\${category}-\${property}\`;
        document.documentElement.style.setProperty(cssVar, String(value));
      });
    }
  });
};

// Get token value helper
export const getToken = (path) => {
  const keys = path.split('.');
  let value = tokens;

  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) break;
  }

  return value;
};

// Initialize theme on load
if (typeof document !== 'undefined') {
  applyTheme();
}
`;
    }
  }
}

async function updatePackageJson(dir: string): Promise<void> {
  const packagePath = path.join(dir, 'package.json');

  if (await fs.pathExists(packagePath)) {
    const pkg = await fs.readJson(packagePath);
    pkg.scripts = {
      ...pkg.scripts,
      'tokens:build': 'style-dictionary build',
      'tokens:build:light': 'style-dictionary build --config config.light.json',
      'tokens:build:dark': 'style-dictionary build --config config.dark.json',
      'tokens:watch': 'style-dictionary build --watch'
    };
    await fs.writeJson(packagePath, pkg, { spaces: 2 });
  }
}

async function createReadme(dir: string, config: any): Promise<void> {
  const readme = `# Design Token System

This project uses a design token system generated with the Design Token Toolkit.

## Configuration

- **Primary Color**: ${config.primaryColor}
- **Secondary Color**: ${config.secondaryColor}
- **Themes**: ${config.theme}
- **Framework**: ${config.framework}

## Building Tokens

\`\`\`bash
# Build all tokens
npm run tokens:build

# Build specific themes
npm run tokens:build:light
npm run tokens:build:dark

# Watch for changes
npm run tokens:watch
\`\`\`

## Usage

Import the generated tokens in your components:

\`\`\`javascript
import tokens from './src/styles/generated/tokens.js';

// Use in your components
const button = css({
  backgroundColor: tokens.color.brand.primary,
  color: tokens.color.text.primary
});
\`\`\`

## File Structure

- \`tokens/\` - Source token definitions (JSON)
- \`src/styles/generated/\` - Generated CSS/JS files
- \`config.json\` - Style Dictionary configuration
`;

  await fs.writeFile(path.join(dir, 'TOKENS.md'), readme);
}