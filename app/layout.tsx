import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WWORLDS — Wedding planning, beautifully settled",
  description:
    "Find the right vendors, message in real time, sign contracts, and pay instantly on the XRP rail. Couples pay $0 extra; vendors cover a 2.9% Instant Rail fee.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${outfit.variable} h-full antialiased`}>
      <body className="min-h-full bg-ivory text-ink font-sans">{children}</body>
    </html>
  );
}
