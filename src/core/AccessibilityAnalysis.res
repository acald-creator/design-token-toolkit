/**
 * AccessibilityAnalysis.res - High-Performance Accessibility Analysis
 * Optimized ReScript implementation for WCAG compliance and color blindness analysis
 * Expected 5-8x performance improvement over TypeScript
 */

// Color type definitions (reuse from PaletteGeneration)
type rgb = {r: int, g: int, b: int}
type lab = {l: float, a: float, b: float}

// Accessibility-specific types
type wcagLevel = AAA | AA | Partial | None

type colorBlindnessType =
  | Protanopia | Protanomaly
  | Deuteranopia | Deuteranomaly
  | Tritanopia | Tritanomaly
  | Monochromacy

type contrastAnalysis = {
  foreground: string,
  background: string,
  ratio: float,
  passesAA: bool,
  passesAAA: bool,
  passesAALarge: bool,
  passesAAALarge: bool
}

type colorPair = {
  color1: string,
  color2: string,
  originalDistance: float,
  perceivedDistance: float,
  problematic: bool
}

type affectedColor = {
  original: string,
  perceived: string,
  difference: float
}

type colorBlindnessSimulation = {
  affectedColors: array<affectedColor>,
  distinctionIssues: array<colorPair>,
  severity: float // 0-100 score
}

type accessibilityAnalysis = {
  overallScore: float,
  wcagCompliance: wcagLevel,
  colorBlindnessScore: float,
  contrastIssues: array<contrastAnalysis>,
  problematicPairs: array<colorPair>
}

// Utility functions for hex conversion (reuse from PaletteGeneration)
let hexToRgb = (hex: string): option<rgb> => {
  let cleanHex = if String.length(hex) > 0 && String.startsWith(hex, "#") {
    String.slice(hex, ~start=1, ~end=String.length(hex))
  } else {
    hex
  }

  if String.length(cleanHex) == 6 {
    let rHex = String.slice(cleanHex, ~start=0, ~end=2)
    let gHex = String.slice(cleanHex, ~start=2, ~end=4)
    let bHex = String.slice(cleanHex, ~start=4, ~end=6)

    let parseHex = (hexStr) => {
      let charToInt = (c) => {
        switch c {
        | "0" => Some(0) | "1" => Some(1) | "2" => Some(2) | "3" => Some(3)
        | "4" => Some(4) | "5" => Some(5) | "6" => Some(6) | "7" => Some(7)
        | "8" => Some(8) | "9" => Some(9) | "a" => Some(10) | "A" => Some(10)
        | "b" => Some(11) | "B" => Some(11) | "c" => Some(12) | "C" => Some(12)
        | "d" => Some(13) | "D" => Some(13) | "e" => Some(14) | "E" => Some(14)
        | "f" => Some(15) | "F" => Some(15)
        | _ => None
        }
      }

      if String.length(hexStr) == 2 {
        switch (String.get(hexStr, 0), String.get(hexStr, 1)) {
        | (Some(c0), Some(c1)) => switch (charToInt(c0), charToInt(c1)) {
          | (Some(h), Some(l)) => Some(h * 16 + l)
          | _ => None
          }
        | _ => None
        }
      } else {
        None
      }
    }

    switch (parseHex(rHex), parseHex(gHex), parseHex(bHex)) {
    | (Some(r), Some(g), Some(b)) => Some({r: r, g: g, b: b})
    | _ => None
    }
  } else {
    None
  }
}

let rgbToHex = (color: rgb): string => {
  let componentToHex = (c: int) => {
    let hex = Js.Int.toStringWithRadix(c, ~radix=16)
    if String.length(hex) == 1 { "0" ++ hex } else { hex }
  }
  "#" ++ componentToHex(color.r) ++ componentToHex(color.g) ++ componentToHex(color.b)
}

