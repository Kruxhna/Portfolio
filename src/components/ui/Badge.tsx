import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "emerald" | "cyan" | "indigo" | "outline" | "mono";
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
    default: "bg-[#18181b] text-[#A1A1AA] border-[#27272A]",
    emerald: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30",
    cyan: "bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/30",
    indigo: "bg-[#6366F1]/10 text-[#6366F1] border-[#6366F1]/30",
    outline: "bg-transparent text-[#71717A] border-[#27272A]",
    mono: "bg-[#111115] text-[#FAFAFA] border-[#27272A] font-mono",
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
