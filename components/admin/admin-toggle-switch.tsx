'use client'

type AdminToggleSwitchProps = {
  active: boolean
  disabled?: boolean
  onToggle: () => void
  ariaLabel?: string
}

export function AdminToggleSwitch({
  active,
  disabled = false,
  onToggle,
  ariaLabel,
}: AdminToggleSwitchProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      aria-label={ariaLabel ?? (active ? 'Desativar' : 'Ativar')}
      className={`inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-40 ${
        active ? 'bg-ink' : 'bg-soft-cloud'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 translate-x-1 rounded-full bg-white shadow transition-transform ${
          active ? 'translate-x-6' : ''
        }`}
      />
    </button>
  )
}
