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
