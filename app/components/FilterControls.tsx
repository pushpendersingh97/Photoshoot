"use client";

import type { FilterState } from "../types";

interface FilterControlsProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: number) => void;
  isDarkMode: boolean;
}

export default function FilterControls({
  filters,
  onFilterChange,
  isDarkMode,
}: FilterControlsProps) {
  const sliderBg = isDarkMode ? "#27272a" : "#e4e4e7";

  return (
    <div className="space-y-4">
      <h3
        className={`text-sm font-semibold ${
          isDarkMode ? "text-zinc-400" : "text-zinc-600"
        }`}
      >
        Adjustments
      </h3>

      {Object.entries(filters).map(([key, value]) => {
        const filterKey = key as keyof FilterState;
        const min = filterKey === "hueRotate" ? -180 : 0;
        const max =
          filterKey === "hueRotate"
            ? 180
            : filterKey === "invert" || filterKey === "grayscale"
            ? 100
            : 200;

        const percentage =
          ((value - (filterKey === "hueRotate" ? -180 : 0)) /
            (filterKey === "hueRotate" ? 360 : max)) *
          100;

        return (
          <div key={key} className="space-y-2">
            <div className="flex justify-between items-center">
              <label
                className={`text-xs capitalize ${
                  isDarkMode ? "text-zinc-300" : "text-zinc-700"
                }`}
              >
                {key.replace(/([A-Z])/g, " $1").trim()}
              </label>
              <span
                className={`text-xs ${
                  isDarkMode ? "text-zinc-500" : "text-zinc-500"
                }`}
              >
                {value}
              </span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              value={value}
              onChange={(e) => onFilterChange(filterKey, Number(e.target.value))}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-600 ${
                isDarkMode ? "bg-zinc-800" : "bg-zinc-200"
              }`}
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, ${sliderBg} ${percentage}%, ${sliderBg} 100%)`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

