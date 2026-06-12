# Plano de Implementacao - Vinculo Automatico de Veiculo Ficticio

## Objetivo

Implementar no app ToyotaTech um fluxo em que o usuario nao escolhe manualmente um carro no mobile. O sistema deve resolver automaticamente qual carro mostrar para o usuario depois do cadastro e preenchimento de perfil, usando um banco ficticio de compras pre-carregado ou gerado pelo backend.

A ideia de produto e:

1. O usuario cria conta pelo Cognito.
2. O usuario verifica e-mail.
3. O usuario completa perfil com nome completo e data de nascimento.
4. Futuramente o perfil tambem tera CPF.
5. O backend cruza `email`, `fullName`, `birthDate` e depois `cpf` contra uma base ficticia de compras.
6. Se achar uma compra compativel, vincula essa compra ao `userId` Cognito.
7. Se nao achar, gera uma compra ficticia deterministicamente a partir de um catalogo pre-definido.
8. O backend projeta essa compra para o formato `GarageData`.
9. O app segue lendo `GET /garage/current` e renderizando home, financiamento, gestao do veiculo e tracking sem saber se a compra veio de match real ou seed ficticio.

O MVP deve continuar suportando um unico carro por usuario. Nao implementar selecao manual multi-carro agora.

## Contexto da Codebase

O projeto fica em `apps/mobile` e e um app Expo Router com React Native e TypeScript.

Pontos principais:

- `app/_layout.tsx`: guarda de autenticacao e perfil.
- `contexts/AuthContext.tsx`: gerencia sessao Cognito, tokens, refresh e bootstrap de garagem.
- `services/api.ts`: wrapper HTTP usando `EXPO_PUBLIC_API_URL`.
- `services/auth.ts`: login, cadastro, verificacao de e-mail, refresh e `/me`.
- `services/profile.ts`: leitura e atualizacao de perfil.
- `services/garage.ts`: consumo de garagem.
- `types/auth.ts`, `types/profile.ts`, `types/garage.ts`: contratos TypeScript do app.
- `aws/lambda/auth_handler.py`: backend Lambda principal.
- `aws/scripts/deploy.ps1`: cria/atualiza Cognito, Lambda, API Gateway e DynamoDB.
- `docs/continuacao-garage.md`: contexto parcial da fase anterior de garagem.

Telas consumidoras de garagem:

- `app/(tabs)/home.tsx`: chama `fetchGarageCurrent` e mostra `garage.vehicle`.
- `app/(tabs)/financing.tsx`: chama `fetchGarageCurrent` e mostra financiamento.
- `app/(tabs)/vehicle-management.tsx`: chama `fetchGarageCurrent` e mostra documentos/recalls.
- `app/(tabs)/tracking.tsx`: chama `fetchGarageStatus` e mostra timeline.

## Estado Atual da Arquitetura

O app ja esta estruturado para receber um unico objeto `GarageData`.

Contrato atual:

```ts
GET /garage/current -> { garage: GarageData }
GET /garage/status -> { tracking: TrackingInfo }
POST /garage/link -> { garage: GarageData, purchase?: unknown }
```

`services/garage.ts` ja possui:

- `fetchGarageCurrent(token)`
- `fetchGarageStatus(token)`
- `linkGaragePurchase(token, payload)`

`types/garage.ts` define:

- `GarageVehicle`
- `GarageOrder`
- `GarageFinancing`
- `GarageDocument`
- `GarageRecall`
- `GarageData`
- `GarageResponse`

No backend, a Lambda ja possui funcoes uteis:

- `_get_or_create_garage(user)`
- `_build_demo_garage(user)`
- `_build_demo_purchase(user)`
- `_seed_purchase_for_user(user)`
- `_project_garage_from_purchase(user, purchase)`
- `_find_purchase_by_email(email)`
- `_find_linked_purchase_for_user(userId)`
- `_attach_purchase_to_user(purchase, userId)`
- `_garage_current(event)`
- `_garage_status(event)`
- `_garage_link(event)`

