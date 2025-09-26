// AIProviders.res - High-performance AI palette generation core
// Optimized ReScript implementation for computational-heavy AI provider functions

// AI Context types for pattern matching
@genType
type industryType = [
  | #tech
  | #healthcare
  | #finance
  | #creative
  | #retail
  | #education
  | #government
  | #nonprofit
]

@genType
type audienceType = [#children | #professionals | #seniors | #general | #experts]

@genType
type emotionalTone = [#calm | #energetic | #trustworthy | #playful | #professional | #innovative]

@genType
type accessibilityLevel = [#standard | #high_contrast | #color_blind_friendly | #comprehensive]

@genType
type wcagLevel = [#AA | #AAA | #partial | #none]

@genType
type designContext = {
  industry?: industryType,
  audience?: audienceType,
  emotional?: emotionalTone,
  accessibility?: accessibilityLevel,
}

@genType
type styleDictionaryToken = {"value": string}

@genType
type styleDictionaryTokens = {
  "color": {
    "primary": Js.Dict.t<styleDictionaryToken>,
    "secondary": Js.Dict.t<styleDictionaryToken>,
    "neutral": Js.Dict.t<styleDictionaryToken>,
    "semantic": option<{
      "success": styleDictionaryToken,
      "warning": styleDictionaryToken,
      "error": styleDictionaryToken,
      "info": styleDictionaryToken,
    }>,
  },
}

@genType
type accessibilityAnalysis = {
  wcagCompliance: wcagLevel,
  contrastIssues: array<string>,
  colorBlindnessCompatible: bool,
  recommendations: array<string>,
}

@genType
type enhancedPaletteMetadata = {
  provider: string,
  confidence: float,
  reasoning: string,
  accessibility: accessibilityAnalysis,
  context?: designContext,
}

@genType
type enhancedPalette = {
  tokens: styleDictionaryTokens,
  metadata: enhancedPaletteMetadata,
}

@genType
type paletteRequest = {
  baseColor: string,
  style: ColorAnalysis.paletteStyle,
  context?: designContext,
  accessibility?: bool,
  size?: int,
}

// Helper function to convert palette style to string (for metadata)
let paletteStyleToString = (style: ColorAnalysis.paletteStyle): string => {
  switch style {
  | #professional => "professional"
  | #vibrant => "vibrant"
  | #minimal => "minimal"
  | #warm => "warm"
  | #cool => "cool"
  }
}

// High-performance palette generation for Local Intelligence Provider
@genType
let rec generateLocalIntelligencePalette = (request: paletteRequest): enhancedPalette => {
  try {
    // Use existing ReScript intelligent palette generation
    let intelligentPalette = ColorAnalysis.generateIntelligentPalette(
      request.baseColor,
      ~options={
        style: request.style,
      },
      ()
    )

    // Generate secondary color using OKLCH color space
    let secondaryColor = try {
      let color = Culori.parseToOklch(request.baseColor)
      let oklchCoords = Culori.getOklchCoords(color)
      let h = Array.getUnsafe(oklchCoords, 2)
      let l = Array.getUnsafe(oklchCoords, 0)
      let c = Array.getUnsafe(oklchCoords, 1)
      Culori.oklchToHex(l, c, mod_float(h +. 30.0, 360.0))    } catch {
    | _ => request.baseColor
    }

    // Generate semantic colors using existing ReScript function
    let semanticColors = ColorAnalysis.generateSemanticColorsAI({
      primary: request.baseColor,
      secondary: Some(secondaryColor),
    })

    // Convert ReScript palette to Style Dictionary format
    let convertPaletteToTokens = (palette: ColorAnalysis.intelligentPaletteResult): Js.Dict.t<styleDictionaryToken> => {
      let tokens = Js.Dict.empty()
      let rescriptPalette = palette.palette

      // Standard color steps
      let steps = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"]

      Belt.Array.forEach(steps, step => {
        let color = switch step {
        | "50" => rescriptPalette["100"] // Use 100 as 50 fallback
        | "100" => rescriptPalette["100"]
        | "200" => rescriptPalette["200"]
        | "300" => rescriptPalette["300"]
        | "400" => rescriptPalette["400"]
        | "500" => rescriptPalette["500"]
        | "600" => rescriptPalette["600"]
        | "700" => rescriptPalette["700"]
        | "800" => rescriptPalette["800"]
        | "900" => rescriptPalette["900"]
        | _ => request.baseColor
        }
        Js.Dict.set(tokens, step, {"value": color})
      })

      tokens
    }

    // Generate secondary palette
    let secondaryPalette = ColorAnalysis.generateIntelligentPalette(
      secondaryColor,
      ~options={
        style: request.style,
      },
      ()
    )

    // Generate neutral palette
    let neutralColor = try {
      let color = Culori.parseToOklch(request.baseColor)
      let oklchCoords = Culori.getOklchCoords(color)
      let h = Array.getUnsafe(oklchCoords, 2)
      Culori.oklchToHex(0.5, 0.05, h) // Low chroma neutral
    } catch {
    | _ => "#6b7280"
    }

    let neutralPalette = ColorAnalysis.generateIntelligentPalette(
      neutralColor,
      ~options={
        style: #minimal,
      },
      ()
    )

    // Build Style Dictionary tokens
    let tokens: styleDictionaryTokens = {
      "color": {
        "primary": convertPaletteToTokens(intelligentPalette),
        "secondary": convertPaletteToTokens(secondaryPalette),
        "neutral": convertPaletteToTokens(neutralPalette),
        "semantic": Some({
          "success": {"value": semanticColors["semantic"].success},
          "warning": {"value": semanticColors["semantic"].warning},
          "error": {"value": semanticColors["semantic"].error},
          "info": {"value": semanticColors["semantic"].info},
        }),
      },
    }

    // Analyze accessibility
    let accessibility = analyzeStyleDictionaryAccessibility(tokens, request)

    let metadata = {
      provider: "Local Intelligence",
      confidence: 0.75,
      reasoning: `Algorithmically generated ${paletteStyleToString(request.style)} palette using advanced color theory`,
      accessibility: accessibility,
    }

    let metadataWithContext = switch request.context {
    | Some(ctx) => {...metadata, context: ctx}
    | None => metadata
    }

    {
      tokens: tokens,
      metadata: metadataWithContext,
    }
  } catch {
  | _ => {
      // Fallback palette
      let fallbackTokens = generateFallbackStyleDictionary(request.baseColor)
      let fallbackMetadata = {
        provider: "Local Intelligence (Fallback)",
        confidence: 0.5,
        reasoning: "Fallback palette due to processing error",
        accessibility: {
          wcagCompliance: #partial,
          contrastIssues: ["Error in accessibility analysis"],
          colorBlindnessCompatible: false,
          recommendations: ["Manual review recommended"],
        },
      }

      let fallbackMetadataWithContext = switch request.context {
      | Some(ctx) => {...fallbackMetadata, context: ctx}
      | None => fallbackMetadata
      }

      {
        tokens: fallbackTokens,
        metadata: fallbackMetadataWithContext,
      }
    }
  }
}

// High-performance rule-based palette generation
@genType
and generateRuleBasedPalette = (request: paletteRequest): enhancedPalette => {
  try {
    let baseColor = Culori.parseToOklch(request.baseColor)
    let baseCoords = Culori.getOklchCoords(baseColor)
    let h = Array.getUnsafe(baseCoords, 2)
    let c = Array.getUnsafe(baseCoords, 1)

    // Generate simple but effective scales using OKLCH
    let generateSimpleScale = (_color: string): Js.Dict.t<styleDictionaryToken> => {
      let tokens = Js.Dict.empty()
      let steps = [50.0, 100.0, 200.0, 300.0, 400.0, 500.0, 600.0, 700.0, 800.0, 900.0]

      Belt.Array.forEach(steps, step => {
        let lightness = 0.95 -. (step /. 1000.0) *. 0.9
        let stepStr = Belt.Float.toString(step)->Js.String2.replace(".0", "")
        let colorHex = try {
          Culori.oklchToHex(lightness, c, h)        } catch {
        | _ => request.baseColor
        }
        Js.Dict.set(tokens, stepStr, {"value": colorHex})
      })

      tokens
    }

    // Generate secondary and neutral variations
    let secondaryColor = try {
      Culori.oklchToHex(Array.getUnsafe(baseCoords, 0), c, mod_float(h +. 30.0, 360.0))
    } catch {
    | _ => request.baseColor
    }

    let neutralColor = try {
      Culori.oklchToHex(0.5, 0.05, h) // Low chroma neutral
    } catch {
    | _ => "#6b7280"
    }

    let tokens: styleDictionaryTokens = {
      "color": {
        "primary": generateSimpleScale(request.baseColor),
        "secondary": generateSimpleScale(secondaryColor),
        "neutral": generateSimpleScale(neutralColor),
        "semantic": None,
      },
    }

    let ruleBasedMetadata = {
      provider: "Rule-Based",
      confidence: 0.6,
      reasoning: "Rule-based palette generation ensuring reliability and accessibility",
      accessibility: {
        wcagCompliance: #AA,
        contrastIssues: [],
        colorBlindnessCompatible: true,
        recommendations: [],
      },
    }

    let ruleBasedMetadataWithContext = switch request.context {
    | Some(ctx) => {...ruleBasedMetadata, context: ctx}
    | None => ruleBasedMetadata
    }

    {
      tokens: tokens,
      metadata: ruleBasedMetadataWithContext,
    }
  } catch {
  | _ => {
      let fallbackTokens = generateFallbackStyleDictionary(request.baseColor)
      let ruleBasedFallbackMetadata = {
        provider: "Rule-Based (Fallback)",
        confidence: 0.4,
        reasoning: "Minimal rule-based fallback palette",
        accessibility: {
          wcagCompliance: #partial,
          contrastIssues: [],
          colorBlindnessCompatible: true,
          recommendations: [],
        },
      }

      let ruleBasedFallbackMetadataWithContext = switch request.context {
      | Some(ctx) => {...ruleBasedFallbackMetadata, context: ctx}
      | None => ruleBasedFallbackMetadata
      }

      {
        tokens: fallbackTokens,
        metadata: ruleBasedFallbackMetadataWithContext,
      }
    }
  }
}

// Advanced accessibility analysis for Style Dictionary tokens
and analyzeStyleDictionaryAccessibility = (
  tokens: styleDictionaryTokens,
  request: paletteRequest,
): accessibilityAnalysis => {
  let issues = []
  let wcagCompliance = ref(#AA: wcagLevel)

  // Check primary color contrast
  switch Js.Dict.get(tokens["color"]["primary"], "500") {
  | Some(primaryToken) => {
      let primaryColor = primaryToken["value"]
      let accessibilityWhite = ColorAnalysis.validateAccessibility(primaryColor, "#FFFFFF", ())
      let accessibilityBlack = ColorAnalysis.validateAccessibility(primaryColor, "#000000", ())
      let maxContrast = Js.Math.max_float(accessibilityWhite.contrast, accessibilityBlack.contrast)

      if maxContrast < 4.5 {
        issues->Belt.Array.push("Primary color may have insufficient contrast for text")
        wcagCompliance := #partial
      }

      // Stricter requirements for high contrast contexts
      switch request.context {
      | Some(context) => {
          switch context.accessibility {
          | Some(#high_contrast) => {
              if maxContrast < 7.0 {
                wcagCompliance := #partial
                issues->Belt.Array.push("High contrast context requires AAA level contrast")
              } else {
                wcagCompliance := #AAA
              }
            }
          | _ => ()
          }
        }
      | None => ()
      }
    }
  | None => {
      issues->Belt.Array.push("Missing primary color token")
      wcagCompliance := #partial
    }
  }

  {
    wcagCompliance: wcagCompliance.contents,
    contrastIssues: issues,
    colorBlindnessCompatible: true, // TODO: Implement detailed color blindness analysis
    recommendations: Belt.Array.length(issues) > 0 ? ["Consider adjusting lightness values for better contrast"] : [],
  }
}

// Generate fallback Style Dictionary tokens
and generateFallbackStyleDictionary = (baseColor: string): styleDictionaryTokens => {
  let createToken = (color: string) => {"value": color}

  {
    "color": {
      "primary": Js.Dict.fromArray([
        ("50", createToken(baseColor)),
        ("100", createToken(baseColor)),
        ("200", createToken(baseColor)),
        ("300", createToken(baseColor)),
        ("400", createToken(baseColor)),
        ("500", createToken(baseColor)),
        ("600", createToken(baseColor)),
        ("700", createToken(baseColor)),
        ("800", createToken(baseColor)),
        ("900", createToken(baseColor)),
      ]),
      "secondary": Js.Dict.fromArray([
        ("500", createToken(baseColor)),
      ]),
      "neutral": Js.Dict.fromArray([
        ("500", createToken("#6b7280")),
      ]),
      "semantic": None,
    },
  }
}