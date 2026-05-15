param(
  [string]$Region = "",
  [string]$Prefix = "toyotatech-lab",
  [string]$TableName = "toyotatech-auth-dev",
  [string]$EmailVerificationMode = "mock",
  [string]$SesSourceEmail = ""
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
$roleArn = "arn:aws:iam::${accountId}:role/LabRole"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$awsRoot = Split-Path -Parent $scriptDir
$mobileRoot = Split-Path -Parent $awsRoot
$lambdaDir = Join-Path $awsRoot "lambda"
$distDir = Join-Path $awsRoot "dist"
$zipPath = Join-Path $distDir "auth-handler.zip"
$zipFileArg = "fileb://aws/dist/auth-handler.zip"

New-Item -ItemType Directory -Force -Path $distDir | Out-Null
Push-Location $mobileRoot

$tableExists = $false
$null = aws dynamodb describe-table --table-name $TableName --region $Region 2>$null
if ($LASTEXITCODE -eq 0) {
  $tableExists = $true
}

if (-not $tableExists) {
  aws dynamodb create-table `
    --table-name $TableName `
    --attribute-definitions AttributeName=PK,AttributeType=S AttributeName=SK,AttributeType=S `
    --key-schema AttributeName=PK,KeyType=HASH AttributeName=SK,KeyType=RANGE `
    --billing-mode PAY_PER_REQUEST `
    --region $Region | Out-Null

  aws dynamodb wait table-exists --table-name $TableName --region $Region
}

aws dynamodb update-time-to-live `
  --table-name $TableName `
  --time-to-live-specification Enabled=true,AttributeName=ttl `
  --region $Region 2>$null | Out-Null

if (Test-Path $zipPath) {
  Remove-Item -Force $zipPath
}

Compress-Archive -Path (Join-Path $lambdaDir "auth_handler.py") -DestinationPath $zipPath

$lambdaExists = $false
$null = aws lambda get-function --function-name $lambdaName --region $Region 2>$null
if ($LASTEXITCODE -eq 0) {
  $lambdaExists = $true
}

if (-not $lambdaExists) {
  $envVars = "Variables={DYNAMODB_TABLE_NAME=$TableName,SESSION_DURATION_SECONDS=86400,VERIFICATION_CODE_TTL_SECONDS=900,EMAIL_VERIFICATION_MODE=$EmailVerificationMode"
  if (-not [string]::IsNullOrWhiteSpace($SesSourceEmail)) {
    $envVars = "$envVars,SES_SOURCE_EMAIL=$SesSourceEmail"
  }
  $envVars = "$envVars}"

  aws lambda create-function `
    --function-name $lambdaName `
    --runtime python3.12 `
    --handler auth_handler.lambda_handler `
    --role $roleArn `
    --zip-file $zipFileArg `
    --timeout 15 `
    --memory-size 256 `
    --environment $envVars `
    --region $Region | Out-Null
} else {
  $envVars = "Variables={DYNAMODB_TABLE_NAME=$TableName,SESSION_DURATION_SECONDS=86400,VERIFICATION_CODE_TTL_SECONDS=900,EMAIL_VERIFICATION_MODE=$EmailVerificationMode"
  if (-not [string]::IsNullOrWhiteSpace($SesSourceEmail)) {
    $envVars = "$envVars,SES_SOURCE_EMAIL=$SesSourceEmail"
  }
  $envVars = "$envVars}"

  aws lambda update-function-code `
    --function-name $lambdaName `
    --zip-file $zipFileArg `
    --region $Region | Out-Null

  aws lambda update-function-configuration `
    --function-name $lambdaName `
    --handler auth_handler.lambda_handler `
    --environment $envVars `
    --timeout 15 `
    --memory-size 256 `
    --region $Region | Out-Null
}

Start-Sleep -Seconds 5

$lambdaArn = aws lambda get-function --function-name $lambdaName --query "Configuration.FunctionArn" --output text --region $Region

$apiId = $null
$existingApi = aws apigatewayv2 get-apis --region $Region --query "Items[?Name=='$apiName'].ApiId | [0]" --output text
if ($existingApi -and $existingApi -ne "None") {
  $apiId = $existingApi
} else {
  $apiId = aws apigatewayv2 create-api --name $apiName --protocol-type HTTP --query "ApiId" --output text --region $Region
}

$integrationId = aws apigatewayv2 create-integration `
  --api-id $apiId `
  --integration-type AWS_PROXY `
  --integration-uri $lambdaArn `
  --payload-format-version "2.0" `
  --query "IntegrationId" `
  --output text `
  --region $Region

$routes = @(
  "POST /auth/register",
  "POST /auth/login",
  "POST /auth/verify-email",
  "POST /auth/resend-verification",
  "GET /me",
  "OPTIONS /{proxy+}"
)
foreach ($routeKey in $routes) {
  $routeId = aws apigatewayv2 get-routes --api-id $apiId --region $Region --query "Items[?RouteKey=='$routeKey'].RouteId | [0]" --output text
  if (-not $routeId -or $routeId -eq "None") {
    aws apigatewayv2 create-route `
      --api-id $apiId `
      --route-key $routeKey `
      --target "integrations/$integrationId" `
      --region $Region | Out-Null
  }
}

$stageExists = aws apigatewayv2 get-stages --api-id $apiId --region $Region --query "Items[?StageName=='`$default'].StageName | [0]" --output text
if (-not $stageExists -or $stageExists -eq "None") {
  aws apigatewayv2 create-stage --api-id $apiId --stage-name "`$default" --auto-deploy --region $Region | Out-Null
}

$statementId = "$Prefix-apigw-invoke"
try {
  aws lambda remove-permission --function-name $lambdaName --statement-id $statementId --region $Region | Out-Null
} catch {
}

aws lambda add-permission `
  --function-name $lambdaName `
  --statement-id $statementId `
  --action lambda:InvokeFunction `
  --principal apigateway.amazonaws.com `
  --source-arn "arn:aws:execute-api:${Region}:${accountId}:${apiId}/*/*/*" `
  --region $Region | Out-Null

$apiEndpoint = aws apigatewayv2 get-api --api-id $apiId --query "ApiEndpoint" --output text --region $Region
$url = "$apiEndpoint"

$envExample = Join-Path (Split-Path -Parent $awsRoot) ".env.example"
$envLocal = Join-Path (Split-Path -Parent $awsRoot) ".env.local"

@"
EXPO_PUBLIC_API_URL=$url
"@ | Set-Content -Encoding utf8 $envExample

@"
EXPO_PUBLIC_API_URL=$url
"@ | Set-Content -Encoding utf8 $envLocal

Write-Host ""
Write-Host "Deploy concluido:"
Write-Host "  Region: $Region"
Write-Host "  Table: $TableName"
Write-Host "  Lambda: $lambdaName"
Write-Host "  Role: $roleArn"
Write-Host "  API URL: $url"

Pop-Location
