/**
 * PaletteGeneration.res - High-Performance Palette Generation
 * Optimized ReScript implementation for color palette algorithms
 * Expected 3-5x performance improvement over TypeScript
 */

// Color type definitions
type rgb = {r: int, g: int, b: int}
type hsl = {h: float, s: float, l: float}
type oklch = {l: float, c: float, h: float}

// Palette generation options
type paletteStyle =
  | Professional
  | Vibrant
  | Minimal
  | Warm
  | Cool

type harmonyType =
  | Analogous
  | Complementary
  | Triadic
  | Monochromatic

type paletteOptions = {
  style: paletteStyle,
  accessibility: bool,
  size: int,
}

type colorPalette = {
  "100": string,
  "200": string,
  "300": string,
  "400": string,
  "500": string,
  "600": string,
  "700": string,
  "800": string,
  "900": string,
  "1000": string,
}

// Pure functional utility functions
let rgbToHex = (color: rgb): string => {
  let componentToHex = (c: int) => {
    let hex = Js.Int.toStringWithRadix(c, ~radix=16)
    if String.length(hex) == 1 { "0" ++ hex } else { hex }
  }
  "#" ++ componentToHex(color.r) ++ componentToHex(color.g) ++ componentToHex(color.b)
}

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

// Color space conversion functions (optimized for performance)
let rgbToHsl = (color: rgb): hsl => {
  let r = Belt.Int.toFloat(color.r) /. 255.0
  let g = Belt.Int.toFloat(color.g) /. 255.0
  let b = Belt.Int.toFloat(color.b) /. 255.0

  let max = Js.Math.max_float(r, Js.Math.max_float(g, b))
  let min = Js.Math.min_float(r, Js.Math.min_float(g, b))
  let delta = max -. min

  // Lightness
  let l = (max +. min) /. 2.0

  // Saturation
  let s = if delta == 0.0 {
    0.0
  } else if l < 0.5 {
    delta /. (max +. min)
  } else {
    delta /. (2.0 -. max -. min)
  }

  // Hue
  let h = if delta == 0.0 {
    0.0
  } else if max == r {
    60.0 *. (mod_float((g -. b) /. delta, 6.0))
  } else if max == g {
    60.0 *. (((b -. r) /. delta) +. 2.0)
  } else {
    60.0 *. (((r -. g) /. delta) +. 4.0)
  }

  {h: if h < 0.0 { h +. 360.0 } else { h }, s: s, l: l}
}

let hslToRgb = (color: hsl): rgb => {
  let c = (1.0 -. abs_float(2.0 *. color.l -. 1.0)) *. color.s
  let x = c *. (1.0 -. abs_float(mod_float(color.h /. 60.0, 2.0) -. 1.0))
  let m = color.l -. c /. 2.0

  let (rPrime, gPrime, bPrime) = if color.h < 60.0 {
    (c, x, 0.0)
  } else if color.h < 120.0 {
    (x, c, 0.0)
  } else if color.h < 180.0 {
    (0.0, c, x)
  } else if color.h < 240.0 {
    (0.0, x, c)
  } else if color.h < 300.0 {
    (x, 0.0, c)
  } else {
    (c, 0.0, x)
  }

  {
    r: Belt.Float.toInt((rPrime +. m) *. 255.0),
    g: Belt.Float.toInt((gPrime +. m) *. 255.0),
    b: Belt.Float.toInt((bPrime +. m) *. 255.0)
  }
}

// Optimized lightness variation generation
let generateLightnessScale = (_baseL: float, steps: int): array<float> => {
  let stepSize = 0.9 /. Belt.Int.toFloat(steps - 1)  // From 0.05 to 0.95
  Belt.Array.makeBy(steps, (i) => {
    let normalizedStep = Belt.Int.toFloat(i) *. stepSize
    0.05 +. normalizedStep
  })
}

// Core palette generation function (3-5x optimization target)
@genType
let generateColorPalette = (baseColor: string, _steps: int): option<colorPalette> => {
  switch hexToRgb(baseColor) {
  | None => None
  | Some(baseRgb) => {
      let baseHsl = rgbToHsl(baseRgb)
      let lightnessValues = generateLightnessScale(baseHsl.l, 10)

      // Generate palette using functional approach with immutable operations
      let paletteArray = Belt.Array.mapWithIndex(lightnessValues, (index, lightness) => {
        let adjustedHsl = {...baseHsl, l: lightness}
        let adjustedRgb = hslToRgb(adjustedHsl)
        ((index + 1) * 100, rgbToHex(adjustedRgb))
      })

      // Convert array to record efficiently
      let palette = Belt.Array.reduce(paletteArray, Js.Dict.empty(), (acc, (step, color)) => {
        let stepStr = Belt.Int.toString(step)
        Js.Dict.set(acc, stepStr, color)
        acc
      })

      Some({
        "100": Belt.Option.getWithDefault(Js.Dict.get(palette, "100"), baseColor),
        "200": Belt.Option.getWithDefault(Js.Dict.get(palette, "200"), baseColor),
        "300": Belt.Option.getWithDefault(Js.Dict.get(palette, "300"), baseColor),
        "400": Belt.Option.getWithDefault(Js.Dict.get(palette, "400"), baseColor),
        "500": Belt.Option.getWithDefault(Js.Dict.get(palette, "500"), baseColor),
        "600": Belt.Option.getWithDefault(Js.Dict.get(palette, "600"), baseColor),
        "700": Belt.Option.getWithDefault(Js.Dict.get(palette, "700"), baseColor),
        "800": Belt.Option.getWithDefault(Js.Dict.get(palette, "800"), baseColor),
        "900": Belt.Option.getWithDefault(Js.Dict.get(palette, "900"), baseColor),
        "1000": Belt.Option.getWithDefault(Js.Dict.get(palette, "1000"), baseColor),
      })
    }
  }
}

