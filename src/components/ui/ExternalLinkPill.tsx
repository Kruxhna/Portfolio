"use client";

import React from "react";

// ─── Symmetrical 14×14 Diagonal Arrow SVG ───────────────────────────────────
// Mathematically crisp 45-degree arrow with equal 5px fin lengths.
function ArrowSVG({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 14 14"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <line x1="3.5" y1="10.5" x2="10.5" y2="3.5" />
      <polyline points="5.5,3.5 10.5,3.5 10.5,8.5" />
    </svg>
  );
}

// ─── Dual-Arrow Relay Track Primitive ─────────────────────────────────────────
// Renders the masked slot-machine arrow animation container.
export function ExternalArrow({ className = "" }: { className?: string }) {
  return (
    <span className={`elp-arrow-track ${className}`} aria-hidden="true">
      {/* Primary arrow — starts centered, exits top-right on hover */}
      <ArrowSVG className="elp-arrow elp-arrow-primary" />
      {/* Clone arrow — starts bottom-left, slides into center on hover */}
      <ArrowSVG className="elp-arrow elp-arrow-clone" />
    </span>
  );
}

// ─── Props Interface ──────────────────────────────────────────────────────────
export interface ExternalLinkPillProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "sm" | "md";
  showArrow?: boolean;
  "data-cursor"?: string;
  "data-cursor-label"?: string;
}

// ─── ExternalLinkPill Component ──────────────────────────────────────────────
export function ExternalLinkPill({
  href,
  children,
  variant = "secondary",
  size = "md",
  showArrow = true,
  className = "",
  "data-cursor": dataCursor = "pointer",
  ...rest
}: ExternalLinkPillProps) {
  // Decide target/rel defaults — mailto: and internal anchor links stay in-page
  const isExternal =
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//");

  const targetProps = isExternal
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  // Variant class names
  const variantClass =
    variant === "primary" ? "elp-primary" : "elp-secondary";

  // Size class names
  const sizeClass = size === "sm" ? "elp-sm" : "elp-md";

  return (
    <a
      href={href}
      {...targetProps}
      data-cursor={dataCursor}
      className={`external-link-pill ${variantClass} ${sizeClass} ${className}`}
      {...rest}
    >
      <span className="inline-flex items-center gap-1.5">{children}</span>
      {showArrow && <ExternalArrow />}
    </a>
  );
}
