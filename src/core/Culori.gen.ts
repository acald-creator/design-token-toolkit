/* TypeScript file generated from Culori.res by genType. */

/* eslint-disable */
/* tslint:disable */

import * as CuloriJS from './Culori.res.mjs';

export type color = {
  readonly mode: string; 
  readonly l: (undefined | number); 
  readonly c: (undefined | number); 
  readonly h: (undefined | number); 
  readonly r: (undefined | number); 
  readonly g: (undefined | number); 
  readonly b: (undefined | number); 
  readonly alpha: (undefined | number)
};

export type coords = number[];

export const oklch: (l:number, c:number, h:number) => color = CuloriJS.oklch as any;

export const oklchWithAlpha: (l:number, c:number, h:number, alpha:number) => color = CuloriJS.oklchWithAlpha as any;

export const getOklchCoords: (color:color) => coords = CuloriJS.getOklchCoords as any;

export const toHex: (color:color) => string = CuloriJS.toHex as any;

export const parseToOklch: (hexString:string) => color = CuloriJS.parseToOklch as any;

export const oklchToHex: (l:number, c:number, h:number) => string = CuloriJS.oklchToHex as any;

export const setOklchLightness: (color:color, lightness:number) => color = CuloriJS.setOklchLightness as any;

export const setOklchChroma: (color:color, chroma:number) => color = CuloriJS.setOklchChroma as any;

export const setOklchHue: (color:color, hue:number) => color = CuloriJS.setOklchHue as any;
