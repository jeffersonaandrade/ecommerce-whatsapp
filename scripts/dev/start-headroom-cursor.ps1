# Inicia o proxy Headroom para uso com Cursor (compressão de contexto / tokens).
# Requer: pip install "headroom-ai[proxy,mcp]"
# Docs: https://github.com/headroomlabs-ai/headroom

$ErrorActionPreference = "Stop"

if (-not (Get-Command headroom -ErrorAction SilentlyContinue)) {
  Write-Host "Headroom CLI não encontrado. Instale com:" -ForegroundColor Yellow
  Write-Host '  pip install "headroom-ai[proxy,mcp]"' -ForegroundColor Cyan
  exit 1
}

Set-Location (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent)

Write-Host "Iniciando Headroom para Cursor (Ctrl+C para parar)..." -ForegroundColor Green
headroom wrap cursor
