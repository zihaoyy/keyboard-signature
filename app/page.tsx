import {Metadata} from "next";
import {KeyboardSignature} from "@/components/KeyboardSignature";

export const metadata: Metadata = {
  title: "Digitized Signatures",
};

export default async function Page() {
  const allowedClaimCount = parseInt(process.env.ALLOWED_CLAIM_SIGNATURE_COUNT || '1');

  return (
    <KeyboardSignature allowedClaimCount={allowedClaimCount}/>
  );
}
