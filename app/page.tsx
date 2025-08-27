import { Metadata } from "next";
import ReactQueryProvider from "@/components/ReactQueryProvider";
import { KeyboardSignature } from "@/components/KeyboardSignature";

export const metadata: Metadata = {
  title: "Digitized Signatures",
};

export default function Page() {
  return (
    <ReactQueryProvider>
      <KeyboardSignature />
    </ReactQueryProvider>
  );
}
