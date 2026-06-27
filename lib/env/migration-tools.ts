/** Ferramentas de onboarding (import CSV, Central de Mídia). Desligadas em produção pós-go-live. */
export function isMigrationToolsEnabled(): boolean {
  return process.env.ENABLE_MIGRATION_TOOLS === 'true'
}
