# Pendências

Atualizado em 2026-11-13.

## 1. Deploy da Wave 1 (#295, #296, #308)

Os cards #295, #296 e #308 permanecem em **In Progress** por decisão do Senhor; não mover para Done até nova ordem.

O código está em `develop` @ `60fad29` com CI 5/5 verde. A produção AWS continua no código anterior (`78d8720`); nenhum deploy foi feito nesta sessão.

- #295 (unicidade de CPF) e #308 (boleto) dependem de deploy do backend para valer na nuvem.
- #296 é mobile; depende de build/publicação do app.
- Deploy exige autorização explícita e orçamento de chamadas (lab AWS Academy, concorrência 9/10).

## 2. Rate limit no `/profile` (achado MEDIUM)

`PUT /profile` não passa pelo token bucket. O 409 de CPF permite enumeração de CPFs cadastrados e squatting por conta autenticada. Mitigação: token bucket por IP+rota no `ProfileFunction` ou mensagem genérica + rate limit.

## 3. Reservas de CPF órfãs / LGPD (achado MEDIUM)

Itens `cpf#<cpf>` na `ProfilesTable` não têm TTL e não são removidos ao excluir o perfil. Definir rotina de limpeza/TTL e remoção na exclusão.

## 4. Login Google (#288)

O `UserPoolDomain` e as URLs de OAuth estão no template (#284), mas o `AWS::Cognito::UserPoolIdentityProvider` não existe. Falta insumo externo: projeto no Google Cloud, OAuth consent screen e Client ID/Secret (tipo Web).

## 5. Merge de `main` (#280)

O PR `#294` traz `develop` para `main`, mas está bloqueado pela proteção de `main`, que exige 1 aprovação. Depois do merge, `main` e `develop` ficam alinhadas.

## 6. Branches remotas antigas

`origin/chatbot-toyota-giza` (1 commit) e `origin/feature/web-restructure` (3 commits) continuam sem merge. A poda exige decisão da equipe.

## 7. Proteção do `develop`

O push de `d781d86` reportou bypass de uma regra que espera o check `lint`; os 5 workflows reais passaram. Revisar a required status check configurada para o `develop`.

## 8. Wave 2

#303–#307 (documentos), #310–#312 (conteúdo) e #313 (recall) seguem no Backlog. #288 continua bloqueado por insumo externo.

---

Detalhes e contexto em [Handoff](https://github.com/SENAI-TOYOTA/ToyotaTech/wiki/Handoff).