O problema atual e que `_get_or_create_garage` cria ou retorna uma garagem cedo demais. O `AuthContext` chama `fetchGarageCurrent` durante login/restauracao de sessao. Isso pode criar uma garagem demo antes do usuario completar perfil, quando ainda nao ha `fullName` e `birthDate` confiaveis para cruzamento.

## Estado Atual na AWS

Recursos observados:

- Cognito User Pool: `us-east-1_wcPLRxv6W`
- Cognito App Client: `7i1l02ojsk3j6f1plnh0iu5g7m`
- Lambda: `toyotatech-auth-handler`
- DynamoDB: `toyotatech-profile`
- DynamoDB: `toyotatech-garage`
- DynamoDB: `toyotatech-purchases`
- API Gateway: URL em `.env.local` via `EXPO_PUBLIC_API_URL`

Estado de tabela:

- `toyotatech-garage` tem chave primaria `userId`.
- `toyotatech-purchases` tem chave primaria `purchaseId`.
- Atualmente nao ha GSI real em `toyotatech-purchases`, apesar do codigo tentar consultar `userId-index`, `email-index`, `orderId-index` e `chassi-index`. O codigo cai em `scan` quando os indices nao existem.

Para MVP pequeno, scans funcionam. Para organizar direito, adicionar GSIs.

## Regras de Ouro para o Agente

Nao quebrar login, cadastro, verificacao de e-mail ou refresh token.

Nao trocar o contrato mobile de `GET /garage/current` neste primeiro momento. As telas existentes dependem desse endpoint.

Nao criar selecao manual de carro no mobile agora. O sistema deve resolver o carro.

Nao apagar dados DynamoDB existentes sem pedido explicito.

Nao mexer nos arquivos de `../../infra/docker/*` a menos que a tarefa peca isso diretamente. Eles ja podem estar modificados por outro trabalho.

Nao reverter alteracoes existentes no workspace.

Usar `apply_patch` para edicoes manuais.

Pode usar AWS CLI para diagnostico e validacao. Prefixos `aws cognito-idp`, `aws dynamodb`, `aws apigatewayv2` e `aws lambda get-function-configuration` ja foram usados no projeto. Se uma chamada AWS falhar por proxy/sandbox, repetir com permissao escalada conforme as regras do ambiente.

## Cuidado Especifico com Cognito

Foi identificado antes um problema real no envio de e-mail de verificacao: o User Pool estava sem `AutoVerifiedAttributes: email`. Isso foi corrigido na AWS e em `aws/scripts/deploy.ps1`.

Ao mexer em `deploy.ps1`, manter estas configuracoes no `update-user-pool`:

```powershell
--auto-verified-attributes email
--verification-message-template DefaultEmailOption=CONFIRM_WITH_CODE
--email-configuration EmailSendingAccount=COGNITO_DEFAULT
--policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=false}"
--lambda-config PreSignUp=$lambdaArn
```

Nao remover o trigger `PreSignUp`, pois ele tambem trata federacao Google.

## Decisao de Arquitetura

Implementar um fluxo chamado aqui de `garage resolve`.

Ele deve resolver a garagem do usuario com base no perfil completo.

Prioridade:

1. Manter um carro por usuario.
2. Manter retorno de `GET /garage/current` igual.
3. Evitar criacao de garagem antes do perfil completo.
4. Permitir que a compra venha de uma base ficticia pre-carregada.
5. Se nao houver compra compativel, gerar compra ficticia do backend com dados consistentes.
6. Deixar CPF preparado para entrar como criterio forte depois.

## Modelo de Dados Recomendado para MVP

### Profile

Atual:

```ts
interface UserProfile {
  fullName: string;
  birthDate: string;
}
```

Futuro proximo:

```ts
interface UserProfile {
  fullName: string;
  birthDate: string;
  cpf?: string;
}
```

Adicionar CPF em fase separada para reduzir risco.

### Purchase Ficticia

Tabela: `toyotatech-purchases`

Campos recomendados:

