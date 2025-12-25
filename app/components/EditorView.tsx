"use client";

import { X, Download, Sparkles } from "lucide-react";
import type { AspectRatio } from "../types";

interface EditorViewProps {
  capturedImage: string;
  filterStyle: React.CSSProperties;
  aspectRatio: AspectRatio;
  showOriginal: boolean;
  onShowOriginal: (show: boolean) => void;
  onBack: () => void;
  onExport: () => void;
  isDarkMode: boolean;
}

export default function EditorView({
  capturedImage,
  filterStyle,
  aspectRatio,
  showOriginal,
  onShowOriginal,
  onBack,
  onExport,
  isDarkMode,
}: EditorViewProps) {
  const getAspectRatioStyle = () => {
    if (aspectRatio === "original") return {};
    if (aspectRatio === "1:1") return { aspectRatio: "1 / 1" };
    if (aspectRatio === "9:16") return { aspectRatio: "9 / 16" };
    if (aspectRatio === "16:9") return { aspectRatio: "16 / 9" };
    return {};
  };

  return (
    <div className="relative w-full max-w-4xl">
      <div
        className="w-full rounded-lg overflow-hidden"
        style={getAspectRatioStyle()}
      >
        <img
          src={capturedImage}
          alt="Captured"
          className="w-full h-full object-contain"
          style={showOriginal ? {} : filterStyle}
        />
      </div>

      {/* Editor controls */}
      <div className="absolute top-4 left-4 flex gap-2">
        <button
          onClick={onBack}
          className={`p-2 rounded-lg backdrop-blur-sm transition-colors ${
            isDarkMode
              ? "bg-zinc-800/90 hover:bg-zinc-700 text-white"
              : "bg-white/90 hover:bg-zinc-100 text-zinc-900 shadow-lg"
          }`}
          title="Back to Camera"
        >
          <X className="w-5 h-5" />
        </button>
        <button
          onClick={onExport}
          className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg backdrop-blur-sm transition-colors text-white"
          title="Export"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

