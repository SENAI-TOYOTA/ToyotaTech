# Guia do Agente — ToyotaTech (Mobile & Cloud Serverless)

Diretrizes essenciais para agentes de IA atuando no repositório **ToyotaTech**, um ecossistema estritamente composto por **aplicativo mobile** (`apps/mobile`) e **backend serverless na AWS** (`apps/server`).

---

## 1. Documentação na Wiki (Leitura Obrigatória)

**A fonte oficial e detalhada de arquitetura, contratos e decisões técnicas é a Wiki do GitHub.**
Sempre que precisar de detalhes aprofundados sobre qualquer parte do sistema, consulte a wiki clonando-a temporariamente:

```bash
git clone https://github.com/SENAI-TOYOTA/ToyotaTech.wiki.git /tmp/ToyotaTech.wiki
```

### Páginas Principais da Wiki:
- **Mobile (`apps/mobile`)**:
  - `Aplicativo-Mobile---Visao-Geral.md`: Escopo do app, stack Expo SDK 57 e propósito do negócio.
  - `Aplicativo-Mobile---Arquitetura.md`: Arquitetura do app e diagrama de comunicação.
  - `Aplicativo-Mobile---Rotas-e-Telas.md`: Rotas do Expo Router, guards e transições de tela.
  - `Aplicativo-Mobile---Servicos.md`: Métodos de API, contratos e camadas de sessão.
  - `Aplicativo-Mobile---Autenticacao.md`: Fluxos Cognito (email/senha, Google PKCE) e renovação transparente.
  - `Aplicativo-Mobile---AWS-Backend.md`: Mapeamento das Lambdas, DynamoDB e variáveis `EXPO_PUBLIC_*`.
- **Backend Serverless (`apps/server`)**:
  - `Backend-Serverless.md`: SAM (`template.yaml`), 4 Lambdas, CommonLayer e DynamoDB.
  - `Backend-Rate-Limiting.md`: Políticas de throttle, token bucket no DynamoDB e headers 429.
  - `Backend-Testes.md`: Testes unitários, mocks com `moto` e testes de contrato TypeScript.
  - `Backend-Operacao.md`: Credenciais AWS Academy, deploy com SAM e limites do ambiente.
- **Histórico & Decisões de Continuidade**:
  - `Handoff.md`: Estado real do ambiente, lições aprendidas e contexto de issues passadas.
  - `Plano-de-Acao.md`: Fases de execução e status do backlog.

---

## 2. A Simbiose Mobile ↔ Cloud na Prática

O projeto não possui frontend desacoplado ou backend independente: **Mobile e Cloud são duas faces do mesmo produto**.

### 1. Contratos Bidirecionais e Testes de Paridade
- **Backend valida o Mobile**: O teste `apps/server/tests/contract/test_contract_services.py` simula a nuvem (Cognito + DynamoDB via `moto`), executa os fluxos das Lambdas e compila as respostas contra os tipos TypeScript do mobile (`npx tsc --noEmit` em `apps/mobile/types/`). Alterar o shape de resposta de uma Lambda sem atualizar o tipo TS no mobile (ou vice-versa) **quebra o CI do backend**.
- **Mobile valida o Backend**: O teste `apps/mobile/__tests__/passwordPolicyParity.test.ts` lê diretamente o arquivo Python `apps/server/layers/common/python/common/validation.py` para garantir que a lista de senhas fracas (`WEAK_PASSWORDS`) do mobile esteja em paridade estrita com a nuvem.

### 2. Infraestrutura Serverless AWS (SAM)
- **HTTP API do API Gateway**:
  - Ponto de entrada único para o mobile (`EXPO_PUBLIC_API_URL`).
  - Throttle fixado em **Burst 10 / Rate 20**.
  - CORS configurado com `ExposeHeaders: Retry-After`.
- **4 Lambdas Python 3.12** (concorrência total limitada a **9 de 10** no AWS Academy):
  - `AuthFunction` (`/auth/*`): 4 execuções reservadas. Login, cadastro, OTP, refresh, set-password e PreSignUp trigger.
  - `ProfileFunction` (`/profile`, `/me`): 2 execuções reservadas. Leitura e atualização de perfil.
  - `GarageFunction` (`/garage/*`): 2 execuções reservadas. Garagem do usuário, veículo e compras.
  - `TrackingFunction` (`/garage/status`, `/garage/ingest`): 1 execução reservada. Status de montagem em tempo real e ingest seguro via SSM.
- **5 Tabelas DynamoDB (PAY_PER_REQUEST)**:
  - `AuthRateLimitTable`: Token bucket para `/auth/*` com expiração TTL.
  - `ProfilesTable`: Dados de perfil (`userId` HASH).
  - `GarageTable`: Veículo do usuário com **`chassi` no topo** para permitir busca indexada via GSI `chassi-index` (sem scan de tabela inteira).
  - `PurchasesTable`: Vínculo de compras (`purchaseId` HASH e GSIs `email`, `cpf`, `orderId`, `userId`).
  - `TrackingTable`: Linha do tempo de fábrica (`vehicleId` HASH + `timestamp` RANGE).
