export enum KeyboardLayout {
  QWERTY = 'qwerty',
  COLEMAK = 'colemak',
  DVORAK = 'dvorak',
  AZERTY = 'azerty',
  ABCDEF = 'abcdef',
}

export enum CurveType {
  LINEAR = 'linear',
  CATMULL_ROM = 'catmull-rom',
  QUADRATIC_BEZIER = 'quadratic-bezier',
  CUBIC_BEZIER = 'cubic-bezier',
  SIMPLE_CURVE = 'simple-curve'
}


export enum StrokeStyle {
  SOLID = 'solid',
  GRADIENT = 'gradient',
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

export interface ClaimedSignature {
  id: string;
  name: string;
  signature_path: string;
  claimed_by_user_id: string;
  claimed_by_username: string;
  claimed_by_avatar: string | null;
  stroke_config: StrokeConfig;
  include_numbers: boolean;
  created_at: string;
  curve_type: CurveType;
  keyboard_layout: KeyboardLayout;
}