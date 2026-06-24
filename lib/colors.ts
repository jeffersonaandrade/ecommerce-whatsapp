/**
 * Color utilities
 */

export function colorNameToHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    'Preto': '#000000',
    'Branco': '#FFFFFF',
    'Vermelho': '#EF4444',
    'Azul': '#3B82F6',
    'Azul Marinho': '#1E3A8A',
    'Cinza': '#9CA3AF',
  }
  return colorMap[colorName] || '#D1D5DB'
}

const LIGHT_SWATCH_HEX = new Set(['#FFFFFF', '#FFF', '#D1D5DB'])

export function colorSwatchBorderClass(colorName: string): string {
  const hex = colorNameToHex(colorName).toUpperCase()
  return LIGHT_SWATCH_HEX.has(hex)
    ? 'border-gray-400 ring-1 ring-inset ring-gray-300'
    : 'border-gray-300'
}
