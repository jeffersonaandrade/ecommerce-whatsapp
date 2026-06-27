'use client'

type AdminReorderButtonsProps = {
  onMoveUp: () => void
  onMoveDown: () => void
  disabled?: boolean
}

export function AdminReorderButtons({
  onMoveUp,
  onMoveDown,
  disabled = false,
}: AdminReorderButtonsProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        disabled={disabled}
        onClick={onMoveUp}
        aria-label="Mover para cima"
        className="rounded px-1 text-mute hover:text-ink disabled:opacity-40"
      >
        ▲
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onMoveDown}
        aria-label="Mover para baixo"
        className="rounded px-1 text-mute hover:text-ink disabled:opacity-40"
      >
        ▼
      </button>
    </div>
  )
}