```json
{
  "purchaseId": "purchase-000001",
  "email": "cliente@email.com",
  "fullName": "Nome Completo",
  "normalizedName": "nome completo",
  "birthDate": "DD/MM/AAAA",
  "cpf": "00000000000",
  "userId": "",
  "linkedAt": 0,
  "status": "available",
  "orderId": "TT-000001",
  "purchaseDate": "03/10/2025",
  "dealership": "Concessionaria Toyota",
  "vehicleId": "CHASSI_00001",
  "chassi": "CHASSI_00001",
  "vehicle": {},
  "financing": {},
  "documents": [],
  "recalls": [],
  "tracking": {},
  "createdAt": 0,
  "updatedAt": 0
}
```

Para MVP, `cpf` pode ficar ausente. O matching usa `email`, `normalizedName` e `birthDate`.

### Garage

Tabela: `toyotatech-garage`

Manter chave `userId` para nao quebrar o app.

Ela segue armazenando o `GarageData` ja projetado, com:

- `userId`
- `order`
- `vehicle`
- `financing`
- `documents`
- `recalls`
- `tracking`
- `createdAt`
- `updatedAt`
- opcional: `purchaseId`
- opcional: `matchSource`
- opcional: `matchConfidence`

## Matching Recomendado

Criar uma funcao no backend:

```python
def _resolve_purchase_for_user(user: Dict[str, Any], profile: Dict[str, str]) -> Optional[Dict[str, Any]]:
    ...
```

Regras:

1. Se ja existe compra vinculada a `userId`, usar ela.
2. Se existe CPF no profile, tentar match por CPF.
3. Tentar match por e-mail normalizado.
4. Validar `fullName` e `birthDate` quando existirem na compra.
5. Se uma compra por e-mail divergir fortemente de nome/data, nao vincular automaticamente.
6. Se nao encontrar compra, gerar compra ficticia deterministicamente.

Para normalizacao:

- E-mail: lowercase + trim.
- Nome: lowercase, remover acentos, compactar espacos.
- CPF: somente digitos.
- Data: manter `DD/MM/AAAA` no app por enquanto, mas normalizar internamente se necessario.

Funcao sugerida:

```python
def _normalize_name(value: str) -> str:
    ...

def _normalize_cpf(value: str) -> str:
    ...

def _purchase_matches_profile(purchase, user, profile) -> bool:
    ...
```

## Mudanca Central no Fluxo

Hoje:

```text
login -> AuthContext.bootstrapGarage -> GET /garage/current -> cria demo se nao existir
```

Desejado:

```text
login -> nao criar garagem se perfil incompleto
profile-setup salva perfil -> backend resolve compra/garagem
home -> GET /garage/current -> retorna garagem resolvida
```

Opcao mais segura:

1. Alterar `AuthContext.bootstrapGarage` para nao criar garagem cedo.
2. Ou alterar `_get_or_create_garage` para nao criar demo se perfil incompleto.
3. Preferir a segunda opcao no backend para proteger qualquer cliente.

Regra:

```text
Se perfil incompleto:
  GET /garage/current retorna 404 ou objeto vazio controlado?
```

Como o app atual espera `garage`, a alternativa menos quebravel e:

- No app, o root layout ja obriga `/profile-setup` quando falta perfil.
- Entao, na pratica, `GET /garage/current` so deveria ser chamado depois do perfil completo.
- Mesmo assim, proteger backend contra criacao prematura.

Recomendacao:

- Remover `bootstrapGarage` do login ou condicionar ao `user.profile.fullName && user.profile.birthDate`.
- Em `profile-setup`, depois de `updateProfile`, chamar endpoint de resolucao.

## Endpoints Recomendados

### Manter

```text
GET /garage/current
GET /garage/status
POST /garage/link
PUT /garage/current
```

### Adicionar

```text
POST /garage/resolve
```

Contrato:

```json
{}
```

Resposta:

```json
{
  "garage": {},
  "purchase": {},
  "matchSource": "linked_user|cpf|email_profile|generated_demo"
}
```

Esse endpoint usa o token para identificar o usuario, busca profile no DynamoDB e resolve a compra.

`GET /garage/current` pode chamar internamente a mesma resolucao quando a garagem ainda nao existe e o perfil esta completo.

## Plano de Implementacao por Fases

