# Backend AWS (Vocareum)

## Deploy
Execute no diretório `apps/mobile`:

```powershell
powershell -ExecutionPolicy Bypass -File .\aws\scripts\deploy.ps1
```

O script cria/atualiza:
- DynamoDB (`toyotatech-auth-dev`)
- Lambda usando a role existente `LabRole` (compatível com Vocareum)
- Lambda Python (`toyotatech-lab-auth-handler`)
- API Gateway HTTP

Endpoints publicados:
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/verify-email`
- `POST /auth/resend-verification`
- `GET /me`

Modo de verificação de e-mail:
- Padrão do lab: `mock` (retorna `verificationCode` na resposta para teste)
- Produção/lab com SES: use `-EmailVerificationMode ses -SesSourceEmail seu-email-verificado@dominio.com`

Também atualiza:
- `.env.example`
- `.env.local` (não versionado)

Com a variável:

```bash
EXPO_PUBLIC_API_URL=<url-da-api>
```

## Destroy

```powershell
powershell -ExecutionPolicy Bypass -File .\aws\scripts\destroy.ps1
```
