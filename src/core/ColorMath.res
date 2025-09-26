// Color Mathematics - ReScript Implementation
// Provides high-performance color calculations for accessibility and intelligence

// External JavaScript Math bindings
@val external pow: (float, float) => float = "Math.pow"
@val external sqrt: float => float = "Math.sqrt"
@val external abs: float => float = "Math.abs"
@val external max: (float, float) => float = "Math.max"
@val external min: (float, float) => float = "Math.min"

@genType
type color = {
  r: float,
  g: float,
  b: float,
}

@genType
type hslColor = {
  h: float, // 0-360
  s: float, // 0-1
  l: float, // 0-1
}

@genType
type labColor = {
  l: float, // 0-100
  a: float, // -128 to 127
  b: float, // -128 to 127
}

// Helper functions for color space conversions
let private_rgbToLab = (color: color): labColor => {
  // Convert RGB to XYZ first
  let toLinear = (c: float): float => {
    if c <= 0.03928 {
      c /. 12.92
    } else {
      pow((c +. 0.055) /. 1.055, 2.4)
    }
  }

  let rLinear = toLinear(color.r /. 255.0)
  let gLinear = toLinear(color.g /. 255.0)
  let bLinear = toLinear(color.b /. 255.0)

  // Observer = 2°, Illuminant = D65
  let x = rLinear *. 0.4124564 +. gLinear *. 0.3575761 +. bLinear *. 0.1804375
  let y = rLinear *. 0.2126729 +. gLinear *. 0.7151522 +. bLinear *. 0.0721750
  let z = rLinear *. 0.0193339 +. gLinear *. 0.1191920 +. bLinear *. 0.9503041

  // Normalize by D65 illuminant
  let xn = x /. 0.95047
  let yn = y /. 1.00000
  let zn = z /. 1.08883

  let fTransform = (t: float): float => {
    if t > 0.008856 {
      pow(t, 1.0 /. 3.0)
    } else {
      (7.787 *. t) +. (16.0 /. 116.0)
    }
  }

  let fx = fTransform(xn)
  let fy = fTransform(yn)
  let fz = fTransform(zn)

  {
    l: 116.0 *. fy -. 16.0,
    a: 500.0 *. (fx -. fy),
    b: 200.0 *. (fy -. fz),
  }
}

// Delta-E CIE76 - More accurate color difference calculation
@genType
let deltaE = (color1: color, color2: color): float => {
  let lab1 = private_rgbToLab(color1)
  let lab2 = private_rgbToLab(color2)

  let deltaL = lab1.l -. lab2.l
  let deltaA = lab1.a -. lab2.a
  let deltaB = lab1.b -. lab2.b

  sqrt(deltaL *. deltaL +. deltaA *. deltaA +. deltaB *. deltaB)
}

// WCAG contrast ratio calculation
@genType
let contrastRatio = (color1: color, color2: color): float => {
  let relativeLuminance = (color: color): float => {
    let toLinear = (c: float): float => {
      let normalized = c /. 255.0
      if normalized <= 0.03928 {
        normalized /. 12.92
      } else {
        pow((normalized +. 0.055) /. 1.055, 2.4)
      }
    }

    let r = toLinear(color.r)
    let g = toLinear(color.g)
    let b = toLinear(color.b)

    0.2126 *. r +. 0.7152 *. g +. 0.0722 *. b
  }

  let lum1 = relativeLuminance(color1)
  let lum2 = relativeLuminance(color2)
  let lighter = max(lum1, lum2)
  let darker = min(lum1, lum2)

  (lighter +. 0.05) /. (darker +. 0.05)
}

// Color blindness simulation matrices
@genType
type colorBlindnessType =
  | Protanopia
  | Deuteranopia
  | Tritanopia
  | Normal

@genType
let simulateColorBlindness = (color: color, blindnessType: colorBlindnessType): color => {
  let applyMatrix = (r: float, g: float, b: float, matrix: array<array<float>>): color => {
    let row0 = Array.getUnsafe(matrix, 0)
    let row1 = Array.getUnsafe(matrix, 1)
    let row2 = Array.getUnsafe(matrix, 2)
    {
      r: r *. Array.getUnsafe(row0, 0) +. g *. Array.getUnsafe(row0, 1) +. b *. Array.getUnsafe(row0, 2),
      g: r *. Array.getUnsafe(row1, 0) +. g *. Array.getUnsafe(row1, 1) +. b *. Array.getUnsafe(row1, 2),
      b: r *. Array.getUnsafe(row2, 0) +. g *. Array.getUnsafe(row2, 1) +. b *. Array.getUnsafe(row2, 2),
    }
  }

  switch blindnessType {
  | Protanopia => applyMatrix(color.r, color.g, color.b, [
      [0.567, 0.433, 0.0],
      [0.558, 0.442, 0.0],
      [0.0, 0.242, 0.758]
    ])
  | Deuteranopia => applyMatrix(color.r, color.g, color.b, [
      [0.625, 0.375, 0.0],
      [0.7, 0.3, 0.0],
      [0.0, 0.3, 0.7]
    ])
  | Tritanopia => applyMatrix(color.r, color.g, color.b, [
      [0.95, 0.05, 0.0],
      [0.0, 0.433, 0.567],
      [0.0, 0.475, 0.525]
    ])
  | Normal => color
  }
}

