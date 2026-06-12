# Continuacao - Garage / Vehicle Data

## Estado atual

- A Lambda `aws/lambda/auth_handler.py` ganhou:
  - `GET /garage/current`
  - `PUT /garage/current`
  - `GET /garage/status`
  - criacao automatica de uma garagem demo por `userId` quando nao existe vinculo
- O deploy AWS passou a criar:
  - `toyotatech-garage`
  - `toyotatech-purchases`
  - tentativa de permissao IAM para acessar `toyotatech-profile`, `toyotatech-garage` e `toyotatech-purchases` com fallback de warning se a conta bloquear
  - rotas novas no API Gateway
- O mobile passou a consumir:
  - `services/garage.ts`
  - `types/garage.ts`
  - tracking vindo de `/garage/status`
  - home, financiamento e gestao de veiculo vindo de `/garage/current`
- O AuthContext agora faz bootstrap de garagem no login/restaura sessao.

## O que falta

1. Conectar o produtor real ao `POST /garage/link` e definir a origem do `purchaseId`/`orderId`.
2. Conectar um produtor real para chamar `PUT /garage/current` com dados de compra.
3. Trocar a garagem demo por lookup real em DynamoDB ou outro backend AWS.
4. Integrar o status do `tracking` com o fluxo IoT Core -> Lambda -> DynamoDB.
5. Remover os mocks residuais das telas que ainda nao foram ligadas ao backend.

## O que entrou nesta rodada

- Lambda agora expõe `POST /garage/link`.
- Deploy cria `toyotatech-purchases` simples, com lookup por scan fallback na Lambda para `userId`, `orderId`, `email` e `chassi`.
- O `garage/current` tenta reaproveitar uma compra ja vinculada, depois tenta casar pelo e-mail do Cognito e, se nao achar nada, cria uma purchase seed persistida antes de cair no demo.
- O Lambda agora aceita payload bruto de IoT e normaliza `chassi`, `stage`, `progress` e `history` em `TrackingInfo` simples para o app.
- O simulador em `infra/docker` pode mandar esses eventos para `POST /garage/ingest` quando `INGEST_URL` estiver configurado.
- O PreSignUp local volta a exigir verificacao por e-mail no cadastro Cognito; o auto-confirm foi removido.

## Ponto de entrada para continuar

- `aws/lambda/auth_handler.py`
- `aws/scripts/deploy.ps1`
- `app/(tabs)/home.tsx`
- `app/(tabs)/financing.tsx`
- `app/(tabs)/vehicle-management.tsx`
- `app/(tabs)/tracking.tsx`
