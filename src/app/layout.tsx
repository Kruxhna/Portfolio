import type { Metadata } from "next";
import localFont from "next/font/local";
import { Playfair_Display, Alex_Brush } from "next/font/google";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { PixelMatrixBackground } from "@/components/layout/PixelMatrixBackground";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { ScrollTelemetryHUD } from "@/components/ui/ScrollTelemetryHUD";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/Geist-Variable.woff2",
  variable: "--font-geist-sans",
  display: "swap",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  display: "swap",
  weight: "100 900",
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const alexBrush = Alex_Brush({
  weight: "400",
  variable: "--font-cursive",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${alexBrush.variable} dark scroll-smooth`}
    >
      <body className="min-h-screen bg-transparent text-[var(--text-primary)] font-sans antialiased selection:bg-[#C3181E] selection:text-[#ECC3AB]">
        {/* Pixelated Matrix Voxel Image Transition (FRONT.png -> BACK.png across scroll) */}
        <PixelMatrixBackground />

        {/* Global Unified Custom Cursor */}
        <CustomCursor />

        {/* Smooth Scroll Engine & Telemetry HUD */}
        <SmoothScrollProvider>
          <div className="relative z-10 bg-transparent min-h-screen">
            {children}
          </div>
          <ScrollTelemetryHUD />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
