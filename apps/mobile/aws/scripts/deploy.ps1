param(
  [string]$Region = "",
  [string]$Prefix = "toyotatech",
  [string]$UserPoolName = "",
  [string]$UserPoolClientName = "mobile",
  [string]$LegacyTableName = "toyotatech-auth-dev",
  [string]$ProfileTableName = "",
  [string]$GarageTableName = "",
  [string]$PurchaseTableName = "",
  [string]$HostedUiDomainPrefix = "",
  [string]$GoogleClientId = "",
  [string]$GoogleClientSecret = "",
  [string]$CallbackUrls = "",
  [string]$LogoutUrls = ""
)

$ErrorActionPreference = "Continue"
$env:AWS_PAGER = ""
$ProgressPreference = "SilentlyContinue"

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

if ([string]::IsNullOrWhiteSpace($HostedUiDomainPrefix)) {
  $HostedUiDomainPrefix = "$Prefix-auth"
}

function Get-UserPoolIdByName {
  param(
    [string]$PoolName,
    [string]$AwsRegion
  )
  return aws cognito-idp list-user-pools `
    --max-results 60 `
    --region $AwsRegion `
    --query "UserPools[?Name=='$PoolName'].Id | [0]" `
    --output text
}

function Split-UrlList {
  param([string]$RawValue)
  if ([string]::IsNullOrWhiteSpace($RawValue)) {
    return @()
  }
  return $RawValue -split "," | ForEach-Object { $_.Trim() } | Where-Object { $_ }
}

$callbackUrlList = Split-UrlList -RawValue $CallbackUrls
$logoutUrlList = Split-UrlList -RawValue $LogoutUrls
$configureGoogle = -not [string]::IsNullOrWhiteSpace($GoogleClientId) -and `
  -not [string]::IsNullOrWhiteSpace($GoogleClientSecret)

if ($configureGoogle -and ($callbackUrlList.Count -eq 0 -or $logoutUrlList.Count -eq 0)) {
  throw "Para configurar Google IdP, informe -CallbackUrls e -LogoutUrls."
}

if ($configureGoogle) {
  $defaultDevRedirects = @(
    "exp://localhost:8081/--/",
    "exp://localhost:8081",
    "mobile://"
  )
  foreach ($redirect in $defaultDevRedirects) {
    if ($callbackUrlList -notcontains $redirect) {
      $callbackUrlList += $redirect
    }
    if ($logoutUrlList -notcontains $redirect) {
      $logoutUrlList += $redirect
    }
  }
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
$zipPath = Join-Path $distDir "cognito-auth-handler.zip"
$zipFileArg = "fileb://aws/dist/cognito-auth-handler.zip"

New-Item -ItemType Directory -Force -Path $distDir | Out-Null
Push-Location $mobileRoot

$userPoolId = Get-UserPoolIdByName -PoolName $UserPoolName -AwsRegion $Region
if (-not $userPoolId -or $userPoolId -eq "None") {
  $userPoolId = aws cognito-idp create-user-pool `
    --pool-name $UserPoolName `
    --auto-verified-attributes email `
    --username-attributes email `
    --verification-message-template DefaultEmailOption=CONFIRM_WITH_CODE `
    --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=false}" `
    --query "UserPool.Id" `
    --output text `
    --region $Region
}

if ($configureGoogle) {
  $domainPoolId = aws cognito-idp describe-user-pool-domain `
    --domain $HostedUiDomainPrefix `
    --query "DomainDescription.UserPoolId" `
    --output text `
    --region $Region 2>$null
  if ($LASTEXITCODE -eq 0 -and $domainPoolId -and $domainPoolId -ne "None") {
    if ($domainPoolId -ne $userPoolId) {
      throw "Hosted UI domain '$HostedUiDomainPrefix' ja pertence a outro User Pool."
    }
  } else {
    aws cognito-idp create-user-pool-domain `
      --domain $HostedUiDomainPrefix `
      --user-pool-id $userPoolId `
      --region $Region | Out-Null
  }

  $idpName = "Google"
  $idpExists = aws cognito-idp list-identity-providers `
    --user-pool-id $userPoolId `
    --query "Providers[?ProviderName=='$idpName'].ProviderName | [0]" `
    --output text `
    --region $Region

  if ($idpExists -and $idpExists -ne "None") {
    aws cognito-idp update-identity-provider `
      --user-pool-id $userPoolId `
      --provider-name $idpName `
      --provider-details client_id=$GoogleClientId client_secret=$GoogleClientSecret authorize_scopes="openid email profile" `
      --attribute-mapping email=email name=name email_verified=email_verified `
      --region $Region | Out-Null
  } else {
    aws cognito-idp create-identity-provider `
      --user-pool-id $userPoolId `
      --provider-name $idpName `
      --provider-type Google `
      --provider-details client_id=$GoogleClientId client_secret=$GoogleClientSecret authorize_scopes="openid email profile" `
      --attribute-mapping email=email name=name email_verified=email_verified `
      --region $Region | Out-Null
  }
} else {
  Write-Host "Google IdP nao configurado. Informe -GoogleClientId e -GoogleClientSecret para habilitar."
}

