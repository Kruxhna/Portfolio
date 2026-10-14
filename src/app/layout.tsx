import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Roboto_Flex } from "next/font/google";
import { CustomCursor } from "@/components/ui/CustomCursor";
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
      className={`${inter.variable} ${jetbrainsMono.variable} ${robotoFlex.variable} dark scroll-smooth`}
    >
      <body className="min-h-screen bg-black text-[var(--text-primary)] font-sans antialiased">
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
