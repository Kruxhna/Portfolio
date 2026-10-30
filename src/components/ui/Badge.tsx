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
    default: "bg-[#140408] text-[#F5EEF0] border-[rgba(221,112,116,0.22)]",
    emerald: "bg-[#240009]/85 text-[#F5EEF0] border-[#6D001A]",
    cyan: "bg-[#240009]/85 text-[#F5EEF0] border-[#6D001A]",
    indigo: "bg-[#240009]/85 text-[#F5EEF0] border-[#6D001A]",
    accent: "bg-[#240009]/85 text-[#F5EEF0] border-[#6D001A]",
    outline: "bg-transparent text-[#A68E94] border-[rgba(221,112,116,0.22)]",
    mono: "bg-[#000000] text-[#F5EEF0] border-[rgba(221,112,116,0.22)] font-mono",
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