$userPoolClientId = aws cognito-idp list-user-pool-clients `
  --user-pool-id $userPoolId `
  --max-results 60 `
  --query "UserPoolClients[?ClientName=='$UserPoolClientName'].ClientId | [0]" `
  --output text `
  --region $Region

$clientArgs = @(
  "--user-pool-id", $userPoolId,
  "--client-name", $UserPoolClientName,
  "--explicit-auth-flows", "ALLOW_USER_PASSWORD_AUTH", "ALLOW_USER_SRP_AUTH", "ALLOW_REFRESH_TOKEN_AUTH",
  "--prevent-user-existence-errors", "ENABLED",
  "--refresh-token-validity", "30",
  "--access-token-validity", "60",
  "--id-token-validity", "60",
  "--token-validity-units", "AccessToken=minutes,IdToken=minutes,RefreshToken=days"
)

if ($configureGoogle) {
  $clientArgs += @(
    "--allowed-o-auth-flows-user-pool-client",
    "--allowed-o-auth-flows", "code",
    "--allowed-o-auth-scopes", "openid", "email", "profile", "aws.cognito.signin.user.admin",
    "--supported-identity-providers", "COGNITO", "Google",
    "--callback-urls"
  ) + $callbackUrlList + @("--logout-urls") + $logoutUrlList
}

if (-not $userPoolClientId -or $userPoolClientId -eq "None") {
  $createArgs = @("cognito-idp", "create-user-pool-client") + $clientArgs + @(
    "--query", "UserPoolClient.ClientId",
    "--output", "text",
    "--region", $Region
  )
  $userPoolClientId = aws @createArgs
} else {
  $updateArgs = @(
    "cognito-idp", "update-user-pool-client",
    "--user-pool-id", $userPoolId,
    "--client-id", $userPoolClientId
  ) + $clientArgs + @(
    "--region", $Region
  )
  aws @updateArgs | Out-Null
}

$null = aws dynamodb describe-table --table-name $ProfileTableName --region $Region 2>$null
if ($LASTEXITCODE -ne 0) {
  aws dynamodb create-table `
    --table-name $ProfileTableName `
    --attribute-definitions AttributeName=userId,AttributeType=S `
    --key-schema AttributeName=userId,KeyType=HASH `
    --billing-mode PAY_PER_REQUEST `
    --region $Region | Out-Null
}

$null = aws dynamodb describe-table --table-name $GarageTableName --region $Region 2>$null
if ($LASTEXITCODE -ne 0) {
  aws dynamodb create-table `
    --table-name $GarageTableName `
    --attribute-definitions AttributeName=userId,AttributeType=S `
    --key-schema AttributeName=userId,KeyType=HASH `
    --billing-mode PAY_PER_REQUEST `
    --region $Region | Out-Null
}

$null = aws dynamodb describe-table --table-name $PurchaseTableName --region $Region 2>$null
if ($LASTEXITCODE -ne 0) {
  aws dynamodb create-table `
    --table-name $PurchaseTableName `
    --attribute-definitions AttributeName=purchaseId,AttributeType=S `
    --key-schema AttributeName=purchaseId,KeyType=HASH `
    --billing-mode PAY_PER_REQUEST `
    --region $Region | Out-Null
}

$profileTableArn = aws dynamodb describe-table `
  --table-name $ProfileTableName `
  --query "Table.TableArn" `
  --output text `
  --region $Region
$garageTableArn = aws dynamodb describe-table `
  --table-name $GarageTableName `
  --query "Table.TableArn" `
  --output text `
  --region $Region
$purchaseTableArn = aws dynamodb describe-table `
  --table-name $PurchaseTableName `
  --query "Table.TableArn" `
  --output text `
  --region $Region
