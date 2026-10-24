# Infraestrutura Docker - ToyotaTech

Stack local de IoT usada para simular a linha de montagem e publicar eventos no backend.

## Containers

| Container | Imagem | Porta |
|---|---|---|
| mqtt_novo | eclipse-mosquitto:2 | 1884:1883 |
| simulador-novo | build local (`simulador/`) | — |
| nodered_novo | nodered/node-red | 1881:1880 |
| influxdb_iot | influxdb:2 | 8087:8086 |
| grafana_novo | grafana/grafana | 3001:3000 |

## Como executar

```bash
docker compose up --build
```

Opcional: defina `INGEST_URL` com a URL do endpoint `POST /garage/ingest` da AWS para o simulador mandar os eventos de linha para a Lambda.

O endpoint exige a chave compartilhada no header `X-Ingest-Key`. Defina também `INGEST_KEY` com o mesmo valor do parâmetro SSM `SecureString` do projeto. Sem `INGEST_KEY` o simulador não envia nada e avisa no log — enviar sem a chave só produziria 401.

## Interfaces Web

| Serviço | URL |
|---|---|
| Node-RED | http://localhost:1881 |
| Grafana | http://localhost:3001 |
| InfluxDB | http://localhost:8087 |

## Estrutura

- `mosquitto/` → configuração MQTT
- `simulador/` → simulador Python que publica eventos
- `nodered/` → fluxos do Node-RED (versionados em `flows.json`)

## Dados persistentes

Os diretórios `influxdb/`, `grafana/` e os arquivos de runtime do Node-RED são criados pelo Docker e ignorados pelo `.gitignore` local.
