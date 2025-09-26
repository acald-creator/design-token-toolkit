// Culori.res - ReScript bindings for culori (high-performance color library)
// Replacing colorjs.io for 21x faster OKLCH operations

// Core color type - culori uses objects
@genType
type color = {
  mode: string,
  l: option<float>,
  c: option<float>,
  h: option<float>,
  r: option<float>,
  g: option<float>,
  b: option<float>,
  alpha: option<float>,
}

// Color coordinates array
@genType
type coords = array<float>

// Parse hex/color string to culori color object
@genType
@module("culori")
external parseColor: string => color = "parse"

// Convert color to hex string
@genType
@module("culori")
external formatHex: color => string = "formatHex"

// Convert to OKLCH color space
@genType
@module("culori")
external convertToOklch: color => color = "oklch"

// Convert to RGB color space
@genType
@module("culori")
external convertToRgb: color => color = "rgb"

// OKLCH constructor
@genType
let oklch = (l: float, c: float, h: float): color => {
  mode: "oklch",
  l: Some(l),
  c: Some(c),
  h: Some(h),
  r: None,
  g: None,
  b: None,
  alpha: Some(1.0),
}

// OKLCH with alpha
@genType
let oklchWithAlpha = (l: float, c: float, h: float, alpha: float): color => {
  mode: "oklch",
  l: Some(l),
  c: Some(c),
  h: Some(h),
  r: None,
  g: None,
  b: None,
  alpha: Some(alpha),
}

// Helper to get OKLCH coordinates as array
@genType
let getOklchCoords = (color: color): coords => {
  let oklchColor = convertToOklch(color)
  switch (oklchColor.l, oklchColor.c, oklchColor.h) {
  | (Some(l), Some(c), Some(h)) => [l, c, h]
  | _ => [0.5, 0.1, 0.0] // Fallback values
  }
}

// Convert to hex string
@genType
let toHex = (color: color): string => {
  try {
    formatHex(color)
  } catch {
  | _ => "#000000" // Fallback for invalid colors
  }
}

// Create color from hex and convert to OKLCH
@genType
let parseToOklch = (hexString: string): color => {
  parseColor(hexString)->convertToOklch
}

// Convert OKLCH to hex
@genType
let oklchToHex = (l: float, c: float, h: float): string => {
  oklch(l, c, h)->toHex
}

// Set OKLCH lightness
@genType
let setOklchLightness = (color: color, lightness: float): color => {
  let oklchColor = convertToOklch(color)
  switch (oklchColor.c, oklchColor.h) {
  | (Some(c), Some(h)) => oklch(lightness, c, h)
  | _ => oklch(lightness, 0.1, 0.0) // Fallback
  }
}

// Set OKLCH chroma
@genType
let setOklchChroma = (color: color, chroma: float): color => {
  let oklchColor = convertToOklch(color)
  switch (oklchColor.l, oklchColor.h) {
  | (Some(l), Some(h)) => oklch(l, chroma, h)
  | _ => oklch(0.5, chroma, 0.0) // Fallback
  }
}

// Set OKLCH hue
@genType
let setOklchHue = (color: color, hue: float): color => {
  let oklchColor = convertToOklch(color)
  switch (oklchColor.l, oklchColor.c) {
  | (Some(l), Some(c)) => oklch(l, c, hue)
  | _ => oklch(0.5, 0.1, hue) // Fallback
  }
}