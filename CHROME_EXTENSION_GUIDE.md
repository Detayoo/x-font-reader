# Chrome Extension Development: A Complete Learning Guide

> **Learn Chrome Extension Development Using the Font Reader Extension**
> 
> This guide uses the Font Reader extension as a real-world example to teach you everything you need to know about building Chrome extensions. By the end, you'll understand how extensions work and be able to create your own.

---

## Table of Contents

1. [What is a Chrome Extension?](#what-is-a-chrome-extension)
2. [Extension Architecture](#extension-architecture)
3. [The Anatomy of Our Extension](#the-anatomy-of-our-extension)
4. [Deep Dive: Understanding Each Component](#deep-dive-understanding-each-component)
5. [Communication Flow](#communication-flow)
6. [Building and Testing](#building-and-testing)
7. [How to Modify and Extend](#how-to-modify-and-extend)
8. [Best Practices and Tips](#best-practices-and-tips)
9. [Publishing Your Extension](#publishing-your-extension)
10. [Common Patterns and Recipes](#common-patterns-and-recipes)

---

## What is a Chrome Extension?

A Chrome extension is a small software program that customizes your browsing experience. It can:
- **Modify web pages** (change how they look or behave)
- **Add new UI elements** (toolbars, popups, sidebars)
- **Interact with browser APIs** (tabs, bookmarks, history, etc.)
- **Communicate with external servers** (fetch data, sync settings)

### Real-World Examples:
- **Ad blockers** - Remove ads from web pages
- **Password managers** - Autofill login forms
- **Screen capture tools** - Take screenshots of web pages
- **Our Font Reader** - Detect and list fonts used on any webpage

---

## Extension Architecture

Chrome extensions have a **modular architecture** with different components that work together:

```
┌─────────────────────────────────────────────────────────┐
│                    CHROME BROWSER                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────┐      ┌──────────────────┐          │
│  │  Background    │◄────►│  Web Page          │          │
│  │  Service Worker│      │  (example.com)      │          │
│  │  (Persistent)  │      └──────────────────┘          │
│  └────────────────┘               ▲                     │
│         ▲                          │                     │
│         │                          │                     │
│         │                  ┌───────▼────────┐           │
│         │                  │  Content Script│           │
│         │                  │  (Injected JS) │           │
│         │                  └────────────────┘           │
│         │                                                │
│  ┌──────▼──────────┐                                    │
│  │   Popup UI      │                                    │
│  │  (React App)    │                                    │
│  └─────────────────┘                                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Key Components:

1. **Manifest File** (`manifest.json`)
   - The "blueprint" of your extension
   - Defines permissions, scripts, and metadata
   - Required for all extensions

2. **Background Script** (Service Worker)
   - Runs in the background
   - Handles events (installation, updates, messages)
   - Persists across browser sessions
   - Cannot access DOM directly

3. **Content Script**
   - Runs in the context of web pages
   - Can read/modify the DOM
   - Limited access to Chrome APIs
   - Isolated from page's JavaScript

4. **Popup UI**
   - The interface users see when clicking the extension icon
   - Built with HTML/CSS/JavaScript (in our case, React)
   - Can communicate with background and content scripts

---

## The Anatomy of Our Extension

Our Font Reader extension demonstrates all the core concepts. Here's the file structure:

```
font-reader-extension/
├── manifest.json              # Extension configuration (MOST IMPORTANT)
├── package.json              # Node dependencies
├── vite.config.ts           # Build configuration
├── index.html               # Popup HTML entry point
│
├── src/
│   ├── main.tsx             # React app entry point
│   ├── App.tsx              # Main popup UI component
│   ├── index.css            # Global styles (Tailwind)
│   │
│   ├── types/
│   │   └── font.ts          # TypeScript interfaces
│   │
│   ├── content/
│   │   └── content.ts       # Content script (runs on web pages)
│   │
│   └── background/
│       └── background.ts    # Background service worker
│
└── public/
    └── icon.svg             # Extension icon
```

### What Makes This Extension Work?

1. **User clicks extension icon** → Opens popup UI
2. **Popup sends message** → Content script running on the active tab
3. **Content script scans** → All fonts used on the webpage
4. **Content script responds** → Sends font data back to popup
5. **Popup displays** → Beautiful list of fonts with details

---

## Deep Dive: Understanding Each Component

### 1. The Manifest File (`manifest.json`)

This is the **heart** of every Chrome extension. Let's break it down:

```json
{
  "manifest_version": 3,           // ← Version 3 is the latest standard
  "name": "Font Reader",
  "version": "1.0.0",
  "description": "Scan and identify fonts used on any webpage",
  
  "permissions": [
    "activeTab",                    // ← Access to the current active tab
    "scripting"                     // ← Required for content scripts
  ],
  
  "action": {
    "default_popup": "index.html"  // ← Popup UI when icon is clicked
  },
  
  "content_scripts": [
    {
      "matches": ["<all_urls>"],   // ← Run on ALL websites
      "js": ["src/content/content.ts"],
      "run_at": "document_idle"    // ← Run after page loads
    }
  ],
  
  "background": {
    "service_worker": "src/background/background.ts",
    "type": "module"               // ← ES modules support
  }
}
```

#### Key Concepts:

**Manifest Version 3 vs 2:**
- Version 3 is newer, more secure, and required for new extensions
- Uses Service Workers instead of background pages
- Better permission model and privacy controls

**Permissions:**
- `activeTab`: Access to the currently active tab (minimal permission)
- `scripting`: Required to inject and run content scripts
- Only request permissions you actually need!

**Content Script Matching:**
- `<all_urls>`: Runs on every website
- You can restrict to specific domains: `["https://example.com/*"]`
- `run_at: "document_idle"`: Waits for DOM to be ready

---

### 2. Background Service Worker (`src/background/background.ts`)

```typescript
// Background service worker for the extension
console.log('Font Reader extension background script loaded')

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Font Reader extension installed')
})
```

#### What Does This Do?

The background script is **always running** in the background. It's perfect for:

- **Listening to browser events** (tab changes, bookmarks added, etc.)
- **Managing extension state** (storing settings, caching data)
- **Coordinating between components** (routing messages)

#### Common Use Cases:

```typescript
// Example: Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log('Page finished loading:', tab.url)
  }
})

// Example: Listen for extension icon clicks
chrome.action.onClicked.addListener((tab) => {
  console.log('Extension icon clicked on tab:', tab.id)
})

// Example: Store data in extension storage
chrome.storage.local.set({ key: 'value' })
chrome.storage.local.get(['key'], (result) => {
  console.log('Stored value:', result.key)
})
```

**Important:** Service Workers are **event-driven** and can be terminated when idle. Don't rely on global variables for long-term storage!

---

### 3. Content Script (`src/content/content.ts`)

This is where the **magic happens**. The content script runs directly on web pages and can access the DOM.

```typescript
import type { FontInfo, FontMessage } from '../types/font'

// Function to extract fonts from all elements
function extractFonts(): FontInfo[] {
  const fontMap = new Map<string, FontInfo>()
  
  // Get all visible elements
  const elements = document.querySelectorAll('*')
  
  elements.forEach((element) => {
    const computed = window.getComputedStyle(element)
    const fontFamily = computed.fontFamily
    const fontWeight = computed.fontWeight
    const fontStyle = computed.fontStyle
    const fontSize = computed.fontSize
    
    if (!fontFamily) return
    
    // Create a unique key for this font combination
    const key = `${fontFamily}-${fontWeight}-${fontStyle}-${fontSize}`
    
    if (fontMap.has(key)) {
      const existing = fontMap.get(key)!
      fontMap.set(key, {
        ...existing,
        count: existing.count + 1,
      })
    } else {
      fontMap.set(key, {
        family: fontFamily.replace(/['"]/g, ''),
        weight: fontWeight,
        style: fontStyle,
        size: fontSize,
        element: element.tagName.toLowerCase(),
        count: 1,
      })
    }
  })
  
  // Convert map to array and sort by count
  return Array.from(fontMap.values()).sort((a, b) => b.count - a.count)
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener(
  (message: FontMessage, _sender, sendResponse) => {
    if (message.type === 'GET_FONTS') {
      const fonts = extractFonts()
      sendResponse({ type: 'FONTS_RESULT', fonts })
    }
    return true  // ← Required for async sendResponse
  }
)
```

#### Key Concepts:

**1. DOM Access:**
```typescript
// You can freely access and modify the DOM
document.querySelectorAll('*')        // Get all elements
window.getComputedStyle(element)      // Get computed CSS
element.textContent = 'Modified!'     // Change content
```

**2. Message Listening:**
```typescript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle messages from popup or background
  if (message.type === 'DO_SOMETHING') {
    sendResponse({ result: 'done' })
  }
  return true  // Keep channel open for async response
})
```

**3. Data Collection Pattern:**
- Use `Map` for efficient deduplication
- Count occurrences for statistics
- Sort by relevance before returning

**Content Script Limitations:**
- Cannot access Chrome APIs directly (except runtime and storage)
- Runs in isolated world (separate from page's JavaScript)
- Cannot access variables or functions from the page

---

### 4. Popup UI (`src/App.tsx`)

The popup is a React application that provides the user interface.

```typescript
import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import type { FontInfo, FontMessage } from './types/font'

function App() {
  const [fonts, setFonts] = useState<FontInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const scanFonts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ 
        active: true, 
        currentWindow: true 
      })
      
      if (!tab.id) {
        throw new Error('No active tab found')
      }

      // Send message to content script
      const response = await chrome.tabs.sendMessage<FontMessage, FontMessage>(
        tab.id,
        { type: 'GET_FONTS' }
      )
      
      if (response && response.fonts) {
        setFonts(response.fonts)
      }
    } catch (err) {
      setError('Failed to scan fonts. Please refresh the page and try again.')
      console.error('Error scanning fonts:', err)
    } finally {
      setLoading(false)
    }
  }

  const copyFont = (fontFamily: string) => {
    navigator.clipboard.writeText(fontFamily)
    setCopied(fontFamily)
    setTimeout(() => setCopied(null), 2000)
  }

  useEffect(() => {
    scanFonts()  // Auto-scan on popup open
  }, [])

  return (
    <div className="w-[400px] h-[600px] bg-white dark:bg-gray-900">
      {/* UI components... */}
    </div>
  )
}
```

#### Key Chrome APIs Used:

**1. Query Tabs:**
```typescript
const [tab] = await chrome.tabs.query({ 
  active: true,      // Current active tab
  currentWindow: true // In the current window
})
```

**2. Send Messages:**
```typescript
const response = await chrome.tabs.sendMessage(
  tab.id,              // Target tab ID
  { type: 'GET_FONTS' } // Message payload
)
```

**3. Clipboard API:**
```typescript
navigator.clipboard.writeText(text)  // Copy to clipboard
```

#### UI Design Decisions:

- **Fixed dimensions** (`400px × 600px`) for consistent popup size
- **Auto-scan** on open for better UX
- **Error handling** with user-friendly messages
- **Loading states** to indicate progress
- **Dark mode support** using Tailwind's dark: classes

---

### 5. Type Definitions (`src/types/font.ts`)

TypeScript interfaces ensure type safety across the extension:

```typescript
export interface FontInfo {
  family: string    // Font family name (e.g., "Arial")
  weight: string    // Font weight (e.g., "400", "bold")
  style: string     // Font style (e.g., "normal", "italic")
  size: string      // Font size (e.g., "16px")
  element: string   // HTML element tag (e.g., "h1", "p")
  count: number     // How many times this font is used
}

export interface FontMessage {
  type: 'GET_FONTS' | 'FONTS_RESULT'
  fonts?: FontInfo[]
}
```

**Why Use Types?**
- **Autocomplete**: Better IDE support
- **Error Prevention**: Catch bugs at compile time
- **Documentation**: Self-documenting code
- **Refactoring**: Safer code changes

---

### 6. Build Configuration (`vite.config.ts`)

Vite + @crxjs/vite-plugin makes extension development easy:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

export default defineConfig({
  plugins: [
    react(),              // React support with Fast Refresh
    tailwindcss(),        // Tailwind CSS v4
    svgr(),               // Import SVGs as React components
    crx({ manifest }),    // Chrome extension support
  ],
  build: {
    rollupOptions: {
      input: {
        popup: 'index.html',
      },
    },
  },
})
```

**What @crxjs/vite-plugin Does:**
- ✅ Automatically bundles all extension files
- ✅ Hot Module Replacement (HMR) in development
- ✅ TypeScript compilation
- ✅ Handles content scripts and background scripts
- ✅ Generates proper manifest.json for production

---

## Communication Flow

Understanding how different parts communicate is crucial:

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  User clicks "Scan Page"                                │
│         │                                                │
│         ▼                                                │
│  ┌──────────────┐                                       │
│  │  Popup UI    │                                       │
│  │  (App.tsx)   │                                       │
│  └──────┬───────┘                                       │
│         │                                                │
│         │ chrome.tabs.sendMessage()                     │
│         │ { type: 'GET_FONTS' }                         │
│         │                                                │
│         ▼                                                │
│  ┌──────────────────────┐                              │
│  │  Content Script      │                              │
│  │  (content.ts)        │                              │
│  │                      │                              │
│  │  1. Receive message  │                              │
│  │  2. Scan DOM         │                              │
│  │  3. Extract fonts    │                              │
│  └──────┬───────────────┘                              │
│         │                                                │
│         │ sendResponse()                                │
│         │ { type: 'FONTS_RESULT', fonts: [...] }       │
│         │                                                │
│         ▼                                                │
│  ┌──────────────┐                                       │
│  │  Popup UI    │                                       │
│  │  Updates UI  │                                       │
│  └──────────────┘                                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Message Passing Patterns:

**1. Popup → Content Script:**
```typescript
// In popup
const response = await chrome.tabs.sendMessage(tabId, {
  type: 'GET_DATA'
})

// In content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_DATA') {
    const data = collectData()
    sendResponse({ data })
  }
  return true
})
```

**2. Content Script → Background:**
```typescript
// In content script
chrome.runtime.sendMessage({ type: 'SAVE_DATA', data: myData })

// In background
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'SAVE_DATA') {
    chrome.storage.local.set({ data: message.data })
  }
})
```

**3. Background → Popup:**
```typescript
// In background
chrome.runtime.sendMessage({ type: 'UPDATE', value: newValue })

// In popup
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'UPDATE') {
    setState(message.value)
  }
})
```

---

## Building and Testing

### Development Workflow:

**Step 1: Install Dependencies**
```bash
npm install
```

**Step 2: Start Development Server**
```bash
npm run dev
```

This runs Vite with HMR. Changes to your code will automatically reload the extension!

**Step 3: Load Extension in Chrome**

1. Open `chrome://extensions/`
2. Enable **Developer mode** (toggle top-right)
3. Click **Load unpacked**
4. Select the `dist` folder

**Step 4: Make Changes and Test**

- Edit code in `src/`
- Save the file
- Extension auto-reloads (with HMR)
- Test by clicking the extension icon

**Step 5: Build for Production**
```bash
npm run build
```

This creates an optimized build in `dist/` ready for distribution.

### Debugging Tips:

**1. Debug Popup:**
- Right-click extension icon → Inspect popup
- Opens DevTools for the popup
- Use console.log(), breakpoints, etc.

**2. Debug Content Script:**
- Open DevTools on the web page (F12)
- Content script logs appear in page console
- Look for your script in Sources tab

**3. Debug Background Script:**
- Go to `chrome://extensions/`
- Find your extension → Click "service worker"
- Opens DevTools for background script

**4. View Errors:**
- Check `chrome://extensions/` for error badges
- Click "Errors" to see detailed error messages

---

## How to Modify and Extend

Now that you understand the structure, here are practical modifications you can make:

### 1. Add a New Feature: Filter Fonts by Type

**Goal:** Add a dropdown to filter fonts (all, serif, sans-serif, monospace)

**Steps:**

1. **Update UI** (`src/App.tsx`):
```typescript
const [filter, setFilter] = useState<string>('all')

const filteredFonts = fonts.filter(font => {
  if (filter === 'all') return true
  if (filter === 'serif') return /serif/i.test(font.family)
  if (filter === 'sans-serif') return /sans-serif/i.test(font.family)
  if (filter === 'monospace') return /mono/i.test(font.family)
  return true
})

// Add dropdown before font list
<select 
  value={filter} 
  onChange={(e) => setFilter(e.target.value)}
  className="w-full p-2 border rounded mb-4"
>
  <option value="all">All Fonts</option>
  <option value="serif">Serif</option>
  <option value="sans-serif">Sans-Serif</option>
  <option value="monospace">Monospace</option>
</select>

// Use filteredFonts instead of fonts in map
{filteredFonts.map((font, index) => (...))}
```

### 2. Add Export Functionality

**Goal:** Let users export font list as JSON

**Steps:**

1. **Add Export Function** (`src/App.tsx`):
```typescript
const exportFonts = () => {
  const dataStr = JSON.stringify(fonts, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'fonts.json'
  link.click()
  URL.revokeObjectURL(url)
}

// Add button
<button onClick={exportFonts} className="...">
  Export as JSON
</button>
```

### 3. Add Settings Storage

**Goal:** Remember user preferences

**Steps:**

1. **Request Permission** (`manifest.json`):
```json
"permissions": ["activeTab", "scripting", "storage"]
```

2. **Save Settings** (`src/App.tsx`):
```typescript
// Load saved filter on mount
useEffect(() => {
  chrome.storage.local.get(['filter'], (result) => {
    if (result.filter) setFilter(result.filter)
  })
}, [])

// Save filter when it changes
useEffect(() => {
  chrome.storage.local.set({ filter })
}, [filter])
```

### 4. Detect Only Visible Text

**Goal:** Ignore hidden elements

**Update Content Script** (`src/content/content.ts`):
```typescript
elements.forEach((element) => {
  const computed = window.getComputedStyle(element)
  
  // Skip hidden elements
  if (computed.display === 'none' || 
      computed.visibility === 'hidden' ||
      computed.opacity === '0') {
    return
  }
  
  // Rest of the code...
})
```

### 5. Add Context Menu

**Goal:** Right-click to scan fonts

**Steps:**

1. **Add Permission** (`manifest.json`):
```json
"permissions": ["activeTab", "scripting", "contextMenus"]
```

2. **Create Context Menu** (`src/background/background.ts`):
```typescript
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'scanFonts',
    title: 'Scan Fonts on This Page',
    contexts: ['page']
  })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'scanFonts' && tab?.id) {
    // Trigger font scan
    chrome.tabs.sendMessage(tab.id, { type: 'GET_FONTS' })
  }
})
```

---

## Best Practices and Tips

### 1. Performance Optimization

**Don't Scan Too Often:**
```typescript
// Bad: Scans on every DOM change
document.addEventListener('DOMSubtreeModified', scanFonts)

// Good: Debounce scans
let timeout: number
document.addEventListener('DOMSubtreeModified', () => {
  clearTimeout(timeout)
  timeout = setTimeout(scanFonts, 500)
})
```

**Limit Element Scanning:**
```typescript
// Bad: Scan everything
const elements = document.querySelectorAll('*')

// Good: Scan only text elements
const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div')
```

### 2. Error Handling

**Always Handle Failures:**
```typescript
try {
  const response = await chrome.tabs.sendMessage(tabId, message)
} catch (error) {
  if (error.message.includes('Receiving end does not exist')) {
    // Content script not loaded yet
    setError('Please refresh the page and try again')
  } else {
    console.error('Unexpected error:', error)
  }
}
```

### 3. Security Best Practices

**Minimize Permissions:**
```json
// Bad: Requesting more than needed
"permissions": ["tabs", "storage", "history", "<all_urls>"]

// Good: Minimal permissions
"permissions": ["activeTab", "scripting"]
```

**Validate Input:**
```typescript
// Always validate messages
chrome.runtime.onMessage.addListener((message, sender) => {
  if (!message || typeof message.type !== 'string') {
    return
  }
  // Process valid message
})
```

**Use Content Security Policy:**
```json
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'self'"
}
```

### 4. User Experience

**Show Loading States:**
```typescript
const [loading, setLoading] = useState(false)

{loading ? (
  <div>Loading...</div>
) : (
  <div>Content</div>
)}
```

**Provide Clear Error Messages:**
```typescript
// Bad
setError('Error')

// Good
setError('Failed to scan fonts. Please refresh the page and try again.')
```

**Auto-save User Preferences:**
```typescript
useEffect(() => {
  chrome.storage.local.set({ preferences: userPreferences })
}, [userPreferences])
```

### 5. Development Workflow

**Use TypeScript:**
- Catch errors early
- Better IDE support
- Self-documenting code

**Split Components:**
```typescript
// Instead of one large App.tsx
// Split into:
// - FontList.tsx
// - FontCard.tsx
// - SearchBar.tsx
// - FilterDropdown.tsx
```

**Use Environment Variables:**
```typescript
// vite.config.ts
define: {
  __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
}

// In code
if (__DEV__) {
  console.log('Debug info')
}
```

---

## Publishing Your Extension

Once your extension is ready, you can publish it to the Chrome Web Store:

### Step 1: Prepare for Publishing

**1. Create Production Build:**
```bash
npm run build
```

**2. Create Promotional Materials:**
- Icon (128x128px minimum)
- Screenshots (1280x800px or 640x400px)
- Promotional tile (440x280px)
- Description and feature list

**3. Update Manifest:**
```json
{
  "name": "Your Extension Name",
  "version": "1.0.0",
  "description": "A compelling description under 132 characters",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

### Step 2: Create Developer Account

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay one-time $5 registration fee
3. Fill in developer information

### Step 3: Upload Extension

1. Click **New Item**
2. Upload `dist` folder as ZIP file
3. Fill in store listing:
   - Detailed description
   - Category
   - Language
   - Screenshots
   - Promotional images
4. Set pricing (free or paid)
5. Submit for review

### Step 4: Review Process

- Review takes **1-3 days** typically
- Address any feedback from reviewers
- Once approved, extension is live!

### Updating Your Extension:

```bash
# Update version in manifest.json
"version": "1.1.0"

# Build and upload new version
npm run build
# Upload ZIP to dashboard
```

---

## Common Patterns and Recipes

### Pattern 1: Inject CSS into Pages

```typescript
// In content script
function injectStyles() {
  const style = document.createElement('style')
  style.textContent = `
    .my-custom-class {
      background: yellow;
      padding: 10px;
    }
  `
  document.head.appendChild(style)
}

injectStyles()
```

### Pattern 2: Listen to Tab Changes

```typescript
// In background script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('Page loaded:', tab.url)
    // Do something when page loads
  }
})
```

### Pattern 3: Badge Notifications

```typescript
// In background script
chrome.action.setBadgeText({ text: '5' })
chrome.action.setBadgeBackgroundColor({ color: '#FF0000' })
```

### Pattern 4: Options Page

**1. Create Options Page:**
```html
<!-- options.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Extension Options</title>
</head>
<body>
  <h1>Settings</h1>
  <label>
    <input type="checkbox" id="autoScan"> Auto-scan on page load
  </label>
  <button id="save">Save</button>
  <script src="options.js"></script>
