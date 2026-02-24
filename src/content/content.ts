import type { FontInfo, FontMessage } from "../types/font";

function extractFonts(): FontInfo[] {
  const fontMap = new Map<string, FontInfo>();

  const elements = document.querySelectorAll("*");

  elements.forEach((element) => {
    const computed = window.getComputedStyle(element);
    console.log({ computed });
    const fontFamily = computed.fontFamily;
    const fontWeight = computed.fontWeight;
    const fontStyle = computed.fontStyle;
    const fontSize = computed.fontSize;

    if (!fontFamily) return;

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

  return Array.from(fontMap.values()).sort((a, b) => b.count - a.count);
}

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
