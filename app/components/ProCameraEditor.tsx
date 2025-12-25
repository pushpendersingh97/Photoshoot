"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  FlipHorizontal,
  RotateCcw,
  RotateCw,
  Download,
  X,
  Square,
  Film,
  Monitor,
  Sparkles,
  Image as ImageIcon,
  Sun,
  Moon,
} from "lucide-react";

type FilterState = {
  brightness: number;
  contrast: number;
  saturation: number;
  sepia: number;
  hueRotate: number;
  invert: number;
  grayscale: number;
};

type Preset = {
  name: string;
  filters: FilterState;
};

const PRESETS: Preset[] = [
  {
    name: "Original",
    filters: {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      sepia: 0,
      hueRotate: 0,
      invert: 0,
      grayscale: 0,
    },
  },
  {
    name: "Vintage",
    filters: {
      brightness: 110,
      contrast: 90,
      saturation: 85,
      sepia: 30,
      hueRotate: 5,
      invert: 0,
      grayscale: 0,
    },
  },
  {
    name: "Noir",
    filters: {
      brightness: 90,
      contrast: 120,
      saturation: 0,
      sepia: 0,
      hueRotate: 0,
      invert: 0,
      grayscale: 100,
    },
  },
  {
    name: "Vivid",
    filters: {
      brightness: 105,
      contrast: 110,
      saturation: 150,
      sepia: 0,
      hueRotate: 0,
      invert: 0,
      grayscale: 0,
    },
  },
  {
    name: "Cyberpunk",
    filters: {
      brightness: 95,
      contrast: 130,
      saturation: 140,
      sepia: 0,
      hueRotate: 180,
      invert: 0,
      grayscale: 0,
    },
  },
  {
    name: "Warm",
    filters: {
      brightness: 105,
      contrast: 100,
      saturation: 110,
      sepia: 15,
      hueRotate: -10,
      invert: 0,
      grayscale: 0,
    },
  },
  {
    name: "Cool",
    filters: {
      brightness: 100,
      contrast: 105,
      saturation: 95,
      sepia: 0,
      hueRotate: 10,
      invert: 0,
      grayscale: 0,
    },
  },
  {
    name: "Dramatic",
    filters: {
      brightness: 85,
      contrast: 140,
      saturation: 120,
      sepia: 0,
      hueRotate: 0,
      invert: 0,
      grayscale: 0,
    },
  },
];

type AspectRatio = "original" | "1:1" | "9:16" | "16:9";

