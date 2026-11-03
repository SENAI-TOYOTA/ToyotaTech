
from datetime import datetime, timezone
from pathlib import Path
import sqlite3

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "toyotatech.db"

app = FastAPI(
    title="Toyota Tech API",
    description="API de acompanhamento de veículos e pós-venda Toyota Tech",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:8082",
        "http://127.0.0.1:8082",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def conectar():
    conexao = sqlite3.connect(DB_PATH)
    conexao.row_factory = sqlite3.Row
    return conexao


def etapa_por_status(status: str) -> str:
    etapas = {
        "Produção iniciada": "Produção",
        "Montagem finalizada": "Montagem concluída",
        "Teste de qualidade": "Controle de qualidade",
        "Em transporte": "Transporte para concessionária",
        "Concessionária": "Veículo na concessionária",
        "Pronto para retirada": "Aguardando retirada",
    }
    return etapas.get(status, status or "Etapa não informada")


def inicializar_banco():
    with conectar() as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS veiculos (
                chassi TEXT PRIMARY KEY,
                cliente TEXT NOT NULL,
                modelo TEXT NOT NULL,
                ano INTEGER NOT NULL,
                status TEXT NOT NULL,
                atualizado_em TEXT NOT NULL
            )
        """)

        db.execute("""
            CREATE TABLE IF NOT EXISTS revisoes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                chassi TEXT NOT NULL,
                concessionaria TEXT NOT NULL,
                data_solicitada TEXT NOT NULL,
                observacao TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL
            )
        """)

        colunas = {
            coluna["name"]
            for coluna in db.execute(
                "PRAGMA table_info(veiculos)"
            ).fetchall()
        }

        if "etapa" not in colunas:
            db.execute("ALTER TABLE veiculos ADD COLUMN etapa TEXT")

        if "previsao_entrega" not in colunas:
            db.execute(
                "ALTER TABLE veiculos ADD COLUMN previsao_entrega TEXT"
            )

        total = db.execute(
            "SELECT COUNT(*) AS total FROM veiculos"
        ).fetchone()["total"]

        if total == 0:
            agora = datetime.now(timezone.utc).isoformat()
            exemplos = [
                (
                    "CHASSI_00001", "Cliente demonstração",
                    "Yaris", 2026, "Produção iniciada", agora
                ),
                (
                    "CHASSI_00002", "Cliente demonstração",
                    "Corolla", 2026, "Montagem finalizada", agora
                ),
                (
                    "CHASSI_00003", "Cliente demonstração",
                    "Corolla Cross", 2026, "Teste de qualidade", agora
                ),
            ]

            db.executemany("""
                INSERT INTO veiculos
                (chassi, cliente, modelo, ano, status, atualizado_em)
                VALUES (?, ?, ?, ?, ?, ?)
            """, exemplos)

        registros = db.execute("""
            SELECT chassi, status, etapa
            FROM veiculos
        """).fetchall()

        for registro in registros:
            if not registro["etapa"]:
                db.execute("""
                    UPDATE veiculos
                    SET etapa = ?
                    WHERE chassi = ?
                """, (
                    etapa_por_status(registro["status"]),
                    registro["chassi"],
                ))
   
        # Tabela de concessionárias demonstrativas
        db.execute("""
            CREATE TABLE IF NOT EXISTS concessionarias (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                cidade TEXT NOT NULL,
                estado TEXT NOT NULL,
                endereco TEXT NOT NULL,
                telefone TEXT NOT NULL,
                demonstracao INTEGER NOT NULL DEFAULT 1
            )
        """)

        # Tabela de solicitações de análise de garantia
        db.execute("""
            CREATE TABLE IF NOT EXISTS solicitacoes_garantia (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                chassi TEXT NOT NULL,
                descricao TEXT NOT NULL,
                data_solicitacao TEXT NOT NULL,
                status TEXT NOT NULL
            )
        """)

        # Tabela de pedidos de atendimento humano
        db.execute("""
            CREATE TABLE IF NOT EXISTS atendimentos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                telefone TEXT NOT NULL,
                assunto TEXT NOT NULL,
                descricao TEXT NOT NULL,
                data_solicitacao TEXT NOT NULL,
                status TEXT NOT NULL
            )
        """)

        # Inserir concessionárias fictícias para demonstração
        total_concessionarias = db.execute(
            "SELECT COUNT(*) AS total FROM concessionarias"
        ).fetchone()["total"]

        if total_concessionarias == 0:
            db.executemany("""
                INSERT INTO concessionarias
                (nome, cidade, estado, endereco, telefone, demonstracao)
                VALUES (?, ?, ?, ?, ?, 1)
            """, [
                (
                    "Toyota Tech Sorocaba - Demonstração",
                    "Sorocaba", "SP",
                    "Endereço demonstrativo - Sorocaba/SP",
                    "(15) 0000-0000"
                ),
                (
                    "Toyota Tech São Paulo - Demonstração",
                    "São Paulo", "SP",
                    "Endereço demonstrativo - São Paulo/SP",
                    "(11) 0000-0000"
                ),
            ])



inicializar_banco()


class SolicitacaoRevisao(BaseModel):
    chassi: str = Field(min_length=1, max_length=80)
    concessionaria: str = Field(min_length=2, max_length=120)
    data_solicitada: str = Field(min_length=1, max_length=40)
    observacao: str = Field(default="", max_length=1000)


class AtualizacaoEntrega(BaseModel):
    etapa: str | None = Field(default=None, max_length=120)
    previsao_entrega: str | None = Field(default=None, max_length=40)


class MensagemChat(BaseModel):
    mensagem: str = Field(min_length=1, max_length=2000)

class SolicitacaoGarantia(BaseModel):
    chassi: str = Field(min_length=1, max_length=80)
    descricao: str = Field(min_length=5, max_length=1000)


class SolicitacaoAtendimento(BaseModel):
    nome: str = Field(min_length=2, max_length=120)
    telefone: str = Field(min_length=8, max_length=30)
    assunto: str = Field(min_length=3, max_length=120)
    descricao: str = Field(min_length=5, max_length=1000)



@app.get("/")
def inicio():
    return {
        "projeto": "Toyota Tech",
        "status": "online",
        "documentacao": "/docs",
    }


@app.get("/health")
def health():
    with conectar() as db:
        db.execute("SELECT 1")
    return {"status": "online", "banco": "conectado"}


@app.get("/veiculos")
def listar_veiculos():
    with conectar() as db:
        registros = db.execute(
            "SELECT * FROM veiculos ORDER BY chassi"
        ).fetchall()

    return {
        "total": len(registros),
        "veiculos": [dict(registro) for registro in registros],
    }


@app.get("/status/{chassi}")
def consultar_status(chassi: str):
    with conectar() as db:
        registro = db.execute(
            "SELECT * FROM veiculos WHERE chassi = ?",
            (chassi.strip().upper(),),
        ).fetchone()

    if registro is None:
        raise HTTPException(
            status_code=404,
            detail="Veículo não encontrado",
        )

    return dict(registro)


@app.patch("/veiculos/{chassi}/etapa-entrega")
def atualizar_etapa_entrega(
    chassi: str,
    dados: AtualizacaoEntrega,
):
    etapa_enviada = "etapa" in dados.model_fields_set
    previsao_enviada = "previsao_entrega" in dados.model_fields_set

    if not etapa_enviada and not previsao_enviada:
        raise HTTPException(
            status_code=400,
            detail="Informe a etapa ou a previsão de entrega.",
        )

    etapa = dados.etapa.strip() if dados.etapa else dados.etapa
    previsao = (
        dados.previsao_entrega.strip()
        if dados.previsao_entrega
        else dados.previsao_entrega
    )

    if etapa_enviada and etapa == "":
        raise HTTPException(
            status_code=400,
            detail="A etapa não pode ficar vazia.",
        )

    if previsao_enviada and previsao == "":
        previsao = None

    if previsao:
        try:
            datetime.strptime(previsao, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Use o formato de data AAAA-MM-DD para a previsão.",
            )

    atualizacoes = []
    valores = []

    if etapa_enviada:
        atualizacoes.append("etapa = ?")
        valores.append(etapa)

    if previsao_enviada:
        atualizacoes.append("previsao_entrega = ?")
        valores.append(previsao)

    atualizacoes.append("atualizado_em = ?")
    valores.append(datetime.now(timezone.utc).isoformat())
    valores.append(chassi.strip().upper())

    with conectar() as db:
        existe = db.execute(
            "SELECT chassi FROM veiculos WHERE chassi = ?",
            (chassi.strip().upper(),),
        ).fetchone()

        if existe is None:
            raise HTTPException(
                status_code=404,
                detail="Veículo não encontrado",
            )

        db.execute(
            f"UPDATE veiculos SET {', '.join(atualizacoes)} WHERE chassi = ?",
            valores,
        )

        registro = db.execute(
            "SELECT * FROM veiculos WHERE chassi = ?",
            (chassi.strip().upper(),),
        ).fetchone()

    return {
        "mensagem": "Informações de entrega atualizadas.",
        "veiculo": dict(registro),
    }


@app.post("/revisao", status_code=201)
def solicitar_revisao(solicitacao: SolicitacaoRevisao):
    chassi = solicitacao.chassi.strip().upper()

    with conectar() as db:
        veiculo = db.execute(
            "SELECT chassi FROM veiculos WHERE chassi = ?",
            (chassi,),
        ).fetchone()

        if veiculo is None:
            raise HTTPException(
                status_code=404,
                detail=(
                    "Chassi não encontrado. Confira o veículo "
                    "antes de solicitar a revisão."
                ),
            )

        cursor = db.execute("""
            INSERT INTO revisoes
            (chassi, concessionaria, data_solicitada, observacao, status)
            VALUES (?, ?, ?, ?, ?)
        """, (
            chassi,
            solicitacao.concessionaria.strip(),
            solicitacao.data_solicitada.strip(),
            solicitacao.observacao.strip(),
            "SOLICITACAO_RECEBIDA",
        ))

        protocolo = f"TOY-{cursor.lastrowid:08d}"

    return {
        "protocolo": protocolo,
        "chassi": chassi,
        "status_atendimento": "PENDENTE",
        "mensagem": "Solicitação de revisão recebida.",
    }


@app.get("/revisoes")
def listar_revisoes():
    with conectar() as db:
        registros = db.execute(
            "SELECT * FROM revisoes ORDER BY id DESC"
        ).fetchall()

    return {
        "total": len(registros),
        "revisoes": [dict(registro) for registro in registros],
    }



# =====================================================
# CONCESSIONÁRIAS
# =====================================================

@app.get("/concessionarias")
def listar_concessionarias(cidade: str | None = None):
    with conectar() as db:
        if cidade:
            registros = db.execute("""
                SELECT * FROM concessionarias
                WHERE cidade LIKE ?
                ORDER BY cidade, nome
            """, (f"%{cidade.strip()}%",)).fetchall()
        else:
            registros = db.execute("""
                SELECT * FROM concessionarias
                ORDER BY cidade, nome
            """).fetchall()

    return {
        "total": len(registros),
        "demonstracao": True,
        "aviso": "Unidades fictícias para demonstração acadêmica.",
        "concessionarias": [dict(r) for r in registros],
    }


# =====================================================
# GARANTIA
# =====================================================

@app.post("/garantia", status_code=201)
def solicitar_analise_garantia(dados: SolicitacaoGarantia):
    chassi = dados.chassi.strip().upper()

    with conectar() as db:
        veiculo = db.execute(
            "SELECT chassi, modelo, ano FROM veiculos WHERE chassi = ?",
            (chassi,),
        ).fetchone()

        if veiculo is None:
            raise HTTPException(
                status_code=404,
                detail="Veículo não encontrado. Confira o chassi informado.",
            )

        cursor = db.execute("""
            INSERT INTO solicitacoes_garantia
            (chassi, descricao, data_solicitacao, status)
            VALUES (?, ?, ?, ?)
        """, (
            chassi,
            dados.descricao.strip(),
            datetime.now(timezone.utc).isoformat(),
            "AGUARDANDO_ANALISE",
        ))

        protocolo = f"GAR-{cursor.lastrowid:08d}"

    return {
        "protocolo": protocolo,
        "chassi": chassi,
        "status": "AGUARDANDO_ANALISE",
        "mensagem": (
            "Solicitação registrada. A cobertura da garantia "
            "depende de análise e validação oficial."
        ),
    }


@app.get("/garantia")
def listar_solicitacoes_garantia():
    with conectar() as db:
        registros = db.execute("""
            SELECT * FROM solicitacoes_garantia
            ORDER BY id DESC
        """).fetchall()

    return {
        "total": len(registros),
        "solicitacoes": [dict(r) for r in registros],
    }


# =====================================================
# ATENDIMENTO HUMANO
# =====================================================

@app.post("/atendimento", status_code=201)
def solicitar_atendimento(dados: SolicitacaoAtendimento):
    with conectar() as db:
        cursor = db.execute("""
            INSERT INTO atendimentos
            (nome, telefone, assunto, descricao, data_solicitacao, status)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            dados.nome.strip(),
            dados.telefone.strip(),
            dados.assunto.strip(),
            dados.descricao.strip(),
            datetime.now(timezone.utc).isoformat(),
            "AGUARDANDO_CONTATO",
        ))

        protocolo = f"ATD-{cursor.lastrowid:08d}"

    return {
        "protocolo": protocolo,
        "status": "AGUARDANDO_CONTATO",
        "mensagem": (
            "Seu pedido de atendimento foi registrado. "
            "O protocolo está disponível para acompanhamento. "
            "Este registro não significa que um atendente já foi notificado."
        ),
    }


