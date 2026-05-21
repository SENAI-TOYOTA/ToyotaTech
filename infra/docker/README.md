# Infraestrutura Docker - ToyotaTech

## Containers

| Container | Imagem | Porta |
|---|---|---|
| mqtt_novo | eclipse-mosquitto:2 | 1884:1883 |
| nodered_novo | nodered/node-red | 1881:1880 |
| influxdb_iot | influxdb:2 | 8087:8086 |
| grafana_novo | grafana/grafana | 3001:3000 |
| postgres_db | postgres:latest | 5432:5432 |
| pgadmin | dpage/pgadmin4 | 5050:80 |

## Como executar

```bash
docker compose up --build
```

## Interfaces Web

| Serviço | URL |
|---|---|
| Node-RED | http://localhost:1881 |
| Grafana | http://localhost:3001 |
| InfluxDB | http://localhost:8087 |
| PgAdmin | http://localhost:5050 |

## Estrutura

- `mosquitto/` → configuração MQTT
- `simulador/` → simulador Python
