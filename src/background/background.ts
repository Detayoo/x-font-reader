// Background service worker for the extension
console.log('Font Reader extension background script loaded')

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Font Reader extension installed')
})