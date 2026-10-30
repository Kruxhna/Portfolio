"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCw, Waves } from "lucide-react";
import { useGlobalTsunamiMode } from "@/lib/tsunamiStore";
import type { TsunamiMode } from "@/components/ui/Tsunami";

export function TsunamiControllerPill() {
  const [mode, setMode] = useGlobalTsunamiMode();
  const [replayKey, setReplayKey] = useState(0);

  const handleSelectMode = (newMode: TsunamiMode) => {
    if (newMode === "appear") {
      setReplayKey((k) => k + 1);
    }
    setMode(newMode);
  };

  const handleReplayAppear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setReplayKey((k) => k + 1);
    setMode("appear");
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 select-none pointer-events-auto">
      {/* Replay Button (Appears when in 'appear' mode, matching reference recording) */}
      <AnimatePresence>
        {mode === "appear" && (
          <motion.button
            key={replayKey}
            initial={{ opacity: 0, y: 8, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.85 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleReplayAppear}
            data-cursor="pointer"
            title="Replay Wave Animation"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/80 text-white/90 shadow-xl backdrop-blur-md transition-colors hover:border-white/40 hover:text-white cursor-pointer"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main Mode Switcher Pill */}
      <div className="flex items-center gap-1 rounded-full border border-white/15 bg-black/80 p-1 font-sans text-xs shadow-2xl backdrop-blur-xl">
        {/* Subtle Liquid Icon */}
        <div className="pl-2 pr-1 text-[#C93B5B]">
          <Waves className="h-3.5 w-3.5 animate-pulse" />
        </div>

        {(["appear", "scroll", "sequence"] as const).map((m) => {
          const isActive = mode === m;
          const label = m.charAt(0).toUpperCase() + m.slice(1);

          return (
            <button
              key={m}
              onClick={() => handleSelectMode(m)}
              data-cursor="pointer"
              className={`relative px-3.5 py-1 rounded-full font-medium transition-colors text-[11.5px] cursor-pointer ${
                isActive ? "text-black font-semibold" : "text-white/60 hover:text-white"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="tsunami-active-pill"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="absolute inset-0 rounded-full bg-white shadow-sm"
                />
              )}
              <span className="relative z-10">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default TsunamiControllerPill;