### Fase 1 - Backend resolve sem CPF

Arquivos:

- `aws/lambda/auth_handler.py`
- `aws/scripts/deploy.ps1`
- `services/garage.ts`
- `app/profile-setup.tsx`

Tarefas:

1. Criar helper `_normalize_name`.
2. Criar helper `_normalize_birth_date` se necessario.
3. Criar `_get_profile(userId)` ja existe, reutilizar.
4. Criar `_is_profile_complete(profile)`.
5. Criar `_find_purchase_for_profile(user, profile)`.
6. Criar `_generate_purchase_for_profile(user, profile)` ou adaptar `_build_demo_purchase`.
7. Criar `_resolve_garage_for_user(user)`.
8. Fazer `_garage_current` usar `_resolve_garage_for_user` quando nao houver garagem.
9. Criar rota `POST /garage/resolve`.
10. Atualizar `deploy.ps1` para incluir rota `POST /garage/resolve`.
11. Criar `resolveGarage(token)` em `services/garage.ts`.
12. Em `profile-setup.tsx`, depois de `updateProfile` e `refreshUser`, chamar `resolveGarage(token)` antes de `router.replace("/home")`.
13. Condicionar `AuthContext.bootstrapGarage` para nao criar garagem se `user.profile` estiver incompleto, ou remover o bootstrap.

Contrato mobile continua compativel.

### Fase 2 - Base ficticia de compras

Arquivos:

- `aws/lambda/auth_handler.py`
- `aws/scripts/deploy.ps1`
- opcional: novo script `aws/scripts/seed-purchases.ps1`
- opcional: novo arquivo `aws/seeds/purchases.sample.json`

Tarefas:

1. Criar catalogo de veiculos pre-definidos no backend ou seed JSON.
2. Criar compras ficticias com e-mail/nome/data para teste.
3. Seedar `toyotatech-purchases`.
4. Se o usuario cadastrado bater com uma compra seeded, vincular ela.
5. Se nao bater, gerar compra demo a partir do catalogo.

Para nao depender de dados reais, usar combinacoes ficticias.

### Fase 3 - CPF

Arquivos:

- `types/profile.ts`
- `services/profile.ts` se necessario
- `app/profile-setup.tsx`
- `app/(tabs)/profile.tsx`
- `aws/lambda/auth_handler.py`
- `aws/scripts/deploy.ps1`

Tarefas:

1. Adicionar `cpf?: string` em `UserProfile`.
2. Adicionar campo CPF no profile setup.
3. Adicionar CPF na tela de perfil.
4. Normalizar CPF no frontend com mascara.
5. Salvar CPF no DynamoDB profile.
6. Adicionar CPF ao matching.
7. Priorizar CPF sobre nome/data/e-mail.

CPF deve ser opcional no inicio para nao bloquear contas antigas.

### Fase 4 - Indices DynamoDB

Arquivos:

- `aws/scripts/deploy.ps1`
- `aws/lambda/auth_handler.py`

Tarefas:

1. Atualizar criacao de `toyotatech-purchases` com GSIs:
   - `userId-index`
   - `email-index`
   - `orderId-index`
   - `chassi-index`
   - futuramente `cpf-index`
2. Para tabelas existentes, usar `aws dynamodb update-table` para adicionar GSIs.
3. Remover dependencia de `scan` no fluxo principal depois que indices estiverem prontos.

Atencao: adicionar GSI em DynamoDB existente pode demorar. Validar status `ACTIVE` antes de depender dele.

## Implementacao Detalhada Sugerida

### 1. Backend: perfil completo

Em `aws/lambda/auth_handler.py`, adicionar:

```python
def _is_profile_complete(profile: Dict[str, str]) -> bool:
    return bool(_coerce_text(profile.get("fullName")) and _coerce_text(profile.get("birthDate")))
```

Depois, em resolucao de garagem:

```python
profile = _get_profile(user_id)
if not _is_profile_complete(profile):
    return None ou resposta 409/404 controlada
```

Como o app ja redireciona para profile setup, esse caso deve ser raro.

### 2. Backend: resolver compra

Criar:

