import {useRef, useState} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {useDebounce} from '@/hooks/useDebounce';
import {useSearchSignatures} from '@/hooks/useSignaturesQuery';
import {ClaimedSignature} from '@/types/signature';

interface SearchProps {
  setSelectedSignature: (signature: ClaimedSignature) => void;
}

export default function Search({setSelectedSignature}: SearchProps) {
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce only the API requests, not signature generation
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms delay for search
  const {searchResults} = useSearchSignatures(debouncedSearchQuery); // Search API debounced

  return (
    <div className='absolute top-6 left-6 z-20'>
      <div className='relative'>
        <motion.div
          animate={{
            width: showSearchInput ? 200 : 36,
            transition: {duration: 0.3, ease: [0.6, 1, 0.26, 1]},
          }}
          className='flex items-center bg-neutral-900/50 border border-neutral-700/50 rounded-lg overflow-hidden'
        >
          <button
            onClick={() => setShowSearchInput(true)}
            className='p-2 text-neutral-400 hover:text-white transition-colors duration-150 flex-shrink-0 flex items-center justify-center'
            title='Search claimed signatures'
          >
            <svg
              width='18'
              height='18'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
            >
              <circle cx='11' cy='11' r='8'/>
              <path d='m21 21-4.35-4.35'/>
            </svg>
          </button>

          <AnimatePresence>
            {showSearchInput && (
              <motion.input
                ref={searchInputRef}
                initial={{opacity: 0, x: -20}}
                animate={{opacity: 1, x: 0}}
                exit={{opacity: 0, x: -20}}
                transition={{duration: 0.2, delay: 0.1}}
                autoFocus
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={(e) => {
                  // Don't close if clicking on a result
                  if (!e.relatedTarget?.closest('.search-results')) {
                    setTimeout(() => {
                      if (!searchQuery) {
                        setShowSearchInput(false);
                      }
                    }, 150);
                  }
                }}
                placeholder='Search signatures...'
                className='bg-transparent text-white placeholder-neutral-500 px-0 py-2 text-sm outline-none flex-1 min-w-0'
              />
            )}
          </AnimatePresence>

          {searchQuery && (
            <motion.button
              initial={{opacity: 0, scale: 0.5}}
              animate={{opacity: 1, scale: 1}}
              onClick={(e) => {
                e.stopPropagation();
                setSearchQuery("");
                setShowSearchInput(false);
              }}
              className='p-1 mr-2 text-neutral-400 hover:text-white transition-colors flex-shrink-0'
            >
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='currentColor'
              >
                <path
                  d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'/>
              </svg>
            </motion.button>
          )}
        </motion.div>

        <AnimatePresence>
          {(searchResults.length > 0 || searchQuery.trim()) &&
            showSearchInput && (
              <motion.div
                initial={{opacity: 0, y: -10}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -10}}
                className='search-results absolute top-full left-0 mt-2 w-80 max-w-[90vw] sm:w-96 z-30'
              >
                {searchQuery.trim() &&
                  searchQuery !== debouncedSearchQuery && (
                    <div className='px-4 py-3 text-center text-neutral-400 text-sm'>
                      Searching...
                    </div>
                  )}
                {searchResults.length > 0 ? (
                  <div className='py-2'>
                    {searchResults.map((signature: ClaimedSignature) => (
                      <div
                        key={signature.id}
                        onClick={() => {
                          setSelectedSignature(signature);
                          setShowSearchInput(false);
                          setSearchQuery("");
                        }}
                        className='px-4 py-3 bg-neutral-900/90 backdrop-blur-sm border border-neutral-700/50 rounded-lg mb-2 hover:bg-neutral-800/90 cursor-pointer transition-colors duration-150'
                      >
                        <div className='flex items-center gap-3'>
                          <div
                            className='bg-black rounded p-2 w-12 h-6 flex items-center justify-center flex-shrink-0'>
                            <svg
                              width='48'
                              height='20'
                              viewBox='0 0 600 200'
                              className='w-full h-full'
                            >
                              <defs>
                                {signature.stroke_config.style ===
                                  'gradient' && (
                                    <linearGradient
                                      id={`search-gradient-${signature.id}`}
                                      x1='0%'
                                      y1='0%'
                                      x2='100%'
                                      y2='0%'
                                    >
                                      <stop
                                        offset='0%'
                                        stopColor={
                                          signature.stroke_config.gradientStart
                                        }
                                        stopOpacity={1}
                                      />
                                      <stop
                                        offset='100%'
                                        stopColor={
                                          signature.stroke_config.gradientEnd
                                        }
                                        stopOpacity={1}
                                      />
                                    </linearGradient>
                                  )}
                              </defs>
                              <path
                                d={signature.signature_path}
                                stroke={
                                  signature.stroke_config.style === 'solid'
                                    ? signature.stroke_config.color
                                    : `url(#search-gradient-${signature.id})`
                                }
                                strokeWidth={signature.stroke_config.width}
                                fill='none'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                            </svg>
                          </div>

                          <div className='flex-1 min-w-0'>
                            <h3 className='font-semibold text-white text-sm truncate'>
                              {signature.name}
                            </h3>
                            <p className='text-xs text-neutral-400 truncate'>
                              @{signature.claimed_by_username}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery.trim() ? (
                  <div
                    className='px-4 py-3 bg-neutral-900/90 backdrop-blur-sm border border-neutral-700/50 rounded-lg text-center'>
                    <p className='text-neutral-400 text-sm'>
                      No signatures found for &quot;{searchQuery}&quot;
                    </p>
                  </div>
                ) : (
                  <div
                    className='px-4 py-3 bg-neutral-900/90 backdrop-blur-sm border border-neutral-700/50 rounded-lg text-center'>
                    <p className='text-neutral-400 text-sm'>
                      Start typing to search signatures...
                    </p>
                  </div>
                )}
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  )
}
