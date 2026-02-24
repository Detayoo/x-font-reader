console.log('Font Reader extension background script loaded')

chrome.runtime.onInstalled.addListener(() => {
  console.log('Font Reader extension installed')
})
