import {ReactNode} from "react";
// import { Geist_Mono, Open_Sans } from "next/font/google";
import "@/styles/globals.css";
import Providers from "@/components/Providers";

// const sans = Open_Sans({
//   variable: "--font-open-sans",
//   subsets: ["latin"],
// });

// const mono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({children}: RootLayoutProps) {
  return (
    <html lang="en">
    {/* <body className={`${sans.variable} ${mono.variable} antialiased`}> */}
    <body className="antialiased">
    <Providers>
      <main
        className="w-screen h-screen flex flex-col sm:justify-center sm:items-center font-sans py-12 overflow-x-auto overflow-y-auto">
        {children}
      </main>
    </Providers>
    </body>
    </html>
  );
}
