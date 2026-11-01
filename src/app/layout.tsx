import Script from "next/script";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Playfair_Display, Alex_Brush } from "next/font/google";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { CosmicScrollBackground } from "@/components/ui/CosmicScrollBackground";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { ScrollTelemetryHUD } from "@/components/ui/ScrollTelemetryHUD";
import { TsunamiControllerPill } from "@/components/ui/TsunamiControllerPill";
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
      suppressHydrationWarning
      style={{ backgroundColor: "#000000" }}
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${alexBrush.variable} dark scroll-smooth`}
    >
      <body suppressHydrationWarning className="min-h-screen bg-transparent text-[var(--text-primary)] font-sans antialiased selection:bg-[#6D001A] selection:text-[#FFFFFF]">
        <Script
          id="anti-fdprocessedid"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const origSetAttribute = Element.prototype.setAttribute;
                  Element.prototype.setAttribute = function(name, value) {
                    if (name === 'fdprocessedid') return;
                    return origSetAttribute.call(this, name, value);
                  };
                  const removeBad = function(el) {
                    if (el && el.removeAttribute && el.hasAttribute && el.hasAttribute('fdprocessedid')) {
                      el.removeAttribute('fdprocessedid');
                    }
                  };
                  const observer = new MutationObserver(function(mutations) {
                    for (let i = 0; i < mutations.length; i++) {
                      const m = mutations[i];
                      if (m.type === 'attributes' && m.attributeName === 'fdprocessedid') {
                        removeBad(m.target);
                      } else if (m.type === 'childList') {
                        for (let j = 0; j < m.addedNodes.length; j++) {
                          const n = m.addedNodes[j];
                          if (n.nodeType === 1) {
                            removeBad(n);
                            if (n.querySelectorAll) {
                              const b = n.querySelectorAll('[fdprocessedid]');
                              for (let k = 0; k < b.length; k++) removeBad(b[k]);
                            }
                          }
                        }
                      }
                    }
                  });
                  if (document.documentElement) {
                    observer.observe(document.documentElement, {
                      subtree: true,
                      attributes: true,
                      attributeFilter: ['fdprocessedid'],
                      childList: true,
                    });
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        {/* 3D Cosmic Starfield & Volumetric Nebula Fly-Through Background */}
        <CosmicScrollBackground />

        {/*
          Cosmic Readability Scrim
          Fixed overlay between WebGL canvas (z=0) and page content (z=10).
          Never blocks pointer events. Three layered gradients:
          - Radial vignette: darkens edges where nebula clusters bloom
          - Vertical gradient: top & bottom sections read cleanly
          - Centre dimmer: prevents bright nebula cores washing out text
        */}
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none select-none"
          style={{
            zIndex: 2,
            background: [
              "radial-gradient(ellipse 120% 100% at 50% 50%, transparent 28%, rgba(3,3,8,0.75) 100%)",
              "linear-gradient(to bottom, rgba(3,3,8,0.50) 0%, rgba(3,3,8,0.20) 30%, rgba(3,3,8,0.20) 70%, rgba(3,3,8,0.55) 100%)",
              "radial-gradient(ellipse 58% 52% at 50% 44%, rgba(3,3,8,0.32) 0%, transparent 80%)",
            ].join(", "),
          }}
        />

        {/* Global Unified Custom Cursor */}
        <CustomCursor />

        {/* Smooth Scroll Engine & Telemetry HUD */}
        <SmoothScrollProvider>
          <div className="relative z-10 bg-transparent min-h-screen">
            {children}
          </div>
          <ScrollTelemetryHUD />
          <TsunamiControllerPill />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
