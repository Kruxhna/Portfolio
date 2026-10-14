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
    default: "bg-[#14100D] text-[#ECC3AB] border-[rgba(221,112,116,0.22)]",
    emerald: "bg-[#4E0104]/85 text-[#E8A791] border-[#9A142C]",
    cyan: "bg-[#4E0104]/85 text-[#E8A791] border-[#9A142C]",
    indigo: "bg-[#4E0104]/85 text-[#E8A791] border-[#9A142C]",
    accent: "bg-[#4E0104]/85 text-[#E8A791] border-[#9A142C]",
    outline: "bg-transparent text-[#DD7074] border-[rgba(221,112,116,0.22)]",
    mono: "bg-[#0A0807] text-[#ECC3AB] border-[rgba(221,112,116,0.22)] font-mono",
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
