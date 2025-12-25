export type FilterState = {
  brightness: number;
  contrast: number;
  saturation: number;
  sepia: number;
  hueRotate: number;
  invert: number;
  grayscale: number;
};

export type Preset = {
  name: string;
  filters: FilterState;
};

export type AspectRatio = "original" | "1:1" | "9:16" | "16:9";

export type FacingMode = "user" | "environment";

