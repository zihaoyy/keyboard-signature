import {useEffect, useState} from 'react';
import {useAuth} from '@/hooks/useAuth';
import {useDebounce} from '@/hooks/useDebounce';
import {StrokeStyle} from '@/types/signature';
import {handleGithubRedirect} from '@/utils/get-github';
import {useSignatureOptionsStore} from '@/stores/signature-options-store';
import {useClaimSignature, useSignatureByName, useUnclaimSignature} from '@/hooks/useSignaturesQuery';
import {AnimatePresence, motion} from 'motion/react';
import ClaimPopup from '@/components/claim-popup';

interface SignatureButtonsProps {
  name: string;
  signaturePath: string;
  allowedClaimCount: number;
}

export default function SignatureButtons({name, signaturePath, allowedClaimCount}: SignatureButtonsProps) {
  const {
    includeNumbers,
    strokeConfig,
    curveType,
    keyboardLayout
  } = useSignatureOptionsStore(state => state.signatureOptions);
  const {user} = useAuth();
  const claimSignatureMutation = useClaimSignature();
  const unclaimSignatureMutation = useUnclaimSignature();

  // Debounce only the API requests, not signature generation
  const debouncedName = useDebounce(name, 300); // 300ms delay for API calls only
  const {data: existingSignature} = useSignatureByName(debouncedName); // API call debounced
  const [claimError, setClaimError] = useState<string | null>(null);
  const [showClaimPopup, setShowClaimPopup] = useState(false);
  const [claimedBy, setClaimedBy] = useState<string | null>(null);

  const handleClaim = async () => {
    if (!user || !name || !signaturePath) {
      return;
    }

    // Check if already claimed using React Query data
    if (existingSignature) {
      setClaimedBy(existingSignature.claimed_by_username);
      setClaimError(
        `Signature already claimed by @${existingSignature.claimed_by_username}`
      );
      return;
    }

    setClaimError(null);

    // Use React Query mutation to claim the signature
    claimSignatureMutation.mutate(
      {
        name,
        signaturePath,
        strokeConfig,
        includeNumbers,
        curveType,
        keyboardLayout,
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            setClaimedBy(user.username);
            setShowClaimPopup(true); // Show success popup
          } else if (result.error === 'signature_already_claimed') {
            setClaimError('Signature already claimed');
          } else if (result.error === 'user_already_claimed') {
            setClaimError(
              `You already claimed a signature. Only ${allowedClaimCount} signature${allowedClaimCount > 1 ? 's' : ''} per account.`
            );
          } else {
            setClaimError('Failed to claim signature. Please try again.');
          }
        },
        onError: () => {
          setClaimError('Failed to claim signature. Please try again.');
        },
      }
    );
  };

  const handleUnclaim = async () => {
    if (!user || !existingSignature?.claimed_by_username) {
      return;
    }

    setClaimError(null);

    // Use React Query mutation to claim the signature
    unclaimSignatureMutation.mutate(
      {
        name,
        username: existingSignature.claimed_by_username,
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            setClaimedBy(null);
          } else {
            setClaimError('Failed to unclaim signature. Please try again.');
          }
        },
        onError: () => {
          setClaimError('Failed to unclaim signature. Please try again.');
        },
      }
    );
  };

  // Export functions
  const exportSVG = () => {
    if (!signaturePath || !name) return;

    const height = includeNumbers ? 260 : 200;
    const gradients =
      strokeConfig.style === StrokeStyle.GRADIENT
        ? `<linearGradient id='pathGradient' x1='0%' y1='0%' x2='100%' y2='0%'>
           <stop offset='0%' style='stop-color:${strokeConfig.gradientStart};stop-opacity:1' />
           <stop offset='100%' style='stop-color:${strokeConfig.gradientEnd};stop-opacity:1' />
         </linearGradient>`
        : "";
    const strokeColor =
      strokeConfig.style === StrokeStyle.SOLID
        ? strokeConfig.color
        : 'url(#pathGradient)';

    const svgContent = `<svg width='650' height='${height}' xmlns='http://www.w3.org/2000/svg'>
          <defs>${gradients}</defs>
          <path d='${signaturePath}' stroke='${strokeColor}' stroke-width='${strokeConfig.width}' fill='none' stroke-linecap='round' stroke-linejoin='round'/>
        </svg>`;

    const blob = new Blob([svgContent], {type: 'image/svg+xml'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.toLowerCase()}-signature.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!debouncedName) {
      setClaimedBy(null);
      setClaimError(null);
      return;
    }

    if (existingSignature) {
      setClaimedBy(existingSignature.claimed_by_username);
      setClaimError(null);
    } else {
      setClaimedBy(null);
      setClaimError(null);
    }
  }, [debouncedName, existingSignature]);

  return (
    <>
      <div
        className={`max-sm:w-[20rem] max-sm:mx-auto flex flex-col gap-6 sm:mt-8 transition-all ease-in-out ${
          name.length > 1
            ? 'opacity-100 translate-y-0 duration-1000'
            : 'pointer-events-none opacity-0 translate-y-2 duration-150'
        }`}
      >
        {existingSignature?.claimed_by_username &&
        existingSignature?.claimed_by_username === user?.username ? (
          <button
            onClick={handleUnclaim}
            className='relative inline-flex items-center justify-center select-none rounded-2xl disabled:cursor-not-allowed ease-in-out border-[2px]  backdrop-blur-[25px] bg-origin-border shadow-sm not-disabled:hover:bg-red-700/80 not-disabled:hover:text-white not-disabled:hover:shadow-button transition-all duration-200 disabled:opacity-30 disabled:text-white/50 focus-visible:ring-4 focus-visible:ring-white/30 focus-visible:outline-hidden focus-visible:bg-white/90 focus-visible:text-black text-base h-12 gap-0 px-5 font-semibold text-red-300 border-red-700/50 py-1.5 bg-red-500/50 hover:bg-red-900/30 cursor-pointer hover:text-red-400'
          >
            Unclaim
          </button>
        ) : claimedBy ? (
          <div
            className='flex items-center justify-center gap-1 font-medium text-neutral-500 border border-neutral-700/50 px-3.5 py-1.5 bg-neutral-900/50 text-sm rounded-md'>
            <span>Claimed by</span>
            <button
              onClick={() => handleGithubRedirect(claimedBy)}
              className='text-blue-400 hover:text-blue-300 transition-colors duration-100 cursor-pointer'
            >
              @{claimedBy}
            </button>
          </div>
        ) : (
          <button
            type='button'
            onClick={handleClaim}
            disabled={!user || !name || !!claimedBy}
            className="cursor-pointer relative inline-flex items-center justify-center select-none rounded-2xl disabled:cursor-not-allowed ease-in-out text-white border-[2px] border-white/5 backdrop-blur-[25px] bg-origin-border bg-[linear-gradient(104deg,rgba(253,253,253,0.05)_5%,rgba(240,240,228,0.1)_100%)] shadow-sm not-disabled:hover:bg-white/90 not-disabled:hover:text-black not-disabled:hover:shadow-button transition-all duration-200 disabled:opacity-30 disabled:text-white/50 focus-visible:ring-4 focus-visible:ring-white/30 focus-visible:outline-hidden focus-visible:bg-white/90 focus-visible:text-black after:absolute after:w-[calc(100%+4px)] after:h-[calc(100%+4px)] after:top-[-2px] after:left-[-2px] after:rounded-[1rem] after:bg-[url('/static/texture-btn.png')] after:bg-repeat after:pointer-events-none text-base h-12 gap-0 px-5 font-semibold"
          >
            {!user
              ? 'Login to Claim'
              : !name
                ? 'Enter Name'
                : claimedBy
                  ? 'Already Claimed'
                  : 'Claim Signature'}
          </button>
        )}

        <button
          type='button'
          onClick={exportSVG}
          className='cursor-pointer relative inline-flex items-center justify-center select-none rounded-2xl disabled:cursor-not-allowed ease-in-out text-gray-500 border-[2px] border-white/5 bg-white/5 shadow-sm not-disabled:hover:bg-white/10 not-disabled:hover:text-white/50 not-disabled:hover:shadow-button transition-all duration-200 disabled:opacity-30 disabled:text-white/50 focus-visible:ring-4 focus-visible:ring-white/30 focus-visible:outline-hidden focus-visible:bg-white/20 focus-visible:text-black text-base h-12 gap-0 px-5 font-semibold'
        >
          Download
        </button>
      </div>


      <AnimatePresence>
        {showClaimPopup && (
          <ClaimPopup
            isOpen={showClaimPopup}
            onClose={() => setShowClaimPopup(false)}
            name={name}
            signaturePath={signaturePath}
            strokeConfig={strokeConfig}
            includeNumbers={includeNumbers}
            user={user}
          />
        )}
      </AnimatePresence>

      {claimError ? (
        <motion.div
          initial={{y: -4, opacity: 0}}
          animate={{y: 0, opacity: 1}}
          exit={{y: -4, opacity: 0}}
          transition={{duration: 1, ease: [0.26, 1, 0.6, 1]}}
          className='absolute top-24 left-1/2 -translate-x-1/2'
        >
          <div
            className='inline-flex items-center gap-2 bg-yellow-900/20 border border-yellow-700/30 rounded-lg px-4 py-2'>
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              className='text-yellow-400'
            >
              <path d='m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z'/>
              <path d='M12 9v4'/>
              <path d='m12 17.02.01-.02'/>
            </svg>
            <p className='text-sm text-yellow-200 font-medium text-center'>
              {claimError}
            </p>
          </div>
        </motion.div>
      ) : null}
    </>
  )
}
