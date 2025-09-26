/* TypeScript file generated from ColorJsIo.res by genType. */

/* eslint-disable */
/* tslint:disable */

import * as ColorJsIoJS from './ColorJsIo.res.mjs';

export abstract class color { protected opaque!: any }; /* simulate opaque types */

export type colorSpace = "srgb" | "p3" | "oklch" | "lch" | "lab" | "oklab";

export type coords = number[];

export type colorObject = {
  readonly space: colorSpace; 
  readonly coords: coords; 
  readonly alpha: (undefined | number)
};

export type interpolationOptions = {
  readonly space?: colorSpace; 
  readonly outputSpace?: colorSpace; 
  readonly hue?: 
    "increasing"
  | "shorter"
  | "longer"
  | "decreasing"
};

export const toOklch: (c:color) => color = ColorJsIoJS.toOklch as any;

export const getOklchCoords: (c:color) => coords = ColorJsIoJS.getOklchCoords as any;

export const setOklchLightness: (c:color, l:number) => color = ColorJsIoJS.setOklchLightness as any;

export const setOklchChroma: (c:color, chroma:number) => color = ColorJsIoJS.setOklchChroma as any;

export const setOklchHue: (c:color, hue:number) => color = ColorJsIoJS.setOklchHue as any;

export const toP3: (c:color) => color = ColorJsIoJS.toP3 as any;

export const getP3Coords: (c:color) => coords = ColorJsIoJS.getP3Coords as any;

export const oklch: (l:number, c:number, h:number) => color = ColorJsIoJS.oklch as any;

export const oklchWithAlpha: (l:number, c:number, h:number, alpha:number) => color = ColorJsIoJS.oklchWithAlpha as any;

export const p3: (r:number, g:number, b:number) => color = ColorJsIoJS.p3 as any;

export const p3WithAlpha: (r:number, g:number, b:number, alpha:number) => color = ColorJsIoJS.p3WithAlpha as any;

export const parseColor: (colorString:string) => color = ColorJsIoJS.parseColor as any;

export const toHex: (c:color) => string = ColorJsIoJS.toHex as any;

export const toOklchString: (c:color) => string = ColorJsIoJS.toOklchString as any;

export const toP3String: (c:color) => string = ColorJsIoJS.toP3String as any;
