import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "emerald" | "cyan" | "indigo" | "outline" | "mono" | "accent";
  size?: "sm" | "md";
}

export function Badge({
  children,
  className,
  variant = "default",
  size = "sm",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-[#120E0B] text-[#DEC1B4] border-[rgba(206,164,145,0.18)]",
    emerald: "bg-[rgba(173,106,76,0.15)] text-[#AD6A4C] border-[rgba(173,106,76,0.35)]",
    cyan: "bg-[rgba(173,106,76,0.15)] text-[#AD6A4C] border-[rgba(173,106,76,0.35)]",
    indigo: "bg-[rgba(173,106,76,0.15)] text-[#AD6A4C] border-[rgba(173,106,76,0.35)]",
    accent: "bg-[rgba(173,106,76,0.15)] text-[#AD6A4C] border-[rgba(173,106,76,0.35)]",
    outline: "bg-transparent text-[rgba(222,193,180,0.55)] border-[rgba(206,164,145,0.18)]",
    mono: "bg-[#0A0807] text-[#DEC1B4] border-[rgba(206,164,145,0.18)] font-mono",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium tracking-tight transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
