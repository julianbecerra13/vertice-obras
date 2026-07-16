# Sube el proyecto a Vercel.
#
#   .\scripts\subir-a-vercel.ps1
#
# Hace login, crea el proyecto, carga las variables de entorno leyendolas de
# .env.local y despliega a produccion.
#
# La base de datos (Neon) NO se conecta aqui: se hace despues desde el panel de
# Vercel. Sin ella la web funciona igual, pero los leads se borran en cada
# despliegue. El panel de administracion lo avisa en la pantalla de Resumen.

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

Write-Host ""
Write-Host "=== Vertice Obras -> Vercel ===" -ForegroundColor Cyan
Write-Host ""

# --- 1. Sesion ------------------------------------------------------------
Write-Host "[1/4] Comprobando sesion de Vercel..." -ForegroundColor Yellow
$quien = (vercel whoami 2>&1 | Out-String).Trim()
if ($LASTEXITCODE -ne 0) {
  Write-Host "      Sin sesion. Se abrira el navegador para iniciarla." -ForegroundColor Gray
  vercel login
  if ($LASTEXITCODE -ne 0) { throw "No se pudo iniciar sesion en Vercel." }
  $quien = (vercel whoami 2>&1 | Out-String).Trim()
}
Write-Host "      Conectado como: $quien" -ForegroundColor Green

# --- 2. Enlazar proyecto --------------------------------------------------
Write-Host "[2/4] Enlazando el proyecto..." -ForegroundColor Yellow
if (Test-Path ".vercel/project.json") {
  Write-Host "      Ya estaba enlazado." -ForegroundColor Green
} else {
  vercel link --yes
  if ($LASTEXITCODE -ne 0) { throw "No se pudo enlazar el proyecto." }
  Write-Host "      Enlazado." -ForegroundColor Green
}

# --- 3. Variables de entorno ---------------------------------------------
Write-Host "[3/4] Cargando variables de entorno..." -ForegroundColor Yellow

if (-not (Test-Path ".env.local")) { throw "Falta .env.local. Ejecute: npm run credenciales" }

# Leemos .env.local tal cual. Split con conteo 2 para no partir valores que
# contengan '=' (el hash en base64 termina en '=').
$vars = @{}
foreach ($linea in Get-Content ".env.local") {
  $t = $linea.Trim()
  if ($t -eq "" -or $t.StartsWith("#")) { continue }
  $partes = $t.Split("=", 2)
  if ($partes.Count -eq 2) { $vars[$partes[0].Trim()] = $partes[1].Trim() }
}

foreach ($nombre in @("ADMIN_USER", "ADMIN_PASSWORD_HASH", "JWT_SECRET")) {
  if (-not $vars.ContainsKey($nombre)) { throw "Falta $nombre en .env.local" }

  foreach ($entorno in @("production", "preview", "development")) {
    # Si la variable ya existe, vercel env add falla: la quitamos antes.
    vercel env rm $nombre $entorno --yes 2>&1 | Out-Null
    $vars[$nombre] | vercel env add $nombre $entorno 2>&1 | Out-Null
  }
  Write-Host "      $nombre cargada" -ForegroundColor Green
}

# --- 4. Desplegar ---------------------------------------------------------
Write-Host "[4/4] Desplegando a produccion..." -ForegroundColor Yellow
vercel --prod
if ($LASTEXITCODE -ne 0) { throw "El despliegue fallo." }

Write-Host ""
Write-Host "=== Listo ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Entre al panel con:  /admin" -ForegroundColor White
Write-Host "  Usuario:     $($vars['ADMIN_USER'])" -ForegroundColor White
Write-Host "  Contrasena:  la que genero con 'npm run credenciales'" -ForegroundColor White
Write-Host ""
Write-Host "FALTA LA BASE DE DATOS:" -ForegroundColor Yellow
Write-Host "  Sin ella los leads se borran en cada despliegue." -ForegroundColor Gray
Write-Host "  1. En vercel.com, abra el proyecto -> Storage -> Marketplace -> Neon" -ForegroundColor Gray
Write-Host "  2. Al conectarla, DATABASE_URL se crea sola" -ForegroundColor Gray
Write-Host "  3. Copie esa DATABASE_URL a .env.local y ejecute: npm run db:push" -ForegroundColor Gray
Write-Host "  4. Vuelva a desplegar: vercel --prod" -ForegroundColor Gray
Write-Host ""
