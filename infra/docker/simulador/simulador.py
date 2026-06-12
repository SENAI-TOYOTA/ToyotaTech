import time
import json
import random
from datetime import datetime
import paho.mqtt.client as mqtt

BROKER = "mqtt"
PORT = 1883
TOPIC = "Toyota_Tech/linha"

QTD_CARROS = 10

ETAPAS = [
    "Produção iniciada",
    "Montagem finalizada",
    "Teste de qualidade",
    "Em transporte",
    "Concessionária",
    "Pronto para retirada"
]

TEMPOS_ETAPA = [4, 5, 3, 4, 3, 2]

# MQTT
client = mqtt.Client()
client.connect(BROKER, PORT)
client.loop_start()

inicio_carro = {}

def timestamp():
    return datetime.utcnow().isoformat()

def gerar_chassi(n):
    return f"CHASSI_{str(n).zfill(5)}"

def publicar(chassi, etapa, status, tempo_etapa=0, posicao_linha=0, falha=0, retrabalho=0, tempo_total=0):
    payload = {
        "measurement": "linha",
        "tags": {
            "chassi": chassi,
            "etapa": etapa,
            "status": status
        },
        "fields": { 
            "valor": 1,
            "tempo_etapa": tempo_etapa,
            "posicao_linha": posicao_linha,
            "falha": falha,
            "retrabalho": retrabalho,
            "tempo_total": tempo_total
        },
        "time": timestamp()
    }

    client.publish(TOPIC, json.dumps(payload))
    print(payload)


print("=== SIMULADOR DE LINHA AVANÇADO ===")

linha = [None] * len(ETAPAS)
tempo_restante = [0] * len(ETAPAS)
inicio_etapa = [None] * len(ETAPAS)

carro_atual = 1
carros_finalizados = 0

while carros_finalizados < QTD_CARROS:

    for i in reversed(range(len(ETAPAS))):

        if linha[i] is not None:

            tempo_restante[i] -= 1

            if tempo_restante[i] <= 0:

                chassi = linha[i]

                tempo_etapa = (datetime.utcnow() - inicio_etapa[i]).total_seconds()

                falha = 1 if random.random() < 0.05 else 0
                retrabalho = 0

                if falha:
                    retrabalho = 1
                    tempo_restante[i] = TEMPOS_ETAPA[i] + random.randint(1, 3)
                    inicio_etapa[i] = datetime.utcnow()

                    publicar(chassi, ETAPAS[i], "Retrabalho", tempo_etapa, i, falha, retrabalho)
                    continue

                publicar(chassi, ETAPAS[i], "Finalizado", tempo_etapa, i)

                if i == len(ETAPAS) - 1:

                    tempo_total = (datetime.utcnow() - inicio_carro[chassi]).total_seconds()

                    publicar(chassi, ETAPAS[i], "Concluído", tempo_etapa, i, 0, 0, tempo_total)

                    carros_finalizados += 1
                    linha[i] = None

                else:
                    if linha[i + 1] is None:

                        linha[i + 1] = chassi

                        tempo_restante[i + 1] = TEMPOS_ETAPA[i + 1] + random.randint(-1, 2)
                        inicio_etapa[i + 1] = datetime.utcnow()

                        publicar(chassi, ETAPAS[i + 1], "Iniciado", 0, i + 1)

                        linha[i] = None


    if carro_atual <= QTD_CARROS and linha[0] is None:

        chassi = gerar_chassi(carro_atual)

        linha[0] = chassi
        tempo_restante[0] = TEMPOS_ETAPA[0]
        inicio_etapa[0] = datetime.utcnow()

        inicio_carro[chassi] = datetime.utcnow()

        publicar(chassi, ETAPAS[0], "Iniciado", 0, 0)

        carro_atual += 1

    time.sleep(1)

print("Simulação finalizada.")