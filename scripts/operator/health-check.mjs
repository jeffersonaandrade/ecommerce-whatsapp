#!/usr/bin/env node
/**
 * Orquestra checks de saúde do projeto (read-only).
 *
 * Uso:
 *   npm run health:check
 *   npm run health:check -- --client unitsports
 *   npm run health:check -- --client unitsports --skip-smoke --skip-checkout
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
)

/** @typedef {{ id: string, label: string, status: 'pass' | 'fail' | 'skip' | 'warn', detail?: string }} CheckResult */

/** @type {CheckResult[]} */
const checks = []
/** @type {string[]} */
const warnings = []
/** @type {string[]} */
const blockers = []
/** @type {string[]} */
const nextSteps = []

function parseArgs(argv) {
  /** @type {{ client: string | null, skipBuild: boolean, skipSmoke: boolean, skipCheckout: boolean }} */
  const opts = {
    client: process.env.HEALTH_CLIENT?.trim() || null,
    skipBuild: process.env.HEALTH_SKIP_BUILD === '1',
    skipSmoke: process.env.HEALTH_SKIP_SMOKE === '1',
    skipCheckout: process.env.HEALTH_SKIP_CHECKOUT === '1',
  }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--client') {
      opts.client = argv[++i]?.trim() || null
      if (!opts.client) usageError('--client requer um slug')
    } else if (arg.startsWith('--client=')) {
      opts.client = arg.slice('--client='.length).trim() || null
      if (!opts.client) usageError('--client requer um slug')
    } else if (arg === '--skip-build') {
      opts.skipBuild = true
    } else if (arg === '--skip-smoke') {
      opts.skipSmoke = true
    } else if (arg === '--skip-checkout') {
      opts.skipCheckout = true
    } else if (arg === '--help' || arg === '-h') {
      printUsage()
      process.exit(0)
    } else if (arg.startsWith('-')) {
      usageError(`Flag desconhecida: ${arg}`)
    } else if (!opts.client) {
      // npm no Windows costuma repassar só o slug após `--` (sem --client)
      opts.client = arg.trim()
    }
  }

  return opts
}

function printUsage() {
  console.log(`Uso: npm run health:check -- [opções]

Opções:
  --client <slug>     Roda build:client e deploy:check para o slug
  --client=<slug>     Mesmo que --client (útil no PowerShell/npm)
  --skip-build        Não roda build:client
  --skip-smoke        Não roda smoke E2E
  --skip-checkout     Não roda checkout E2E
  -h, --help          Mostra esta ajuda

Env (alternativa no Windows quando flags após npm -- são omitidas):
  HEALTH_CLIENT, HEALTH_SKIP_BUILD=1, HEALTH_SKIP_SMOKE=1, HEALTH_SKIP_CHECKOUT=1

Exit codes: 0 = saudável · 1 = blockers · 2 = uso inválido`)
}

function usageError(message) {
  console.error(message)
  printUsage()
  process.exit(2)
}

function npmCmd() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm'
}

function nodeCmd() {
  return process.platform === 'win32' ? 'node.exe' : 'node'
}

/**
 * @param {string} id
 * @param {string} label
 * @param {string} cmd
 * @param {string[]} args
 * @param {{ optional?: boolean, skip?: boolean, skipReason?: string }} [options]
 */
