from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import requests

app = FastAPI()

templates = Jinja2Templates(directory="templates")


class Mensagem(BaseModel):
    mensagem: str


@app.get("/")
async def home(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="index.html"
    )


@app.post("/chat")
async def chat(dados: Mensagem):

    mensagem = dados.mensagem
    mensagem_lower = mensagem.lower()

    # Atendimento Humano

    if any(palavra in mensagem_lower for palavra in [
        "atendente",
        "humano",
        "pessoa",
        "especialista"
    ]):

        return JSONResponse({
            "resposta": """
👨 Transferência para Atendimento Humano

Para continuar, informe:

• Nome Completo
• Telefone
• E-mail
• Cidade/Estado

Um especialista Toyota entrará em contato.
"""
        })

    # Concessionária

    if any(palavra in mensagem_lower for palavra in [
        "concessionária",
        "concessionaria",
        "loja",
        "endereço",
        "endereco"
    ]):

        return JSONResponse({
            "resposta": """
📍 Localização de Concessionária

Informe:

• Cidade
• Estado

Vou ajudar a localizar a concessionária Toyota mais próxima.
"""
        })

    # Revisão

    if "revisão" in mensagem_lower or "revisao" in mensagem_lower:

        return JSONResponse({
            "resposta": """
🔧 Agendamento de Revisão

Informe:

• Modelo do veículo
• Ano
• Quilometragem atual
• Cidade

Assim posso orientar o agendamento.
"""
        })

    # Garantia

    if "garantia" in mensagem_lower:

        return JSONResponse({
            "resposta": """
🛡️ Garantia Toyota

Informe:

• Modelo do veículo
• Ano de fabricação

Posso orientar sobre cobertura e prazos.
"""
        })

    # Recall

    if "recall" in mensagem_lower:

        return JSONResponse({
            "resposta": """
📢 Verificação de Recall

Informe o número do chassi (VIN) ou modelo do veículo para orientações sobre recalls.
"""
        })

    # Assistência

    if "assistência" in mensagem_lower or "assistencia" in mensagem_lower:

        return JSONResponse({
            "resposta": """
🚨 Assistência 24 Horas

Informe:

• Cidade
• Tipo de ocorrência

Exemplos:
- Pane mecânica
- Pane elétrica
- Guincho
- Troca de pneu
"""
        })

    # Peças

    if "peça" in mensagem_lower or "peca" in mensagem_lower:

        return JSONResponse({
            "resposta": """
🔩 Peças e Acessórios Toyota

Informe:

• Modelo do veículo
• Ano
• Peça desejada

Posso orientar sobre disponibilidade.
"""
        })

    # Híbridos

    if "híbrido" in mensagem_lower or "hibrido" in mensagem_lower:

        return JSONResponse({
            "resposta": """
🚙 Veículos Híbridos Toyota

Posso ajudar com:

• Bateria híbrida
• Manutenção
• Garantia
• Consumo
• Funcionamento do sistema híbrido
"""
        })

    # IA Ollama

    prompt = f"""
Você é Lucas, consultor virtual Toyota especializado em pós-venda.

Serviços disponíveis:

- Revisão
- Garantia
- Recall
- Assistência 24h
- Peças Originais
- Veículos Híbridos
- Histórico de Manutenção
- Concessionárias
- Atendimento Humano

Regras:

- Responda sempre em português.
- Seja educado.
- Seja objetivo.
- Nunca invente informações técnicas.
- Quando não souber algo, recomende uma concessionária Toyota.

Pergunta do cliente:

{mensagem}
"""

    try:

        resposta = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False
            },
            timeout=120
        )

        texto = resposta.json()["response"]

        return JSONResponse({
            "resposta": texto
        })

    except Exception as erro:

        return JSONResponse({
            "resposta": f"Erro ao conectar com a IA local (Ollama): {str(erro)}"
        })