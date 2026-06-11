param(
  [string]$Region = "",
  [string]$TableName = "",
  [string]$SeedFile = ""
)

$ErrorActionPreference = "Stop"
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -Scope Global -ErrorAction SilentlyContinue) {
  $global:PSNativeCommandUseErrorActionPreference = $false
}
$env:AWS_PAGER = ""
$ProgressPreference = "SilentlyContinue"

if ([string]::IsNullOrWhiteSpace($Region)) {
  $Region = aws configure get region
}

if ([string]::IsNullOrWhiteSpace($Region)) {
  $Region = $env:EXPO_PUBLIC_AWS_REGION
}

if ([string]::IsNullOrWhiteSpace($Region)) {
  $Region = "us-east-1"
}

if ([string]::IsNullOrWhiteSpace($TableName)) {
  $TableName = "toyotatech-purchases"
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$awsRoot = Split-Path -Parent $scriptDir

if ([string]::IsNullOrWhiteSpace($SeedFile)) {
  $SeedFile = Join-Path $awsRoot "seeds\purchases.sample.json"
}

if (-not (Test-Path $SeedFile)) {
  throw "Arquivo de seed nao encontrado: $SeedFile"
}

function ConvertTo-DynamoAttribute {
  param([object]$Value)

  if ($null -eq $Value) {
    return @{ NULL = $true }
  }

  if ($Value -is [bool]) {
    return @{ BOOL = [bool]$Value }
  }

  if (
    $Value -is [byte] -or
    $Value -is [int16] -or
    $Value -is [int] -or
    $Value -is [long] -or
    $Value -is [float] -or
    $Value -is [double] -or
    $Value -is [decimal]
  ) {
    return @{ N = [string]$Value }
  }

  if ($Value -is [array]) {
    $items = @()
    foreach ($item in $Value) {
      $items += ConvertTo-DynamoAttribute -Value $item
    }
    return @{ L = $items }
  }

  if ($Value -is [System.Management.Automation.PSCustomObject]) {
    $map = @{}
    foreach ($property in $Value.PSObject.Properties) {
      $map[$property.Name] = ConvertTo-DynamoAttribute -Value $property.Value
    }
    return @{ M = $map }
  }

  return @{ S = [string]$Value }
}

$rawPurchases = Get-Content -Raw -Path $SeedFile | ConvertFrom-Json
$purchases = @($rawPurchases)
$now = [int][double]::Parse((Get-Date -UFormat %s))
$created = 0
$skipped = 0
$updated = 0

function Write-TempJsonFile {
  param(
    [string]$Name,
    [object]$Value
  )

  $path = Join-Path ([System.IO.Path]::GetTempPath()) $Name
  $json = $Value | ConvertTo-Json -Depth 80 -Compress
  [System.IO.File]::WriteAllText($path, $json, [System.Text.UTF8Encoding]::new($false))
  return $path
}

foreach ($purchase in $purchases) {
  $item = @{}
  foreach ($property in $purchase.PSObject.Properties) {
    $item[$property.Name] = ConvertTo-DynamoAttribute -Value $property.Value
  }
  if (-not $item.ContainsKey("createdAt")) {
    $item["createdAt"] = @{ N = [string]$now }
  }
  if (-not $item.ContainsKey("updatedAt")) {
    $item["updatedAt"] = @{ N = [string]$now }
  }

  $itemJson = $item | ConvertTo-Json -Depth 80 -Compress
  $purchaseId = [string]$purchase.purchaseId
  $itemFile = Join-Path ([System.IO.Path]::GetTempPath()) "toyotatech-purchase-$purchaseId.json"
  [System.IO.File]::WriteAllText($itemFile, $itemJson, [System.Text.UTF8Encoding]::new($false))
  $previousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  $output = aws dynamodb put-item `
    --table-name $TableName `
    --item "file://$itemFile" `
    --condition-expression "attribute_not_exists(purchaseId)" `
    --region $Region 2>&1
  $ErrorActionPreference = $previousErrorActionPreference
  Remove-Item -LiteralPath $itemFile -Force -ErrorAction SilentlyContinue

  if ($LASTEXITCODE -eq 0) {
    $created += 1
    continue
  }

  if (($output | Out-String) -match "ConditionalCheckFailedException") {
    $names = @{}
    $values = @{}
    $setParts = @()
    $index = 0

    foreach ($property in $purchase.PSObject.Properties) {
      if ($property.Name -in @("purchaseId", "userId", "linkedAt", "createdAt")) {
        continue
      }
      if (-not $item.ContainsKey($property.Name)) {
        continue
      }
      $nameToken = "#n$index"
      $valueToken = ":v$index"
      $names[$nameToken] = $property.Name
      $values[$valueToken] = $item[$property.Name]
      $setParts += "$nameToken = $valueToken"
      $index += 1
    }

    $nameToken = "#n$index"
    $valueToken = ":v$index"
    $names[$nameToken] = "updatedAt"
    $values[$valueToken] = @{ N = [string]$now }
    $setParts += "$nameToken = $valueToken"

    $key = @{ purchaseId = @{ S = $purchaseId } }
    $keyFile = Write-TempJsonFile -Name "toyotatech-purchase-$purchaseId-key.json" -Value $key
    $namesFile = Write-TempJsonFile -Name "toyotatech-purchase-$purchaseId-names.json" -Value $names
    $valuesFile = Write-TempJsonFile -Name "toyotatech-purchase-$purchaseId-values.json" -Value $values
    $updateExpression = "SET " + ($setParts -join ", ")

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    $updateOutput = aws dynamodb update-item `
      --table-name $TableName `
      --key "file://$keyFile" `
      --update-expression $updateExpression `
      --expression-attribute-names "file://$namesFile" `
      --expression-attribute-values "file://$valuesFile" `
      --region $Region 2>&1
    $ErrorActionPreference = $previousErrorActionPreference
    Remove-Item -LiteralPath $keyFile -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $namesFile -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $valuesFile -Force -ErrorAction SilentlyContinue

    if ($LASTEXITCODE -eq 0) {
      $updated += 1
      continue
    }

    $skipped += 1
    Write-Warning ($updateOutput | Out-String)
    continue
  }

  throw ($output | Out-String)
}

Write-Host "Seed concluido:"
Write-Host "  Tabela: $TableName"
Write-Host "  Criados: $created"
Write-Host "  Atualizados: $updated"
Write-Host "  Ignorados: $skipped"
