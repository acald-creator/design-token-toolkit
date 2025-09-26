/* TypeScript file for ReScript Js module types */

// Basic JSON type for ReScript Js.Json.t
export type Json_t = any;

// Date type for Js.Date
export type Date_t = Date;

// Dictionary type for Js.Dict
export type Dict_t<T> = Record<string, T>;

// Console type for Js.Console
export type Console = {
  log: (message: any) => void;
  warn: (message: any) => void;
  error: (message: any) => void;
};

// Math type for Js.Math
export type Math = {
  max_float: (a: number, b: number) => number;
  min_float: (a: number, b: number) => number;
};

// Export commonly used types
export type t = Json_t;