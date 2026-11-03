$ErrorActionPreference = 'Stop'

$ToyotaRoot = 'C:\Users\ADM\Downloads\ToyotaTech'
$MobileRoot = Join-Path $ToyotaRoot 'apps\mobile'
$WidgetRoot = Join-Path $ToyotaRoot 'vlibras-web-browsers'
$Patcher = Join-Path $PSScriptRoot 'apply_vlibras_bridge.py'
$ChatbotSource = Join-Path $PSScriptRoot 'chatbot_index_libras_auto_bridge_v11.tsx'
$ChatbotTarget = Join-Path $MobileRoot 'app\chatbot\index.tsx'
$PublicApp = Join-Path $MobileRoot 'public\app'

foreach ($required in @($Patcher, $ChatbotSource)) {
    if (-not (Test-Path -LiteralPath $required)) {
        throw "Arquivo do pacote nÃ£o encontrado: $required. Extraia o ZIP inteiro e execute este script na mesma pasta."
    }
}
if (-not (Test-Path -LiteralPath $MobileRoot)) {
    throw "NÃ£o encontrei o projeto mobile em: $MobileRoot"
}
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw 'Git nÃ£o foi encontrado no PATH. Instale/abra o Git for Windows e rode novamente.'
}
if (-not (Get-Command corepack -ErrorAction SilentlyContinue)) {
    throw 'Corepack nÃ£o foi encontrado. Verifique node -v e npm -v; nÃ£o alterei nenhum arquivo do app.'
}

if (-not (Test-Path -LiteralPath $WidgetRoot)) {
    Write-Host '1/6 - Baixando o cÃ³digo-fonte oficial do VLibras...' -ForegroundColor Cyan
    Push-Location $ToyotaRoot
    try {
        & git clone --depth 1 https://github.com/spbgovbr-vlibras/vlibras-web-browsers.git vlibras-web-browsers
        if ($LASTEXITCODE -ne 0) { throw 'git clone falhou. Verifique internet/Git e execute novamente.' }
    } finally { Pop-Location }
} else {
    Write-Host '1/6 - Reutilizando a pasta vlibras-web-browsers existente.' -ForegroundColor Cyan
}

if (-not (Test-Path -LiteralPath (Join-Path $WidgetRoot 'src\widget\app.tsx'))) {
    throw "A pasta $WidgetRoot nÃ£o tem a estrutura esperada do cÃ³digo oficial; parei sem trocar o chatbot."
}

Write-Host '2/6 - Aplicando a ponte de traduÃ§Ã£o automÃ¡tica...' -ForegroundColor Cyan
Copy-Item -LiteralPath $Patcher -Destination (Join-Path $WidgetRoot 'apply_vlibras_bridge.py') -Force
Push-Location $WidgetRoot
try {
    & py .\apply_vlibras_bridge.py
    if ($LASTEXITCODE -ne 0) { throw 'A ponte nÃ£o pÃ´de ser aplicada. O chatbot atual nÃ£o foi substituÃ­do.' }

    Write-Host '3/6 - Instalando dependÃªncias do widget (pode demorar)...' -ForegroundColor Cyan
    & corepack pnpm install
    if ($LASTEXITCODE -ne 0) { throw 'pnpm install falhou. O chatbot atual nÃ£o foi substituÃ­do.' }

    Write-Host '4/6 - Compilando o widget VLibras personalizado...' -ForegroundColor Cyan
    & corepack pnpm build
    if ($LASTEXITCODE -ne 0) { throw 'pnpm build falhou. O chatbot atual nÃ£o foi substituÃ­do. Envie a mensagem completa do erro.' }

    $Loader = Get-ChildItem -LiteralPath $WidgetRoot -Recurse -File -Filter 'vlibras-plugin.js' -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -notmatch '\\(node_modules|src|test|fixtures)\\' } |
        Select-Object -First 1
    if (-not $Loader) {
        throw 'Build executado, mas nÃ£o achei vlibras-plugin.js compilado fora de node_modules/src. O chatbot atual nÃ£o foi substituÃ­do.'
    }
    $BuildFolder = $Loader.Directory.FullName
    $AppBundle = Join-Path $BuildFolder 'vlibras-plugin-app.js'
    if (-not (Test-Path -LiteralPath $AppBundle)) {
        throw "Achei $($Loader.FullName), mas nÃ£o achei vlibras-plugin-app.js na mesma pasta. O chatbot atual nÃ£o foi substituÃ­do."
    }

    Write-Host "Bundle localizado em: $BuildFolder" -ForegroundColor Gray
    Write-Host '5/6 - Copiando a build para apps\mobile\public\app...' -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $PublicApp -Force | Out-Null
    Get-ChildItem -LiteralPath $BuildFolder -Force | ForEach-Object {
        Copy-Item -LiteralPath $_.FullName -Destination $PublicApp -Recurse -Force
    }
} finally { Pop-Location }

if (-not (Test-Path -LiteralPath (Join-Path $PublicApp 'vlibras-plugin.js')) -or
    -not (Test-Path -LiteralPath (Join-Path $PublicApp 'vlibras-plugin-app.js'))) {
    throw 'A cÃ³pia local nÃ£o contÃ©m os dois bundles necessÃ¡rios. O chatbot atual nÃ£o foi substituÃ­do.'
}

$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$backup = Join-Path $ToyotaRoot "chatbot_index_backup_$timestamp.tsx"
Copy-Item -LiteralPath $ChatbotTarget -Destination $backup -Force
Copy-Item -LiteralPath $ChatbotSource -Destination $ChatbotTarget -Force

Write-Host ''
Write-Host '6/6 - ConcluÃ­do: widget personalizado instalado e chatbot atualizado.' -ForegroundColor Green
Write-Host "Backup do chatbot: $backup" -ForegroundColor Gray
Write-Host 'Agora reinicie o Expo na pasta apps\mobile com: npx expo start --clear' -ForegroundColor Yellow
Write-Host 'O backend e o PostgreSQL nÃ£o foram alterados.' -ForegroundColor Green