</body>
</html>
```

```typescript
// options.ts
document.getElementById('save')?.addEventListener('click', () => {
  const autoScan = (document.getElementById('autoScan') as HTMLInputElement).checked
  chrome.storage.local.set({ autoScan })
})
```

**2. Add to Manifest:**
```json
"options_page": "options.html"
```

### Pattern 5: Keyboard Shortcuts

```json
"commands": {
  "scan-fonts": {
    "suggested_key": {
      "default": "Ctrl+Shift+F",
      "mac": "Command+Shift+F"
    },
    "description": "Scan fonts on current page"
  }
}
```

```typescript
// In background script
chrome.commands.onCommand.addListener((command) => {
  if (command === 'scan-fonts') {
    // Trigger scan
  }
})
```

### Pattern 6: Web Request Interception

```json
"permissions": ["webRequest", "webRequestBlocking"],
"host_permissions": ["<all_urls>"]
```

```typescript
// In background script
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    console.log('Request to:', details.url)
    // Optionally block or modify request
    return { cancel: false }
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
)
```

### Pattern 7: Download Files

```typescript
chrome.downloads.download({
  url: 'https://example.com/file.pdf',
  filename: 'my-file.pdf'
})
```

---

## Troubleshooting Common Issues

### Issue 1: "Receiving end does not exist"

**Problem:** Content script not loaded yet when popup sends message

**Solution:**
```typescript
// Inject content script programmatically if needed
await chrome.scripting.executeScript({
  target: { tabId: tab.id },
  files: ['content.js']
})
```

### Issue 2: Popup Closes When Clicked Outside

**Problem:** Popup loses state when closed

**Solution:** Use chrome.storage to persist state
```typescript
useEffect(() => {
  chrome.storage.local.get(['fonts'], (result) => {
    if (result.fonts) setFonts(result.fonts)
  })
}, [])

