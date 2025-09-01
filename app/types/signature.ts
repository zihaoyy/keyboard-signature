export enum KeyboardLayout {
  QWERTY = "qwerty",
  COLEMAK = "colemak",
  DVORAK = "dvorak",
  AZERTY = "azerty",
  ABCDEF = "abcdef",
}

export type CurveType =
  | "linear"
  | "catmull-rom"
  | "quadratic-bezier"
  | "cubic-bezier"
  | "simple-curve";


export enum StrokeStyle {
  SOLID = "solid",
  GRADIENT = "gradient",
}

export interface StrokeConfig {
  style: StrokeStyle
  color: string
  gradientStart: string
  gradientEnd: string
  width: number
}

export interface ISignature {
  keyboardLayout: KeyboardLayout
  curveType: CurveType
  includeNumbers: boolean
  strokeConfig: StrokeConfig
}