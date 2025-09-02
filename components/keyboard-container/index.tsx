'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import {
  generatePath,
  getKeyboardLayout,
} from '@/utils/constants';
import DetailModal from '@/components/detail-modal';
import {
  useSignatureByName,
} from '@/hooks/useSignaturesQuery';
import {useDebounce} from '@/hooks/useDebounce';
import Options from '@/components/options';
import Keyboard from '@/components/keyboard';
import Search from '@/components/search';
import ConnectGithub from '@/components/connect-github';
import SignatureButtons from '@/components/signature-buttons';
import {useSignatureOptionsStore} from '@/stores/signature-options-store';
import {ClaimedSignature} from '@/types/signature';

interface KeyboardSignatureProps {
  allowedClaimCount?: number;
}

export default function KeyboardContainer({allowedClaimCount = 1}: KeyboardSignatureProps) {
  const [name, setName] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const {signatureOptions, setSignatureOptions, resetSignatureStrokeConfig} = useSignatureOptionsStore(state => state);

  // Debounce only the API requests, not signature generation
  const debouncedName = useDebounce(name, 300); // 300ms delay for API calls only

  const [selectedSignature, setSelectedSignature] =
    useState<ClaimedSignature | null>(null);

  const {data: existingSignature} = useSignatureByName(debouncedName); // API call debounced

  const inputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Match the existing signature
    if (existingSignature) {
      setSignatureOptions({
        ...signatureOptions,
        strokeConfig: {
          ...signatureOptions.strokeConfig,
          ...existingSignature.stroke_config,
        },
        curveType: existingSignature.curve_type,
        keyboardLayout: existingSignature.keyboard_layout,
      });
    }
  }, [existingSignature?.stroke_config]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMainInputFocused = document.activeElement === inputRef.current;
      const isSearchInputFocused =
        document.activeElement === searchInputRef.current;
      const isAnyInputFocused = document.activeElement?.tagName === 'INPUT';

      if (!isMainInputFocused && !isSearchInputFocused && !isAnyInputFocused) {
        const regex = signatureOptions.includeNumbers ? /^[a-zA-Z0-9]$/ : /^[a-zA-Z]$/;
        if (regex.test(e.key) || e.key === 'Backspace') {
          inputRef.current?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [signatureOptions.includeNumbers]);

  useEffect(() => {
    // Assume reset if input is cleared
    if (name.length === 0) {
      resetSignatureStrokeConfig();
    }

    if (name.length > 1) {
      setKeyboardVisible(true);
      const timer = setTimeout(() => setKeyboardVisible(false), 100);
      return () => clearTimeout(timer);
    } else {
      setKeyboardVisible(false);
    }
  }, [name, resetSignatureStrokeConfig]);

  const signaturePath = useMemo(() => {
    if (!name) return ""; // Use name directly for immediate signature generation

    const points = [];
    const currentLayout = getKeyboardLayout(
      signatureOptions.keyboardLayout,
      signatureOptions.includeNumbers
    );

    for (const char of name.toUpperCase()) {
      if (char in currentLayout) {
        const {x, y} = currentLayout[char];
        const yOffset = signatureOptions.includeNumbers ? 100 : 40;
        points.push({x: x * 60 + 28, y: y * 60 + yOffset});
      }
    }

    if (points.length === 0) return "";
    return generatePath(points, signatureOptions.curveType);
  }, [name, signatureOptions.keyboardLayout, signatureOptions.includeNumbers, signatureOptions.curveType]); // Use name directly

  return (
    <div className='flex flex-col sm:items-center max-sm:mx-auto max-sm:w-[24rem] sm:w-fit h-screen justify-center'>
      <Search setSelectedSignature={setSelectedSignature}/>

      <ConnectGithub/>

      <input
        autoFocus
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder='Enter your name'
        className='max-sm:mt-14 placeholder-neutral-800 leading-[1] [&::placeholder]:duration-200 [&::placeholder]:transition-all focus:placeholder-neutral-600 tracking-wide text-4xl text-white bg-transparent duration-150 transition-all ease-out px-4 py-2 text-center outline-none'
      />

      <Keyboard name={name} setName={setName} keyboardVisible={keyboardVisible} signaturePath={signaturePath}/>

      <SignatureButtons name={name} signaturePath={signaturePath} allowedClaimCount={allowedClaimCount}/>

      <Options/>

      <DetailModal
        signature={selectedSignature}
        isOpen={!!selectedSignature}
        onClose={() => setSelectedSignature(null)}
      />
    </div>
  );
};
