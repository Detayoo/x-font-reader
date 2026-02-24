export interface FontInfo {
  family: string
  weight: string
  style: string
  size: string
  element: string
  count: number
}

export interface FontMessage {
  type: 'GET_FONTS' | 'FONTS_RESULT'
  fonts?: FontInfo[]
}