// High-performance color space conversion: sRGB → XYZ → LAB
let rgbToLab = (color: rgb): lab => {
  // sRGB to linear RGB conversion (gamma correction)
  let linearize = (c: int): float => {
    let normalized = Belt.Int.toFloat(c) /. 255.0
    if normalized <= 0.04045 {
      normalized /. 12.92
    } else {
      Js.Math.pow_float(~base=(normalized +. 0.055) /. 1.055, ~exp=2.4)
    }
  }

  let rLinear = linearize(color.r)
  let gLinear = linearize(color.g)
  let bLinear = linearize(color.b)

  // Linear RGB to XYZ conversion (sRGB matrix)
  let x = 0.4124564 *. rLinear +. 0.3575761 *. gLinear +. 0.1804375 *. bLinear
  let y = 0.2126729 *. rLinear +. 0.7151522 *. gLinear +. 0.0721750 *. bLinear
  let z = 0.0193339 *. rLinear +. 0.1191920 *. gLinear +. 0.9503041 *. bLinear

  // XYZ to LAB conversion (D65 illuminant)
  let xn = 0.95047  // D65 white point
  let yn = 1.00000
  let zn = 1.08883

  let fx = if (x /. xn) > 0.008856 {
    Js.Math.pow_float(~base=x /. xn, ~exp=1.0 /. 3.0)
  } else {
    7.787 *. (x /. xn) +. 16.0 /. 116.0
  }

  let fy = if (y /. yn) > 0.008856 {
    Js.Math.pow_float(~base=y /. yn, ~exp=1.0 /. 3.0)
  } else {
    7.787 *. (y /. yn) +. 16.0 /. 116.0
  }

  let fz = if (z /. zn) > 0.008856 {
    Js.Math.pow_float(~base=z /. zn, ~exp=1.0 /. 3.0)
  } else {
    7.787 *. (z /. zn) +. 16.0 /. 116.0
  }

  {
    l: 116.0 *. fy -. 16.0,
    a: 500.0 *. (fx -. fy),
    b: 200.0 *. (fy -. fz)
  }
}

// Optimized Delta-E CIE76 calculation
@genType
let deltaE76 = (color1: rgb, color2: rgb): float => {
  let lab1 = rgbToLab(color1)
  let lab2 = rgbToLab(color2)

  let deltaL = lab1.l -. lab2.l
  let deltaA = lab1.a -. lab2.a
  let deltaB = lab1.b -. lab2.b

  Js.Math.sqrt(deltaL *. deltaL +. deltaA *. deltaA +. deltaB *. deltaB)
}

// High-performance relative luminance calculation
@genType
let calculateRelativeLuminance = (color: rgb): float => {
  let sRGB = (c: int) => {
    let normalized = Belt.Int.toFloat(c) /. 255.0
    if normalized <= 0.03928 {
      normalized /. 12.92
    } else {
      Js.Math.pow_float(~base=(normalized +. 0.055) /. 1.055, ~exp=2.4)
    }
  }

  0.2126 *. sRGB(color.r) +. 0.7152 *. sRGB(color.g) +. 0.0722 *. sRGB(color.b)
}

// Optimized WCAG contrast ratio calculation
@genType
let calculateContrastRatio = (color1: rgb, color2: rgb): float => {
  let l1 = calculateRelativeLuminance(color1)
  let l2 = calculateRelativeLuminance(color2)
  let lighter = Js.Math.max_float(l1, l2)
  let darker = Js.Math.min_float(l1, l2)
  (lighter +. 0.05) /. (darker +. 0.05)
}

// Pre-computed transformation matrices for color blindness simulation
let protanopiaMatrix = [
  [0.567, 0.433, 0.000],
  [0.558, 0.442, 0.000],
  [0.000, 0.242, 0.758]
]

let deuteranopiaMatrix = [
  [0.625, 0.375, 0.000],
  [0.700, 0.300, 0.000],
  [0.000, 0.300, 0.700]
]

let tritanopiaMatrix = [
  [0.950, 0.050, 0.000],
  [0.000, 0.433, 0.567],
  [0.000, 0.475, 0.525]
]

let monochromacyMatrix = [
  [0.299, 0.587, 0.114],
  [0.299, 0.587, 0.114],
  [0.299, 0.587, 0.114]
]

