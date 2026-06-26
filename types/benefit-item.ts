export type BenefitItem = {
  id: string
  title: string
  description: string
  sortOrder: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export type BenefitItemInput = {
  title: string
  description: string
  sortOrder?: number
  active?: boolean
}
