# Pendências

Atualizado em 2026-10-16.

## 1. `sam deploy` do `9c8a26d`

O código da chave compartilhada está no repositório com CI 4/4 verde, mas não foi ao ar. **O endpoint em produção continua aceitando escrita anônima** — quem souber um chassi sobrescreve o tracking daquele veículo.

Orçamento: 4 requests.

## 2. IAM: `ssm:GetParameter` no `LabRole`

A Lambda lê a chave de SSM. A permissão não foi verificada e não é verificável daqui: `Pvoclabs1` nega `iam:GetPolicyVersion`, então as políticas do `LabRole` não são legíveis, e `simulate-principal-policy` também não está disponível.

Se faltar a permissão, o ingest responde 500 `Chave de ingest indisponível no SSM.` — falha fechada, mas o ingest fica fora até ser concedido.

## 3. Validação ao vivo

Depois do deploy, com um chassi real:

- 401 sem `X-Ingest-Key` (rodo eu)
- 401 com `X-Ingest-Key` errada (rodo eu)
- 200 com a chave correta (roda o usuário, para o segredo não entrar em transcript)

## 4. Fechar a #264 e mover o card

`#264` está **OPEN**, card em **Backlog** (`PVTI_lADODH2gWs4Bg4CMzg4_zK0`). Só sai de lá com aval explícito, e só depois dos itens 1 a 3.

---

Detalhes e contexto em [Handoff](https://github.com/SENAI-TOYOTA/ToyotaTech/wiki/Handoff).