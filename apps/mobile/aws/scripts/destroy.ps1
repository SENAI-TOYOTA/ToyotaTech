param(
  [string]$Region = "",
  [string]$Prefix = "toyotatech-lab",
  [string]$TableName = "toyotatech-auth-dev"
)

$ErrorActionPreference = "Continue"
$env:AWS_PAGER = ""

if ([string]::IsNullOrWhiteSpace($Region)) {
  $Region = aws configure get region
}

if ([string]::IsNullOrWhiteSpace($Region)) {
  throw "Regiao AWS nao definida. Configure aws region ou passe -Region."
}

$accountId = aws sts get-caller-identity --query Account --output text --region $Region
$lambdaName = "$Prefix-auth-handler"
$apiName = "$Prefix-auth-api"

$apiId = aws apigatewayv2 get-apis --region $Region --query "Items[?Name=='$apiName'].ApiId | [0]" --output text
if ($apiId -and $apiId -ne "None") {
  aws apigatewayv2 delete-api --api-id $apiId --region $Region | Out-Null
}

$statementId = "$Prefix-apigw-invoke"
try {
  aws lambda remove-permission --function-name $lambdaName --statement-id $statementId --region $Region | Out-Null
} catch {
}

try {
  aws lambda delete-function --function-name $lambdaName --region $Region | Out-Null
} catch {
}

try {
  aws dynamodb delete-table --table-name $TableName --region $Region | Out-Null
} catch {
}

Write-Host ""
Write-Host "Destroy concluido para:"
Write-Host "  Region: $Region"
Write-Host "  Prefix: $Prefix"
Write-Host "  Account: $accountId"