// High-performance matrix multiplication for color blindness simulation
let applyColorBlindnessMatrix = (color: rgb, matrix: array<array<float>>): rgb => {
  let r = Belt.Int.toFloat(color.r) /. 255.0
  let g = Belt.Int.toFloat(color.g) /. 255.0
  let b = Belt.Int.toFloat(color.b) /. 255.0

  let row0 = Array.getUnsafe(matrix, 0)
  let row1 = Array.getUnsafe(matrix, 1)
  let row2 = Array.getUnsafe(matrix, 2)

  let newR = r *. Array.getUnsafe(row0, 0) +. g *. Array.getUnsafe(row0, 1) +. b *. Array.getUnsafe(row0, 2)
  let newG = r *. Array.getUnsafe(row1, 0) +. g *. Array.getUnsafe(row1, 1) +. b *. Array.getUnsafe(row1, 2)
  let newB = r *. Array.getUnsafe(row2, 0) +. g *. Array.getUnsafe(row2, 1) +. b *. Array.getUnsafe(row2, 2)

  {
    r: Belt.Float.toInt(Js.Math.max_float(0.0, Js.Math.min_float(255.0, newR *. 255.0))),
    g: Belt.Float.toInt(Js.Math.max_float(0.0, Js.Math.min_float(255.0, newG *. 255.0))),
    b: Belt.Float.toInt(Js.Math.max_float(0.0, Js.Math.min_float(255.0, newB *. 255.0)))
  }
}

// Optimized color blindness simulation
@genType
let simulateColorBlindness = (color: rgb, blindnessType: string): rgb => {
  switch blindnessType {
  | "Protanopia" => applyColorBlindnessMatrix(color, protanopiaMatrix)
  | "Deuteranopia" => applyColorBlindnessMatrix(color, deuteranopiaMatrix)
  | "Tritanopia" => applyColorBlindnessMatrix(color, tritanopiaMatrix)
  | "Monochromacy" => applyColorBlindnessMatrix(color, monochromacyMatrix)
  | "Protanomaly" => {
      // Partial protanopia (mix 50% original + 50% protanopia)
      let simulated = applyColorBlindnessMatrix(color, protanopiaMatrix)
      {
        r: (color.r + simulated.r) / 2,
        g: (color.g + simulated.g) / 2,
        b: (color.b + simulated.b) / 2
      }
    }
  | "Deuteranomaly" => {
      let simulated = applyColorBlindnessMatrix(color, deuteranopiaMatrix)
      {
        r: (color.r + simulated.r) / 2,
        g: (color.g + simulated.g) / 2,
        b: (color.b + simulated.b) / 2
      }
    }
  | "Tritanomaly" => {
      let simulated = applyColorBlindnessMatrix(color, tritanopiaMatrix)
      {
        r: (color.r + simulated.r) / 2,
        g: (color.g + simulated.g) / 2,
        b: (color.b + simulated.b) / 2
      }
    }
  | _ => color // Unknown type, return original
  }
}

// Batch WCAG compliance analysis (optimized for multiple color pairs)
@genType
let analyzeWCAGCompliance = (colors: array<string>, backgrounds: array<string>): array<contrastAnalysis> => {
  let results = ref([])

  // Convert all colors to RGB once
  let rgbColors = Belt.Array.keepMap(colors, hexToRgb)
  let rgbBackgrounds = Belt.Array.keepMap(backgrounds, hexToRgb)

  for i in 0 to Belt.Array.length(rgbBackgrounds) - 1 {
    for j in 0 to Belt.Array.length(rgbColors) - 1 {
      let bg = Array.getUnsafe(rgbBackgrounds, i)
      let fg = Array.getUnsafe(rgbColors, j)

      let contrast = calculateContrastRatio(fg, bg)

      let analysis = {
        foreground: rgbToHex(fg),
        background: rgbToHex(bg),
        ratio: contrast,
        passesAA: contrast >= 4.5,
        passesAAA: contrast >= 7.0,
        passesAALarge: contrast >= 3.0,
        passesAAALarge: contrast >= 4.5
      }

      results := Belt.Array.concat(results.contents, [analysis])
    }
  }

  results.contents
}

