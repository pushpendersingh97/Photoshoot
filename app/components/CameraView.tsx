"use client";

import { Camera, FlipHorizontal, RotateCw, Sparkles } from "lucide-react";

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isStreaming: boolean;
  isMirrored: boolean;
  onMirrorToggle: () => void;
  onSwitchCamera: () => void;
  onCapture: () => void;
  onToggleFilters: () => void;
  showFilters: boolean;
  filterStyle: React.CSSProperties;
  isDarkMode: boolean;
  disabled?: boolean;
}

export default function CameraView({
  videoRef,
  isStreaming,
  isMirrored,
  onMirrorToggle,
  onSwitchCamera,
  onCapture,
  onToggleFilters,
  showFilters,
  filterStyle,
  isDarkMode,
  disabled = false,
}: CameraViewProps) {
  return (
    <div className="relative w-full max-w-4xl">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full rounded-lg ${
          isMirrored ? "scale-x-[-1]" : ""
        }`}
        style={{
          display: isStreaming ? "block" : "none",
          ...filterStyle,
        }}
      />
      {!isStreaming && (
        <div
          className={`w-full aspect-video rounded-lg flex items-center justify-center ${
            isDarkMode ? "bg-zinc-900" : "bg-zinc-200"
          }`}
        >
          <Camera
            className={`w-16 h-16 ${
              isDarkMode ? "text-zinc-600" : "text-zinc-400"
            }`}
          />
        </div>
      )}

      {/* Camera controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 items-center">
        <button
          onClick={onMirrorToggle}
          className={`p-3 rounded-full backdrop-blur-sm transition-colors ${
            isDarkMode
              ? "bg-zinc-800/90 hover:bg-zinc-700 text-white"
              : "bg-white/90 hover:bg-zinc-100 text-zinc-900 shadow-lg"
          }`}
          title="Mirror"
        >
          <FlipHorizontal className="w-6 h-6" />
        </button>

        <button
          onClick={onCapture}
          disabled={disabled}
          className={`p-6 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
            isDarkMode
              ? "bg-white hover:bg-zinc-100"
              : "bg-zinc-900 hover:bg-zinc-800"
          }`}
          title="Capture"
        >
          <div
            className={`w-12 h-12 rounded-full border-4 ${
              isDarkMode ? "border-zinc-900" : "border-white"
            }`}
          />
        </button>

        <button
          onClick={onSwitchCamera}
          className={`p-3 rounded-full backdrop-blur-sm transition-colors ${
            isDarkMode
              ? "bg-zinc-800/90 hover:bg-zinc-700 text-white"
              : "bg-white/90 hover:bg-zinc-100 text-zinc-900 shadow-lg"
          }`}
          title="Switch Camera"
        >
          <RotateCw className="w-6 h-6" />
        </button>
      </div>

      {/* Filter toggle button */}
      <button
        onClick={onToggleFilters}
        className={`absolute top-4 right-4 p-3 rounded-lg backdrop-blur-sm transition-colors ${
          isDarkMode
            ? "bg-zinc-800/90 hover:bg-zinc-700 text-white"
            : "bg-white/90 hover:bg-zinc-100 text-zinc-900 shadow-lg"
        } ${showFilters ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}`}
        title="Toggle Filters"
      >
        <Sparkles className="w-5 h-5" />
      </button>
    </div>
  );
}