function runStep(id, label, cmd, args, options = {}) {
  if (options.skip) {
    checks.push({
      id,
      label,
      status: 'skip',
      detail: options.skipReason || 'omitido',
    })
    return true
  }

  console.log(`\n→ ${label}`)
  const result = spawnSync(cmd, args, {
    cwd: root,
    env: process.env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

  const ok = result.status === 0
  if (ok) {
    checks.push({ id, label, status: 'pass' })
    return true
  }

  const detail = `exit ${result.status ?? 'unknown'}`
  if (options.optional) {
    checks.push({ id, label, status: 'warn', detail })
    warnings.push(`${label}: ${detail}`)
    return true
  }

  checks.push({ id, label, status: 'fail', detail })
  blockers.push(`${label}: ${detail}`)
  return false
}

function hasE2eBaseUrl() {
  return Boolean(
    process.env.PLAYWRIGHT_BASE_URL?.trim() ||
      process.env.QA_BASE_URL?.trim()
  )
}

function printReport() {
  const healthy = blockers.length === 0
  console.log('\n' + '='.repeat(60))
  console.log('Project Health')
  console.log(healthy ? 'PASS' : 'FAIL')
  console.log('='.repeat(60))

  console.log('\nChecks executados:')
  for (const c of checks) {
    const icon =
      c.status === 'pass'
        ? '✓'
        : c.status === 'skip'
          ? '○'
          : c.status === 'warn'
            ? '!'
            : '✗'
    const suffix = c.detail ? ` (${c.detail})` : ''
    console.log(`  ${icon} ${c.label}${suffix}`)
  }

  if (warnings.length) {
    console.log('\nWarnings:')
    for (const w of warnings) console.log(`  - ${w}`)
  }

  if (blockers.length) {
    console.log('\nBlockers:')
    for (const b of blockers) console.log(`  - ${b}`)
  }

  if (nextSteps.length) {
    console.log('\nPróximos passos:')
    for (const s of nextSteps) console.log(`  - ${s}`)
  }

  console.log('')
}

const opts = parseArgs(process.argv.slice(2))
let allOk = true

allOk =
  runStep(
    'anti-slug',
    'Anti-slug guard (qa:check-no-client-branching)',
    npmCmd(),
    ['run', 'qa:check-no-client-branching']
  ) && allOk

allOk =
  runStep('unit-tests', 'Testes unitários (npm test)', npmCmd(), [
    'run',
    'test',
  ]) && allOk

if (opts.client) {
  if (!opts.skipBuild) {
    allOk =
      runStep(
        'build-client',
        `Build cliente (${opts.client})`,
        npmCmd(),
        ['run', 'build:client', '--', opts.client]
      ) && allOk
  } else {
    runStep('build-client', `Build cliente (${opts.client})`, '', [], {
      skip: true,
      skipReason: '--skip-build',
    })
  }

  allOk =
    runStep(
      'deploy-check',
      `Deploy preflight (${opts.client})`,
      npmCmd(),
      ['run', 'deploy:check', '--', opts.client]
    ) && allOk
} else {
  nextSteps.push(
    'Informe --client <slug> para build:client e deploy:check'
  )
}

const e2eBase = hasE2eBaseUrl()

if (!opts.skipSmoke) {
  if (e2eBase) {
    allOk =
      runStep(
        'smoke-e2e',
        'Smoke E2E (Playwright)',
        npmCmd(),
        ['run', 'test:e2e:smoke']
      ) && allOk
  } else {
    runStep('smoke-e2e', 'Smoke E2E (Playwright)', '', [], {
      skip: true,
      skipReason: 'PLAYWRIGHT_BASE_URL ou QA_BASE_URL ausente',
    })
    warnings.push(
      'Smoke E2E omitido — defina PLAYWRIGHT_BASE_URL ou QA_BASE_URL'
    )
  }
} else {
  runStep('smoke-e2e', 'Smoke E2E (Playwright)', '', [], {
    skip: true,
    skipReason: '--skip-smoke',
  })
}

if (!opts.skipCheckout) {
  if (e2eBase) {
    allOk =
      runStep(
        'checkout-e2e',
        'Checkout E2E (WhatsApp)',
        npmCmd(),
        ['run', 'test:e2e:checkout']
      ) && allOk
  } else {
    runStep('checkout-e2e', 'Checkout E2E (WhatsApp)', '', [], {
      skip: true,
      skipReason: 'PLAYWRIGHT_BASE_URL ou QA_BASE_URL ausente',
    })
    warnings.push(
      'Checkout E2E omitido — defina PLAYWRIGHT_BASE_URL ou QA_BASE_URL'
    )
  }
} else {
  runStep('checkout-e2e', 'Checkout E2E (WhatsApp)', '', [], {
    skip: true,
    skipReason: '--skip-checkout',
  })
}

if (!blockers.length && warnings.length) {
  nextSteps.push('Revisar warnings opcionais antes de go-live')
}
if (blockers.length) {
  nextSteps.push('Corrigir blockers e reexecutar npm run health:check')
}

printReport()
process.exit(blockers.length ? 1 : 0)
