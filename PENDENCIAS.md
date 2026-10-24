# Pendências

Atualizado em 2026-10-23.

## 1. Deploy e validação do ingest (`#264`)

O código da chave compartilhada está em `develop` (CI verde), mas não foi ao ar. **O endpoint em produção continua aceitando escrita anônima** — quem souber um chassi sobrescreve o tracking daquele veículo.

Orçamento: 4 requests (1 deploy + 3 validações).

Validação ao vivo, depois do deploy, com um chassi real:

- 401 sem `X-Ingest-Key` (rodo eu)
- 401 com `X-Ingest-Key` errada (rodo eu)
- 200 com a chave correta (roda o usuário, para o segredo não entrar em transcript)

## 2. IAM: `ssm:GetParameter` no `LabRole`

A Lambda lê a chave de SSM. A permissão não é verificável daqui: `Pvoclabs1` nega `iam:GetPolicyVersion` e `simulate-principal-policy` não está disponível.

Se faltar a permissão, o ingest responde 500 `Chave de ingest indisponível no SSM.` — falha fechada, mas o ingest fica fora até ser concedido.

## 3. Login Google (`#288`)

O `UserPoolDomain` e as URLs de OAuth estão no template (`#284`), mas o `AWS::Cognito::UserPoolIdentityProvider` não existe. Falta insumo externo: projeto no Google Cloud, OAuth consent screen e Client ID/Secret (tipo Web).

## 4. Merge de `main` (`#280`)

O PR `#294` (`chore/280-reconcile`) traz `develop` para `main`, com 4 checks verdes. Está **bloqueado pela proteção de `main`**, que exige 1 aprovação.

Depois do merge: `main` e `develop` ficam alinhadas e o fluxo passa a ser issue/PR → `develop` → `main`.

## 5. Branches remotas antigas

`origin/chatbot-toyota-giza` (1 commit) e `origin/feature/web-restructure` (3 commits) continuam sem merge. A poda exige decisão da equipe (o trabalho pode ser retomado ou descartado).

---

Detalhes e contexto em [Handoff](https://github.com/SENAI-TOYOTA/ToyotaTech/wiki/Handoff).