export default function ProCameraEditor() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [filters, setFilters] = useState<FilterState>(PRESETS[0].filters);
  const [history, setHistory] = useState<FilterState[]>([PRESETS[0].filters]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showOriginal, setShowOriginal] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("original");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showCameraFilters, setShowCameraFilters] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
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

  // Start camera stream
  const startStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions.");
    }
  }, [facingMode]);

  // Stop camera stream
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  // Switch camera
  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
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

    // Reset transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Apply filters to the captured image
    const filterString = `
      brightness(${filters.brightness}%)
      contrast(${filters.contrast}%)
      saturate(${filters.saturation}%)
      sepia(${filters.sepia}%)
      hue-rotate(${filters.hueRotate}deg)
      invert(${filters.invert}%)
      grayscale(${filters.grayscale}%)
    `
      .trim()
      .replace(/\s+/g, " ");

    // Create a temporary canvas to apply filters
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (tempCtx) {
      tempCtx.filter = filterString;
      tempCtx.drawImage(canvas, 0, 0);
      // Copy filtered image back to main canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(tempCanvas, 0, 0);
    }

    const dataUrl = canvas.toDataURL("image/png");
    setCapturedImage(dataUrl);
    setIsEditing(true);
    setShowCameraFilters(false);
    stopStream();

    // Flash effect
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 150);

    // Shutter sound
    playShutterSound();
  }, [isMirrored, stopStream, playShutterSound, filters]);

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

  // Filter management
  const updateFilter = useCallback(
    (key: keyof FilterState, value: number) => {
      setFilters((prev) => {
        const newFilters = { ...prev, [key]: value };
        // Add to history
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newFilters);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        return newFilters;
      });
    },
    [history, historyIndex]
  );

  // Apply preset
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

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setFilters(history[newIndex]);
    }
  }, [history, historyIndex]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setFilters(history[newIndex]);
    }
  }, [history, historyIndex]);

  // Reset to camera
  const resetToCamera = useCallback(() => {
    setCapturedImage(null);
    setIsEditing(false);
    setShowCameraFilters(false);
    setFilters(PRESETS[0].filters);
    setHistory([PRESETS[0].filters]);
    setHistoryIndex(0);
    setAspectRatio("original");
    startStream();
  }, [startStream]);

  // Export image
  const exportImage = useCallback(() => {
    if (!capturedImage || !canvasRef.current) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Calculate dimensions based on aspect ratio
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

      // Draw image with crop
      ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

      // Apply filters
      const filterString = `
        brightness(${filters.brightness}%)
        contrast(${filters.contrast}%)
        saturate(${filters.saturation}%)
        sepia(${filters.sepia}%)
        hue-rotate(${filters.hueRotate}deg)
        invert(${filters.invert}%)
        grayscale(${filters.grayscale}%)
      `
        .trim()
        .replace(/\s+/g, " ");

      // Create a temporary canvas for filters
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;

      tempCtx.filter = filterString;
      tempCtx.drawImage(canvas, 0, 0);

      // Download
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
  }, [capturedImage, filters, aspectRatio]);

  // Start stream on mount
  useEffect(() => {
    if (!isEditing) {
      startStream();
    }
    return () => {
      stopStream();
    };
  }, [facingMode, isEditing, startStream, stopStream]);

  // Generate filter CSS string
  const getFilterStyle = useCallback(() => {
    if (showOriginal) return {};
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
  }, [filters, showOriginal]);

  // Generate filter CSS string for video
  const getVideoFilterStyle = useCallback(() => {
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

  // Get aspect ratio style
  const getAspectRatioStyle = useCallback(() => {
    if (aspectRatio === "original") return {};
    if (aspectRatio === "1:1") return { aspectRatio: "1 / 1" };
    if (aspectRatio === "9:16") return { aspectRatio: "9 / 16" };
    if (aspectRatio === "16:9") return { aspectRatio: "16 / 9" };
    return {};
  }, [aspectRatio]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDarkMode ? "bg-zinc-950 text-white" : "bg-zinc-50 text-zinc-900"
      }`}
    >
      {/* Theme toggle button */}
      <button
        onClick={toggleTheme}
        className={`fixed top-4 right-4 z-50 p-3 rounded-full backdrop-blur-sm transition-colors ${
          isDarkMode
            ? "bg-zinc-800/90 hover:bg-zinc-700 text-white"
            : "bg-white/90 hover:bg-zinc-100 text-zinc-900 shadow-lg"
        }`}
        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>

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
          <div
            className={`text-9xl font-bold animate-pulse ${
              isDarkMode ? "text-white" : "text-white"
            }`}
          >
            {countdown}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row h-screen">
        {/* Main preview area */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 relative overflow-hidden">
          {!isEditing ? (
            // Camera view
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
                  ...getVideoFilterStyle(),
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
                  onClick={() => setIsMirrored(!isMirrored)}
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
                  onClick={startCountdown}
                  disabled={!isStreaming || countdown !== null}
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
                  onClick={switchCamera}
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
                onClick={() => setShowCameraFilters(!showCameraFilters)}
                className={`absolute top-4 right-4 p-3 rounded-lg backdrop-blur-sm transition-colors ${
                  isDarkMode
                    ? "bg-zinc-800/90 hover:bg-zinc-700 text-white"
                    : "bg-white/90 hover:bg-zinc-100 text-zinc-900 shadow-lg"
                } ${
                  showCameraFilters
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : ""
                }`}
                title="Toggle Filters"
              >
                <Sparkles className="w-5 h-5" />
              </button>
            </div>
          ) : (
            // Editor view
            <div className="relative w-full max-w-4xl">
              <div
                className="w-full rounded-lg overflow-hidden"
                style={getAspectRatioStyle()}
              >
                <img
                  src={capturedImage || ""}
                  alt="Captured"
                  className="w-full h-full object-contain"
                  style={getFilterStyle()}
                />
              </div>

              {/* Editor controls */}
              <div className="absolute top-4 left-4 flex gap-2">
                <button
                  onClick={resetToCamera}
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
                  onClick={exportImage}
                  className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg backdrop-blur-sm transition-colors text-white"
                  title="Export"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
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
              {/* Presets for camera */}
              <div>
                <h3
                  className={`text-sm font-semibold mb-3 ${
                    isDarkMode ? "text-zinc-400" : "text-zinc-600"
                  }`}
                >
                  Presets
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className={`p-2 rounded-lg transition-colors text-xs ${
                        JSON.stringify(filters) ===
                        JSON.stringify(preset.filters)
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
              </div>

              {/* Filter sliders */}
              <div className="space-y-4">
                <h3
                  className={`text-sm font-semibold ${
                    isDarkMode ? "text-zinc-400" : "text-zinc-600"
                  }`}
                >
                  Adjustments
                </h3>

                {Object.entries(filters).map(([key, value]) => {
                  const sliderBg = isDarkMode ? "#27272a" : "#e4e4e7";
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
                        min={key === "hueRotate" ? -180 : 0}
                        max={
                          key === "hueRotate"
                            ? 180
                            : key === "invert" || key === "grayscale"
                            ? 100
                            : 200
                        }
                        value={value}
                        onChange={(e) =>
                          updateFilter(
                            key as keyof FilterState,
                            Number(e.target.value)
                          )
                        }
                        className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-600 ${
                          isDarkMode ? "bg-zinc-800" : "bg-zinc-200"
                        }`}
                        style={{
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                            ((value - (key === "hueRotate" ? -180 : 0)) /
                              (key === "hueRotate"
                                ? 360
                                : key === "invert" || key === "grayscale"
                                ? 100
                                : 200)) *
                            100
                          }%, ${sliderBg} ${
                            ((value - (key === "hueRotate" ? -180 : 0)) /
                              (key === "hueRotate"
                                ? 360
                                : key === "invert" || key === "grayscale"
                                ? 100
                                : 200)) *
                            100
                          }%, ${sliderBg} 100%)`,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
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
                  disabled={historyIndex === 0}
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
                  disabled={historyIndex === history.length - 1}
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

              {/* Aspect ratio */}
              <div>
                <h3
                  className={`text-sm font-semibold mb-3 ${
                    isDarkMode ? "text-zinc-400" : "text-zinc-600"
                  }`}
                >
                  Aspect Ratio
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAspectRatio("original")}
                    className={`flex-1 p-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      aspectRatio === "original"
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : isDarkMode
                        ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                        : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-xs">Original</span>
                  </button>
                  <button
                    onClick={() => setAspectRatio("1:1")}
                    className={`flex-1 p-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      aspectRatio === "1:1"
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : isDarkMode
                        ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                        : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
                    }`}
                  >
                    <Square className="w-4 h-4" />
                    <span className="text-xs">1:1</span>
                  </button>
                  <button
                    onClick={() => setAspectRatio("9:16")}
                    className={`flex-1 p-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      aspectRatio === "9:16"
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : isDarkMode
                        ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                        : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
                    }`}
                  >
                    <Film className="w-4 h-4" />
                    <span className="text-xs">9:16</span>
                  </button>
                  <button
                    onClick={() => setAspectRatio("16:9")}
                    className={`flex-1 p-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      aspectRatio === "16:9"
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : isDarkMode
                        ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                        : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    <span className="text-xs">16:9</span>
                  </button>
                </div>
              </div>

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

              {/* Filter sliders */}
              <div className="space-y-4">
                <h3
                  className={`text-sm font-semibold ${
                    isDarkMode ? "text-zinc-400" : "text-zinc-600"
                  }`}
                >
                  Adjustments
                </h3>

                {Object.entries(filters).map(([key, value]) => {
                  const sliderBg = isDarkMode ? "#27272a" : "#e4e4e7";
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
                        min={key === "hueRotate" ? -180 : 0}
                        max={
                          key === "hueRotate"
                            ? 180
                            : key === "invert" || key === "grayscale"
                            ? 100
                            : 200
                        }
                        value={value}
                        onChange={(e) =>
                          updateFilter(
                            key as keyof FilterState,
                            Number(e.target.value)
                          )
                        }
                        className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-600 ${
                          isDarkMode ? "bg-zinc-800" : "bg-zinc-200"
                        }`}
                        style={{
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                            ((value - (key === "hueRotate" ? -180 : 0)) /
                              (key === "hueRotate"
                                ? 360
                                : key === "invert" || key === "grayscale"
                                ? 100
                                : 200)) *
                            100
                          }%, ${sliderBg} ${
                            ((value - (key === "hueRotate" ? -180 : 0)) /
                              (key === "hueRotate"
                                ? 360
                                : key === "invert" || key === "grayscale"
                                ? 100
                                : 200)) *
                            100
                          }%, ${sliderBg} 100%)`,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
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
            <div
              className="flex gap-3 overflow-x-auto pb-2"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: isDarkMode
                  ? "#3f3f46 #18181b"
                  : "#d4d4d8 #ffffff",
              }}
            >
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
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
                        style={{
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
                        }}
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
