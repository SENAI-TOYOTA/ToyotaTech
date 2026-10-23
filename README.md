# Toyota Tech

## Introdução

O *Toyota Tech* é um projeto acadêmico que desenvolve uma solução digital para clientes da Toyota acompanharem todas as etapas da compra do seu novo carro, do pedido à entrega.

A solução é composta por um **aplicativo mobile** (Expo/React Native) e um **backend serverless na AWS** (API Gateway, Lambdas Python, DynamoDB e Cognito). O acompanhamento da linha de montagem é alimentado por eventos de tracking enviados ao backend.

## Estrutura do Repositório

| Caminho | Descrição |
|---|---|
| `apps/mobile` | Aplicativo mobile (Expo SDK 57, React Native, TypeScript, Expo Router) |
| `apps/server` | Backend serverless (AWS SAM, 4 Lambdas Python 3.12, DynamoDB, Cognito) |
| `apps/client` | Protótipo web (Next.js) das telas da aplicação |
| `infra/docker` | Stack local de IoT (Mosquitto, simulador, Node-RED, InfluxDB, Grafana) |
| `docs` | Documentação acadêmica e diagramas |
| `.github/workflows` | CI: lint e testes de backend e frontend |

## Documentação Técnica

A documentação detalhada de arquitetura, contratos e operação está na [Wiki do projeto](https://github.com/SENAI-TOYOTA/ToyotaTech/wiki).

- [Aplicativo Mobile — Visão Geral](https://github.com/SENAI-TOYOTA/ToyotaTech/wiki/Aplicativo-Mobile---Visao-Geral)
- [Aplicativo Mobile — Arquitetura](https://github.com/SENAI-TOYOTA/ToyotaTech/wiki/Aplicativo-Mobile---Arquitetura)
- [Backend Serverless](https://github.com/SENAI-TOYOTA/ToyotaTech/wiki/Backend-Serverless)
- [Backend — Operação e Deploy](https://github.com/SENAI-TOYOTA/ToyotaTech/wiki/Backend-Operacao)
- [Handoff](https://github.com/SENAI-TOYOTA/ToyotaTech/wiki/Handoff)

## Como Rodar

### Mobile

```bash
cd apps/mobile
npm install
npm start
```

As variáveis `EXPO_PUBLIC_*` estão documentadas em `apps/mobile/.env.example`.

### Backend

```bash
sam build
sam deploy --guided
```

Validação local:

```bash
ruff check apps/server && ruff format --check apps/server
.venv/bin/python -m pytest apps/server -q
```

### Stack local de IoT

```bash
cd infra/docker
docker compose up --build
```

## Material Acadêmico

- *Documentação* — projeto documentado em PDF e nos padrões ABNT: [Ver documentação](./docs/geral/ToyotaDocument.pdf)
- *Evidência da demanda* — [SAGA](./docs/negocio/SAGA.md) e [Mapeamento IVH](./docs/negocio/Mapeamento-IVH.pdf)
- *Vídeo explicativo* — [Ver vídeo](https://drive.google.com/file/d/1a74CHLaFyhtTp_PLwMmixmdxDPXuN3eu/view)
- *Apresentação* — [Ver apresentação](https://www.canva.com/design/DAGpVkXnpeA/-IqE3Sv6lRKOfNJXP_c3Bw/edit?utm_content=DAGpVkXnpeA&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)

## Objetivo

Demonstrar, de forma prática, como tecnologias integradas melhoram a experiência do cliente no setor automotivo, com foco em *transparência, controle e inovação* no processo de compra de veículos.

---
