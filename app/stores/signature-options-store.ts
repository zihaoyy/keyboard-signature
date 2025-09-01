import {create} from 'zustand'
import {ISignature, KeyboardLayout, StrokeStyle} from "@/app/types/signature";
import {devtools} from "zustand/middleware";

interface SignatureState {
  signatureOptions: ISignature
}

interface SignatureActions {
  setSignatureOptions: (signatureOptions: ISignature) => void
  resetSignature: () => void
}

const signatureOptions = {
  keyboardLayout: KeyboardLayout.QWERTY,
  curveType: "linear",
  includeNumbers: false,
  strokeConfig: {
    style: StrokeStyle.SOLID,
    color: "#ffffff",
    gradientStart: "#ff6b6b",
    gradientEnd: "#4ecdc4",
    width: 3,
  }
}

export const useSignatureOptionsStore = create<SignatureState & SignatureActions>()(devtools(((set, get, store) => ({
  signatureOptions,
  setSignatureOptions: (signatureOptions) => set((state) => ({signatureOptions})),
  resetSignature: () => set(store.getInitialState()),
}))))
