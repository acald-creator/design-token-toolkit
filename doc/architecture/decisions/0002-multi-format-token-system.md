# ADR-002: Multi-Format Token System

## Status
**ACCEPTED** (2025-01-26)

## Context

Design tokens are used across diverse ecosystems with different format requirements:

- **W3C Design Token Community Group**: Emerging standard with `$value`, `$type` syntax
- **Style Dictionary**: Widely adopted with `value` properties and transform system
- **Figma Variables**: Flat structure for design tool integration
- **Tokens Studio**: Figma plugin with nested `global` structure

The original design-token-toolkit only supported Style Dictionary format, limiting compatibility with modern design systems that may use W3C format or require Figma integration.

### Problem Statement

Users reported that generated tokens weren't appearing in Style Dictionary builds when existing projects used W3C format (`"colors"` root, `"$value"` properties) while the CLI generated Style Dictionary format (`"color"` root, `"value"` properties).

This format mismatch prevented seamless integration with existing design systems and limited ecosystem compatibility.

## Decision

We will implement a **comprehensive multi-format token system** with:

1. **Format Auto-Detection**: Automatically detect existing project formats
2. **Explicit Format Selection**: Allow users to specify target format
3. **Format Conversion**: Convert between formats while preserving semantics
4. **Namespace Support**: Prevent naming conflicts with configurable prefixes

## Options Considered

### Option A: Single Format Support (Status Quo)
**Pros:** Simple implementation, no format complexity
**Cons:** Limited ecosystem compatibility, user frustration with format mismatches

### Option B: Manual Format Configuration
**Pros:** User control, simple implementation
**Cons:** Requires user knowledge of formats, no auto-detection

### Option C: Auto-Detection with Manual Override (Chosen)
**Pros:** Best user experience, seamless integration, format education
**Cons:** More complex implementation, multiple format support needed

## Implementation

### Format Configuration System

```typescript
interface TokenFormat {
  name: string;                    // 'w3c', 'style-dictionary', etc.
  displayName: string;             // Human-readable name
  valueKey: '$value' | 'value';    // Property for color values
  typeKey: '$type' | 'type' | null; // Property for type metadata
  rootKey: string;                 // Root object key
  nested: boolean;                 // Supports nested structure
  description: string;             // Format description
  commonUse: string[];            // When to use this format
}
```

### Supported Formats

**W3C Design Token Community Group:**
```json
{
  "colors": {
    "$type": "color",
    "brand-primary": {
      "500": { "$value": "#3b82f6", "$type": "color" }
    }
  }
}
```

**Style Dictionary v3/v4:**
```json
{
  "color": {
    "brand": {
      "primary": {
        "500": { "value": "#3b82f6" }
      }
    }
  }
}
```

**Figma Variables:**
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

**Tokens Studio:**
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

### Auto-Detection Logic

```typescript
async function detectTokenFormat(tokenDir: string): Promise<TokenFormat | null> {
  // Scan existing JSON files
  // Check for W3C patterns: $value, $type, $description
  // Check for Style Dictionary patterns: value without $value
  // Check for Figma patterns: tokens root key
  // Check for Tokens Studio patterns: global root key
  // Return detected format or null
}
```

### CLI Integration

```bash
# Auto-detection (recommended)
design-tokens palette "#3b82f6" --output tokens/palette.json

# Explicit format
design-tokens palette "#ef4444" --format w3c --namespace "error"

# List available formats
design-tokens palette --list-formats
```

### Enhanced User Experience

**Before:**
```
🎨 Generating enhanced AI-powered color palette...
✅ Enhanced palette generated and saved to tokens/palette.json
```

**After:**
```
🎨 Generating enhanced AI-powered color palette...
🔍 Scanning tokens for existing token format...
✅ Auto-detected format: W3C Design Token Community Group
📝 Expected output: colors root, $value properties
🔍 Using format: W3C Design Token Community Group
✅ Enhanced palette generated and saved to tokens/palette.json
📁 Format: W3C Design Token Community Group
📊 Structure: colors root with $value properties
🏷️  Namespace: "brand" prefix applied to all tokens
```

## Consequences

### ✅ **Positive Outcomes:**

**Ecosystem Compatibility:**
- **Seamless integration** with existing design systems
- **Future-proof** W3C format support
- **Figma workflow** compatibility
- **Style Dictionary** continues to work for all formats

**User Experience:**
- **Auto-detection** eliminates format confusion
- **Clear expectations** about output structure
- **Educational value** helps users understand token ecosystem
- **Namespace support** prevents naming conflicts

**Developer Experience:**
- **Format conversion** handled automatically
- **Comprehensive documentation** with examples
- **CLI guidance** for next steps based on format

### ⚠️ **Trade-offs:**

**Implementation Complexity:**
- **Multiple format support** increases codebase complexity
- **Auto-detection logic** requires file system scanning
- **Format conversion** needs careful semantic mapping

**Performance:**
- **File scanning** adds slight overhead to auto-detection
- **Format conversion** adds minimal processing time

## Metrics

**Compatibility Metrics:**
- **Format detection accuracy**: High success rate across test cases
- **Conversion fidelity**: Semantic preservation across formats
- **Style Dictionary integration**: 100% compatibility maintained

**User Experience Metrics:**
- **Format confusion reports**: Eliminated after implementation
- **CLI clarity**: Enhanced feedback and guidance
- **Documentation usage**: Comprehensive format guide reduces support requests

## Future Considerations

**Extensibility:**
- **New format support** via extensible format registry
- **Custom format definitions** for enterprise requirements
- **Format validation** and linting capabilities

**Advanced Features:**
- **Batch conversion** between formats
- **Format migration** tools for project upgrades
- **Schema validation** for format compliance

## Review

**Review Date**: 2026-01-26 (or when new major token formats emerge)
**Success Criteria**:
- Zero format-related user issues
- Successful integration with major design systems
- Positive feedback on auto-detection reliability

## Related Decisions

- **ADR-001**: Project Architecture Modernization (provides foundation)
- **Future ADRs**: May document specific format extensions or validation systems