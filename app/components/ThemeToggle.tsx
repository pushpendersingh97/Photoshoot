"use client";

import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

export default function ThemeToggle({ isDarkMode, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`fixed top-4 right-4 z-50 p-3 rounded-full backdrop-blur-sm transition-colors ${
        isDarkMode
          ? "bg-zinc-800/90 hover:bg-zinc-700 text-white"
          : "bg-white/90 hover:bg-zinc-100 text-zinc-900 shadow-lg"
      }`}
      title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}