```python
def _resolve_purchase_for_user(user, profile):
    user_id = _coerce_text(user.get("sub"))
    email = _normalize_email(_coerce_text(user.get("email")))

    purchase = _find_linked_purchase_for_user(user_id)
    if purchase:
        return purchase, "linked_user"

    purchase = _find_purchase_by_email(email)
    if purchase and _purchase_matches_profile(purchase, user, profile):
        linked = _attach_purchase_to_user(purchase, user_id)
        return linked or purchase, "email_profile"

    generated = _seed_purchase_for_user_profile(user, profile)
    linked = _attach_purchase_to_user(generated, user_id) or generated
    return linked, "generated_demo"
```

Nao usar match frouxo de nome sem e-mail no MVP. Nome e data so validam, nao localizam.

### 3. Backend: gerar compra ficticia melhor

Substituir ou complementar `_build_demo_purchase(user)` com uma versao que recebe `profile`.

Exemplo:

```python
def _build_demo_purchase_for_profile(user, profile):
    ...
```

Dados devem preencher:

- `email`
- `fullName`
- `normalizedName`
- `birthDate`
- `purchaseId`
- `orderId`
- `vehicleId`
- `chassi`
- `vehicle`
- `financing`
- `documents`
- `recalls`
- `tracking`

O "sorteio" deve ser deterministico, nao aleatorio puro. Usar hash de `userId`, `email` ou `cpf` para selecionar um item do catalogo.

Isso evita que o carro mude entre chamadas.

### 4. Backend: endpoint resolve

Adicionar funcao:

```python
def _garage_resolve(event):
    access_token = _extract_token(event)
    user = _get_user_from_access_token(access_token, link_if_needed=True)
    garage, purchase, match_source = _resolve_garage_for_user(user)
    return _response(200, {"garage": garage, "purchase": purchase, "matchSource": match_source})
```

Adicionar rota no `lambda_handler`:

```python
if method == "POST" and path == "/garage/resolve":
    return _garage_resolve(event)
```

Adicionar rota no `deploy.ps1` na lista `$routes`:

```powershell
"POST /garage/resolve",
```

### 5. Mobile: service

Em `services/garage.ts`:

```ts
export async function resolveGarage(token: string) {
  return apiRequest<GarageResponse>("/garage/resolve", {
    method: "POST",
    token,
  });
}
```

Se quiser tipar `matchSource`, criar `ResolveGarageResponse`.

### 6. Mobile: profile setup

Em `app/profile-setup.tsx`, depois de:

```ts
await updateProfile(...)
await refreshUser()
```

chamar:

```ts
await resolveGarage(token)
```

Depois:

```ts
router.replace("/home")
```

Se `resolveGarage` falhar, decidir UX:

- Para MVP, mostrar erro: "Nao foi possivel vincular seu veiculo."
- Ou deixar entrar na home com fallback do `garage/current`.

Recomendacao: mostrar erro apenas se falha for auth/API real. Se backend gerar demo, nao deve falhar.

### 7. AuthContext

Hoje `bootstrapGarage` chama `fetchGarageCurrent` no login. Isso deve mudar.

Opcoes:

1. Remover `bootstrapGarage`.
2. Condicionar:

```ts
if (meResult.user.profile?.fullName && meResult.user.profile?.birthDate) {
  await bootstrapGarage(accessToken);
}
```

Recomendacao: condicionar para menor impacto.

## Validacoes Manuais

### Verificar Cognito

```powershell
aws cognito-idp describe-user-pool `
  --user-pool-id us-east-1_wcPLRxv6W `
  --region us-east-1 `
  --query "UserPool.{AutoVerifiedAttributes:AutoVerifiedAttributes,VerificationMessageTemplate:VerificationMessageTemplate,LambdaConfig:LambdaConfig}" `
  --output json
```

Esperado:

```json
{
  "AutoVerifiedAttributes": ["email"],
  "VerificationMessageTemplate": {
    "DefaultEmailOption": "CONFIRM_WITH_CODE"
  },
  "LambdaConfig": {
    "PreSignUp": "arn:aws:lambda:us-east-1:908570230323:function:toyotatech-auth-handler"
  }
}
```

