# Font Reader - Chrome Extension

A Chrome extension that scans and identifies fonts used on any webpage.

## Features

- 🔍 Scan any webpage to detect all fonts in use
- 📋 Copy font names to clipboard with one click
- 🎨 View font properties (weight, style, size)
- 📊 See usage count for each font
- 🌙 Dark mode support
- ⚡ Fast and lightweight

## Tech Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS v4** - Styling
- **Heroicons** - Icon library
- **@crxjs/vite-plugin** - Chrome extension support

## Development

### Prerequisites

- Node.js 20.19+ or 22.12+
- Chrome browser

### Installation

```bash
cd code/font-reader-extension
npm install
```

### Development Mode

```bash
npm run dev
```

Then:
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `dist` folder from this project

### Build for Production

```bash
npm run build
```

The production-ready extension will be in the `dist` folder.

## How to Use

1. Click the Font Reader extension icon in your Chrome toolbar
2. The extension will automatically scan the current page
3. Click "Scan Page" to refresh the font list
4. Click the clipboard icon next to any font to copy its name
5. View font details including weight, style, and size

## Extension Structure

```
src/
├── App.tsx              # Main popup UI
├── main.tsx            # React entry point
├── index.css           # Global styles (Tailwind)
├── types/
├── font.ts         # TypeScript interfaces
├── content/
├── content.ts      # Content script for font detection
└── background/
    └── background.ts   # Background service worker
```