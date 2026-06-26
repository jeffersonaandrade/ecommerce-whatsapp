import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')
const deployDir = path.join(root, 'deploy', 'netlify')
const storageDir = path.join(root, 'storage')
const brandingDir = path.join(storageDir, 'branding')
const useSupabase = process.env.DATA_PROVIDER === 'supabase'

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
}

function copyDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return
  fs.mkdirSync(destDir, { recursive: true })
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, entry.name)
    const dest = path.join(destDir, entry.name)
    if (entry.isDirectory()) copyDir(src, dest)
    else copyFile(src, dest)
  }
}

if (useSupabase) {
  console.log('Netlify prebuild: DATA_PROVIDER=supabase — skipping JSON seed copy')
  process.exit(0)
}

fs.mkdirSync(storageDir, { recursive: true })
fs.mkdirSync(brandingDir, { recursive: true })

const settingsSrc = path.join(deployDir, 'store-settings.json')
const settingsDest = path.join(storageDir, 'store-settings.json')
let settings = JSON.parse(fs.readFileSync(settingsSrc, 'utf-8'))

const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || process.env.SITE_URL
if (siteUrl) {
  settings = { ...settings, siteUrl }
}

fs.writeFileSync(settingsDest, JSON.stringify(settings, null, 2))

copyDir(path.join(deployDir, 'branding'), brandingDir)

const catalogPath = path.join(storageDir, 'catalog.json')
const catalogSeed = path.join(storageDir, 'catalog.seed.json')
if (!fs.existsSync(catalogPath) && fs.existsSync(catalogSeed)) {
  copyFile(catalogSeed, catalogPath)
}

console.log('Netlify prebuild: storage prepared for build')
