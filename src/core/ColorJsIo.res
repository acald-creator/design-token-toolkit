// ColorJsIo.res - ReScript bindings for colorjs.io OKLCH and P3 support

// Core Color type
@genType
type color

// Color space identifiers
@genType
type colorSpace = [#"srgb" | #"p3" | #"oklch" | #"lch" | #"lab" | #"oklab"]

// Color coordinates (generic)
@genType
type coords = array<float>

// Color object structure
@genType
type colorObject = {
  space: colorSpace,
  coords: coords,
  alpha: option<float>,
}

// Create Color instances
@genType
@module("colorjs.io") @new
external make: string => color = "default"

@genType
@module("colorjs.io") @new
external makeFromObject: colorObject => color = "default"

// Basic operations
@genType
@send external toString: color => string = "toString"

@genType
@send external to: (color, colorSpace) => color = "to"

@genType
@send external clone: color => color = "clone"

// Get coordinates in current space
@genType
@get external getCoords: color => coords = "coords"

// Get current color space
@genType
@get external getSpace: color => colorSpace = "space"

// Set coordinates (generic) - colorjs.io .set() expects object with individual coordinate properties
@genType
@send external setOklchCoords: (color, {"l": float, "c": float, "h": float}) => color = "set"

@genType
@send external setP3Coords: (color, {"r": float, "g": float, "b": float}) => color = "set"

// OKLCH-specific operations
@genType
let toOklch = (c: color) => c->to(#oklch)

@genType
let getOklchCoords = (c: color) => c->toOklch->getCoords

@genType
let setOklchLightness = (c: color, l: float) => {
  let oklch = c->toOklch
  let coords = oklch->getCoords
  oklch->setOklchCoords({"l": l, "c": Array.getUnsafe(coords, 1), "h": Array.getUnsafe(coords, 2)})
}

@genType
let setOklchChroma = (c: color, chroma: float) => {
  let oklch = c->toOklch
  let coords = oklch->getCoords
  oklch->setOklchCoords({"l": Array.getUnsafe(coords, 0), "c": chroma, "h": Array.getUnsafe(coords, 2)})
}

@genType
let setOklchHue = (c: color, hue: float) => {
  let oklch = c->toOklch
  let coords = oklch->getCoords
  oklch->setOklchCoords({"l": Array.getUnsafe(coords, 0), "c": Array.getUnsafe(coords, 1), "h": hue})
}

// P3-specific operations
@genType
let toP3 = (c: color) => c->to(#p3)

@genType
let getP3Coords = (c: color) => c->toP3->getCoords

// Gamut mapping
@genType
@send external toGamut: (color, colorSpace) => color = "toGamut"

// Check if in gamut
@genType
@send external inGamut: (color, colorSpace) => bool = "inGamut"

// Color difference (DeltaE) - using proper colorjs.io API
@genType
@send external deltaE: (color, color, string) => float = "deltaE"

// Contrast ratio
@genType
@send external contrast: (color, color, string) => float = "contrast"

// Interpolation
@genType
type interpolationOptions = {
  space?: colorSpace,
  outputSpace?: colorSpace,
  hue?: [#shorter | #longer | #increasing | #decreasing],
}

@genType
@send external mix: (color, color, float, interpolationOptions) => color = "mix"

// Range/interpolation functions
@genType
@send external range: (color, color, interpolationOptions) => (float => color) = "range"

// Utility functions
@genType
let oklch = (l: float, c: float, h: float) => {
  makeFromObject({
    space: #oklch,
    coords: [l, c, h],
    alpha: Some(1.0),
  })
}

@genType
let oklchWithAlpha = (l: float, c: float, h: float, alpha: float) => {
  makeFromObject({
    space: #oklch,
    coords: [l, c, h],
    alpha: Some(alpha),
  })
}

@genType
let p3 = (r: float, g: float, b: float) => {
  makeFromObject({
    space: #p3,
    coords: [r, g, b],
    alpha: Some(1.0),
  })
}

@genType
let p3WithAlpha = (r: float, g: float, b: float, alpha: float) => {
  makeFromObject({
    space: #p3,
    coords: [r, g, b],
    alpha: Some(alpha),
  })
}

// Parse any color string
@genType
let parseColor = (colorString: string) => make(colorString)

// Convert to different formats
@genType
let toHex = (c: color) => c->to(#"srgb")->toString

@genType
let toOklchString = (c: color) => c->toOklch->toString

@genType
let toP3String = (c: color) => c->toP3->toString

// Example usage:
// Create OKLCH color
// let myColor = oklch(0.7, 0.15, 120.0, 1.0)

// Convert to P3
// let p3Color = myColor->toP3

// Mix colors
// let mixed = myColor->mix(anotherColor, 0.5, {space: #oklch})

// Get string representation
// let cssString = myColor->toString