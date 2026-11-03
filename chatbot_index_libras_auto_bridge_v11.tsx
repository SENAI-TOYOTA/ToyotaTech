import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
// ============================================================
// CONFIGURAÇÃO DA API
// ============================================================
const API_URL =
  Platform.OS === "web"
    ? "http://127.0.0.1:8000"
    : "http://192.168.15.29:8000";
// ============================================================
// VLibras OFICIAL
// ============================================================
const VLIBRAS_SCRIPT =
  "/app/vlibras-plugin.js";
// ============================================================
// FOTO DA ASSISTENTE
// ============================================================
const FOTO_ATENDENTE =
  "https://telfo.ai/telfo-ai/frida.png";
// ============================================================
// TIPOS
// ============================================================
type Mensagem = {
  id: number;
  remetente: "usuario" | "bot";
  texto: string;
};

// Normaliza texto para reconhecer intenções mesmo com acentos
// (ex.: "veículo" e "veiculo") e variações de caixa.
function normalizarTexto(texto: string): string {
  return (texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
// ============================================================
// CARREGAR VLibras OFICIAL
// ============================================================
function carregarVLibras() {
  if (Platform.OS !== "web") {
    return;
  }
  try {
    const globalWeb = globalThis as any;
    const documentWeb = globalWeb.document;
    if (!documentWeb) {
      return;
    }
    // Se o widget já estiver carregado, não faz nada.
    if (
      globalWeb.VLibrasWidget &&
      globalWeb.VLibrasWidget.initBtn
    ) {
      return;
    }
    // Evita carregar o script duas vezes.
    const scriptExistente =
      documentWeb.getElementById(
        "toyota-tech-vlibras"
      );
    if (scriptExistente) {
      return;
    }
    const script =
      documentWeb.createElement("script");
    script.id =
      "toyota-tech-vlibras";
    script.src =
      VLIBRAS_SCRIPT;
    script.async = true;
    documentWeb.body.appendChild(script);
  } catch (erro) {
    console.error(
      "Erro ao carregar VLibras:",
      erro
    );
  }
}
// ============================================================
// CONTROLE DO WIDGET VLibras OFICIAL
// ============================================================
// O widget oficial traduz texto selecionado pelo usuário (hover + clique).
// A API pública do Widget não documenta envio automático de mensagens para
// o player; evitar chamadas a métodos internos não suportados do player.
function obterBotaoVLibras(): HTMLElement | null {
  if (Platform.OS !== "web") return null;

  const globalWeb = globalThis as any;
  const documentWeb = globalWeb.document;
  if (!documentWeb) return null;

  const botaoOficial = globalWeb.VLibrasWidget?.initBtn;
  if (botaoOficial && typeof botaoOficial.click === "function") {
    return botaoOficial as HTMLElement;
  }

  return documentWeb.querySelector(
    "[vw-access-button] .access-button, [vw-access-button] button"
  ) as HTMLElement | null;
}

function enviarTextoParaVLibras(texto: string): void {
  if (Platform.OS !== "web" || !texto.trim()) return;

  const globalWeb = globalThis as any;
  if (!globalWeb.document) return;

  // Mantém apenas a resposta mais recente enquanto o widget inicializa.
  globalWeb.__TOYOTA_VLIBRAS_PENDING_TEXT = texto.trim();
  if (globalWeb.__TOYOTA_VLIBRAS_SEND_SCHEDULED) return;
  globalWeb.__TOYOTA_VLIBRAS_SEND_SCHEDULED = true;

  let tentativa = 0;
  const tentarEnviar = () => {
    const textoPendente = globalWeb.__TOYOTA_VLIBRAS_PENDING_TEXT as string | undefined;

    if (!textoPendente) {
      globalWeb.__TOYOTA_VLIBRAS_SEND_SCHEDULED = false;
      return;
    }

    if (globalWeb.__TOYOTA_VLIBRAS_BRIDGE_READY && globalWeb.CustomEvent) {
      globalWeb.__TOYOTA_VLIBRAS_PENDING_TEXT = "";
      globalWeb.dispatchEvent(
        new globalWeb.CustomEvent("toyota-tech:vlibras:translate", {
          detail: { text: textoPendente },
        })
      );
      globalWeb.__TOYOTA_VLIBRAS_SEND_SCHEDULED = false;
      return;
    }

    tentativa += 1;
    if (tentativa >= 40) {
      globalWeb.__TOYOTA_VLIBRAS_PENDING_TEXT = "";
      globalWeb.__TOYOTA_VLIBRAS_SEND_SCHEDULED = false;
      console.warn(
        "Toyota Tech: ponte automática VLibras não foi carregada. Confira o widget personalizado em public/app."
      );
      return;
    }

    globalWeb.setTimeout(tentarEnviar, 500);
  };

  tentarEnviar();
}

// ============================================================
// TELA PRINCIPAL
// ============================================================
export default function ChatbotScreen() {
  // ==========================================================
  // ESTADOS
  // ==========================================================
  const [mensagem, setMensagem] =
    useState("");
  const scrollRef = useRef<ScrollView | null>(null);
  const [mensagens, setMensagens] =
    useState<Mensagem[]>([
      {
        id: 1,
        remetente: "bot",
        texto:
          "Olá! Eu sou o assistente Toyota Tech. Como posso ajudar você hoje?",
      },
    ]);
  const [carregando, setCarregando] =
    useState(false);
  const [mostrarOpcoes, setMostrarOpcoes] =
    useState(false);
  const [
    modalAcessibilidade,
    setModalAcessibilidade,
  ] = useState(false);
  const [
    altoContraste,
    setAltoContraste,
  ] = useState(false);
  const [
    textoGrande,
    setTextoGrande,
  ] = useState(false);
  const [
    librasAberto,
    setLibrasAberto,
  ] = useState(false);
  // Quando o cliente escolher "Status do veículo",
  // a próxima mensagem será tratada como chassi.
  const [aguardandoChassi, setAguardandoChassi] =
    useState(false);
  // ==========================================================
  // ROLAGEM AUTOMÁTICA
  // ==========================================================
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 120);
    return () => clearTimeout(timer);
  }, [mensagens, carregando, mostrarOpcoes]);
  // ==========================================================
  // VLibras
  //
  // Carregado depois que a tela já está montada.
  // Assim o widget não interfere na abertura do chatbot.
  // ==========================================================
  useEffect(() => {
    if (Platform.OS !== "web") {
      return;
    }
    const timer = setTimeout(() => {
      carregarVLibras();
    }, 700);
    return () => {
      clearTimeout(timer);
    };
  }, []);
  // ==========================================================
  // ABRIR LIBRAS
  // ==========================================================
  function abrirVLibras() {
    if (Platform.OS !== "web") {
      Alert.alert(
        "Libras",
        "O atendimento em Libras está disponível na versão Web do Toyota Tech."
      );
      return;
    }

    setLibrasAberto(true);
    carregarVLibras();

    const tentarAbrir = (tentativa = 0) => {
      const globalWeb = globalThis as any;
      if (!globalWeb.document) return;

      const widget = globalWeb.VLibrasWidget;
      if (widget && typeof widget.open === "function") {
        widget.open();
        const ultimaResposta = [...mensagens].reverse().find((item) => item.remetente === "bot");
        if (ultimaResposta) {
          enviarTextoParaVLibras(ultimaResposta.texto);
        }
        return;
      }

      const botao = obterBotaoVLibras();
      if (botao) {
        botao.click();
        const ultimaResposta = [...mensagens].reverse().find((item) => item.remetente === "bot");
        if (ultimaResposta) {
          enviarTextoParaVLibras(ultimaResposta.texto);
        }
        return;
      }

      if (tentativa < 30) {
        globalWeb.setTimeout(() => tentarAbrir(tentativa + 1), 300);
      } else {
        console.error("Toyota Tech: não foi possível abrir o widget VLibras local.");
      }
    };

    setTimeout(() => tentarAbrir(), 300);
  }

  // ==========================================================
  // CONSULTAR STATUS DO VEÍCULO NO POSTGRESQL
  // ==========================================================
  async function consultarStatusPeloChassi(chassi: string): Promise<string> {
    const chassiLimpo = (chassi || "").trim().toUpperCase();

    if (!chassiLimpo) {
      return "Informe o número do chassi para consultar o veículo.";
    }

    const resposta = await fetch(`${API_URL}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ chassi: chassiLimpo }),
    });

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      throw new Error(
        dados?.detail || `Erro HTTP ${resposta.status} ao consultar o chassi.`
      );
    }

    if (dados?.status === "erro") {
      throw new Error(dados?.mensagem || dados?.erro || "Falha ao consultar o banco de veículos.");
    }

    if (!dados?.veiculo_encontrado || !dados?.veiculo) {
      return (
        dados?.reply ||
        `Não encontrei o chassi ${chassiLimpo}. Confira o número e tente novamente.`
      );
    }

    const veiculo = dados.veiculo;
    return [
      "Encontrei seu veículo no Toyota Tech:",
      `Chassi: ${veiculo.chassi || chassiLimpo}`,
      `Cliente: ${veiculo.cliente || "Não informado"}`,
      `Modelo: ${veiculo.modelo || "Não informado"}`,
      `Ano: ${veiculo.ano || "Não informado"}`,
      `Status atual: ${veiculo.status || "Não informado"}`,
      `Etapa: ${veiculo.etapa || "Não informada"}`,
      `Previsão de entrega: ${veiculo.previsao_entrega || "Não informada"}`,
    ].join("\n");
  }

  function adicionarMensagemBot(texto: string) {
    setMensagens((anteriores) => [
      ...anteriores,
      {
        id: Date.now() + Math.floor(Math.random() * 1000),
        remetente: "bot",
        texto,
      },
    ]);

    // O envio automático funciona quando o widget customizado está aberto.
    if (librasAberto) {
      enviarTextoParaVLibras(texto);
    }
  }

  // ==========================================================
  // ENVIAR MENSAGEM / IDENTIFICAR CONSULTA DE STATUS
  // ==========================================================
  async function enviarMensagem(textoInformado?: string) {
    const texto = (textoInformado ?? mensagem).trim();
    if (!texto || carregando) return;

    setMostrarOpcoes(true);
    setMensagens((anteriores) => [
      ...anteriores,
      { id: Date.now(), remetente: "usuario", texto },
    ]);
    setMensagem("");
    setCarregando(true);

    const textoNormalizado = normalizarTexto(texto);
    const encontrado = texto.toUpperCase().match(/CHASSI[_\s-]*[A-Z0-9_-]+/);
    const chassiDetectado = encontrado?.[0]
      .replace(/[\s-]+/g, "_")
      .replace(/^CHASSI_*/, "CHASSI_");

    // Aceita pedidos digitados naturalmente, mesmo sem clicar no cartão.
    const pediuStatus =
      /\b(status|andamento|etapa|previsao de entrega)\b/.test(textoNormalizado) &&
      /\b(veiculo|carro|meu|minha|pedido|entrega|chassi|status|andamento)\b/.test(textoNormalizado);

    try {
      if (pediuStatus && !aguardandoChassi && !chassiDetectado) {
        setAguardandoChassi(true);
        adicionarMensagemBot(
          "Claro! Para consultar o status atualizado no banco do Toyota Tech, digite o número do chassi do seu veículo."
        );
        return;
      }

      // Quando o cartão Status do veículo foi selecionado, a próxima mensagem
      // é tratada como chassi. Também aceita o chassi digitado diretamente.
      if (aguardandoChassi || chassiDetectado) {
        const chassi = chassiDetectado || texto.trim().toUpperCase();
        const respostaStatus = await consultarStatusPeloChassi(chassi);
        setAguardandoChassi(false);
        adicionarMensagemBot(respostaStatus);
        return;
      }

      // Mensagens gerais vão para o endpoint de chat; consultas de status
      // tratadas acima nunca dependem da IA generativa.
      const resposta = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ mensagem: texto, message: texto }),
      });

      const dados = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        throw new Error(dados?.detail || `Erro HTTP ${resposta.status} no chatbot.`);
      }

      const respostaTexto =
        dados?.resposta ||
        dados?.reply ||
        dados?.message ||
        dados?.mensagem ||
        "Não consegui obter uma resposta no momento. Você pode continuar pelas opções da Toyota Tech.";

      adicionarMensagemBot(String(respostaTexto));
    } catch (erro) {
      console.error("Erro no chatbot Toyota Tech:", erro);
      const detalhe = erro instanceof Error ? erro.message : "Falha de comunicação.";
      adicionarMensagemBot(
        `Não consegui concluir essa consulta. ${detalhe} Se você está consultando o status, confira o chassi e tente novamente.`
      );
    } finally {
      setCarregando(false);
    }
  }

  // ==========================================================
  // OPÇÕES
  // ==========================================================
  function selecionarOpcao(opcao: string) {
    const opcaoNormalizada = normalizarTexto(opcao);

    // A revisão abre sua própria tela e não depende da IA.
    if (opcaoNormalizada.includes("revisao")) {
      router.push("/revisao");
      return;
    }

    if (opcaoNormalizada.includes("status") && opcaoNormalizada.includes("veiculo")) {
      setMostrarOpcoes(true);
      setAguardandoChassi(true);
      adicionarMensagemBot(
        "Claro! Para consultar o status atualizado do seu veículo, digite o número do chassi."
      );
      return;
    }

    enviarMensagem(opcao);
  }

  // ==========================================================
  // RENDER
  // ==========================================================
  return (
    <View
      style={[
        styles.container,
        altoContraste &&
          styles.containerContraste,
      ]}
    >
      {/* ================================================== */}
      {/* CABEÇALHO */}
      {/* ================================================== */}
      <View style={styles.header}>
        {/* VOLTAR */}
        <TouchableOpacity
          style={styles.pageBackButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#D71920"
          />
          <Text
            style={
              styles.pageBackText
            }
          >
            Voltar
          </Text>
        </TouchableOpacity>
        {/* TÍTULO */}
        <View style={styles.headerCenter}>
          <Text
            style={[
              styles.headerTitle,
              altoContraste &&
                styles.textoContraste,
            ]}
          >
            Toyota Tech
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              altoContraste &&
                styles.textoContrasteSecundario,
            ]}
          >
            Assistente virtual
          </Text>
        </View>
        {/* ONLINE */}
        <View style={styles.onlineBadge}>
          <View
            style={styles.onlineDot}
          />
          <Text
            style={styles.onlineText}
          >
            Online
          </Text>
        </View>
      </View>
      {/* ================================================== */}
      {/* CONTEÚDO */}
      {/* ================================================== */}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ================================================= */}
        {/* UMA ÚNICA ASSISTENTE */}
        {/* ================================================= */}
        <TouchableOpacity
          style={[
            styles.assistantCard,
            altoContraste &&
              styles.cardContraste,
          ]}
          onPress={abrirVLibras}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Acionar avatar do atendimento em Libras"
        >
          <View
            style={
              styles.attendantPhotoContainer
            }
          >
            <Image
              source={{
                uri: FOTO_ATENDENTE,
              }}
              style={styles.attendantPhoto}
              resizeMode="cover"
            />
          </View>
          <View
            style={styles.assistantInfo}
          >
            <Text
              style={[
                styles.assistantTitle,
                textoGrande &&
                  styles.textoGrandeTitulo,
                altoContraste &&
                  styles.textoContraste,
              ]}
            >
              Assistente Toyota
            </Text>
            <Text
              style={[
                styles.assistantDescription,
                textoGrande &&
                  styles.textoGrande,
                altoContraste &&
                  styles.textoContrasteSecundario,
              ]}
            >
              Estou aqui para ajudar
              com seu veículo, revisão,
              garantia e atendimento.
            </Text>
            <View
              style={
                styles.attendantStatus
              }
            >
              <View
                style={
                  styles.attendantStatusDot
                }
              />
              <Text
                style={
                  styles.attendantStatusText
                }
              >
                Atendimento disponível
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        {/* ================================================= */}
        {/* CHAT */}
        {/* ================================================= */}
        {mensagens.map((item) => (
          <View
            key={item.id}
            style={[
              styles.messageRow,
              item.remetente ===
              "usuario"
                ? styles.userRow
                : styles.botRow,
            ]}
          >
            {/*&#x20;
              Não existe outra foto aqui.
              A assistente aparece somente no card acima.
            */}
            <View
              style={[
                styles.messageBubble,
                item.remetente ===
                "usuario"
                  ? styles.userBubble
                  : styles.botBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  item.remetente ===
                  "usuario"
                    ? styles.userText
                    : styles.botText,
                  textoGrande &&
                    styles.textoGrande,
                  altoContraste &&
                    item.remetente ===
                      "bot" &&
                    styles.textoContraste,
                ]}
              >
                {item.texto}
              </Text>
            </View>
          </View>
        ))}
        {/* ================================================= */}
        {/* CARREGANDO */}
        {/* ================================================= */}
        {carregando && (
          <View
            style={
              styles.loadingRow
            }
          >
            <View
              style={
                styles.loadingBubble
              }
            >
              <ActivityIndicator
                size="small"
                color="#D71920"
              />
              <Text
                style={
                  styles.loadingText
                }
              >
                Toyota Tech está
                digitando...
              </Text>
            </View>
          </View>
        )}
        {/* ================================================= */}
        {/* OPÇÕES DE ATENDIMENTO */}
        {/* aparecem somente após mensagem */}
        {/* ================================================= */}
        {mostrarOpcoes && (
          <View
            style={
              styles.optionsSection
            }
          >
            <Text
              style={[
                styles.sectionTitle,
                textoGrande &&
                  styles.textoGrandeTitulo,
                altoContraste &&
                  styles.textoContraste,
              ]}
            >
              Como posso ajudar?
            </Text>
            <View
              style={styles.optionsGrid}
            >
              {/* REVISÃO */}
              <TouchableOpacity
                style={
                  styles.optionCard
                }
                onPress={() => router.push("/revisao")}
                activeOpacity={0.8}
              >
                <View
                  style={
                    styles.optionIcon
                  }
                >
                  <Ionicons
                    name="construct-outline"
                    size={23}
                    color="#D71920"
                  />
                </View>
                <Text
                  style={
                    styles.optionText
                  }
                >
                  Revisão
                </Text>
              </TouchableOpacity>
              {/* STATUS */}
              <TouchableOpacity
                style={
                  styles.optionCard
                }
                onPress={() =>
                  selecionarOpcao(
                    "Status do veículo"
                  )
                }
                activeOpacity={0.8}
              >
                <View
                  style={
                    styles.optionIcon
                  }
                >
                  <Ionicons
                    name="analytics-outline"
                    size={23}
                    color="#D71920"
                  />
                </View>
                <Text
                  style={
                    styles.optionText
                  }
                >
                  Status do veículo
                </Text>
              </TouchableOpacity>
              {/* CONCESSIONÁRIA */}
              <TouchableOpacity
                style={
                  styles.optionCard
                }
                onPress={() =>
                  selecionarOpcao(
                    "Quero informações sobre a concessionária"
                  )
                }
                activeOpacity={0.8}
              >
                <View
                  style={
                    styles.optionIcon
                  }
                >
                  <Ionicons
                    name="location-outline"
                    size={23}
                    color="#D71920"
                  />
                </View>
                <Text
                  style={
                    styles.optionText
                  }
                >
                  Concessionária
                </Text>
              </TouchableOpacity>
              {/* GARANTIA */}
              <TouchableOpacity
                style={
                  styles.optionCard
                }
                onPress={() =>
                  selecionarOpcao(
                    "Quero informações sobre a garantia"
                  )
                }
                activeOpacity={0.8}
              >
                <View
                  style={
                    styles.optionIcon
                  }
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={23}
                    color="#D71920"
                  />
                </View>
                <Text
                  style={
                    styles.optionText
                  }
                >
                  Garantia
                </Text>
              </TouchableOpacity>
              {/* ATENDIMENTO HUMANO */}
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  styles.humanOptionCard,
                ]}
                onPress={() =>
                  selecionarOpcao(
                    "Quero atendimento humano"
                  )
                }
                activeOpacity={0.8}
              >
                <View
                  style={
                    styles.optionIcon
                  }
                >
                  <Ionicons
                    name="person-outline"
                    size={23}
                    color="#D71920"
                  />
                </View>
                <Text
                  style={
                    styles.optionText
                  }
                >
                  Atendimento humano
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
      {/* ================================================== */}
      {/* ÁREA FIXA DE DIGITAÇÃO */}
      {/* O campo permanece sempre acessível. */}
      {/* ================================================== */}
      <View style={styles.composerArea}>
        <View style={styles.controlsRow}>
          {librasAberto && (
            <TouchableOpacity
              style={styles.librasControlButton}
              onPress={abrirVLibras}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Enviar atendimento para Libras"
            >
              <Ionicons
                name="hand-left"
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.librasControlText}>
                Libras
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.settingsControlButton}
            onPress={() =>
              setModalAcessibilidade(true)
            }
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Abrir configurações de acessibilidade"
          >
            <Ionicons
              name="accessibility-outline"
              size={23}
              color="#1565C0"
            />
            <Text style={styles.settingsControlText}>
              Acessibilidade
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            value={mensagem}
            onChangeText={setMensagem}
            placeholder={
              aguardandoChassi
                ? "Digite o chassi do veículo..."
                : "Digite sua mensagem..."
            }
            placeholderTextColor="#8994A2"
            multiline
            editable={!carregando}
            style={[
              styles.messageInput,
              textoGrande &&
                styles.inputTextoGrande,
            ]}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={() => enviarMensagem()}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              carregando &&
                styles.sendButtonDisabled,
            ]}
            onPress={() => enviarMensagem()}
            disabled={carregando}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Enviar mensagem"
          >
            {carregando ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color="#FFFFFF"
              />
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.footer}>
          Toyota Tech • Assistente Virtual
        </Text>
      </View>
      {/* CONTROLES DE ROLAGEM FIXOS NA LATERAL */}
      <View style={styles.scrollSideControls} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.scrollSideButton}
          onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Rolar conversa para cima"
        >
          <Ionicons name="chevron-up" size={25} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.scrollSideButton}
          onPress={() => scrollRef.current?.scrollToEnd({ animated: true })}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Rolar conversa para baixo, até as mensagens mais recentes"
        >
          <Ionicons name="chevron-down" size={25} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      {/* ================================================== */}
      {/* PAINEL DE ACESSIBILIDADE */}
      {/* ================================================== */}
      <Modal
        visible={
          modalAcessibilidade
        }
        animationType="slide"
        transparent
        onRequestClose={() =>
          setModalAcessibilidade(
            false
          )
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.accessibilityModal
            }
          >
            {/* CABEÇALHO */}
            <View
              style={
                styles.accessibilityModalHeader
              }
            >
              <View>
                <Text
                  style={[
                    styles.accessibilityModalTitle,
                    textoGrande &&
                      styles.textoGrandeTitulo,
                  ]}
                >
                  Acessibilidade
                </Text>
                <Text
                  style={[
                    styles.accessibilityModalSubtitle,
                    textoGrande &&
                      styles.textoGrande,
                  ]}
                >
                  Personalize sua experiência
                </Text>
              </View>
              <TouchableOpacity
                style={
                  styles.closeModalButton
                }
                onPress={() =>
                  setModalAcessibilidade(
                    false
                  )
                }
                activeOpacity={0.8}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color="#D71920"
                />
              </TouchableOpacity>
            </View>
            {/* ALTO CONTRASTE */}
            <TouchableOpacity
              style={
                styles.accessibilityRow
              }
              onPress={() =>
                setAltoContraste(
                  !altoContraste
                )
              }
              activeOpacity={0.8}
            >
              <View
                style={
                  styles.accessibilityRowIcon
                }
              >
                <Ionicons
                  name="contrast-outline"
                  size={25}
                  color="#D71920"
                />
              </View>
              <View
                style={
                  styles.accessibilityRowContent
                }
              >
                <Text
                  style={
                    styles.accessibilityRowTitle
                  }
                >
                  Alto contraste
                </Text>
                <Text
                  style={
                    styles.accessibilityRowDescription
                  }
                >
                  Aumenta o contraste dos
                  elementos da tela.
                </Text>
              </View>
              <View
                style={[
                  styles.switch,
                  altoContraste &&
                    styles.switchAtivo,
                ]}
              >
                <View
                  style={[
                    styles.switchThumb,
                    altoContraste &&
                      styles.switchThumbAtivo,
                  ]}
                />
              </View>
            </TouchableOpacity>
            {/* TEXTO GRANDE */}
            <TouchableOpacity
              style={
                styles.accessibilityRow
              }
              onPress={() =>
                setTextoGrande(
                  !textoGrande
                )
              }
              activeOpacity={0.8}
            >
              <View
                style={
                  styles.accessibilityRowIcon
                }
              >
                <Ionicons
                  name="text-outline"
                  size={25}
                  color="#D71920"
                />
              </View>
              <View
                style={
                  styles.accessibilityRowContent
                }
              >
                <Text
                  style={
                    styles.accessibilityRowTitle
                  }
                >
                  Texto grande
                </Text>
                <Text
                  style={
                    styles.accessibilityRowDescription
                  }
                >
                  Aumenta o tamanho dos
                  textos.
                </Text>
              </View>
              <View
                style={[
                  styles.switch,
                  textoGrande &&
                    styles.switchAtivo,
                ]}
              >
                <View
                  style={[
                    styles.switchThumb,
                    textoGrande &&
                      styles.switchThumbAtivo,
                  ]}
                />
              </View>
            </TouchableOpacity>
            {/* FECHAR */}
            <TouchableOpacity
              style={
                styles.closeAccessibilityButton
              }
              onPress={() =>
                setModalAcessibilidade(
                  false
                )
              }
              activeOpacity={0.8}
            >
              <Text
                style={
                  styles.closeAccessibilityText
                }
              >
                Fechar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
// ============================================================
// ESTILOS
// ============================================================
const styles = StyleSheet.create({
  // ==========================================================
  // CONTAINER
  // ==========================================================
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  containerContraste: {
    backgroundColor: "#111111",
  },
  // ==========================================================
  // HEADER
  // ==========================================================
  header: {
    minHeight: 78,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E3E8EE",
  },
  pageBackButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingRight: 10,
    minWidth: 80,
  },
  pageBackText: {
    color: "#D71920",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 5,
  },
  headerCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#17202A",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#7A8491",
    marginTop: 2,
  },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDF8F1",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#27A65A",
    marginRight: 6,
  },
  onlineText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#23834A",
  },
  // ==========================================================
  // SCROLL
  // ==========================================================
  scroll: {
    flex: 1,
  },
  // Grupo fixo de rolagem na lateral direita, acima do campo de mensagem.
  scrollSideControls: {
    position: "absolute",
    right: 12,
    bottom: 225,
    zIndex: 9999,
    elevation: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  scrollSideButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#D71920",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    elevation: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 5,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 22,
  },
  // ==========================================================
  // ASSISTENTE
  // ==========================================================
  assistantCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 15,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E1E6EC",
  },
  cardContraste: {
    backgroundColor: "#FFFFFF",
    borderColor: "#000000",
  },
  attendantPhotoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "#FDEBEC",
    borderWidth: 2,
    borderColor: "#D71920",
    marginRight: 13,
  },
  attendantPhoto: {
    width: "100%",
    height: "100%",
  },
  assistantInfo: {
    flex: 1,
  },
  assistantTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#17202A",
    marginBottom: 4,
  },
  assistantDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: "#66717F",
  },
  attendantStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },
  attendantStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#27A65A",
    marginRight: 6,
  },
  attendantStatusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#23834A",
  },
  // ==========================================================
  // MENSAGENS
  // ==========================================================
  messageRow: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 10,
  },
  userRow: {
    justifyContent: "flex-end",
  },
  botRow: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "82%",
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 17,
  },
  userBubble: {
    backgroundColor: "#D71920",
    borderBottomRightRadius: 5,
  },
  botBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: "#E1E6EC",
  },
  messageText: {
    fontSize: 14,
    lineHeight: 21,
  },
  userText: {
    color: "#FFFFFF",
  },
  botText: {
    color: "#303944",
  },
  // ==========================================================
  // CARREGANDO
  // ==========================================================
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  loadingBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E6EC",
    borderRadius: 17,
    paddingHorizontal: 15,
    paddingVertical: 11,
  },
  loadingText: {
    marginLeft: 9,
    color: "#687382",
    fontSize: 13,
  },
  // ==========================================================
  // OPÇÕES
  // ==========================================================
  optionsSection: {
    marginTop: 8,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#202832",
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  optionCard: {
    width: "48%",
    minHeight: 100,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E1E6EC",
    padding: 14,
    marginBottom: 10,
    justifyContent: "center",
  },
  humanOptionCard: {
    width: "100%",
  },
  optionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#FDEBEC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  optionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#27313D",
  },
  // ==========================================================
  // CAMPO DE MENSAGEM
  // ==========================================================
  composerArea: {
    backgroundColor: "#F5F7FA",
    borderTopWidth: 1,
    borderTopColor: "#DDE3E9",
    paddingTop: 4,
    paddingBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DFE5EB",
    borderRadius: 16,
    padding: 7,
    marginHorizontal: 14,
    marginTop: 2,
  },
  messageInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#202832",
    fontSize: 14,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#D71920",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.65,
  },
  footer: {
    textAlign: "center",
    color: "#9AA3AD",
    fontSize: 11,
    marginTop: 18,
  },
  // ==========================================================
  // CONTROLES DE ACESSIBILIDADE
  // ==========================================================
  controlsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  librasControlButton: {
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: "#1565C0",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  librasControlText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 7,
  },
  settingsControlButton: {
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#C9D8E8",
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  settingsControlText: {
    color: "#1565C0",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 7,
  },
  // ==========================================================
  // MODAL
  // ==========================================================
  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  accessibilityModal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 28,
  },
  accessibilityModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  accessibilityModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#202832",
  },
  accessibilityModalSubtitle: {
    fontSize: 12,
    color: "#7A8491",
    marginTop: 4,
  },
  closeModalButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FDEBEC",
    alignItems: "center",
    justifyContent: "center",
  },
  accessibilityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ECEFF2",
  },
  accessibilityRowIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FDEBEC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  accessibilityRowContent: {
    flex: 1,
    marginRight: 12,
  },
  accessibilityRowTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#202832",
  },
  accessibilityRowDescription: {
    fontSize: 11,
    lineHeight: 17,
    color: "#77828F",
    marginTop: 4,
  },
  switch: {
    width: 48,
    height: 28,
    borderRadius: 15,
    backgroundColor: "#D9DEE4",
    padding: 3,
    justifyContent: "center",
  },
  switchAtivo: {
    backgroundColor: "#D71920",
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
  },
  switchThumbAtivo: {
    alignSelf: "flex-end",
  },
  closeAccessibilityButton: {
    height: 50,
    borderRadius: 13,
    backgroundColor: "#D71920",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  closeAccessibilityText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  // ==========================================================
  // TEXTO GRANDE / CONTRASTE
  // ==========================================================
  textoGrande: {
    fontSize: 16,
    lineHeight: 24,
  },
  textoGrandeTitulo: {
    fontSize: 19,
  },
  inputTextoGrande: {
    fontSize: 16,
  },
  textoContraste: {
    color: "#000000",
  },
  textoContrasteSecundario: {
    color: "#252525",
  },
});