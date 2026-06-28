export type PersonalizationAddon = {
  name: string
  number: string
  notes?: string
}

export type CartAddons = {
  personalization?: PersonalizationAddon
}