### Verificar tabelas

```powershell
aws dynamodb describe-table --table-name toyotatech-garage --region us-east-1
aws dynamodb describe-table --table-name toyotatech-purchases --region us-east-1
```

### Verificar registros

```powershell
aws dynamodb scan --table-name toyotatech-garage --region us-east-1 --select COUNT
aws dynamodb scan --table-name toyotatech-purchases --region us-east-1 --select COUNT
```

### Testar API

Usar o app para login/cadastro real e observar:

1. Cadastro chega e-mail.
2. Verificacao confirma conta.
3. Login redireciona para profile setup.
4. Salvar perfil chama resolve.
5. Home mostra carro.
6. Financiamento, gestao e tracking mostram dados do mesmo carro.

Se tiver token local, testar endpoint direto:

```powershell
curl -X POST "$env:EXPO_PUBLIC_API_URL/garage/resolve" `
  -H "Authorization: Bearer <accessToken>" `
  -H "Content-Type: application/json"
```

## Testes e Checagens

Rodar:

```powershell
npm run lint
```

Checar diff:

```powershell
git diff --check
git status --short
```

Se mexer em Lambda:

```powershell
powershell -ExecutionPolicy Bypass -File .\aws\scripts\deploy.ps1
```

Se deploy falhar por permissao IAM em ambiente Vocareum, ler o erro e validar se a Lambda/API foi atualizada parcialmente antes de repetir.

## Riscos

### Criacao prematura de garagem

Maior risco atual. Se `fetchGarageCurrent` rodar antes do perfil completo, o backend pode criar demo errada e nunca tentar match correto depois.

Mitigacao:

- Condicionar bootstrap no `AuthContext`.
- Fazer backend tentar re-resolver quando a garagem existente tiver `matchSource=generated_demo` e existir perfil completo.

### Match incorreto

Cruzar por e-mail apenas pode vincular compra errada se houver e-mail compartilhado ou seed malfeito.

Mitigacao:

- Validar nome e data.
- Adicionar CPF depois.
- Registrar `matchSource` e `matchConfidence`.

### Sobrescrever garagem existente

`POST /garage/link` hoje substitui a garagem do usuario.

Para MVP um carro, isso e aceitavel se for intencional. Para futuro multi-carro, precisa outra modelagem.

### GSI ausente

Scans funcionam com poucos registros, mas nao escalam.

Mitigacao:

- Fase 4 adiciona GSIs.
- Ate la, manter base ficticia pequena.

## O Que Nao Fazer Agora

Nao implementar tela de selecao manual de carro.

Nao migrar para multi-carro.

Nao trocar todos os consumidores mobile para receber `vehicleId`.

Nao remover `GET /garage/current`.

Nao remover Cognito ou trocar auth.

Nao apagar dados existentes em DynamoDB.

Nao bloquear login se a garagem falhar. O bloqueio correto e apenas perfil incompleto, que ja existe.

## Resultado Esperado do MVP

Depois da implementacao:

1. Usuario cadastra e verifica e-mail.
2. Usuario preenche nome completo e data de nascimento.
3. Backend resolve uma compra ficticia.
4. Backend vincula compra ao `userId`.
5. Backend cria/atualiza `toyotatech-garage`.
6. App entra na home.
7. Todas as telas continuam funcionando com `GarageData`.
8. Se o usuario ja tiver garagem, o backend retorna a mesma sem sortear outra.

## Caminho Mais Seguro

Ordem recomendada para executar:

1. Ajustar backend com funcoes de normalizacao e resolve.
2. Adicionar `POST /garage/resolve`.
3. Atualizar `deploy.ps1` com a rota.
4. Atualizar `services/garage.ts`.
5. Chamar resolve no `profile-setup`.
6. Condicionar bootstrap no `AuthContext`.
7. Rodar lint.
8. Deployar.
9. Testar cadastro novo de ponta a ponta.
10. Somente depois pensar em CPF.

Essa abordagem reaproveita quase tudo que existe e reduz o risco de quebrar login, perfil e telas atuais.
