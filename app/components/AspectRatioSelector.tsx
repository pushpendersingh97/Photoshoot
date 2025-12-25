"use client";

import { Square, Film, Monitor, Image as ImageIcon } from "lucide-react";
import type { AspectRatio } from "../types";

interface AspectRatioSelectorProps {
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  isDarkMode: boolean;
}

export default function AspectRatioSelector({
  aspectRatio,
  onAspectRatioChange,
  isDarkMode,
}: AspectRatioSelectorProps) {
  const ratios: { value: AspectRatio; icon: typeof Square; label: string }[] = [
    { value: "original", icon: ImageIcon, label: "Original" },
    { value: "1:1", icon: Square, label: "1:1" },
    { value: "9:16", icon: Film, label: "9:16" },
    { value: "16:9", icon: Monitor, label: "16:9" },
  ];

  return (
    <div>
      <h3
        className={`text-sm font-semibold mb-3 ${
          isDarkMode ? "text-zinc-400" : "text-zinc-600"
        }`}
      >
        Aspect Ratio
      </h3>
      <div className="flex gap-2">
        {ratios.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => onAspectRatioChange(value)}
            className={`flex-1 p-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              aspectRatio === value
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : isDarkMode
                ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

