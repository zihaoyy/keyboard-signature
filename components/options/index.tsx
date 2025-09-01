import {AnimatePresence, motion} from "motion/react";
import {ColorPicker} from "@/components/ColorPicker";
import {useSignatureOptionsStore} from "@/app/stores/signature-options-store";
import {CurveType, KeyboardLayout, StrokeStyle} from "@/app/types/signature";
import {useState} from "react";

export default function Options() {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const {
    signatureOptions,
    setSignatureOptions,
    resetSignature
  } = useSignatureOptionsStore(state => state)

  return (
    <AnimatePresence>
      {isOptionsOpen ? (
        <motion.div
          initial={{y: 4, opacity: 0}}
          animate={{y: 0, opacity: 1}}
          exit={{y: 4, opacity: 0}}
          transition={{
            duration: 0.4,
            ease: [0.6, 1, 0.26, 1],
          }}
          className="flex flex-col items-start max-sm:-translate-x-1/2 max-sm:left-1/2 max-sm:w-[calc(100%-3rem)] sm:max-w-xs absolute sm:right-6 bottom-6 p-4 rounded-xl bg-neutral-950 border-neutral-800/50 border z-10"
        >
          <button
            onClick={() => setIsOptionsOpen(false)}
            className="text-sm text-neutral-600 hover:text-neutral-400 absolute right-4 top-4 cursor-pointer"
          >
            Close
          </button>

          <p className="font-semibold text-neutral-400 mb-4">Options</p>

          <div className="grid grid-cols-[5rem_1fr] gap-y-4">
            {/* Layout */}
            <label
              htmlFor="keyboard-layout"
              className="text-neutral-300 text-sm font-medium mr-8 mt-1"
            >
              Layout
            </label>
            <select
              id="keyboard-layout"
              className="border border-neutral-800 rounded-md px-2 py-1 bg-neutral-900 text-white text-sm"
              value={signatureOptions.keyboardLayout}
              onChange={(e) => setSignatureOptions({
                ...signatureOptions,
                keyboardLayout: e.target.value as KeyboardLayout
              })}
            >
              {Object.values(KeyboardLayout).map((layout) => (
                <option
                  key={layout}
                  value={layout}
                  className="text-neutral-500"
                >
                  {layout}
                </option>
              ))}
            </select>

            {/* Curve */}
            <p className="text-neutral-300 text-sm font-medium mr-8 mt-1">
              Curve
            </p>
            <div className="flex flex-wrap gap-1">
              {(
                [
                  "linear",
                  "simple-curve",
                  "quadratic-bezier",
                  "cubic-bezier",
                  "catmull-rom",
                ] as CurveType[]
              ).map((type) => (
                <button
                  key={type}
                  onClick={() => setSignatureOptions({...signatureOptions, curveType: type})}
                  className={`px-3 py-1 text-xs rounded-full transition-all duration-150 ease-out cursor-pointer border ${
                    signatureOptions.curveType === type
                      ? "bg-white text-black font-medium border-white"
                      : "bg-neutral-900/50 text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200 border-neutral-800"
                  }`}
                >
                  {type.replace("-", " ")}
                </button>
              ))}
            </div>

            {/* Numbers Toggle */}
            <p className="text-neutral-300 text-sm font-medium mr-8">
              Numbers
            </p>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only"
                checked={signatureOptions.includeNumbers}
                onChange={(e) => setSignatureOptions({
                  ...signatureOptions,
                  includeNumbers: e.target.checked
                })}
              />
              <div
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                  signatureOptions.includeNumbers ? "bg-white" : "bg-neutral-700"
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-black rounded-full transition-transform duration-200 ${
                    signatureOptions.includeNumbers ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </label>

            {/* Color Style */}
            <p className="text-neutral-300 text-sm font-medium mr-8 mt-1">
              Style
            </p>
            <div className="flex flex-wrap gap-1">
              {Object.values(StrokeStyle).map((style) => (
                <button
                  key={style}
                  onClick={() => setSignatureOptions({
                    ...signatureOptions,
                    strokeConfig: {
                      ...signatureOptions.strokeConfig,
                      style
                    }
                  })}
                  className={`px-3 py-1 text-xs rounded-full transition-all duration-150 ease-out cursor-pointer border ${
                    signatureOptions?.strokeConfig?.style === style
                      ? "bg-white text-black font-medium border-white"
                      : "bg-neutral-900/50 text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200 border-neutral-800"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>

            {/* Color Picker */}
            {signatureOptions.strokeConfig.style === StrokeStyle.SOLID && (
              <>
                <p className="text-neutral-300 text-sm font-medium mr-8 mt-1">
                  Color
                </p>
                <ColorPicker
                  value={signatureOptions.strokeConfig.color}
                  onChange={(color) => setSignatureOptions({
                    ...signatureOptions,
                    strokeConfig: {
                      ...signatureOptions.strokeConfig,
                      color
                    }
                  })}
                />
              </>
            )}

            {/* Gradient Colors */}
            {signatureOptions.strokeConfig.style === StrokeStyle.GRADIENT && (
              <>
                <p className="text-neutral-300 text-sm font-medium mr-8 mt-1">
                  Colors
                </p>
                <div className="flex items-center gap-2">
                  <ColorPicker
                    value={signatureOptions.strokeConfig.gradientStart}
                    onChange={(color) => setSignatureOptions({
                      ...signatureOptions,
                      strokeConfig: {
                        ...signatureOptions.strokeConfig,
                        gradientStart: color
                      }
                    })}
                  />
                  <ColorPicker
                    value={signatureOptions.strokeConfig.gradientEnd}
                    onChange={(color) => setSignatureOptions({
                      ...signatureOptions,
                      strokeConfig: {
                        ...signatureOptions.strokeConfig,
                        gradientEnd: color
                      }
                    })}
                  />
                </div>
              </>
            )}

            {/* Stroke Width */}
            <p className="text-neutral-300 text-sm font-medium mr-8 mt-1">
              Width
            </p>
            <div className="flex items-center gap-2">
              <input
                min="1"
                max="8"
                type="range"
                className="flex-1"
                value={signatureOptions.strokeConfig.width}
                onChange={(e) => setSignatureOptions({
                  ...signatureOptions,
                  strokeConfig: {
                    ...signatureOptions.strokeConfig,
                    width: parseInt(e.target.value)
                  }
                })}
              />
              <span className="text-neutral-400 text-xs w-6">
                  {signatureOptions.strokeConfig.width}px
                </span>
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetSignature}
            className="mt-4 w-full px-3 py-2 text-sm bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-md transition-colors duration-150 border border-neutral-700 cursor-pointer"
          >
            Reset to Defaults
          </button>
        </motion.div>
      ) : (
        <motion.button
          onClick={() => setIsOptionsOpen(true)}
          className="absolute bottom-6 right-6 px-4 py-2 rounded-lg bg-neutral-950 border-neutral-800/50 border cursor-pointer text-sm font-medium text-neutral-200"
          initial={{y: -4, opacity: 0}}
          animate={{y: 0, opacity: 1}}
          exit={{y: -4, opacity: 0}}
          transition={{
            duration: 0.4,
            ease: [0.6, 1, 0.26, 1],
          }}
        >
          Options
        </motion.button>
      )}
    </AnimatePresence>
  )
}
