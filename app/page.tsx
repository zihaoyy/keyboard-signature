import {Metadata} from "next";
import {KeyboardSignature} from "@/components/KeyboardSignature";

export const metadata: Metadata = {
  title: "Digitized Signatures",
};

export default function Page() {
  return (
    <KeyboardSignature/>
  );
}
