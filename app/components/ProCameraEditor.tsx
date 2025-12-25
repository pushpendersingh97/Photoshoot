"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useCamera } from "../hooks/useCamera";
import { useFilters } from "../hooks/useFilters";
import CameraView from "./CameraView";
import EditorView from "./EditorView";
import FilterControls from "./FilterControls";
import PresetGrid from "./PresetGrid";
import AspectRatioSelector from "./AspectRatioSelector";
import ThemeToggle from "./ThemeToggle";
import type { AspectRatio, FacingMode } from "../types";
import { RotateCcw, RotateCw, Sparkles } from "lucide-react";

export default function ProCameraEditor() {
  const [isMirrored, setIsMirrored] = useState(true);
  const [facingMode, setFacingMode] = useState<FacingMode>("user");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("original");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showCameraFilters, setShowCameraFilters] = useState(false);

  const { videoRef, isStreaming, stopStream } = useCamera(facingMode);
  const {
    filters,
    updateFilter,
    applyPreset,
    undo,
    redo,
    reset,
    getFilterStyle,
    canUndo,
    canRedo,
  } = useFilters();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context for shutter sound
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Play shutter sound
  const playShutterSound = useCallback(() => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContextRef.current.currentTime + 0.1
    );

    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + 0.1);
  }, []);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Apply filters to the captured image
    const filterString = getFilterStyle().filter as string;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (tempCtx) {
      tempCtx.filter = filterString;
      tempCtx.drawImage(canvas, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(tempCanvas, 0, 0);
    }

    const dataUrl = canvas.toDataURL("image/png");
    setCapturedImage(dataUrl);
    setIsEditing(true);
    setShowCameraFilters(false);
    stopStream();

    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 150);
    playShutterSound();
  }, [isMirrored, stopStream, playShutterSound, getFilterStyle, videoRef]);

  // Countdown and capture
  const startCountdown = useCallback(() => {
    if (!isStreaming || countdown !== null) return;

    let count = 3;
    setCountdown(count);

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        setCountdown(null);
        capturePhoto();
      }
    }, 1000);
  }, [isStreaming, countdown, capturePhoto]);

  // Switch camera
  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  // Reset to camera
  const resetToCamera = useCallback(() => {
    setCapturedImage(null);
    setIsEditing(false);
    setShowCameraFilters(false);
    reset();
    setAspectRatio("original");
  }, [reset]);

  // Export image
  const exportImage = useCallback(() => {
    if (!capturedImage || !canvasRef.current) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let width = img.width;
      let height = img.height;
      let x = 0;
      let y = 0;

      if (aspectRatio === "1:1") {
        const size = Math.min(width, height);
        width = size;
        height = size;
        x = (img.width - size) / 2;
        y = (img.height - size) / 2;
      } else if (aspectRatio === "9:16") {
        const targetRatio = 9 / 16;
        const currentRatio = img.width / img.height;
        if (currentRatio > targetRatio) {
          height = img.height;
          width = height * targetRatio;
          x = (img.width - width) / 2;
        } else {
          width = img.width;
          height = width / targetRatio;
          y = (img.height - height) / 2;
        }
      } else if (aspectRatio === "16:9") {
        const targetRatio = 16 / 9;
        const currentRatio = img.width / img.height;
        if (currentRatio > targetRatio) {
          height = img.height;
          width = height * targetRatio;
          x = (img.width - width) / 2;
        } else {
          width = img.width;
          height = width / targetRatio;
          y = (img.height - height) / 2;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

      const filterString = getFilterStyle().filter as string;

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;

      tempCtx.filter = filterString;
      tempCtx.drawImage(canvas, 0, 0);

      tempCanvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "captured-photo.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, "image/png");
    };
    img.src = capturedImage;
  }, [capturedImage, getFilterStyle, aspectRatio]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const filterStyle = getFilterStyle();

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDarkMode ? "bg-zinc-950 text-white" : "bg-zinc-50 text-zinc-900"
      }`}
    >
      <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleTheme} />

      {/* Flash overlay */}
      {showFlash && (
        <div className="fixed inset-0 z-50 bg-white animate-pulse pointer-events-none" />
      )}

      {/* Countdown overlay */}
      {countdown !== null && (
        <div
          className={`fixed inset-0 z-40 flex items-center justify-center pointer-events-none ${
            isDarkMode ? "bg-black/50" : "bg-black/30"
          }`}
        >
          <div className="text-9xl font-bold text-white animate-pulse">
            {countdown}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row h-screen">
        {/* Main preview area */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 relative overflow-hidden">
          {!isEditing ? (
            <CameraView
              videoRef={videoRef}
              isStreaming={isStreaming}
              isMirrored={isMirrored}
              onMirrorToggle={() => setIsMirrored(!isMirrored)}
              onSwitchCamera={switchCamera}
              onCapture={startCountdown}
              onToggleFilters={() => setShowCameraFilters(!showCameraFilters)}
              showFilters={showCameraFilters}
              filterStyle={filterStyle}
              isDarkMode={isDarkMode}
              disabled={!isStreaming || countdown !== null}
            />
          ) : (
            <EditorView
              capturedImage={capturedImage || ""}
              filterStyle={filterStyle}
              aspectRatio={aspectRatio}
              showOriginal={showOriginal}
              onShowOriginal={setShowOriginal}
              onBack={resetToCamera}
              onExport={exportImage}
              isDarkMode={isDarkMode}
            />
          )}
        </div>

        {/* Sidebar - Camera filters */}
        {!isEditing && showCameraFilters && (
          <div
            className={`w-full lg:w-80 border-t lg:border-t-0 lg:border-l overflow-y-auto ${
              isDarkMode
                ? "bg-zinc-900 border-zinc-800"
                : "bg-white border-zinc-200"
            }`}
          >
            <div className="p-4 space-y-6">
              <div>
                <h3
                  className={`text-sm font-semibold mb-3 ${
                    isDarkMode ? "text-zinc-400" : "text-zinc-600"
                  }`}
                >
                  Presets
                </h3>
                <PresetGrid
                  filters={filters}
                  onPresetClick={applyPreset}
                  isDarkMode={isDarkMode}
                  compact
                />
              </div>

              <FilterControls
                filters={filters}
                onFilterChange={updateFilter}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
        )}

        {/* Sidebar - Editor controls */}
        {isEditing && (
          <div
            className={`w-full lg:w-80 border-t lg:border-t-0 lg:border-l overflow-y-auto ${
              isDarkMode
                ? "bg-zinc-900 border-zinc-800"
                : "bg-white border-zinc-200"
            }`}
          >
            <div className="p-4 space-y-6">
              {/* History controls */}
              <div className="flex gap-2">
                <button
                  onClick={undo}
                  disabled={!canUndo}
                  className={`flex-1 p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 ${
                    isDarkMode
                      ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                      : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
                  }`}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-sm">Undo</span>
                </button>
                <button
                  onClick={redo}
                  disabled={!canRedo}
                  className={`flex-1 p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 ${
                    isDarkMode
                      ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                      : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
                  }`}
                >
                  <RotateCw className="w-4 h-4" />
                  <span className="text-sm">Redo</span>
                </button>
              </div>

              <AspectRatioSelector
                aspectRatio={aspectRatio}
                onAspectRatioChange={setAspectRatio}
                isDarkMode={isDarkMode}
              />

              {/* Before/After */}
              <div>
                <button
                  onMouseDown={() => setShowOriginal(true)}
                  onMouseUp={() => setShowOriginal(false)}
                  onMouseLeave={() => setShowOriginal(false)}
                  onTouchStart={() => setShowOriginal(true)}
                  onTouchEnd={() => setShowOriginal(false)}
                  className={`w-full p-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    isDarkMode
                      ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                      : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm">Hold to Preview Original</span>
                </button>
              </div>

              <FilterControls
                filters={filters}
                onFilterChange={updateFilter}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
        )}
      </div>

      {/* Presets gallery */}
      {isEditing && (
        <div
          className={`fixed bottom-0 left-0 right-0 lg:left-80 border-t p-4 ${
            isDarkMode
              ? "bg-zinc-900 border-zinc-800"
              : "bg-white border-zinc-200"
          }`}
        >
          <div className="max-w-6xl mx-auto">
            <h3
              className={`text-sm font-semibold mb-3 ${
                isDarkMode ? "text-zinc-400" : "text-zinc-600"
              }`}
            >
              Presets
            </h3>
            <PresetGrid
              filters={filters}
              onPresetClick={applyPreset}
              isDarkMode={isDarkMode}
              capturedImage={capturedImage}
            />
          </div>
        </div>
      )}

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
