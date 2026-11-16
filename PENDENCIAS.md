# Pendências

Atualizado em 2026-11-16.

## 0. Retomada rápida (outra máquina/sessão)

- Repo: `develop` @ `6bccf14` (docs); código deployado: `3b89c74`.
- CI: **5/5** no último push. Testes: **287 pytest** e **120 Jest**.
- Cards **#295, #296 e #308**: `In Progress`, issues abertas. **Não mover para Done.**
- Deploy: stack `toyotatech` em `UPDATE_COMPLETE`; concorrência **9/10**. Nenhuma credencial foi persistida no repo.
- Board: Project 30 — 80 Done · 3 In Progress · 10 Backlog · total 93.

Comandos de retomada:

```bash
git pull
ruff check apps/server && ruff format --check apps/server
.venv/bin/python -m pytest apps/server -q
cd apps/mobile && npx tsc --noEmit && npm run check && npm test
```

Deploy (somente com autorização e orçamento declarado): `sam build` e `sam deploy` em `apps/server`.

## 1. Pendências por card

### #295 — CPF único

- [x] Compra `demo-56606` (`generated_demo`): remoção concluída como **cosmética**. `resolver.should_re_resolve` devolve `True` para `purchaseId` com prefixo `demo-`, e `purchases.seed_for_profile` regrava o mesmo item no próximo `GET /garage/current`. Remoção definitiva exige parar o seeding demo (novo escopo, precisa de card).
- [x] TTL/limpeza de reservas `cpf#<cpf>`: **não implementar agora**. TTL nativa é rejeitada — item expirado desaparece enquanto o perfil ainda detém o CPF, reabrindo a duplicidade; não há heartbeat de perfil para renovar `expiresAt`. `TransactWriteItems` é inviável (o `moto` aceita valores nativos no `Item`, o botocore/AWS real exige `AttributeValue`). Gatilho para agir: 409 “CPF já vinculado” para CPF **sem** perfil correspondente. Remédio manual: `scan` em `ProfilesTable` com `begins_with(userId,'cpf#')` e `delete_item` condicional em `ownerUserId` e `createdAt`.
- [x] Auditoria de 2026-11-16: a reserva `cpf#41421269899` **existe e é legítima** — pertence ao perfil `e4a88448-a0f1-70c8-29cd-65a3852b3d16`, mesmo CPF. Não é órfã; apagá-la reabriria a duplicidade.
- [ ] Opcional: validar o rate limit de `PUT /profile` em produção com uma chamada real.

### #296 — Auto-login após OTP

- [ ] Validar em aparelho/web contra Cognito real: cadastro → OTP → auto-login; falha 429 → mensagem e botão “Ir para login”.
- [ ] Confirmar que a sessão persiste e que o guard leva conta nova ao `profile-setup`.

### #308 — Boleto

- [ ] Validar em aparelho/web: `/financing` → `/boleto`, linha digitável, cópia/compartilhamento e aviso de demonstração.
- [ ] Conferir uma garagem antiga sem `boletoBarcode`: o backfill de leitura deve devolver 47 dígitos e habilitar o botão.

## 2. Transversal

- [ ] Required status check do `develop`: o contexto `lint` **existe**, mas é ambíguo — três workflows usam job `lint` (backend/client/frontend) e dois usam `test`, então o check é o mesmo nome repetido. Renomear os jobs (`name:` em cada um) exige push no `develop` e `PATCH` da proteção. **Adiado**: com `strict=true`, um PATCH que falhe (403 sem admin) trava a branch. Antes de qualquer push, confirmar `"admin": true` em `gh api repos/SENAI-TOYOTA/ToyotaTech --jq .permissions`.
- [ ] Merge de `main` (#280) e poda das branches antigas.
- [ ] Login Google (#288): bloqueado por insumo externo (Google Cloud/OAuth Client ID/Secret).
- [ ] Wave 2 (#303–#307, #310–#312, #313): fora do escopo atual; permanece no Backlog.

## 3. Limpeza já executada

- Dois perfis com o mesmo CPF (final `9899`) e a reserva `cpf#<cpf>` foram removidos da `ProfilesTable`.
- Contas Cognito preservadas; os usuários voltarão ao `profile-setup`.
- A compra `demo-56606` (`generated_demo`) permanece na `PurchasesTable` — decisão de 2026-11-16: remoção é cosmética, porque o item é recriado pelo seeding demo.

---

Detalhes e contexto em [Handoff](https://github.com/SENAI-TOYOTA/ToyotaTech/wiki/Handoff).
