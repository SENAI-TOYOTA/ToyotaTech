param(
  [string]$Region = "",
  [string]$Prefix = "toyotatech",
  [string]$UserPoolName = "",
  [string]$LegacyTableName = "toyotatech-auth-dev",
  [string]$ProfileTableName = "",
  [string]$GarageTableName = "",
  [string]$PurchaseTableName = ""
)

$ErrorActionPreference = "Continue"
$env:AWS_PAGER = ""

if ([string]::IsNullOrWhiteSpace($Region)) {
  $Region = aws configure get region
}

if ([string]::IsNullOrWhiteSpace($Region)) {
  throw "Regiao AWS nao definida. Configure aws region ou passe -Region."
}

if ([string]::IsNullOrWhiteSpace($UserPoolName)) {
  $UserPoolName = "$Prefix-auth"
}

if ([string]::IsNullOrWhiteSpace($ProfileTableName)) {
  $ProfileTableName = "$Prefix-profile"
}

if ([string]::IsNullOrWhiteSpace($GarageTableName)) {
  $GarageTableName = "$Prefix-garage"
}

if ([string]::IsNullOrWhiteSpace($PurchaseTableName)) {
  $PurchaseTableName = "$Prefix-purchases"
}

$accountId = aws sts get-caller-identity --query Account --output text --region $Region
$lambdaName = "$Prefix-auth-handler"
$apiName = "$Prefix-auth-api"

$apiId = aws apigatewayv2 get-apis --region $Region --query "Items[?Name=='$apiName'].ApiId | [0]" --output text
if ($apiId -and $apiId -ne "None") {
  aws apigatewayv2 delete-api --api-id $apiId --region $Region | Out-Null
}

$lambdaExists = $false
$null = aws lambda get-function --function-name $lambdaName --region $Region 2>$null
if ($LASTEXITCODE -eq 0) {
  $lambdaExists = $true
}

if ($lambdaExists) {
  $statementId = "$Prefix-apigw-invoke"
  try {
    aws lambda remove-permission --function-name $lambdaName --statement-id $statementId --region $Region 2>$null | Out-Null
  } catch {
  }

  aws lambda delete-function --function-name $lambdaName --region $Region | Out-Null
}

if (-not [string]::IsNullOrWhiteSpace($LegacyTableName)) {
  $null = aws dynamodb describe-table --table-name $LegacyTableName --region $Region 2>$null
  if ($LASTEXITCODE -eq 0) {
    aws dynamodb delete-table --table-name $LegacyTableName --region $Region | Out-Null
  }
}

if (-not [string]::IsNullOrWhiteSpace($ProfileTableName)) {
  $null = aws dynamodb describe-table --table-name $ProfileTableName --region $Region 2>$null
  if ($LASTEXITCODE -eq 0) {
    aws dynamodb delete-table --table-name $ProfileTableName --region $Region | Out-Null
  }
}

if (-not [string]::IsNullOrWhiteSpace($GarageTableName)) {
  $null = aws dynamodb describe-table --table-name $GarageTableName --region $Region 2>$null
  if ($LASTEXITCODE -eq 0) {
    aws dynamodb delete-table --table-name $GarageTableName --region $Region | Out-Null
  }
}

if (-not [string]::IsNullOrWhiteSpace($PurchaseTableName)) {
  $null = aws dynamodb describe-table --table-name $PurchaseTableName --region $Region 2>$null
  if ($LASTEXITCODE -eq 0) {
    aws dynamodb delete-table --table-name $PurchaseTableName --region $Region | Out-Null
  }
}

$roleName = "LabRole"
$policyName = "$Prefix-profile-table-access"
try {
  aws iam delete-role-policy --role-name $roleName --policy-name $policyName | Out-Null
} catch {
}

$userPoolId = aws cognito-idp list-user-pools `
  --max-results 60 `
  --region $Region `
  --query "UserPools[?Name=='$UserPoolName'].Id | [0]" `
  --output text
if ($userPoolId -and $userPoolId -ne "None") {
  aws cognito-idp delete-user-pool --user-pool-id $userPoolId --region $Region | Out-Null
}

Write-Host ""
Write-Host "Destroy concluido para:"
Write-Host "  Region: $Region"
Write-Host "  Prefix: $Prefix"
Write-Host "  Account: $accountId"
Write-Host "  UserPool: $UserPoolName"
Write-Host "  Profile Dynamo: $ProfileTableName"
Write-Host "  Garage Dynamo: $GarageTableName"
Write-Host "  Purchase Dynamo: $PurchaseTableName"
Write-Host "  Lambda: $lambdaName"

$global:LASTEXITCODE = 0
