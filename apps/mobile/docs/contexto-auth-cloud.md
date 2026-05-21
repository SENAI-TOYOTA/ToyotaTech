# Contexto vivo - Auth mobile + ambiente cloud

> Atualize este arquivo sempre que houver mudanca no app (fluxo auth) ou na infraestrutura AWS.

## 1) Snapshot do app mobile (estado atual)

### Fluxo e contrato
- O app usa `EXPO_PUBLIC_API_URL` e consome:
  - `POST /auth/check-email`
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/verify-email`
  - `POST /auth/resend-verification`
  - `POST /auth/refresh`
  - `GET /profile`
  - `PUT /profile`
  - `GET /me`
- Arquivos principais do fluxo:
  - `app/(auth)/index.tsx`
  - `services/api.ts`
  - `services/auth.ts`
  - `services/profile.ts`
  - `contexts/AuthContext.tsx`
  - `app/(auth)/register.tsx`
  - `app/(auth)/verify-email.tsx`
  - `app/(auth)/login.tsx`
  - `app/profile-setup.tsx`
  - `app/(tabs)/profile.tsx`

### Login social
- Login Google via Hosted UI do Cognito (OAuth Authorization Code + PKCE).
- Variaveis usadas no app:
  - `EXPO_PUBLIC_COGNITO_DOMAIN`
  - `EXPO_PUBLIC_COGNITO_CLIENT_ID`

### Sessao no app
- Sessao salva em:
  - web: `localStorage`
  - mobile: `expo-secure-store`
- Chave: `toyotatech.auth.session`.
- Estrutura: `accessToken`, `idToken`, `refreshToken`, `expiresAt`.
- Em falha 401 no `GET /me`, o app tenta `POST /auth/refresh` antes de derrubar sessao.

### Perfil
- Dados de perfil persistidos no Dynamo:
  - `fullName`
  - `birthDate`
- Usuarios autenticados sem perfil completo sao redirecionados para `app/profile-setup.tsx`.

## 2) Snapshot do ambiente cloud (estado atual)

### Conta/regiao
- AWS Account: `908570230323`
- Regiao: `us-east-1`
- Identidade atual no lab: role assumida `voclabs/...`

### Recursos detectados
- API Gateway HTTP:
  - Nome: `toyotatech-auth-api` (padrao)
- Lambda:
  - Nome: `toyotatech-auth-handler` (padrao)
  - Runtime: `python3.12`
  - Role: `arn:aws:iam::908570230323:role/LabRole`
  - Env: `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID`, `COGNITO_REGION`, `PROFILE_TABLE_NAME`
- Cognito:
  - User Pool: `toyotatech-auth` (padrao)
  - App Client: `mobile` (padrao)
  - Hosted UI Domain: `https://toyotatech-auth.auth.us-east-1.amazoncognito.com` (padrao)
  - IdP Google: `Google` (quando configurado)
- DynamoDB:
  - Tabela de perfil: `toyotatech-profile` (padrao).

### Rotas publicadas na API
- `POST /auth/check-email`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/verify-email`
- `POST /auth/resend-verification`
- `POST /auth/refresh`
- `GET /profile`
- `PUT /profile`
- `GET /me`
- `OPTIONS /{proxy+}`

## 3) Validacao funcional executada
- Smoke test Cognito executado no endpoint atual:
  - `check-email` antes do cadastro: `200` -> `/register`
  - `register`: `200`
  - `check-email` apos cadastro: `200` -> `/login`
  - `login` antes de verificar email: `403`
  - `admin-confirm-sign-up` (teste de laboratorio): sucesso
  - `login` apos confirmar: `200`
  - `GET /me`: `200`
  - `POST /auth/refresh`: `200`

## 4) Viabilidade Cognito no lab atual
- `list-user-pools`: permitido.
- Teste de provisao temporaria:
  - `create-user-pool`: **SUCCESS**
  - `create-user-pool-client`: **SUCCESS**
  - `list-user-pool-clients`: **SUCCESS**
  - `delete-user-pool`: **SUCCESS**
- Conclusao: **migracao para Cognito e viavel neste ambiente** (com risco normal de variacao de permissoes por sessao Vocareum).

### Validacao complementar (fluxo por e-mail)
- Prova adicional executada com User Pool temporario:
  - `sign-up`: **SUCCESS** com `CodeDeliveryMedium=EMAIL` e destino mascarado (`v***@e***`).
  - `admin-get-user` (usuario existente): **SUCCESS**.
  - `admin-get-user` (usuario inexistente): `UserNotFoundException`.
  - cleanup do teste: `delete-user-pool` **SUCCESS**.
- Implicacao: Cognito cobre verificacao por codigo no e-mail e permite implementar seu fluxo inicial de decisao por e-mail via endpoint backend (`/auth/check-email`).

## 5) Regra de manutencao deste arquivo
- Atualizar imediatamente quando mudar qualquer item abaixo:
  1. Contrato de auth no app (tipos, endpoints, contexto, persistencia de token).
  2. Recursos AWS (nomes, IDs, URLs, roles, variaveis de ambiente, rotas).
  3. Estrategia de autenticacao (custom auth vs Cognito).
  4. Resultado de validacoes de permissao no lab.

## 6) Historico de alteracoes
| Data (local) | Tipo | Alteracao |
| --- | --- | --- |
| 2026-05-18 | Inicial | Snapshot do fluxo auth atual, inventario AWS e prova de viabilidade Cognito. |
| 2026-05-18 | Atualizacao | Confirmacao pratica de envio de codigo por email no Cognito e viabilidade do fluxo de checagem de e-mail (existe/nao existe). |
| 2026-05-18 | Migracao aplicada | App e backend ajustados para Cognito, novas rotas de `check-email` e `refresh`, e Dynamo legado removido do ambiente. |
| 2026-05-19 | Atualizacao | Login Google via Hosted UI, DynamoDB de perfil e novas rotas `/profile` adicionadas no backend. |
