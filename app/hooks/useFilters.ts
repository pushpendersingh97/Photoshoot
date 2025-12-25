import { useState, useCallback } from "react";
import type { FilterState, Preset } from "../types";
import { PRESETS } from "../constants";

export function useFilters() {
  const [filters, setFilters] = useState<FilterState>(PRESETS[0].filters);
  const [history, setHistory] = useState<FilterState[]>([PRESETS[0].filters]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const updateFilter = useCallback(
    (key: keyof FilterState, value: number) => {
      setFilters((prev) => {
        const newFilters = { ...prev, [key]: value };
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newFilters);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        return newFilters;
      });
    },
    [history, historyIndex]
  );

  const applyPreset = useCallback(
    (preset: Preset) => {
      setFilters(preset.filters);
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(preset.filters);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setFilters(history[newIndex]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setFilters(history[newIndex]);
    }
  }, [history, historyIndex]);

  const reset = useCallback(() => {
    setFilters(PRESETS[0].filters);
    setHistory([PRESETS[0].filters]);
    setHistoryIndex(0);
  }, []);

  const getFilterStyle = useCallback(() => {
    return {
      filter: `
        brightness(${filters.brightness}%)
        contrast(${filters.contrast}%)
        saturate(${filters.saturation}%)
        sepia(${filters.sepia}%)
        hue-rotate(${filters.hueRotate}deg)
        invert(${filters.invert}%)
        grayscale(${filters.grayscale}%)
      `
        .trim()
        .replace(/\s+/g, " "),
    };
  }, [filters]);

  return {
    filters,
    updateFilter,
    applyPreset,
    undo,
    redo,
    reset,
    getFilterStyle,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };
}

