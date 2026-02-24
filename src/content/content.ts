import type { FontInfo, FontMessage } from "../types/font";

// Function to extract fonts from all elements
function extractFonts(): FontInfo[] {
  const fontMap = new Map<string, FontInfo>();

  // Get all visible elements
  const elements = document.querySelectorAll("*");

  elements.forEach((element) => {
    const computed = window.getComputedStyle(element);
    console.log({ computed });
    const fontFamily = computed.fontFamily;
    const fontWeight = computed.fontWeight;
    const fontStyle = computed.fontStyle;
    const fontSize = computed.fontSize;

    if (!fontFamily) return;

    // Create a unique key for this font combination
    const key = `${fontFamily}-${fontWeight}-${fontStyle}-${fontSize}`;

    if (fontMap.has(key)) {
      const existing = fontMap.get(key)!;
      fontMap.set(key, {
        ...existing,
        count: existing.count + 1,
      });
    } else {
      fontMap.set(key, {
        family: fontFamily.replace(/['"]/g, ""),
        weight: fontWeight,
        style: fontStyle,
        size: fontSize,
        element: element.tagName.toLowerCase(),
        count: 1,
      });
    }
  });

  // Convert map to array and sort by count
  return Array.from(fontMap.values()).sort((a, b) => b.count - a.count);
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener(
  (
    message: FontMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: FontMessage) => void
  ) => {
    if (message.type === "GET_FONTS") {
      const fonts = extractFonts();
      sendResponse({ type: "FONTS_RESULT", fonts });
    }
    return true;
  }
);
