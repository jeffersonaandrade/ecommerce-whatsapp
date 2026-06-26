export function validateBannerImageFile(file: File): string | null {
  if (!(file instanceof File) || file.size === 0) {
    return 'Selecione uma imagem desktop válida.'
  }
  if (file.size > 5 * 1024 * 1024) {
    return 'Imagem deve ter no máximo 5 MB.'
  }
  const allowed = ['image/png', 'image/jpeg', 'image/webp']
  const ext = file.name.split('.').pop()?.toLowerCase()
  const extOk = ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'webp'
  if (!allowed.includes(file.type) && !extOk) {
    return 'Formato aceito: PNG, JPG ou WebP.'
  }
  return null
}

export function assertBannerDesktopPath(desktopImagePath: string): void {
  if (!desktopImagePath.trim()) {
    throw new Error('Imagem desktop é obrigatória para criar um slide.')
  }
}

export function hasBannerDesktopImage(desktopImagePath: string | null | undefined): boolean {
  return Boolean(desktopImagePath?.trim())
}
