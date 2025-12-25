"use client";

import type { Preset } from "../types";
import { PRESETS } from "../constants";

interface PresetGridProps {
  filters: any;
  onPresetClick: (preset: Preset) => void;
  isDarkMode: boolean;
  capturedImage?: string | null;
  compact?: boolean;
}

export default function PresetGrid({
  filters,
  onPresetClick,
  isDarkMode,
  capturedImage,
  compact = false,
}: PresetGridProps) {
  const isActive = (preset: Preset) => {
    return JSON.stringify(filters) === JSON.stringify(preset.filters);
  };

  const getFilterStyle = (preset: Preset) => {
    return {
      filter: `
        brightness(${preset.filters.brightness}%)
        contrast(${preset.filters.contrast}%)
        saturate(${preset.filters.saturation}%)
        sepia(${preset.filters.sepia}%)
        hue-rotate(${preset.filters.hueRotate}deg)
        invert(${preset.filters.invert}%)
        grayscale(${preset.filters.grayscale}%)
      `
        .trim()
        .replace(/\s+/g, " "),
    };
  };

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => onPresetClick(preset)}
            className={`p-2 rounded-lg transition-colors text-xs ${
              isActive(preset)
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : isDarkMode
                ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin", scrollbarColor: isDarkMode ? "#3f3f46 #18181b" : "#d4d4d8 #ffffff" }}>
      {PRESETS.map((preset) => (
        <button
          key={preset.name}
          onClick={() => onPresetClick(preset)}
          className={`shrink-0 p-3 rounded-lg transition-colors min-w-[100px] ${
            isDarkMode
              ? "bg-zinc-800 hover:bg-zinc-700 text-white"
              : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
          }`}
        >
          <div
            className={`text-xs font-medium mb-1 ${
              isDarkMode ? "text-white" : "text-zinc-900"
            }`}
          >
            {preset.name}
          </div>
          <div
            className={`w-full h-16 rounded overflow-hidden ${
              isDarkMode ? "bg-zinc-700" : "bg-zinc-300"
            }`}
          >
            {capturedImage && (
              <img
                src={capturedImage}
                alt={preset.name}
                className="w-full h-full object-cover"
                style={getFilterStyle(preset)}
              />
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

