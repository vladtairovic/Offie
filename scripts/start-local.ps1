param([switch]$Demo)
$ErrorActionPreference = 'Stop'
$offieRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $offieRoot
$offieNode = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $offieNode) {
  $offieRuntime = Get-ChildItem -LiteralPath 'C:/Program Files/WindowsApps' -Directory -Filter 'OpenAI.CodexPrimaryRuntime*' -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1
  if ($offieRuntime) { $offieNode = Join-Path $offieRuntime.FullName 'dependencies/node/bin/node.exe' }
}
if (-not $offieNode -or -not (Test-Path -LiteralPath $offieNode)) { throw 'Instale Node.js 24 ou superior para executar o Offie.' }
if (-not (Test-Path -LiteralPath 'node_modules')) { throw 'Instale as dependencias primeiro: npm install. Veja README.md.' }
if (-not (Test-Path -LiteralPath 'dist/index.html')) {
  & $offieNode node_modules/typescript/bin/tsc -b
  if ($LASTEXITCODE -ne 0) { throw 'A verificacao TypeScript falhou.' }
  & $offieNode node_modules/vite/bin/vite.js build
  if ($LASTEXITCODE -ne 0) { throw 'A compilacao falhou.' }
}
if ($Demo) {
  $env:OFFIE_SESSION_SECONDS = '45'
  $env:OFFIE_COOLDOWN_SECONDS = '90'
  $env:OFFIE_DB_PATH = Join-Path $offieRoot 'data/offie-demo.sqlite'
}
Write-Host 'OFFIE - Abra http://localhost:3001 no navegador.' -ForegroundColor Yellow
Write-Host 'Nos totens, use http://IP-DESTE-COMPUTADOR:3001. Ctrl+C encerra o servidor.'
& $offieNode server/index.mjs
