# Deploy — ToyotaTech Server (AWS Academy)

## Pré-requisitos
- AWS Academy Lab ativo (AWS CLI configurado via `aws sts get-caller-identity` ou credenciais exportadas do Academy)
- AWS SAM CLI instalado (`sam --version`)
- Executar a partir de `apps/server/`

## Build e Deploy

```bash
cd apps/server
sam build
sam deploy --guided
```

No modo guided, responda:

| Prompt | Valor |
|---|---|
| Stack Name | toyotatech-server |
| AWS Region | us-east-1 (região do lab) |
| Parameter StackSet bucket / S3 bucket | aceitar o bucket sugerido pelo SAM (do Academy) |
| Confirm changeset | Y |
| Allow IAM role creation | N (o template usa a LabRole existente) |

> O deploy usa a role `LabRole` da conta Academy — nenhuma IAM Role nova é criada.

## Pós-deploy: variáveis .env do mobile

Obtenha os valores dos Outputs da stack:

```bash
aws cloudformation describe-stacks \
  --stack-name toyotatech-server \
  --query "Stacks[0].Outputs" \
  --output table
```

Preencha o `.env` do mobile:

```env
EXPO_PUBLIC_API_URL=<valor de ApiUrl>
EXPO_PUBLIC_COGNITO_USER_POOL_ID=<valor de UserPoolId>
EXPO_PUBLIC_COGNITO_CLIENT_ID=<valor de UserPoolClientId>
EXPO_PUBLIC_AWS_REGION=<região do deploy>
```

## Cleanup

```bash
sam delete --stack-name toyotatech-server
```
