import {create} from 'zustand'
import {devtools} from 'zustand/middleware';
import {CurveType, ISignature, KeyboardLayout, StrokeStyle} from '@/types/signature';

interface SignatureState {
  signatureOptions: ISignature
}

interface SignatureActions {
  setSignatureOptions: (signatureOptions: ISignature) => void
  resetSignature: () => void
  resetSignatureStrokeConfig: () => void
}

const strokeConfig = {
  style: StrokeStyle.SOLID,
  color: '#ffffff',
  gradientStart: '#ff6b6b',
  gradientEnd: '#4ecdc4',
  width: 3,
}

const signatureOptions = {
  keyboardLayout: KeyboardLayout.QWERTY,
  curveType: CurveType.LINEAR,
  includeNumbers: false,
  strokeConfig,
}

export const useSignatureOptionsStore = create<SignatureState & SignatureActions>()(devtools(((set, get, store) => ({
  signatureOptions,
  setSignatureOptions: (signatureOptions) => set((state) => ({signatureOptions})),
  resetSignature: () => set(store.getInitialState()),
  resetSignatureStrokeConfig: () => set((state) => ({
    ...state,
    signatureOptions: {
      ...state.signatureOptions,
    },
    strokeConfig
  }))
}))))