- **Autenticação no Cognito**:
  - User Pool (`ToyotatechUserPool`) com trigger PreSignUp apontando para `toyotatech-auth`.
  - Hosted UI para Google OAuth2 PKCE com domínio `toyotatech-mobile`.
  - Política de senha no Cognito: mínimo 8 caracteres, maiúscula, minúscula e número (sem exigência de símbolo). **O Cognito rejeita explicitamente senhas com espaços nas pontas**.

### 3. Rate Limiting e Tratamento de 429 no Mobile
- Requisições barradas pelo API Gateway ou pelo token bucket retornam **HTTP 429** contendo `retryAfter` no JSON e no cabeçalho `Retry-After`.
- **NUNCA implemente retries automáticos ou loops para erros 429**. O mobile deve extrair `retryAfter` via `apiErrorMessage` e informar ao usuário quando tentar novamente.

### 4. Camada de Sessão e Interceptor no Mobile
- `apps/mobile/services/api.ts` consome unicamente o `services/sessionStore.ts` (memória pura). A persistência nativa (`Expo SecureStore`) é conectada pelo `AuthContext.tsx`.
- Interceptor inteligente de 401:
  - Só renova se a requisição enviou token.
  - A requisição de refresh nunca envia token (evita loop infinito).
  - Compara se o token da sessão ainda é o mesmo enviado: se requisições paralelas causaram 401 simultâneo, apenas a primeira renova; as demais reaproveitam o novo token sem sobrecarregar a AWS.
  - Erros de rede, timeout (408) ou 5xx **não deslogam** o usuário. Apenas 4xx no refresh encerra a sessão.

---

## 3. Regras Inegociáveis (Golden Rules)

### 1. PROIBIDO COMENTÁRIOS NO CÓDIGO (ESLint Fail)
- O ESLint em `apps/mobile/eslint.config.js` possui a regra `"local/no-comments": "error"`.
- **Qualquer comentário (`//` ou `/* */`) no código TypeScript/JavaScript causa falha imediata no linter e quebra o CI (`Frontend Lint`)**. Apenas diretivas de linter (ex: `eslint-disable`) são toleradas.
- Proibido também o uso de anotações como `todo`, `fixme`, `bug`, `hack` (`no-warning-comments`).
- Escreva código autoexplicativo, fortemente tipado e limpo. **Zero comentários.**

### 2. GESTÃO DE ISSUES: APENAS PROJECT 30
- O único board ativo no GitHub da organização `SENAI-TOYOTA` é o **Project 30 ("Board")** (`PVT_kwDODH2gWs4Bg4CM`).
- **O Project 6 ("Board - Legado") está formalmente congelado**. Nunca audite, comente ou altere cards que pertençam a ele.
- **Fluxo obrigatório do card**: `Backlog` → `In Progress` → `In Review` → `Done`. Nunca mova um card direto para `Done`.
- **`Done` só após revisão**: mova para `Done` somente depois de revisar o resultado em `In Review` e confirmar que **nenhuma modificação é necessária**. Se a revisão exigir qualquer alteração, o card **permanece em `In Review`** até a correção e nova revisão.
- Padrão de commits: `tipo: mensagem descritiva (#issue)`.

### 3. PROTEÇÃO CONTRA BAN NO LAB AWS
- O ambiente roda em **AWS Academy** com limites severos (concorrência total das Lambdas fixada em 9/10).
- O ambiente já foi **banido 2x por excesso de requisições / rajadas (#287)**.
- Nunca dispare scripts de teste de carga, loops de requisições ou deploys sem autorização explícita e orçamento prévio de chamadas declarado.

### 4. ESTRUTURA DE ARQUIVOS (PÓS-LIMPEZA #231)
- `theme.ts` e `profileValidation.ts` ficam **diretamente na raiz de `apps/mobile/`** (não crie subpastas `constants/` ou `utils/` para eles).
- Não reintroduza arquivos e pastas mortas removidos em limpezas anteriores.

---

## 4. Como Validar as Alterações (Gates de CI)

Antes de finalizar qualquer modificação, execute a validação local correspondente:

### No Mobile (`apps/mobile`):
```bash
cd apps/mobile

# Validação completa de tipos, lint, formatação e testes unitários:
npx tsc --noEmit && npm run check && npm test
```
- **Typecheck**: `npx tsc --noEmit`
- **Lint**: `npm run lint` (`eslint . --max-warnings=0`)
- **Prettier**: `npm run format:check`
- **Testes**: `npm test` (Jest - 5 suítes e 56 testes passando)

### No Backend & Contratos (`apps/server`):
```bash
# Linter e formatação Python:
ruff check apps/server && ruff format --check apps/server

# Testes unitários e contratos TypeScript (226 testes passando):
.venv/bin/python -m pytest apps/server -q
```