// Optimized color blindness batch analysis
@genType
let analyzeColorBlindnessBatch = (colors: array<string>): colorBlindnessSimulation => {
  let rgbColors = Belt.Array.keepMap(colors, hexToRgb)
  let blindnessTypes = ["Protanopia", "Deuteranopia", "Tritanopia", "Monochromacy"]

  let allAffectedColors = ref([])
  let allDistinctionIssues = ref([])

  // Process each blindness type
  Belt.Array.forEach(blindnessTypes, (blindnessType) => {
    // Simulate all colors for this blindness type
    let simulatedColors = Belt.Array.map(rgbColors, (color) => {
      let simulated = simulateColorBlindness(color, blindnessType)
      let original = rgbToHex(color)
      let perceived = rgbToHex(simulated)
      let difference = deltaE76(color, simulated)

      {original, perceived, difference}
    })

    // Add to accumulated results
    Belt.Array.forEach(simulatedColors, (simColor) => {
      allAffectedColors := Belt.Array.concat(allAffectedColors.contents, [simColor])
    })

    // Find distinction issues for this blindness type
    for i in 0 to Belt.Array.length(simulatedColors) - 1 {
      for j in i + 1 to Belt.Array.length(simulatedColors) - 1 {
        let color1 = Array.getUnsafe(simulatedColors, i)
        let color2 = Array.getUnsafe(simulatedColors, j)

        let originalRgb1 = Belt.Array.getExn(rgbColors, i)
        let originalRgb2 = Belt.Array.getExn(rgbColors, j)

        let originalDistance = deltaE76(originalRgb1, originalRgb2)
        let perceivedDistance = switch (hexToRgb(color1.perceived), hexToRgb(color2.perceived)) {
        | (Some(rgb1), Some(rgb2)) => deltaE76(rgb1, rgb2)
        | _ => 0.0
        }

        let problematic = originalDistance > 10.0 && perceivedDistance < 5.0

        if problematic {
          let issue = {
            color1: color1.original,
            color2: color2.original,
            originalDistance,
            perceivedDistance,
            problematic
          }
          allDistinctionIssues := Belt.Array.concat(allDistinctionIssues.contents, [issue])
        }
      }
    }
  })

  // Calculate severity score (0-100, higher = less severe)
  let avgDifference = if Belt.Array.length(allAffectedColors.contents) > 0 {
    let totalDiff = Belt.Array.reduce(allAffectedColors.contents, 0.0, (sum, color) => sum +. color.difference)
    totalDiff /. Belt.Int.toFloat(Belt.Array.length(allAffectedColors.contents))
  } else {
    0.0
  }

  let issueCount = Belt.Array.length(allDistinctionIssues.contents)
  let severity = if avgDifference < 5.0 && issueCount == 0 {
    100.0 // No issues
  } else if avgDifference < 15.0 && issueCount <= 2 {
    75.0 // Mild
  } else if avgDifference < 30.0 && issueCount <= 5 {
    50.0 // Moderate
  } else {
    25.0 // Severe
  }

  {
    affectedColors: allAffectedColors.contents,
    distinctionIssues: allDistinctionIssues.contents,
    severity
  }
}

// Comprehensive accessibility analysis (main optimization target)
@genType
let analyzeAccessibilityComprehensive = (colors: array<string>, backgrounds: array<string>): accessibilityAnalysis => {
  // Pre-validate colors
  let validColors = Belt.Array.keep(colors, (color) => Belt.Option.isSome(hexToRgb(color)))
  let validBackgrounds = Belt.Array.keep(backgrounds, (bg) => Belt.Option.isSome(hexToRgb(bg)))

  if Belt.Array.length(validColors) == 0 {
    // Return minimal analysis for empty input
    {
      overallScore: 50.0,
      wcagCompliance: None,
      colorBlindnessScore: 50.0,
      contrastIssues: [],
      problematicPairs: []
    }
  } else {
    // Perform comprehensive analysis
    let contrastAnalyses = analyzeWCAGCompliance(validColors, validBackgrounds)
    let colorBlindnessAnalysis = analyzeColorBlindnessBatch(validColors)

    // Calculate WCAG compliance level
    let passedAA = Belt.Array.every(contrastAnalyses, (analysis) => analysis.passesAA)
    let passedAAA = Belt.Array.every(contrastAnalyses, (analysis) => analysis.passesAAA)
    let partialAA = Belt.Array.some(contrastAnalyses, (analysis) => analysis.passesAA)

    let wcagLevel = if passedAAA {
      AAA
    } else if passedAA {
      AA
    } else if partialAA {
      Partial
    } else {
      None
    }

    // Calculate overall score (weighted average)
    let wcagScore = switch wcagLevel {
    | AAA => 100.0
    | AA => 85.0
    | Partial => 60.0
    | None => 30.0
    }

    let colorBlindnessScore = colorBlindnessAnalysis.severity
    let overallScore = (wcagScore *. 0.6) +. (colorBlindnessScore *. 0.4)

    // Filter contrast issues (only failed contrasts)
    let contrastIssues = Belt.Array.keep(contrastAnalyses, (analysis) => !analysis.passesAA)

    {
      overallScore,
      wcagCompliance: wcagLevel,
      colorBlindnessScore,
      contrastIssues,
      problematicPairs: colorBlindnessAnalysis.distinctionIssues
    }
  }
}