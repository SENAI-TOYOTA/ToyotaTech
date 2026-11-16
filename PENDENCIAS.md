# Pendências

Só o que falta. Itens concluídos saem daqui.

## #295 — CPF único

- [ ] Validar o rate limit do `PUT /profile` em produção (opcional; exige conta de teste com senha).

## #296 — Auto-login após OTP

- [ ] Em aparelho, contra Cognito real: cadastro → OTP → auto-login; falha 429 exibe `retryAfter` e o botão "Ir para login".
- [ ] Sessão persiste ao reabrir o app e o guard leva a conta nova ao `profile-setup`.

## #308 — Boleto

- [ ] Garagem sem `boletoBarcode`: o backfill de leitura devolve 47 dígitos e habilita o botão. A base está vazia desde 2026-11-16, então é preciso criar o caso antes.

## Transversal

- [ ] Merge de `main` (#280) e poda das branches antigas — decisão do dono; `main` não é tocada até ordem.
- [ ] Login Google (#288) — bloqueado por insumo externo (Google Cloud / OAuth Client ID e Secret).
- [ ] Wave 2 (#303–#307, #310–#312, #313) — Backlog.
