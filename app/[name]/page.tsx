import {Metadata} from 'next';
import Link from 'next/link';
import {XIcon} from '@/components/icons/x';
import {getUserSignatureAction} from '@/utils/actions';
import {getTweetUrl} from '@/utils/tweet';
import {ClaimedSignature} from '@/types/signature';

interface SignaturePageProps {
  params: Promise<{ name: string }>
}

export async function generateMetadata(
  {params}: SignaturePageProps,
): Promise<Metadata> {
  const signatureId = (await params).name
  const signature = await getUserSignatureAction(signatureId);

  return {
    title: `${signature?.name} - Digital Signature`,
    description: `Digital signature for ${signature.name} created on Digital Signatures`,
    openGraph: {
      type: 'website',
      url: `${process.env.NEXT_PUBLIC_URL}/${signature.name.toLowerCase()}`,
      title: `${signature.name} - Digital Signature`,
      description: `Digital signature for ${signature.name} created on Digital Signatures`,
      images: [{
        url: `${process.env.NEXT_PUBLIC_URL}/api/signature-image/${signature.name}`,
        width: 650,
        height: signature?.include_numbers ? 260 : 200
      }]
    }
  }
}

export default async function SignaturePage({params}: SignaturePageProps) {
  const signatureId = (await params).name;
  const signature: ClaimedSignature | null = await getUserSignatureAction(signatureId);

  if (!signature) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-white mb-4'>
            Signature Not Found
          </h1>
          <p className='text-neutral-400 mb-6'>
            The signature you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href='/'
            className='bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:brightness-85 transition-all duration-150'
          >
            Create Your Signature
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className='min-h-screen w-screen bg-neutral-950/50 flex flex-col items-center sm:justify-center p-4 max-sm:py-16'>
      <Link
        target='_blank'
        href={`https://github.com/${signature.claimed_by_username}`}
        className='opacity-75 hover:opacity-100 hover:duration-150 transition-all duration-300 ease-out cursor-pointer px-3 py-0.5 shadow-[0_5px_4px_-4px_var(--color-gray-900)] hover:shadow-[0_4px_6px_-4px_var(--color-gray-600)] bg-gradient-to-b from-gray-600 via-gray-800 to-gray-700 border-gray-600 via-30% rounded-full border text-gray-400 font-semibold mb-4'
      >
        Claimed by{' '}
        <span className='text-gray-200 hover:text-white cursor-pointer transition-colors duration-100 ease-out'>
            @{signature.claimed_by_username}
          </span>{' '}
        on {new Date(signature.created_at).toLocaleDateString()}
      </Link>

      <h1 className='text-4xl font-bold text-white text-center mb-6'>
        {signature.name}
      </h1>

      <div className='bg-black rounded-4xl py-8 flex items-center justify-center border border-neutral-800'>
        <svg
          width='650'
          height={signature.include_numbers ? 260 : 200}
          viewBox={`0 0 650 ${signature.include_numbers ? 260 : 200}`}
          className='max-w-full max-h-[300px]'
        >
          <defs>
            {signature.stroke_config.style === 'gradient' && (
              <linearGradient id='gradient' x1='0%' y1='0%' x2='100%' y2='0%'>
                <stop
                  offset='0%'
                  stopColor={signature.stroke_config.gradientStart}
                  stopOpacity={1}
                />
                <stop
                  offset='100%'
                  stopColor={signature.stroke_config.gradientEnd}
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
                : 'url(#gradient)'
            }
            strokeWidth={signature.stroke_config.width}
            fill='none'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </div>

      <div className='flex gap-4 mt-8 max-sm:grid max-sm:flex-col max-sm:w-full max-sm:gap-2'>
        <Link
          href='/'
          className="relative inline-flex items-center justify-center select-none rounded-2xl disabled:cursor-not-allowed ease-in-out text-white border-[2px] border-white/5 backdrop-blur-[25px] bg-origin-border bg-[linear-gradient(104deg,rgba(253,253,253,0.05)_5%,rgba(240,240,228,0.1)_100%)] shadow-sm not-disabled:hover:bg-white/90 not-disabled:hover:text-black not-disabled:hover:shadow-button transition-all duration-200 disabled:opacity-30 disabled:text-white/50 focus-visible:ring-4 focus-visible:ring-white/30 focus-visible:outline-hidden focus-visible:bg-white/90 focus-visible:text-black after:absolute after:w-[calc(100%+4px)] after:h-[calc(100%+4px)] after:top-[-2px] after:left-[-2px] after:rounded-[1rem] after:bg-[url('/static/texture-btn.png')] after:bg-repeat after:pointer-events-none text-base h-12 gap-0 px-5 font-semibold"
        >
          Create Your Own
        </Link>
        <Link
          href={getTweetUrl(signature.name)}
          target='_blank'
          className='justify-center max-sm:w-full cursor-pointer flex items-center font-semibold  whitespace-nowrap gap-2 bg-neutral-950 text-white px-5 py-2.5 border border-neutral-800 hover:border-neutral-700 rounded-2xl hover:bg-neutral-900 transition-all duration-150'
        >
          Share on <XIcon className='fill-white shrink-0 size-6'/>
        </Link>
      </div>
    </div>
  );
}
