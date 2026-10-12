"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  FolderGit2,
  Terminal,
  Cpu,
  BookOpen,
  Calendar,
  Mail,
  Copy,
  Check,
  ExternalLink,
  X,
} from "lucide-react";
import { PERSONAL_INFO } from "@/data/portfolioData";

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onRunTerminalCommand?: (cmd: string) => void;
}

export function CommandMenu({ isOpen, onClose, onRunTerminalCommand }: CommandMenuProps) {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via parent or event
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const copyEmail = () => {
    navigator.clipboard.writeText(PERSONAL_INFO.email);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 1200);
  };

  const navItems = [
    { label: "01. About & Bio", href: "#about", icon: Cpu, tag: "About" },
    { label: "02. DSA / Stats & Lab", href: "#stats", icon: Terminal, tag: "Stats" },
    { label: "03. AI Projects & Work", href: "#projects", icon: FolderGit2, tag: "Projects" },
    { label: "04. Technical Arsenal", href: "#arsenal", icon: Cpu, tag: "Arsenal" },
    { label: "05. Get in Touch / Contact", href: "#contact", icon: Mail, tag: "Contact" },
    { label: "Research Notes & Articles", href: "#research", icon: BookOpen, tag: "Writing" },
  ];

  const filteredNav = navItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.tag.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-[#27272A] bg-[#111115] shadow-2xl shadow-black/90"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-[#27272A] px-4 py-3.5">
          <Search className="h-4 w-4 text-[#71717A]" />
          <input
            type="text"
            placeholder="Type a command or search sections..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm text-[#FAFAFA] placeholder-[#71717A] focus:outline-none"
          />
          <button
            onClick={onClose}
            className="rounded p-1 text-[#71717A] hover:bg-white/[0.05] hover:text-[#FAFAFA]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {/* Quick Actions Group */}
          <div className="px-2 py-1.5 text-[11px] font-mono text-[#71717A] uppercase tracking-wider">
            Quick Actions
          </div>

          <button
            onClick={copyEmail}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-[#A1A1AA] hover:bg-white/[0.05] hover:text-[#FAFAFA]"
          >
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-[#38BDF8]" />
              <span>Copy Direct Email</span>
            </div>
            {copied ? (
              <span className="flex items-center gap-1 text-xs text-[#10B981]">
                <Check className="h-3 w-3" /> Copied!
              </span>
            ) : (
              <span className="font-mono text-xs text-[#71717A]">{PERSONAL_INFO.email}</span>
            )}
          </button>

          <a
            href={PERSONAL_INFO.github}
            target="_blank"
            rel="noreferrer"
            onClick={onClose}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-[#A1A1AA] hover:bg-white/[0.05] hover:text-[#FAFAFA]"
          >
            <div className="flex items-center gap-3">
              <FolderGit2 className="h-4 w-4 text-[#6366F1]" />
              <span>GitHub Profile</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-[#71717A]" />
          </a>

          {/* Navigation Group */}
          <div className="mt-3 px-2 py-1.5 text-[11px] font-mono text-[#71717A] uppercase tracking-wider">
            Navigation
          </div>

          {filteredNav.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-[#A1A1AA] hover:bg-white/[0.05] hover:text-[#FAFAFA]"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-[#A1A1AA]" />
                  <span>{item.label}</span>
                </div>
                <span className="rounded bg-[#18181b] border border-[#27272A] px-1.5 py-0.5 font-mono text-[10px] text-[#71717A]">
                  {item.tag}
                </span>
              </a>
            );
          })}

          {filteredNav.length === 0 && (
            <div className="py-8 text-center text-sm text-[#71717A]">
              No actions found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-[#27272A] px-4 py-2.5 bg-[#09090b]/50 text-[11px] text-[#71717A]">
          <span className="font-mono">ESC to dismiss</span>
          <span className="font-mono">KRUSHNA // PORTFOLIO</span>
        </div>
      </div>
    </div>
  );
}