// Optimized harmony generation (4-6x speedup target)
@genType
let generateHarmoniousPalette = (baseColor: string, harmonyType: string): array<string> => {
  switch hexToRgb(baseColor) {
  | None => [baseColor]
  | Some(baseRgb) => {
      let baseHsl = rgbToHsl(baseRgb)

      switch harmonyType {
      | "analogous" => {
          // Generate analogous colors (+/- 30 degrees)
          let colors = [
            hslToRgb({...baseHsl, h: mod_float(baseHsl.h -. 30.0 +. 360.0, 360.0)}),
            baseRgb,
            hslToRgb({...baseHsl, h: mod_float(baseHsl.h +. 30.0, 360.0)})
          ]
          Belt.Array.map(colors, rgbToHex)
        }
      | "complementary" => {
          let complementaryHsl = {...baseHsl, h: mod_float(baseHsl.h +. 180.0, 360.0)}
          [rgbToHex(baseRgb), rgbToHex(hslToRgb(complementaryHsl))]
        }
      | "triadic" => {
          let triadic1 = {...baseHsl, h: mod_float(baseHsl.h +. 120.0, 360.0)}
          let triadic2 = {...baseHsl, h: mod_float(baseHsl.h +. 240.0, 360.0)}
          [
            rgbToHex(baseRgb),
            rgbToHex(hslToRgb(triadic1)),
            rgbToHex(hslToRgb(triadic2))
          ]
        }
      | "monochromatic" => {
          // Generate monochromatic variations with different lightness
          let lightnessValues = [0.2, 0.4, baseHsl.l, 0.8]
          Belt.Array.map(lightnessValues, (l) => {
            rgbToHex(hslToRgb({...baseHsl, l: l}))
          })
        }
      | _ => [baseColor]
      }
    }
  }
}

// Style adjustment functions
let applyStyleAdjustments = (baseHsl: hsl, style: paletteStyle): hsl => {
  switch style {
  | Professional => baseHsl
  | Vibrant => {
      ...baseHsl,
      s: Js.Math.min_float(1.0, baseHsl.s +. 0.2),
      l: Js.Math.min_float(1.0, baseHsl.l +. 0.1)
    }
  | Minimal => {
      ...baseHsl,
      s: Js.Math.max_float(0.0, baseHsl.s -. 0.1),
      l: Js.Math.min_float(1.0, baseHsl.l +. 0.05)
    }
  | Warm => {
      ...baseHsl,
      s: Js.Math.min_float(1.0, baseHsl.s +. 0.1),
      l: Js.Math.min_float(1.0, baseHsl.l +. 0.05)
    }
  | Cool => {
      ...baseHsl,
      s: Js.Math.min_float(1.0, baseHsl.s +. 0.05),
      l: Js.Math.max_float(0.0, baseHsl.l -. 0.05)
    }
  }
}

// Intelligent palette generation with style awareness (main optimization target)
@genType
let generateIntelligentPalette = (baseColor: string, options: paletteOptions): option<colorPalette> => {
  switch hexToRgb(baseColor) {
  | None => None
  | Some(baseRgb) => {
      let baseHsl = rgbToHsl(baseRgb)
      let adjustedHsl = applyStyleAdjustments(baseHsl, options.style)
      let adjustedColor = rgbToHex(hslToRgb(adjustedHsl))

      // Use optimized generateColorPalette with style adjustments
      generateColorPalette(adjustedColor, options.size)
    }
  }
}

// Accessibility-focused contrast calculations
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

@genType
let calculateContrastRatio = (color1: rgb, color2: rgb): float => {
  let l1 = calculateRelativeLuminance(color1)
  let l2 = calculateRelativeLuminance(color2)
  let lighter = Js.Math.max_float(l1, l2)
  let darker = Js.Math.min_float(l1, l2)
  (lighter +. 0.05) /. (darker +. 0.05)
}

// Batch palette validation for accessibility
@genType
let validatePaletteAccessibility = (palette: colorPalette): bool => {
  let colors = [
    palette["100"], palette["200"], palette["300"], palette["400"], palette["500"],
    palette["600"], palette["700"], palette["800"], palette["900"], palette["1000"]
  ]

  let rgbColors = Belt.Array.keepMap(colors, hexToRgb)
  let white = {r: 255, g: 255, b: 255}
  let black = {r: 0, g: 0, b: 0}

  // Check if at least 70% of colors meet WCAG AA standards
  let accessibleCount = Belt.Array.reduce(rgbColors, 0, (count, color) => {
    let contrastWhite = calculateContrastRatio(color, white)
    let contrastBlack = calculateContrastRatio(color, black)
    let maxContrast = Js.Math.max_float(contrastWhite, contrastBlack)

    if maxContrast >= 4.5 { count + 1 } else { count }
  })

  Belt.Int.toFloat(accessibleCount) /. Belt.Int.toFloat(Belt.Array.length(rgbColors)) >= 0.7
}