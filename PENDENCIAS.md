# Pendências

Atualizado em 2026-11-13.

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

- [ ] Opcional: apagar a compra `demo-56606` (`generated_demo`), último resíduo do CPF duplicado; os dois perfis e a reserva já foram removidos.
- [ ] Definir TTL/rotina de limpeza para reservas `cpf#<cpf>` órfãs (sem TTL hoje).
- [ ] Opcional: validar o rate limit de `PUT /profile` em produção com uma chamada real.

### #296 — Auto-login após OTP

- [ ] Validar em aparelho/web contra Cognito real: cadastro → OTP → auto-login; falha 429 → mensagem e botão “Ir para login”.
- [ ] Confirmar que a sessão persiste e que o guard leva conta nova ao `profile-setup`.

### #308 — Boleto

- [ ] Validar em aparelho/web: `/financing` → `/boleto`, linha digitável, cópia/compartilhamento e aviso de demonstração.
- [ ] Conferir uma garagem antiga sem `boletoBarcode`: o backfill de leitura deve devolver 47 dígitos e habilitar o botão.

## 2. Transversal

- [ ] Revisar a required status check `lint` do `develop` (regra órfã; os 5 workflows reais passam).
- [ ] Merge de `main` (#280) e poda das branches antigas.
- [ ] Login Google (#288): bloqueado por insumo externo (Google Cloud/OAuth Client ID/Secret).
- [ ] Wave 2 (#303–#307, #310–#312, #313): fora do escopo atual; permanece no Backlog.

## 3. Limpeza já executada

- Dois perfis com o mesmo CPF (final `9899`) e a reserva `cpf#<cpf>` foram removidos da `ProfilesTable`.
- Contas Cognito preservadas; os usuários voltarão ao `profile-setup`.
- A compra `demo-56606` (`generated_demo`) permanece na `PurchasesTable`.

---

Detalhes e contexto em [Handoff](https://github.com/SENAI-TOYOTA/ToyotaTech/wiki/Handoff).
