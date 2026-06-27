export type TourStepId =
  | 'deployment-center'
  | 'nav-loja'
  | 'settings-form'
  | 'import-wizard'
  | 'media-center'
  | 'categories-list'
  | 'banners-list'
  | 'review-storefront'

export type TourStepDef = {
  id: TourStepId
  target: `[data-onboarding="${string}"]`
  route: string
  title: string
  description: string
  requiresMigrationTools?: boolean
  skipIfMissing?: boolean
}

export const TOUR_PHASE = 3 as const

export const TOUR_COMPLETION_MESSAGE =
  'Tour concluído! Continue pelo Centro de Implantação para finalizar tarefas pendentes.'

/** @deprecated Use TOUR_COMPLETION_MESSAGE */
export const PHASE_2_COMPLETION_MESSAGE = TOUR_COMPLETION_MESSAGE

export const STEP_ROUTES: Record<TourStepId, string> = {
  'deployment-center': '/admin',
  'nav-loja': '/admin',
  'settings-form': '/admin/settings',
  'import-wizard': '/admin/import',
  'media-center': '/admin/products/media',
  'categories-list': '/admin/categories',
  'banners-list': '/admin/banners',
  'review-storefront': '/admin',
}

export const INTRO_TOUR_STEPS: TourStepDef[] = [
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
    id: 'nav-loja',
    target: '[data-onboarding="nav-loja"]',
    route: '/admin',
    title: 'Configurar a loja',
    description:
      'Acesse configurações, banners e demais opções da vitrine a partir da seção Loja.',
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

export const OPERATIONS_TOUR_STEPS: TourStepDef[] = [
  {
    id: 'import-wizard',
    target: '[data-onboarding="import-wizard"]',
    route: '/admin/import',
    title: 'Importar produtos',
    description:
      'Envie uma planilha CSV para cadastrar produtos em massa. Baixe o template de exemplo na página.',
    requiresMigrationTools: true,
    skipIfMissing: true,
  },
  {
    id: 'media-center',
    target: '[data-onboarding="media-center"]',
    route: '/admin/products/media',
    title: 'Central de Mídia',
    description:
      'Revise e migre imagens dos produtos importados antes de publicar na vitrine.',
    requiresMigrationTools: true,
    skipIfMissing: true,
  },
  {
    id: 'categories-list',
    target: '[data-onboarding="categories-list"]',
    route: '/admin/categories',
    title: 'Categorias',
    description: 'Organize as categorias visíveis no menu da loja.',
    skipIfMissing: true,
  },
  {
    id: 'banners-list',
    target: '[data-onboarding="banners-list"]',
    route: '/admin/banners',
    title: 'Banners da home',
    description: 'Configure os slides do carrossel na página inicial (desktop e mobile).',
    skipIfMissing: true,
  },
  {
    id: 'review-storefront',
    target: '[data-onboarding="review-storefront"]',
    route: '/admin',
    title: 'Revisar a loja',
    description:
      'Abra a vitrine, confira layout e produtos. Marque como revisado quando estiver satisfeito.',
    skipIfMissing: true,
  },
]

export const FULL_TOUR_STEPS: TourStepDef[] = [...INTRO_TOUR_STEPS, ...OPERATIONS_TOUR_STEPS]

/** Intro-only steps (legacy alias) */
export const PHASE_2_TOUR_STEPS = INTRO_TOUR_STEPS

export type TourNavigationContext = {
  migrationToolsEnabled: boolean
}

export function resolveApplicableSteps(
  steps: TourStepDef[] = FULL_TOUR_STEPS,
  ctx: TourNavigationContext
): TourStepDef[] {
  return steps.filter(
    (step) => !step.requiresMigrationTools || ctx.migrationToolsEnabled
  )
}

export function resolveNavigationAfterStep(
  fromStepId: TourStepId,
  ctx: TourNavigationContext,
  steps: TourStepDef[] = FULL_TOUR_STEPS
): { path: string; resumeStepId: TourStepId } | null {
  const applicable = resolveApplicableSteps(steps, ctx)
  let nextId = getNextStepId(fromStepId, applicable)
  while (nextId) {
    const step = getStepById(nextId, applicable)
    if (!step) break
    return { path: step.route, resumeStepId: step.id }
  }
  return null
}

export function formatStepDescription(
  stepDef: TourStepDef,
  ctx: TourNavigationContext,
  steps: TourStepDef[] = FULL_TOUR_STEPS
): string {
  const applicable = resolveApplicableSteps(steps, ctx)
  const index = findStepIndex(stepDef.id, applicable)
  if (index < 0) return stepDef.description
  return `${stepDef.description}\n\nEtapa ${index + 1} de ${applicable.length}`
}

export function getTourStepsForPhase(phase: number): TourStepDef[] {
  if (phase === TOUR_PHASE || phase === 2) return FULL_TOUR_STEPS
  return []
}

export function getStepById(
  id: TourStepId,
  steps: TourStepDef[] = FULL_TOUR_STEPS
): TourStepDef | undefined {
  return steps.find((step) => step.id === id)
}

export function findStepIndex(id: TourStepId, steps: TourStepDef[] = FULL_TOUR_STEPS): number {
  return steps.findIndex((step) => step.id === id)
}

export function getNextStepId(
  id: TourStepId,
  steps: TourStepDef[] = FULL_TOUR_STEPS
): TourStepId | undefined {
  const index = findStepIndex(id, steps)
  if (index < 0 || index >= steps.length - 1) return undefined
  return steps[index + 1]?.id
}

export function isFinalTourStep(
  stepDef: TourStepDef,
  ctx: TourNavigationContext,
  steps: TourStepDef[] = FULL_TOUR_STEPS
): boolean {
  const applicable = resolveApplicableSteps(steps, ctx)
  const last = applicable[applicable.length - 1]
  return last != null && stepDef.id === last.id
}

export function getStepRoute(stepId: TourStepId): string {
  return STEP_ROUTES[stepId]
}
