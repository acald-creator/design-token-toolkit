import inquirer from 'inquirer';
import { generateThemeColors } from '../generators/color.js';
import * as path from 'path';
import * as fs from 'fs-extra';
import { readTokenFiles, writeThemeFile } from '../utils/file.js';

export async function theme(action: string, name?: string): Promise<void> {
  switch (action) {
    case 'create':
      await createTheme(name);
      break;
    case 'list':
      await listThemes();
      break;
    case 'remove':
      await removeTheme(name);
      break;
    default:
      console.error('Invalid action. Use: create, list, or remove');
  }
}

async function createTheme(themeName?: string): Promise<void> {
  let name = themeName;
  let themeType: 'light' | 'dark' = 'light';

  if (!name) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'themeName',
        message: 'What should the theme be called?',
        default: 'custom'
      },
      {
        type: 'list',
        name: 'baseTheme',
        message: 'What type of theme?',
        choices: [
          { name: 'Light theme', value: 'light' },
          { name: 'Dark theme', value: 'dark' }
        ],
        default: 'light'
      }
    ]);
    name = answers.themeName;
    themeType = answers.baseTheme;
  } else {
    // Infer theme type from name
    themeType = name.includes('dark') ? 'dark' : 'light';
  }

  // Read existing core colors
  const existingTokens = await readTokenFiles(path.join(process.cwd(), 'tokens'));
  const coreColors = existingTokens.color?.core;

  if (!coreColors || !Object.keys(coreColors).length) {
    console.error('❌ No core colors found. Please run `design-tokens init` first.');
    return;
  }

  // Generate theme colors
  const themeColors = generateThemeColors(themeType, coreColors);

  // Write theme file
  await writeThemeFile(
    themeColors,
    name!,
    path.join(process.cwd(), 'tokens')
  );

  console.log(`✅ Theme "${name}" created!`);
}

async function listThemes(): Promise<void> {
  try {
    const themesDir = path.join(process.cwd(), 'tokens', 'theme');

    // Check if themes directory exists
    if (!(await fs.pathExists(themesDir))) {
      console.log('📁 No themes directory found. Run `design-tokens theme create <name>` to create your first theme.');
      return;
    }

    // Read theme files
    const themeFiles = await fs.readdir(themesDir);
    const themeNames = themeFiles
      .filter(file => file.endsWith('.json'))
      .map(file => path.basename(file, '.json'));

    if (themeNames.length === 0) {
      console.log('📁 No themes found. Run `design-tokens theme create <name>` to create your first theme.');
      return;
    }

    console.log('🎨 Available themes:');
    for (const themeName of themeNames) {
      try {
        const themeFilePath = path.join(themesDir, `${themeName}.json`);
        const themeData = await fs.readJson(themeFilePath);
        const colorCount = themeData.color ? Object.keys(themeData.color).length : 0;
        console.log(`   • ${themeName} (${colorCount} color groups)`);
      } catch (error) {
        console.log(`   • ${themeName} (error reading theme)`);
      }
    }

    console.log('\n💡 Use `design-tokens theme create <name>` to create a new theme');
    console.log('💡 Use `design-tokens theme remove <name>` to remove a theme');
  } catch (error) {
    console.error('❌ Failed to list themes:', error);
  }
}

async function removeTheme(name?: string): Promise<void> {
  if (!name) {
    console.error('❌ Please specify a theme name to remove');
    return;
  }

  try {
    const themesDir = path.join(process.cwd(), 'tokens', 'theme');
    const themeFilePath = path.join(themesDir, `${name}.json`);

    // Check if theme file exists
    if (!(await fs.pathExists(themeFilePath))) {
      console.error(`❌ Theme "${name}" not found. Use \`design-tokens theme list\` to see available themes.`);
      return;
    }

    // Confirm deletion with user
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmDelete',
        message: `Are you sure you want to remove theme "${name}"? This action cannot be undone.`,
        default: false
      }
    ]);

    if (!answers.confirmDelete) {
      console.log('🚫 Theme removal cancelled.');
      return;
    }

    // Remove the theme file
    await fs.remove(themeFilePath);

    console.log(`✅ Theme "${name}" has been removed successfully!`);

    // Check if this was the last theme
    const remainingFiles = await fs.readdir(themesDir);
    const remainingThemes = remainingFiles.filter(file => file.endsWith('.json'));

    if (remainingThemes.length === 0) {
      console.log('💡 No themes remaining. Use `design-tokens theme create <name>` to create a new theme.');
    } else {
      console.log(`💡 ${remainingThemes.length} theme(s) remaining. Use \`design-tokens theme list\` to see them.`);
    }

  } catch (error) {
    console.error(`❌ Failed to remove theme "${name}":`, error);
  }
}