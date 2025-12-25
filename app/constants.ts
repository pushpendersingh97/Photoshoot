import type { Preset } from "./types";

export const PRESETS: Preset[] = [
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

