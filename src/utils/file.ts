import { DesignTokens, TokenConfig } from '../types/index.js';
import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * Write design tokens to JSON files
 */
export async function writeTokenFiles(
  tokens: DesignTokens,
  outputDir: string
): Promise<void> {
  await fs.ensureDir(outputDir);

  // Write core colors
  if (tokens.color?.core) {
    await fs.writeJson(
      path.join(outputDir, 'color', 'core.json'),
      { color: { core: tokens.color.core } },
      { spaces: 2 }
    );
  }

  // Write semantic colors
  if (tokens.color?.semantic) {
    await fs.writeJson(
      path.join(outputDir, 'color', 'semantic.json'),
      { color: { semantic: tokens.color.semantic } },
      { spaces: 2 }
    );
  }

  // Write size tokens
  if (tokens.size) {
    await fs.writeJson(
      path.join(outputDir, 'size', 'base.json'),
      { size: tokens.size },
      { spaces: 2 }
    );
  }

  // Write typography tokens
  if (tokens.typography) {
    await fs.writeJson(
      path.join(outputDir, 'typography', 'base.json'),
      { typography: tokens.typography },
      { spaces: 2 }
    );
  }
}

/**
 * Write theme-specific colors to a theme file
 */
export async function writeThemeFile(
  themeColors: Partial<Pick<DesignTokens['color'], 'background' | 'text' | 'border'>>,
  themeName: string,
  outputDir: string
): Promise<void> {
  const themeDir = path.join(outputDir, 'theme');
  await fs.ensureDir(themeDir);

  await fs.writeJson(
    path.join(themeDir, `${themeName}.json`),
    { color: themeColors },
    { spaces: 2 }
  );
}

/**
 * Write Style Dictionary configuration
 */
export async function writeStyleDictionaryConfig(
  config: TokenConfig,
  outputPath: string
): Promise<void> {
  await fs.ensureDir(path.dirname(outputPath));
  await fs.writeJson(outputPath, config, { spaces: 2 });
}

/**
 * Copy template files
 */
export async function copyTemplates(
  templateDir: string,
  targetDir: string,
  variables: Record<string, any> = {}
): Promise<void> {
  const templateFiles = await fs.readdir(templateDir);

  for (const file of templateFiles) {
    const templatePath = path.join(templateDir, file);
    const targetPath = path.join(targetDir, file);

    if ((await fs.stat(templatePath)).isDirectory()) {
      await copyTemplates(templatePath, targetPath, variables);
    } else {
      let content = await fs.readFile(templatePath, 'utf-8');

      // Replace template variables
      for (const [key, value] of Object.entries(variables)) {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }

      await fs.ensureDir(path.dirname(targetPath));
      await fs.writeFile(targetPath, content);
    }
  }
}

/**
 * Create directory structure for tokens
 */
export async function createTokenDirectories(baseDir: string): Promise<void> {
  const dirs = [
    'tokens/color',
    'tokens/size',
    'tokens/typography',
    'tokens/theme',
    'src/styles/generated',
    'src/styles/generated/themes'
  ];

  for (const dir of dirs) {
    await fs.ensureDir(path.join(baseDir, dir));
  }
}

/**
 * Read existing token files
 */
export async function readTokenFiles(tokenDir: string): Promise<Partial<DesignTokens>> {
  const tokens: Partial<DesignTokens> = {};

  try {
    // Read color tokens
    const corePath = path.join(tokenDir, 'color', 'core.json');
    if (await fs.pathExists(corePath)) {
      const coreData = await fs.readJson(corePath);
      tokens.color = { ...tokens.color, ...coreData.color };
    }

    const semanticPath = path.join(tokenDir, 'color', 'semantic.json');
    if (await fs.pathExists(semanticPath)) {
      const semanticData = await fs.readJson(semanticPath);
      tokens.color = { ...tokens.color, ...semanticData.color };
    }

    // Read size tokens
    const sizePath = path.join(tokenDir, 'size', 'base.json');
    if (await fs.pathExists(sizePath)) {
      tokens.size = await fs.readJson(sizePath);
    }

    // Read typography tokens
    const typographyPath = path.join(tokenDir, 'typography', 'base.json');
    if (await fs.pathExists(typographyPath)) {
      tokens.typography = await fs.readJson(typographyPath);
    }

  } catch (error) {
    console.warn('Error reading token files:', error);
  }

  return tokens;
}