useEffect(() => {
  chrome.storage.local.set({ fonts })
}, [fonts])
```

### Issue 3: CORS Errors

**Problem:** Can't fetch from external API

**Solution:** Use background script or add host_permissions
```json
"host_permissions": ["https://api.example.com/*"]
```

### Issue 4: Content Script Conflicts

**Problem:** Multiple extensions modifying same elements

**Solution:** Use unique class names and check before modifying
```typescript
if (!element.classList.contains('my-extension-modified')) {
  element.classList.add('my-extension-modified')
  // Modify element
}
```

---

## Next Steps: Build Your Own Extension!

Now that you understand how Chrome extensions work, here are some ideas for your first extension:

### Beginner Projects:

1. **Word Counter**: Count words on any page
2. **Color Picker**: Pick colors from web pages
3. **Link Highlighter**: Highlight all links on a page
4. **Reading Time**: Estimate reading time for articles
5. **Image Downloader**: Download all images from a page

### Intermediate Projects:

1. **Price Tracker**: Track price changes on e-commerce sites
2. **Grammar Checker**: Check grammar as you type
3. **Tab Manager**: Organize and save tab sessions
4. **Screenshot Tool**: Capture and annotate screenshots
5. **Custom CSS Injector**: Apply custom styles to websites

### Advanced Projects:

1. **Password Manager**: Securely store and autofill passwords
2. **Ad Blocker**: Block ads and trackers
3. **Developer Tools**: Inspect and debug web applications
4. **Automation Tool**: Automate repetitive web tasks
5. **API Client**: Beautiful UI for testing APIs

---

## Resources and Learning More

### Official Documentation:
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome API Reference](https://developer.chrome.com/docs/extensions/reference/)

### Tutorials:
- [Getting Started Tutorial](https://developer.chrome.com/docs/extensions/mv3/getstarted/)
- [Sample Extensions](https://github.com/GoogleChrome/chrome-extensions-samples)

### Tools:
- [@crxjs/vite-plugin](https://crxjs.dev/vite-plugin/) - Build tool we used
- [Extension Reloader](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid) - Auto-reload during development
- [Extension Source Viewer](https://chrome.google.com/webstore/detail/chrome-extension-source-v/jifpbeccnghkjeaalbbjmodiffmgedin) - Study other extensions

### Community:
- [r/chromeextensions](https://reddit.com/r/chromeextensions) - Reddit community
- [Stack Overflow](https://stackoverflow.com/questions/tagged/google-chrome-extension) - Q&A
- [Chrome Extension Discord](https://discord.gg/chrome-extensions) - Real-time help

---

## Conclusion

Congratulations! You now have a solid understanding of Chrome extension development. You've learned:

✅ **Extension Architecture** - How components work together  
✅ **Manifest Configuration** - The blueprint of extensions  
✅ **Message Passing** - Communication between components  
✅ **Chrome APIs** - Interacting with the browser  
✅ **Build Process** - Development and production workflows  
✅ **Best Practices** - Writing maintainable, secure extensions  
✅ **Publishing** - Getting your extension to users  

The Font Reader extension is a great starting point. Use it as a template, modify it, break it, rebuild it - that's the best way to learn!

**Remember:**
- Start small and iterate
- Test thoroughly before publishing
- Listen to user feedback
- Keep learning and experimenting

Now go build something amazing! 🚀

---

*This guide was created to help you learn Chrome extension development. If you have questions or suggestions, feel free to reach out to the community or contribute improvements to this documentation.*