@app.get("/atendimentos")
def listar_atendimentos():
    with conectar() as db:
        registros = db.execute("""
            SELECT * FROM atendimentos
            ORDER BY id DESC
        """).fetchall()

    return {
        "total": len(registros),
        "atendimentos": [dict(r) for r in registros],
    }

@app.post("/chat")

@app.post("/chat")
def conversar(dados: MensagemChat):
    consulta = dados.mensagem.strip().lower()

    if any(p in consulta for p in [
        "status", "andamento", "chassi", "entrega"
    ]):
        resposta = (
            "Para consultar o andamento do veículo, acesse "
            "a opção Consulta de Veículos e informe o chassi."
        )

    elif any(p in consulta for p in [
        "revisão", "revisao", "manutenção", "manutencao"
    ]):
        resposta = (
            "Para solicitar uma revisão, acesse a opção Revisões "
            "e preencha o formulário com os dados do veículo."
        )

    elif any(p in consulta for p in [
        "concessionária", "concessionaria", "loja"
    ]):
        resposta = (
            "Você pode consultar as unidades disponíveis na opção "
            "Concessionárias. Os dados atuais são demonstrativos."
        )

    elif any(p in consulta for p in [
        "garantia", "cobertura"
    ]):
        resposta = (
            "Para solicitar uma análise de garantia, acesse a opção "
            "Garantia e informe o chassi e a descrição da solicitação."
        )

    elif any(p in consulta for p in [
        "atendente", "atendimento", "humano", "pessoa"
    ]):
        resposta = (
            "Para solicitar contato de um atendente, acesse "
            "Atendimento Humano e preencha seus dados."
        )

    else:
        resposta = (
            "Olá! Sou a assistente do Toyota Tech.\n\n"
            "Posso ajudar com:\n"
            "1. Consulta de veículos e entrega\n"
            "2. Solicitação de revisão\n"
            "3. Consulta de concessionárias\n"
            "4. Análise de garantia\n"
            "5. Atendimento humano\n\n"
            "Digite o serviço desejado para receber orientação."
        )

    return {"resposta": resposta}
