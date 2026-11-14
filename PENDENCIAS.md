# Pendências

Atualizado em 2026-11-13.

## 1. Wave 1 (#295, #296, #308) — em In Progress

Os cards #295, #296 e #308 permanecem em **In Progress** por decisão do Senhor; não mover para Done até nova ordem.

O código está em `develop` @ `3b89c74`, CI 5/5 verde, e foi deployado na stack `toyotatech` (`UPDATE_COMPLETE` em 2026-11-14). Produção agora tem `ProfileFunction` e `GarageFunction` atualizadas; concorrência segue 9/10.

- **#295:** reserva `cpf#<cpf>` + rate limit em `PUT /profile`; backfill executado na `ProfilesTable`.
- **#296:** auto-login pós-OTP, tratamento de 429 e testes de tela; falta validar em aparelho/web contra Cognito real.
- **#308:** backfill de `boletoBarcode` em leitura, testes de tela e aviso de demonstração; produção atualizada.

## 2. CPF duplicado legado — resolvido em 2026-11-13

Os **2 perfis com o mesmo CPF** (final `9899`) e a reserva `cpf#<cpf>` foram removidos da `ProfilesTable`. As contas Cognito foram preservadas; os usuários voltarão ao `profile-setup`. A compra `demo-56606` (`generated_demo`) permanece na `PurchasesTable` como registro de demonstração.

## 3. Teste em dispositivo/web

#296 e #308 têm testes de tela em Jest, mas não foram exercitados em aparelho real ou navegador contra Cognito/API de produção. A validação de ponta a ponta depende de build do app e de uma sessão real.

## 4. Proteção do `develop`

O push de `3b89c74` reportou bypass de uma regra que espera o check `lint`; os 5 workflows reais passaram. Revisar a required status check configurada para o `develop`.

## 5. Login Google (#288)

O `UserPoolDomain` e as URLs de OAuth estão no template (#284), mas o `AWS::Cognito::UserPoolIdentityProvider` não existe. Falta insumo externo: projeto no Google Cloud, OAuth consent screen e Client ID/Secret (tipo Web).

## 6. Merge de `main` (#280)

O PR `#294` traz `develop` para `main`, mas está bloqueado pela proteção de `main`, que exige 1 aprovação. Depois do merge, `main` e `develop` ficam alinhadas.

## 7. Branches remotas antigas

`origin/chatbot-toyota-giza` (1 commit) e `origin/feature/web-restructure` (3 commits) continuam sem merge. A poda exige decisão da equipe.

## 8. Wave 2

#303–#307 (documentos), #310–#312 (conteúdo) e #313 (recall) seguem no Backlog. #288 continua bloqueado por insumo externo.

---

Detalhes e contexto em [Handoff](https://github.com/SENAI-TOYOTA/ToyotaTech/wiki/Handoff).
