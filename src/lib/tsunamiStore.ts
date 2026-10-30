"use client";

import { useState, useEffect } from "react";
import type { TsunamiMode } from "@/components/ui/Tsunami";

let currentMode: TsunamiMode = "scroll";
const listeners = new Set<(mode: TsunamiMode) => void>();

export function setGlobalTsunamiMode(mode: TsunamiMode) {
  currentMode = mode;
  listeners.forEach((listener) => listener(mode));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tsunami:mode", { detail: mode }));
  }
}

export function getGlobalTsunamiMode(): TsunamiMode {
  return currentMode;
}

export function useGlobalTsunamiMode(): [TsunamiMode, (mode: TsunamiMode) => void] {
  const [mode, setMode] = useState<TsunamiMode>(currentMode);

  useEffect(() => {
    const handler = (newMode: TsunamiMode) => setMode(newMode);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return [mode, setGlobalTsunamiMode];
}

