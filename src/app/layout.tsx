import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Roboto_Flex, Playfair_Display } from "next/font/google";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { FluidBackground } from "@/components/layout/FluidBackground";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const robotoFlex = Roboto_Flex({
  variable: "--font-roboto-flex",
  subsets: ["latin"],
  display: "swap",
  axes: ["wdth"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KRUSHNA // AIML Engineer & Researcher",
  description:
    "Personal portfolio of Krushna — Artificial Intelligence & Machine Learning Engineering student. Specializing in spatial-temporal deep learning architectures, video forensics, and high-performance inference systems.",
  keywords: [
    "Krushna",
    "AIML Engineer",
    "Machine Learning",
    "Deep Learning",
    "Computer Vision",
    "Deepfake Detection",
    "PyTorch",
    "Next.js Portfolio",
  ],
  authors: [{ name: "Krushna" }],
  creator: "Krushna",
  openGraph: {
    title: "KRUSHNA // AIML Engineer & Researcher",
    description:
      "Minimalist engineering portfolio of Krushna — AIML Engineer building high-throughput deep learning systems.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      style={{ backgroundColor: "#0A0807" }}
      className={`${inter.variable} ${jetbrainsMono.variable} ${robotoFlex.variable} ${playfair.variable} dark scroll-smooth`}
    >
      <body className="min-h-screen bg-transparent text-[var(--text-primary)] font-sans antialiased selection:bg-[#C3181E] selection:text-[#ECC3AB]">
        {/* Site-wide WebGL2 Navier-Stokes Fluid Hover Reveal (Fixed Background at z-0) */}
        <FluidBackground />

        {/* Global Unified Custom Cursor */}
        <CustomCursor />

        {/* Main Content Stacking Context at z-10 */}
        <div className="relative z-10 bg-transparent min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
