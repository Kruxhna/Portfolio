"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  FolderGit2,
  Terminal,
  Cpu,
  Calendar,
  Mail,
  Copy,
  Check,
  X,
} from "lucide-react";
import { ExternalArrow } from "@/components/ui/ExternalLinkPill";
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
  ];

  const filteredNav = navItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.tag.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-[rgba(221,112,116,0.22)] bg-[#0A0807] shadow-2xl shadow-black/90"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-[rgba(221,112,116,0.18)] px-4 py-3.5">
          <Search className="h-4 w-4 text-[#DD7074]" />
          <input
            type="text"
            placeholder="Type a command or search sections..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm text-[#ECC3AB] placeholder-[#DD7074]/50 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="rounded p-1 text-[#DD7074] hover:bg-[#4E0104]/85 hover:text-[#ECC3AB] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {/* Quick Actions Group */}
          <div className="px-2 py-1.5 text-[11px] font-mono text-[#DD7074] uppercase tracking-wider">
            Quick Actions
          </div>

          <button
            onClick={copyEmail}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-[#ECC3AB] hover:bg-[#4E0104]/85 hover:text-[#ECC3AB] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-[#E46B5E]" />
              <span>Copy Direct Email</span>
            </div>
            {copied ? (
              <span className="flex items-center gap-1 text-xs text-[#E46B5E]">
                <Check className="h-3 w-3" /> Copied!
              </span>
            ) : (
              <span className="font-mono text-xs text-[#DD7074]">{PERSONAL_INFO.email}</span>
            )}
          </button>

          <a
            href={PERSONAL_INFO.github}
            target="_blank"
            rel="noreferrer"
            onClick={onClose}
            className="group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-[#ECC3AB] hover:bg-[#4E0104]/85 hover:text-[#ECC3AB] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <FolderGit2 className="h-4 w-4 text-[#E46B5E]" />
              <span>GitHub Profile</span>
            </div>
            <ExternalArrow className="text-[#DD7074] group-hover:text-[#ECC3AB] transition-colors" />
          </a>

          {/* Navigation Group */}
          <div className="mt-3 px-2 py-1.5 text-[11px] font-mono text-[#DD7074] uppercase tracking-wider">
            Navigation
          </div>

          {filteredNav.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-[#ECC3AB] hover:bg-[#4E0104]/85 hover:text-[#ECC3AB] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-[#E46B5E]" />
                  <span>{item.label}</span>
                </div>
                <span className="rounded bg-[#14100D] border border-[rgba(221,112,116,0.18)] px-1.5 py-0.5 font-mono text-[10px] text-[#DD7074]">
                  {item.tag}
                </span>
              </a>
            );
          })}

          {filteredNav.length === 0 && (
            <div className="py-8 text-center text-sm text-[#DD7074]">
              No actions found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-[rgba(221,112,116,0.18)] px-4 py-2.5 bg-[#070504] text-[11px] text-[#DD7074]">
          <span className="font-mono">ESC to dismiss</span>
          <span className="font-mono">KRUSHNA // PORTFOLIO</span>
        </div>
      </div>
    </div>
  );
}
