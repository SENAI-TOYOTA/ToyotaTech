# Backend AWS (Vocareum)

## Deploy
Execute no diretório `apps/mobile`:

```powershell
powershell -ExecutionPolicy Bypass -File .\aws\scripts\deploy.ps1
```

O script cria/atualiza:
- Cognito User Pool (`toyotatech-lab-auth-user-pool`)
- Cognito App Client (`mobile-app`)
- Lambda Python (`toyotatech-lab-auth-handler`) usando a role existente `LabRole`
- API Gateway HTTP

Endpoints publicados:
- `POST /auth/check-email`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/verify-email`
- `POST /auth/resend-verification`
- `POST /auth/refresh`
- `POST /auth/set-password`
- `GET /profile`
- `PUT /profile`
- `GET /me`

Modo de verificação de e-mail:
- Via Cognito (`CONFIRM_WITH_CODE`), com envio de código para e-mail.

Para habilitar Google IdP, informe `-GoogleClientId`, `-GoogleClientSecret`,
`-CallbackUrls` e `-LogoutUrls`. Em desenvolvimento (Expo Go + web), use:

```
http://localhost:8081,http://localhost:19006,exp://localhost:8081,exp://localhost:8081/--/,mobile://
```

Também atualiza:
- `.env.example`
- `.env.local` (não versionado)

Com as variáveis:

```bash
EXPO_PUBLIC_API_URL=<url-da-api>
EXPO_PUBLIC_AWS_REGION=<regiao>
EXPO_PUBLIC_COGNITO_USER_POOL_ID=<user-pool-id>
EXPO_PUBLIC_COGNITO_CLIENT_ID=<app-client-id>
```

Durante o deploy, o script remove recursos legados de autenticação custom:
- DynamoDB antiga (`toyotatech-auth-dev`)

## Destroy

```powershell
powershell -ExecutionPolicy Bypass -File .\aws\scripts\destroy.ps1
```

O destroy remove:
- API Gateway HTTP de auth
- Lambda Cognito de auth
- User Pool Cognito criado pelo deploy
- DynamoDB legada (`toyotatech-auth-dev`, se existir)
