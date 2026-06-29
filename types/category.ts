export type Category = {
  id: string
  name: string
  slug: string
  description: string
  sortOrder: number
  visible: boolean
  parentId?: string | null
  depth: number
  path: string
  imagePath?: string | null
  createdAt: string
  updatedAt: string
}

export type CategoryInput = {
  name: string
  slug?: string
  description?: string
  sortOrder?: number
  visible?: boolean
  parentId?: string | null
  imagePath?: string | null
}
