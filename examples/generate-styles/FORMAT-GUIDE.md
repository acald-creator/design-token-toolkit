# Design Token Format Guide

This directory demonstrates the multi-format token generation system with auto-detection capabilities.

## Supported Formats

### 1. W3C Design Token Community Group (`w3c`)
**Structure:** `colors` root → `$value` properties
**Use case:** Future-proof projects, W3C compliance, modern toolchains

```json
{
  "colors": {
    "$type": "color",
    "$description": "AI-generated palette",
    "brand-primary": {
      "500": {
        "$value": "#3b82f6",
        "$type": "color"
      }
    }
  }
}
```

### 2. Style Dictionary v3/v4 (`style-dictionary`)
**Structure:** `color` root → `value` properties
**Use case:** Existing Style Dictionary projects, multi-platform apps

```json
{
  "color": {
    "brand": {
      "primary": {
        "500": {
          "value": "#3b82f6"
        }
      }
    }
  }
}
```

### 3. Figma Variables (`figma`)
**Structure:** `tokens` root → flat structure
**Use case:** Figma workflows, design-to-dev handoff

```json
{
  "tokens": {
    "brand-primary-500": {
      "value": "#3b82f6",
      "type": "color"
    }
  }
}
```

### 4. Tokens Studio (`tokens-studio`)
**Structure:** `global` root → nested structure
**Use case:** Figma + Tokens Studio plugin, collaborative workflows

```json
{
  "global": {
    "brand": {
      "primary": {
        "500": {
          "value": "#3b82f6",
          "type": "color"
        }
      }
    }
  }
}
```

## Format Auto-Detection

The system automatically detects existing token formats by scanning for:

- **W3C patterns**: `$value`, `$type`, `$description` properties
- **Style Dictionary patterns**: `value` without `$value` prefix
- **Figma patterns**: `tokens` root key
- **Tokens Studio patterns**: `global` root key

## Usage Examples

### Auto-Detection (Recommended)
```bash
# Scans existing tokens/ directory and matches format
design-tokens palette "#3b82f6" --output tokens/new-palette.json
```

### Explicit Format
```bash
# W3C format with namespace
design-tokens palette "#ef4444" --format w3c --namespace "error" --output tokens/error.json

# Style Dictionary format
design-tokens palette "#10b981" --format style-dictionary --output tokens/success.json

# Figma format
design-tokens palette "#8b5cf6" --format figma --namespace "accent" --output tokens/accent.json
```

### List All Formats
```bash
design-tokens palette --list-formats
```

## Integration with Build Systems

### Style Dictionary (Any Format)
```bash
# All formats work with Style Dictionary
style-dictionary build --config config.json
```

### W3C to Style Dictionary Conversion
Style Dictionary automatically handles W3C format tokens through transforms.

### Expected Output Structure

- **CSS Variables**: `--colors-namespace-scale-weight`
- **iOS Swift**: `colorsNamespaceScaleWeight`
- **Android XML**: `colors_namespace_scale_weight`
- **Compose Kotlin**: `ColorsNamespaceScaleWeight`

## Performance

- **ReScript Optimization**: 1.89x faster accessibility analysis
- **Multi-Provider AI**: Ollama → Local Intelligence → Rule-Based fallback
- **Format Detection**: Cached for subsequent operations

## File Examples in This Directory

- `tokens/colors.json` - Original W3C format tokens
- `tokens/test-w3c-format.json` - Generated W3C format
- `tokens/test-style-dictionary.json` - Generated Style Dictionary format
- `build/` - Compiled outputs (CSS, iOS, Android, Compose)

## Next Steps

1. Generate tokens: `design-tokens palette <color> --output tokens/palette.json`
2. Build outputs: `style-dictionary build --config config.json`
3. Import into your design system