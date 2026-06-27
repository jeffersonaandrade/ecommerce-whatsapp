export type TourStepId = 'deployment-center' | 'nav-produtos' | 'settings-form'

export type TourStepDef = {
  id: TourStepId
  target: `[data-onboarding="${string}"]`
  route: string
  title: string
  description: string
  navigateOnNext?: string
  resumeStepId?: TourStepId
  skipIfMissing?: boolean
}

export const TOUR_PHASE = 2 as const

export const PHASE_2_COMPLETION_MESSAGE =
  'Nos próximos passos você aprenderá a importar produtos, revisar imagens e configurar banners.'

export const PHASE_2_TOUR_STEPS: TourStepDef[] = [
  {
    id: 'deployment-center',
    target: '[data-onboarding="deployment-center"]',
    route: '/admin',
    title: 'Centro de Implantação',
    description:
      'Acompanhe aqui o progresso da configuração da sua loja e o que falta para começar a vender.',
    skipIfMissing: true,
  },
  {
    id: 'nav-produtos',
    target: '[data-onboarding="nav-produtos"]',
    route: '/admin',
    title: 'Gerenciar produtos',
    description: 'Todo o gerenciamento da loja começa aqui.',
    navigateOnNext: '/admin/settings',
    resumeStepId: 'settings-form',
    skipIfMissing: true,
  },
  {
    id: 'settings-form',
    target: '[data-onboarding="settings-form"]',
    route: '/admin/settings',
    title: 'Configurações da loja',
    description:
      'Configure as informações da sua loja antes de cadastrar produtos.',
    skipIfMissing: true,
  },
]

export function getTourStepsForPhase(phase: number): TourStepDef[] {
  if (phase === TOUR_PHASE) return PHASE_2_TOUR_STEPS
  return []
}

export function getStepById(id: TourStepId, steps = PHASE_2_TOUR_STEPS): TourStepDef | undefined {
  return steps.find((step) => step.id === id)
}

export function findStepIndex(id: TourStepId, steps = PHASE_2_TOUR_STEPS): number {
  return steps.findIndex((step) => step.id === id)
}

export function getNextStepId(
  id: TourStepId,
  steps = PHASE_2_TOUR_STEPS
): TourStepId | undefined {
  const index = findStepIndex(id, steps)
  if (index < 0 || index >= steps.length - 1) return undefined
  return steps[index + 1]?.id
}
