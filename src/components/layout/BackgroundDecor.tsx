"use client";

import React from "react";

export function BackgroundDecor() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Flat near-black base (#0f1115), no glows, no extra gradients */}
      <div className="absolute inset-0 bg-[#0f1115]" />
    </div>
  );
}
