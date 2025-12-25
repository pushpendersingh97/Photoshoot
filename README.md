# 📸 Pro Camera & Editor

A high-performance, professional-grade camera and photo editing application built with Next.js, React, and Tailwind CSS. Capture stunning photos with real-time filters, advanced editing tools, and seamless export functionality.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwind-css)

## ✨ Features

### 🎥 Camera Engine

- **Live Video Stream**: Real-time camera feed with high-quality video capture
- **Mirror Mode**: Toggle mirroring for front-facing camera
- **Camera Switching**: Seamlessly switch between front and back cameras
- **3-Second Countdown**: Visual countdown timer with overlay before capture
- **Flash Effect**: Realistic flash animation on photo capture
- **Shutter Sound**: Audio feedback using Web Audio API

### 🎨 Real-Time Filters (Pre-Capture)

- Apply filters **before** taking the photo
- See filter effects in real-time on the live video feed
- 8 Professional Presets:
  - Original, Vintage, Noir, Vivid, Cyberpunk, Warm, Cool, Dramatic
- 7 Manual Adjustments:
  - Brightness, Contrast, Saturation, Sepia, Hue-rotate, Invert, Grayscale

### ✂️ Advanced Editing Suite

- **Manual Sliders**: Fine-tune all filter parameters with real-time preview
- **Preset Gallery**: Scrollable preset library with visual previews
- **Aspect Ratio Cropping**:
  - Original, 1:1 (Square), 9:16 (Story), 16:9 (Cinematic)
- **Before/After Preview**: Hold button to see original vs. edited comparison
- **Undo/Redo**: Full history stack for non-destructive editing

### 🎨 UI/UX

- **Dark & Light Mode**: Beautiful theme toggle with smooth transitions
- **Lightroom-Style Interface**: Professional, intuitive layout
- **Responsive Design**: Perfect on mobile and desktop
- **Touch-Friendly**: Optimized for touch interactions on mobile devices

### 💾 Export

- **High-Resolution Export**: Full-quality PNG export
- **Filter Preservation**: All filters and crops applied to exported image
- **One-Click Download**: Instant download as `captured-photo.png`

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- A device with camera access (for camera features)

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd photoshoot
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### ⚠️ Important Notes

- **HTTPS Required**: Camera access requires HTTPS in production (or localhost for development)
- **Browser Permissions**: Grant camera permissions when prompted
- **Mobile Support**: Works best on modern browsers with camera API support

## 📁 Project Structure

```
photoshoot/
├── app/
│   ├── components/
│   │   ├── ProCameraEditor.tsx    # Main orchestrator component
│   │   ├── CameraView.tsx         # Camera preview and controls
│   │   ├── EditorView.tsx         # Image editor view
│   │   ├── FilterControls.tsx     # Filter adjustment sliders
│   │   ├── PresetGrid.tsx         # Preset selection grid
│   │   ├── AspectRatioSelector.tsx # Aspect ratio buttons
│   │   └── ThemeToggle.tsx        # Dark/light mode toggle
│   ├── hooks/
│   │   ├── useCamera.ts           # Camera stream management
│   │   └── useFilters.ts          # Filter state management
│   ├── types.ts                   # TypeScript type definitions
│   ├── constants.ts               # Presets and constants
│   ├── page.tsx                   # Main page
│   ├── layout.tsx                  # Root layout
│   └── globals.css                # Global styles
├── public/                        # Static assets
├── package.json
├── tsconfig.json
└── README.md
```

## 🎯 Usage

### Taking a Photo

1. **Allow Camera Access**: Grant permissions when prompted
2. **Adjust Filters** (Optional): Click the ✨ filter icon to open filter controls
3. **Select Preset** (Optional): Choose from 8 professional presets
4. **Fine-Tune** (Optional): Use sliders to adjust individual filter parameters
5. **Capture**: Click the shutter button (or use 3-second countdown)
6. **Edit**: Continue editing in the editor view
7. **Export**: Click download to save your photo

### Editing Features

- **Filters**: Adjust brightness, contrast, saturation, and more
- **Presets**: Apply one-click filter combinations
- **Aspect Ratios**: Crop to square, story, or cinematic formats
- **Before/After**: Hold the preview button to see original
- **Undo/Redo**: Navigate through edit history

## 🛠️ Tech Stack

- **Framework**: [Next.js 16.1](https://nextjs.org/) - React framework with App Router
- **UI Library**: [React 19.2](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS
- **Icons**: [Lucide React](https://lucide.dev/) - Beautiful icon library
- **Language**: [TypeScript 5](https://www.typescriptlang.org/) - Type safety
- **Audio**: Web Audio API - Shutter sound effects

## 🎨 Customization

### Adding New Presets

Edit `app/constants.ts` to add new filter presets:

```typescript
{
  name: "Your Preset",
  filters: {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    sepia: 0,
    hueRotate: 0,
    invert: 0,
    grayscale: 0,
  },
}
```

### Modifying Filter Ranges

Adjust filter min/max values in `components/FilterControls.tsx`:

```typescript
min={key === "hueRotate" ? -180 : 0}
max={key === "hueRotate" ? 180 : 200}
```

### Theme Customization

Modify color schemes in component files using Tailwind classes or update `app/globals.css` for global theme changes.

## 📱 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers with camera API support

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Deploy (automatic HTTPS included)

### Other Platforms

The app can be deployed to any platform supporting Next.js:

- Netlify
- AWS Amplify
- Railway
- Self-hosted with Node.js

**Remember**: Camera features require HTTPS in production!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Icons by [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Made with ❤️ using Next.js and React**
