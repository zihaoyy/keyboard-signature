import {getKeyboardLayout} from '@/utils/constants';
import {StrokeStyle} from '@/types/signature';
import {useSignatureOptionsStore} from '@/stores/signature-options-store';
import {useMemo} from 'react';

interface KeyboardProps {
  name: string;
  setName: (name: string) => void
  keyboardVisible: boolean;
  signaturePath: string;
}

export default function Keyboard({name, setName, keyboardVisible, signaturePath}: KeyboardProps) {
  const {includeNumbers, keyboardLayout, strokeConfig} = useSignatureOptionsStore(state => state.signatureOptions)


  const activeKeys = useMemo(() => {
    const currentLayout = getKeyboardLayout(
      keyboardLayout,
      includeNumbers
    );
    return new Set(
      name
      .toUpperCase()
      .split("")
      .filter((char) => char in currentLayout)
    );
  }, [name, keyboardLayout, includeNumbers]); // Use name directly

  return (
    <div className='relative mb-4 mt-8 max-sm:mt-0 max-sm:scale-70 max-sm:-ml-22'>
      <div
        className={`relative transition-opacity ease-out ${
          name.length < 2
            ? 'opacity-100'
            : keyboardVisible
              ? 'opacity-100 brightness-125 duration-50'
              : 'opacity-0 duration-4000'
        }`}
        style={{width: '650px', height: includeNumbers ? '260px' : '200px'}}
      >
        {Object.entries(
          getKeyboardLayout(keyboardLayout, includeNumbers)
        ).map(([char, pos]) => {
          const isActive = activeKeys.has(char);
          const isCurrentKey =
            name.length > 0 && name.toUpperCase()[name.length - 1] === char;

          return (
            <div
              key={char}
              onClick={() => setName(name + char)}
              className={`absolute w-14 h-12 rounded-lg border flex items-center justify-center text-sm font-mono transition-[transform,color,background-color,border-color] duration-200 active:scale-95 ${
                isCurrentKey
                  ? 'bg-white/50 border-neutral-400 text-black scale-110'
                  : isActive
                    ? 'bg-neutral-900 border-neutral-800 text-white'
                    : 'bg-transparent border-neutral-800/50 text-neutral-300'
              }`}
              style={{
                left: `${pos.x * 60}px`,
                top: `${pos.y * 60 + (includeNumbers ? 75 : 15)}px`,
              }}
            >
              {char}
            </div>
          );
        })}
      </div>

      <svg
        className='pointer-events-none absolute top-0 left-0'
        width='650'
        height={includeNumbers ? '260' : '200'}
        style={{zIndex: 10}}
      >
        <defs>
          {strokeConfig.style === StrokeStyle.GRADIENT && (
            <linearGradient
              id='pathGradient'
              x1='0%'
              y1='0%'
              x2='100%'
              y2='0%'
            >
              <stop
                offset='0%'
                stopColor={strokeConfig.gradientStart}
                stopOpacity={1}
              />
              <stop
                offset='100%'
                stopColor={strokeConfig.gradientEnd}
                stopOpacity={1}
              />
            </linearGradient>
          )}
        </defs>

        {signaturePath ? (
          <path
            d={signaturePath}
            stroke={
              strokeConfig.style === StrokeStyle.SOLID
                ? strokeConfig.color
                : 'url(#pathGradient)'
            }
            strokeWidth={strokeConfig.width}
            fill='none'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        ) : null}
      </svg>
    </div>
  )
}

