import {Metadata} from 'next';
import KeyboardContainer from '@/components/keyboard-container';

export const metadata: Metadata = {
  title: 'Digitized Signatures',
  description: 'Digital signature for your created on Digital Signatures',
};

export default async function Page() {
  const allowedClaimCount = parseInt(process.env.ALLOWED_CLAIM_SIGNATURE_COUNT || '1');

  return (
    <KeyboardContainer allowedClaimCount={allowedClaimCount}/>
  );
}
