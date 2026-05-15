# Plano 01 - Backend AWS (API Gateway + Lambda + DynamoDB) no Vocareum

## Objetivo
Colocar no ar um backend serverless funcional para autenticação e perfil do usuário, consumido pelo app mobile, usando **API Gateway + Lambda + DynamoDB** no laboratório Vocareum.

## Escopo funcional mínimo (MVP)
1. Cadastro de usuário com e-mail e senha.
2. Login com e-mail e senha.
3. Verificação de sessão/token no app.
4. Endpoint de perfil (`GET /me`) para validar usuário logado.
5. Logout no app (limpeza de token local).

## Arquitetura proposta
- **API Gateway (REST ou HTTP API)** para expor endpoints públicos.
- **Lambda (Node.js/TypeScript)** com handlers separados por domínio:
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/verify-email` (pode iniciar mockado no MVP)
  - `GET /me` (protegido por token JWT)
- **DynamoDB**:
  - Tabela `users` (PK: `email`, atributos: `userId`, `passwordHash`, `isVerified`, `createdAt`).
  - GSI opcional por `userId` para consultas futuras.
- **JWT assinado** por segredo em variável de ambiente da Lambda (Secret Manager/SSM se disponível no lab).

## Plano de execução por fases
### Fase 1 - Preparação do lab e infraestrutura base
1. Levantar limitações reais do Vocareum:
   - região permitida,
   - serviços bloqueados,
   - restrições de IAM,
   - janela de tempo do lab.
2. Definir infraestrutura com IaC simples (SAM ou Terraform, priorizar o que o lab suportar).
3. Criar API Gateway, Lambdas e tabela DynamoDB no mesmo deploy.

### Fase 2 - Implementar autenticação backend
1. `register`: validar payload, aplicar hash de senha (bcrypt), gravar no DynamoDB.
2. `login`: buscar por e-mail, comparar hash, emitir JWT com expiração curta.
3. `me`: validar JWT e retornar dados públicos do usuário.
4. Padronizar respostas e erros (`400`, `401`, `409`, `500`).

### Fase 3 - Segurança mínima e observabilidade
1. CORS configurado para Expo/dev.
2. Logs no CloudWatch por request id.
3. Variáveis de ambiente por estágio (`dev` no lab).
4. Rate limit básico no API Gateway (se permitido no Vocareum).

### Fase 4 - Integração com mobile
1. Publicar URL base da API no app via configuração (`EXPO_PUBLIC_API_URL`).
2. Integrar telas de auth com endpoints reais.
3. Persistir token local (SecureStore/AsyncStorage).
4. Implementar guarda de rota baseada em sessão.

## Limitações típicas do Vocareum e mitigação
1. **Sessão do lab expira**  
   Mitigação: IaC versionado + script único de `deploy` para recriar ambiente rápido.
2. **Permissões IAM parciais**  
   Mitigação: reduzir arquitetura ao mínimo (1 API, poucas Lambdas, 1 tabela).
3. **Serviços avançados bloqueados (SES/Cognito/WAF)**  
   Mitigação: fluxo de verificação de e-mail inicialmente mockado (código fixo em ambiente `dev`).
4. **Limite de custo/recursos**  
   Mitigação: remover recursos ao final da prática com script `destroy`.
5. **Região fixa**  
   Mitigação: parametrizar região uma vez e manter todos recursos colocalizados.

## Critérios de pronto
- App consegue registrar usuário, logar e chamar `GET /me`.
- Token inválido retorna `401`.
- Ambiente pode ser recriado do zero em um único comando de deploy.

## Riscos e decisões
- Se Cognito não estiver liberado, manter auth própria via JWT no MVP.
- Se Lambda authorizer estiver bloqueado, validar JWT dentro do próprio handler inicialmente.