$roleName = ($roleArn -split "/")[-1]
$policyName = "$Prefix-profile-table-access"
$policyDocument = @{
  Version = "2012-10-17"
  Statement = @(
    @{
      Effect = "Allow"
      Action = @("dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:Query")
      Resource = @($profileTableArn, $garageTableArn, $purchaseTableArn)
    }
  )
} | ConvertTo-Json -Depth 5
aws iam put-role-policy `
  --role-name $roleName `
  --policy-name $policyName `
  --policy-document $policyDocument 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Warning "Nao foi possivel atualizar a policy do role. Seguindo com o deploy."
}

if (Test-Path $zipPath) {
  Remove-Item -Force $zipPath
}

$packageDir = Join-Path $distDir "lambda-package"
if (Test-Path $packageDir) {
  Remove-Item -Recurse -Force $packageDir
}
New-Item -ItemType Directory -Force -Path $packageDir | Out-Null
Copy-Item -Force (Join-Path $lambdaDir "auth_handler.py") (Join-Path $packageDir "auth_handler.py")

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($packageDir, $zipPath)
Remove-Item -Recurse -Force $packageDir

$lambdaExists = $false
$null = aws lambda get-function --function-name $lambdaName --region $Region 2>$null
if ($LASTEXITCODE -eq 0) {
  $lambdaExists = $true
}

$envVars = "Variables={COGNITO_USER_POOL_ID=$userPoolId,COGNITO_CLIENT_ID=$userPoolClientId,COGNITO_REGION=$Region,PROFILE_TABLE_NAME=$ProfileTableName,GARAGE_TABLE_NAME=$GarageTableName,PURCHASE_TABLE_NAME=$PurchaseTableName}"

if (-not $lambdaExists) {
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

$userPoolArn = "arn:aws:cognito-idp:${Region}:${accountId}:userpool/$userPoolId"
$cognitoStatementId = "$Prefix-cognito-presignup"
try {
  aws lambda remove-permission --function-name $lambdaName --statement-id $cognitoStatementId --region $Region | Out-Null
} catch {
}

aws lambda add-permission `
  --function-name $lambdaName `
  --statement-id $cognitoStatementId `
  --action lambda:InvokeFunction `
  --principal cognito-idp.amazonaws.com `
  --source-arn $userPoolArn `
  --region $Region | Out-Null

aws cognito-idp update-user-pool `
  --user-pool-id $userPoolId `
  --auto-verified-attributes email `
  --verification-message-template DefaultEmailOption=CONFIRM_WITH_CODE `
  --email-configuration EmailSendingAccount=COGNITO_DEFAULT `
  --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=false}" `
  --lambda-config PreSignUp=$lambdaArn `
  --region $Region | Out-Null

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
  "POST /auth/check-email",
  "POST /auth/register",
  "POST /auth/login",
  "POST /auth/verify-email",
  "POST /auth/resend-verification",
  "POST /auth/refresh",
  "POST /auth/set-password",
  "GET /profile",
  "PUT /profile",
  "GET /me",
  "GET /garage/current",
  "PUT /garage/current",
  "POST /garage/ingest",
  "POST /garage/link",
  "GET /garage/status",
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
  } else {
    aws apigatewayv2 update-route `
      --api-id $apiId `
      --route-id $routeId `
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
$hostedUiDomain = ""
if ($configureGoogle) {
  $hostedUiDomain = "https://$HostedUiDomainPrefix.auth.$Region.amazoncognito.com"
}

$envExample = Join-Path (Split-Path -Parent $awsRoot) ".env.example"
$envLocal = Join-Path (Split-Path -Parent $awsRoot) ".env.local"

@"
EXPO_PUBLIC_API_URL=$url
EXPO_PUBLIC_AWS_REGION=$Region
EXPO_PUBLIC_COGNITO_USER_POOL_ID=$userPoolId
EXPO_PUBLIC_COGNITO_CLIENT_ID=$userPoolClientId
EXPO_PUBLIC_COGNITO_DOMAIN=$hostedUiDomain
"@ | Set-Content -Encoding utf8 $envExample

@"
EXPO_PUBLIC_API_URL=$url
EXPO_PUBLIC_AWS_REGION=$Region
EXPO_PUBLIC_COGNITO_USER_POOL_ID=$userPoolId
EXPO_PUBLIC_COGNITO_CLIENT_ID=$userPoolClientId
EXPO_PUBLIC_COGNITO_DOMAIN=$hostedUiDomain
"@ | Set-Content -Encoding utf8 $envLocal

if (-not [string]::IsNullOrWhiteSpace($LegacyTableName)) {
  $null = aws dynamodb describe-table --table-name $LegacyTableName --region $Region 2>$null
  if ($LASTEXITCODE -eq 0) {
    aws dynamodb delete-table --table-name $LegacyTableName --region $Region | Out-Null
  }
}

Write-Host ""
Write-Host "Deploy concluido:"
Write-Host "  Region: $Region"
Write-Host "  UserPool: $UserPoolName ($userPoolId)"
Write-Host "  UserPoolClient: $UserPoolClientName ($userPoolClientId)"
Write-Host "  Profile Dynamo: $ProfileTableName"
Write-Host "  Garage Dynamo: $GarageTableName"
Write-Host "  Purchase Dynamo: $PurchaseTableName"
if ($configureGoogle) {
  Write-Host "  Hosted UI Domain: $hostedUiDomain"
}
Write-Host "  Lambda: $lambdaName"
Write-Host "  Legacy Dynamo removida: $LegacyTableName"
Write-Host "  Role: $roleArn"
Write-Host "  API URL: $url"

$global:LASTEXITCODE = 0
Pop-Location