// Check if colors are distinguishable for accessibility
@genType
let areColorsDistinguishable = (
  color1: color,
  color2: color,
  ~minimumDeltaE: float = 10.0,
  ~minimumContrast: float = 3.0
): bool => {
  let deltaEValue = deltaE(color1, color2)
  let contrastValue = contrastRatio(color1, color2)

  deltaEValue >= minimumDeltaE && contrastValue >= minimumContrast
}

// Advanced color harmony detection
@genType
type harmonyType =
  | Complementary
  | Analogous
  | Triadic
  | Monochromatic

@genType
let detectHarmony = (colors: array<color>): option<harmonyType> => {
  if Js.Array.length(colors) < 2 {
    None
  } else {
    // Convert to HSL for harmony analysis
    let rgbToHsl = (color: color): hslColor => {
      let r = color.r /. 255.0
      let g = color.g /. 255.0
      let b = color.b /. 255.0

      let maxVal = max(r, max(g, b))
      let minVal = min(r, min(g, b))
      let diff = maxVal -. minVal

      let l = (maxVal +. minVal) /. 2.0

      let s = if diff == 0.0 {
        0.0
      } else if l < 0.5 {
        diff /. (maxVal +. minVal)
      } else {
        diff /. (2.0 -. maxVal -. minVal)
      }

      let h = if diff == 0.0 {
        0.0
      } else if maxVal == r {
        let h = ((g -. b) /. diff) +. (g < b ? 6.0 : 0.0)
        h *. 60.0
      } else if maxVal == g {
        let h = ((b -. r) /. diff) +. 2.0
        h *. 60.0
      } else {
        let h = ((r -. g) /. diff) +. 4.0
        h *. 60.0
      }

      {h: h, s: s, l: l}
    }

    let hslColors = Js.Array.map(rgbToHsl, colors)
    let hues = Js.Array.map((hsl: hslColor) => hsl.h, hslColors)

    // Simple harmony detection logic
    if Js.Array.length(hues) == 2 {
      let hueDiff = abs(Array.getUnsafe(hues, 0) -. Array.getUnsafe(hues, 1))
      let normalizedDiff = if hueDiff > 180.0 { 360.0 -. hueDiff } else { hueDiff }

      if normalizedDiff >= 150.0 && normalizedDiff <= 210.0 {
        Some(Complementary)
      } else if normalizedDiff <= 30.0 {
        Some(Analogous)
      } else {
        None
      }
    } else {
      None
    }
  }
}

// Calculate accessibility score for a color palette
@genType
let calculateAccessibilityScore = (colors: array<color>): float => {
  let colorCount = Js.Array.length(colors)
  if colorCount < 2 {
    50.0 // Neutral score for single colors
  } else {
    let rec calculatePairs = (i: int, totalScore: float, pairCount: int): float => {
      if i >= colorCount - 1 {
        totalScore /. Belt.Int.toFloat(pairCount)
      } else {
        let rec calculateInnerPairs = (j: int, currentTotal: float, currentCount: int): (float, int) => {
          if j >= colorCount {
            (currentTotal, currentCount)
          } else {
            let contrast = contrastRatio(Array.getUnsafe(colors, i), Array.getUnsafe(colors, j))
            let deltaEValue = deltaE(Array.getUnsafe(colors, i), Array.getUnsafe(colors, j))

            // Score based on WCAG compliance and perceptual difference
            let pairScore = if contrast >= 7.0 && deltaEValue >= 15.0 {
              100.0 // Excellent
            } else if contrast >= 4.5 && deltaEValue >= 10.0 {
              80.0  // Good
            } else if contrast >= 3.0 && deltaEValue >= 5.0 {
              60.0  // Fair
            } else {
              20.0  // Poor
            }

            calculateInnerPairs(j + 1, currentTotal +. pairScore, currentCount + 1)
          }
        }

        let (newTotal, newCount) = calculateInnerPairs(i + 1, totalScore, pairCount)
        calculatePairs(i + 1, newTotal, newCount)
      }
    }

    calculatePairs(0, 0.0, 0)
  }
}