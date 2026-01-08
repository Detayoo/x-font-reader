# Getting Started with Font Reader

## Quick Start

### 1. Build the Extension

```bash
cd code/font-reader-extension
npm run build
```

### 2. Load in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Navigate to and select the `dist` folder inside `code/font-reader-extension`

### 3. Use the Extension

1. Navigate to any webpage
2. Click the Font Reader icon in your Chrome toolbar
3. The extension will automatically scan and display all fonts
4. Click the clipboard icon to copy any font name

## Development Mode

For live development with hot reload:

```bash
npm run dev
```

Then load the extension from the `dist` folder as described above. Changes will auto-reload.

## Project Structure

- `src/App.tsx` - Main popup UI component
- `src/content/content.ts` - Content script that scans webpage fonts
- `src/background/background.ts` - Background service worker
- `manifest.json` - Chrome extension configuration
- `public/` - Static assets

## Features

✨ **Font Detection** - Scans all visible elements on the page
📊 **Usage Stats** - Shows how many times each font is used
📋 **Quick Copy** - One-click clipboard copy
🎨 **Font Details** - Displays weight, style, and size
🌙 **Dark Mode** - Automatic dark mode support

## Troubleshooting

**Extension not loading?**
- Make sure you've run `npm run build` first
- Check that you're loading the `dist` folder, not the root folder

**Not detecting fonts?**
- Refresh the webpage after installing the extension
- Try clicking "Scan Page" button manually

**Build errors?**
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (requires 20.19+ or 22.12+)

## Next Steps

- Customize the UI in `src/App.tsx`
- Add more font detection features in `src/content/content.ts`
- Publish to Chrome Web Store (requires developer account)