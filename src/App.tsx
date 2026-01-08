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
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      
      if (!tab.id) {
        throw new Error('No active tab found')
      }

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
    scanFonts()
  }, [])

  return (
    <div className="w-[400px] h-[600px] bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-black dark:bg-gray-950 p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Font Reader</h1>
        <p className="text-gray-300 dark:text-gray-400 text-sm">
          Discover fonts used on this webpage
        </p>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Scan Button */}
        <button
          onClick={scanFonts}
          disabled={loading}
          className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors mb-4"
        >
          <MagnifyingGlassIcon className="w-5 h-5" />
          {loading ? 'Scanning...' : 'Scan Page'}
        </button>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Fonts List */}
        <div className="space-y-2 max-h-[440px] overflow-y-auto">
          {fonts.length === 0 && !loading && !error && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              Click "Scan Page" to discover fonts
            </div>
          )}

          {fonts.map((font, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold text-gray-900 dark:text-white truncate"
                    style={{ fontFamily: font.family }}
                  >
                    {font.family}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Used {font.count} {font.count === 1 ? 'time' : 'times'}
                  </p>
                </div>
                <button
                  onClick={() => copyFont(font.family)}
                  className="flex-shrink-0 p-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                  title="Copy font name"
                >
                  <ClipboardDocumentIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Weight:</span>
                  <span className="ml-1 text-gray-700 dark:text-gray-200">
                    {font.weight}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Style:</span>
                  <span className="ml-1 text-gray-700 dark:text-gray-200">
                    {font.style}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Size:</span>
                  <span className="ml-1 text-gray-700 dark:text-gray-200">
                    {font.size}
                  </span>
                </div>
              </div>

              {copied === font.family && (
                <div className="mt-2 text-xs text-green-600 dark:text-green-400 font-medium">
                  ✓ Copied to clipboard
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App