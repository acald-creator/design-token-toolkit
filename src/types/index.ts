// Design Token Toolkit Types

export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface CoreColors {
  primary: ColorPalette;
  secondary: ColorPalette;
  neutral: ColorPalette;
  [key: string]: ColorPalette;
}

export interface SemanticColors {
  brand: {
    primary: string;
    'primary-hover': string;
    'primary-light': string;
    'primary-dark': string;
    secondary: string;
  };
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export interface ThemeColors {
  background: {
    primary: string;
    secondary: string;
    elevated: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  border: {
    default: string;
    focus: string;
  };
}

export interface DesignTokens {
  color: {
    core: CoreColors;
    semantic: SemanticColors;
    background?: ThemeColors['background'];
    text?: ThemeColors['text'];
    border?: ThemeColors['border'];
  };
  size?: {
    font: Record<string, string>;
    spacing: Record<string, string>;
    border: {
      radius: Record<string, string>;
      width: Record<string, string>;
    };
  };
  typography?: {
    family: Record<string, string>;
    weight: Record<string, string>;
    lineHeight: Record<string, string>;
    letterSpacing: Record<string, string>;
  };
}

export interface TokenConfig {
  source: string[];
  platforms: Record<string, any>;
}

export interface InitOptions {
  dir: string;
  framework: 'react' | 'vue' | 'vanilla';
  theme: 'light' | 'dark' | 'both';
}

export interface ColorGenerationOptions {
  baseColor: string;
  harmony?: 'analogous' | 'complementary' | 'triadic' | 'monochromatic';
  accessibility?: boolean;
  steps?: number;
}