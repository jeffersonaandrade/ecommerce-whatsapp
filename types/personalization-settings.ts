export type PersonalizationSettings = {
  enabled: boolean
  defaultPrice: number
  nameMaxLength: number
  numberMin: number
  numberMax: number
  notesRequired: boolean
  notesMaxLength: number
  updatedAt: string
}

export type PersonalizationSettingsInput = Partial<
  Omit<PersonalizationSettings, 'updatedAt'>
>
