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
const VLIBRAS_SCRIPT = "/app/vlibras-plugin.js";
// ============================================================
// FOTO DA ASSISTENTE
// ============================================================
const FOTO_ATENDENTE =
  "https://telfo.ai/telfo-ai/frida.png";
// ============================================================
// TIPOS
// ============================================================
type DadosRastreamento = {
  chassi: string;
  modelo: string;
  status: string;
  etapa: string;
  previsao_entrega: string | null;
};

type Mensagem = {
  id: number;
  remetente: "usuario" | "bot";
  texto: string;
  rastreamento?: DadosRastreamento;
};

type EtapaRastreamento = {
  titulo: string;
  descricao: string;
};

const ETAPAS_RASTREAMENTO: EtapaRastreamento[] = [
  { titulo: "Produção", descricao: "Fabricação do veículo." },
  { titulo: "Montagem concluída", descricao: "Finalização da montagem." },
  { titulo: "Controle de qualidade", descricao: "Testes e inspeção do veículo." },
  { titulo: "Transporte", descricao: "Envio do veículo para a concessionária." },
  { titulo: "Na concessionária", descricao: "Recebimento do veículo." },
  { titulo: "Pronto para retirada", descricao: "Veículo disponível para o cliente." },
];



function normalizarEtapa(status: string, etapa: string): number {
  const statusNormalizado = normalizarTexto(status);
  const etapaNormalizada = normalizarTexto(etapa);

  // Prioriza o status recebido pela API e usa a etapa como alternativa.
  const texto = `${statusNormalizado} ${etapaNormalizada}`;

  if (
    texto.includes("pronto para retirada") ||
    texto.includes("aguardando retirada")
  ) {
    return 5;
  }

  if (
    texto.includes("na concessionaria") ||
    texto.includes("concessionaria")
  ) {
    return 4;
  }

  if (
    texto.includes("em transporte") ||
    texto.includes("transporte")
  ) {
    return 3;
  }

  if (
    texto.includes("teste de qualidade") ||
    texto.includes("controle de qualidade")
  ) {
    return 2;
  }

  if (
    texto.includes("montagem finalizada") ||
    texto.includes("montagem concluida")
  ) {
    return 1;
  }

  if (
    texto.includes("producao iniciada") ||
    etapaNormalizada === "producao" ||
    statusNormalizado === "producao"
  ) {
    return 0;
  }

  return -1;
}

function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// ============================================================
// CARREGAR VLibras OFICIAL
// ============================================================
// ============================================================
// CARREGAR VLibras OFICIAL
// ============================================================
function carregarVLibras() {
  if (Platform.OS !== "web") return;

  try {
    const globalWeb = globalThis as any;
    const documentWeb = globalWeb.document;

    if (!documentWeb) return;

    if (globalWeb.VLibrasWidget?.initBtn) return;

    if (documentWeb.getElementById("toyota-tech-vlibras")) return;

    const script = documentWeb.createElement("script");
    script.id = "toyota-tech-vlibras";
    script.src = VLIBRAS_SCRIPT;
    script.async = true;

    script.onload = () => {
      try {
        const VLibras = globalWeb.VLibras;

        if (VLibras?.Widget && !globalWeb.VLibrasWidget?.initBtn) {
          VLibras.Widget({
            rootPath: "/app",
            showButton: true,
          });
        }
      } catch (erro) {
        console.error("Erro ao inicializar VLibras:", erro);
      }
    };

    documentWeb.body.appendChild(script);
  } catch (erro) {
    console.error("Erro ao carregar VLibras:", erro);
  }
}

// ============================================================
// ABRIR WIDGET VLibras
// ============================================================
function iniciarWidgetVLibras() {
  if (Platform.OS !== "web") return false;

  const globalWeb = globalThis as any;

  if (typeof globalWeb.VLibrasWidget?.open === "function") {
    globalWeb.VLibrasWidget.open(true);
    return true;
  }

  return false;
}

// ============================================================
// TRADU��O AUTOM�TICA PELO AVATAR OFICIAL
// ============================================================
function traduzirAutomaticamenteVLibras(texto: string) {
  if (Platform.OS !== "web") return;

  const textoLimpo = texto.trim();
  if (!textoLimpo) return;

  let tentativas = 0;
  const maxTentativas = 40;

  const tentar = () => {
    tentativas++;

    try {
      const globalWeb = globalThis as any;

      iniciarWidgetVLibras();

      if (globalWeb.__TOYOTA_VLIBRAS_BRIDGE_READY) {
        globalWeb.dispatchEvent(
          new globalWeb.CustomEvent("toyota-tech:vlibras:translate", {
            detail: { text: textoLimpo },
          })
        );
        return;
      }
    } catch (erro) {
      console.warn("VLibras aguardando inicialização:", erro);
    }

    if (tentativas < maxTentativas) {
      setTimeout(tentar, 500);
    }
  };

  setTimeout(tentar, 300);
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
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  // Indica se a conversa está próxima do final para alternar a seta lateral.
  const [estaNoFimDaConversa, setEstaNoFimDaConversa] = useState(true);
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
    // Aguarda o widget oficial terminar de carregar.
    setTimeout(() => {
      const globalWeb = globalThis as any;
      const documentWeb = globalWeb.document;
      if (!documentWeb) {
        return;
      }
      const botao = documentWeb.querySelector(
        "[vw-access-button] .access-button"
      ) as HTMLElement | null;
      if (botao && !globalWeb.plugin) {
        botao.click();
      }
      // Faz o avatar sinalizar a saudação assim que o painel estiver aberto.
      traduzirAutomaticamenteVLibras(
        "Olá! Eu sou o assistente Toyota Tech. Como posso ajudar você hoje?"
      );
    }, 900);
  }
  // ==========================================================
  // CONSULTAR STATUS DO VEÍCULO
  // ==========================================================
  
async function consultarStatusPeloChassi(
  chassi: string
): Promise<{ texto: string; rastreamento?: DadosRastreamento }> {
  const chassiNormalizado = chassi.trim().toUpperCase();

  const resposta = await fetch(
    `${API_URL}/status/${encodeURIComponent(chassiNormalizado)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(
      dados?.detail ||
        `Erro HTTP ${resposta.status}`
    );
  }

  // A rota GET /status/{chassi} retorna diretamente os dados do veículo.
  if (!dados || !dados.chassi) {
    return {
      texto:
        "Não encontrei esse veículo no sistema. Verifique o número do chassi.",
    };
  }

  const rastreamento: DadosRastreamento = {
    chassi: String(dados.chassi || chassiNormalizado),
    modelo: String(dados.modelo || "Não informado"),
    status: String(dados.status || ""),
    etapa: String(dados.etapa || dados.status || ""),
    previsao_entrega:
      dados.previsao_entrega != null &&
      String(dados.previsao_entrega).trim() !== ""
        ? String(dados.previsao_entrega)
        : null,
  };

  const linhas = [
    `Consultei o veículo ${rastreamento.chassi}.`,
    `Cliente: ${dados.cliente || "Não informado"}.`,
    `Modelo: ${rastreamento.modelo}.`,
    `Ano: ${dados.ano || "Não informado"}.`,
    `Status: ${rastreamento.status || "Não informado"}.`,
    `Etapa: ${rastreamento.etapa || "Não informada"}.`,
  ];

  if (rastreamento.previsao_entrega) {
    linhas.push(
      `Previsão de entrega: ${rastreamento.previsao_entrega}.`
    );
  }

  return {
    texto: linhas.join("\n"),
    rastreamento,
  };
}

  // ==========================================================
  // ENVIAR MENSAGEM
  // ==========================================================
  async function enviarMensagem(
    textoInformado?: string
  ) {
    const texto = (
      textoInformado ?? mensagem
    ).trim();
    if (!texto) {
      return;
    }
    setMostrarOpcoes(true);
    const mensagemUsuario: Mensagem = {
      id: Date.now(),
      remetente: "usuario",
      texto,
    };
    setMensagens((anteriores) => [
      ...anteriores,
      mensagemUsuario,
    ]);
    setMensagem("");
    setCarregando(true);
    // Se o cliente acabou de selecionar Status do veículo,
    // a próxima mensagem é o chassi e vai diretamente para /status.
    const chassiInformado = texto
      .toUpperCase()
      .match(/CHASSI_[A-Z0-9_-]+/);
    try {
      if (aguardandoChassi || chassiInformado) {
        const chassi =
          chassiInformado?.[0] ||
          texto.toUpperCase();
        const respostaStatus = await consultarStatusPeloChassi(chassi);
        setAguardandoChassi(false);
        const mensagemBot: Mensagem = {
          id: Date.now() + 1,
          remetente: "bot",
          texto: respostaStatus.texto,
          ...(respostaStatus.rastreamento ? { rastreamento: respostaStatus.rastreamento } : {}),
        };
        setMensagens((anteriores) => [
          ...anteriores,
          mensagemBot,
        ]);
        // O mesmo texto do status vai para o avatar VLibras.
        traduzirAutomaticamenteVLibras(
          respostaStatus.texto
        );
        return;
      }
      const resposta = await fetch(
        `${API_URL}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            message: texto,
            mensagem: texto,
          }),
        }
      );
      if (!resposta.ok) {
        throw new Error(
          `Erro HTTP ${resposta.status}`
        );
      }
      const dados =
        await resposta.json();
      const respostaTexto =
        dados.resposta ||
        dados.reply ||
        dados.message ||
        dados.mensagem ||
        "Não consegui obter uma resposta no momento.";
      const mensagemBot: Mensagem = {
        id: Date.now() + 1,
        remetente: "bot",
        texto: respostaTexto,
      };
      setMensagens((anteriores) => [
        ...anteriores,
        mensagemBot,
      ]);
      // Qualquer resposta da assistente também é sinalizada.
      traduzirAutomaticamenteVLibras(
        respostaTexto
      );
    } catch (erro) {
      console.error(
        "Erro no chatbot:",
        erro
      );
      const mensagemErro =
        "Não foi possível consultar o veículo agora. Verifique se o backend está funcionando na porta 8000.";
      setMensagens((anteriores) => [
        ...anteriores,
        {
          id: Date.now() + 1,
          remetente: "bot",
          texto: mensagemErro,
        },
      ]);
      traduzirAutomaticamenteVLibras(
        mensagemErro
      );
    } finally {
      setCarregando(false);
    }
  }
  // ==========================================================
  // OPÇÕES
  // ==========================================================
  function selecionarOpcao(
    opcao: string
  ) {
    if (opcao === "Status do veículo") {
      setMostrarOpcoes(true);
      setAguardandoChassi(true);
      const texto =
        "Claro! Para consultar o status do seu veículo, digite o número do chassi.";
      setMensagens((anteriores) => [
        ...anteriores,
        {
          id: Date.now(),
          remetente: "bot",
          texto,
        },
      ]);
      // O pedido do chassi também é sinalizado pelo VLibras.
      traduzirAutomaticamenteVLibras(texto);
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
        onScroll={({ nativeEvent }) => {
          const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
          const distanciaDoFim =
            contentSize.height - (contentOffset.y + layoutMeasurement.height);
          setEstaNoFimDaConversa(distanciaDoFim <= 80);
        }}
        scrollEventThrottle={16}
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
                item.remetente === "usuario" ? styles.userBubble : styles.botBubble,
                item.rastreamento && styles.trackingBubble,
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
              {item.remetente === "bot" && item.rastreamento && (() => {
                const atual = normalizarEtapa(item.rastreamento.status, item.rastreamento.etapa);
                return (
                  <View style={styles.timelineCard}>
                    <Text style={styles.timelineTitle}>Acompanhe a entrega</Text>
                    <Text style={styles.timelineSubtitle}>Chassi: {item.rastreamento.chassi}</Text>
                    <Text style={styles.timelineSubtitle}>Modelo: {item.rastreamento.modelo}</Text>
                    <View style={styles.timelineList}>
                      {ETAPAS_RASTREAMENTO.map((etapa, indice) => {
                        const concluida = atual >= 0 && indice < atual;
                        const selecionada = atual === indice;
                        const cor = concluida ? "#23834A" : selecionada ? "#D71920" : "#AAB2BD";
                        return (
                          <View key={etapa.titulo} style={styles.timelineItem}>
                            <View style={styles.timelineRail}>
                              <View style={[styles.timelineDot, { borderColor: cor, backgroundColor: concluida ? cor : "#FFFFFF" }]}>
                                {concluida ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : selecionada ? <View style={styles.timelineCurrentDot} /> : null}
                              </View>
                              {indice < ETAPAS_RASTREAMENTO.length - 1 && <View style={[styles.timelineLine, { backgroundColor: atual >= 0 && indice < atual ? "#23834A" : "#D7DDE4" }]} />}
                            </View>
                            <View style={styles.timelineContent}>
                              <Text style={[styles.timelineStageTitle, { color: cor }]}>{etapa.titulo}</Text>
                              <Text style={styles.timelineDescription}>{etapa.descricao}</Text>
                              {selecionada && <Text style={styles.timelineCurrentLabel}>ETAPA ATUAL</Text>}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                    {atual < 0 && <Text style={styles.timelineWarning}>Não foi possível identificar a etapa atual com o status recebido. Confira o status retornado pela API.</Text>}
                    {!!item.rastreamento.previsao_entrega && (
                      <View style={styles.timelineForecast}>
                        <Ionicons name="calendar-outline" size={22} color="#D71920" />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.timelineForecastLabel}>Previsão de entrega informada pelo sistema</Text>
                          <Text style={styles.timelineForecastDate}>{item.rastreamento.previsao_entrega}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })()}
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
                onPress={() =>
                  selecionarOpcao(
                    "Quero fazer uma revisão"
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
      {/* Botão lateral para alternar entre o início e as mensagens recentes. */}
      <TouchableOpacity
        style={styles.scrollSideButton}
        onPress={() => {
          if (estaNoFimDaConversa) {
            scrollRef.current?.scrollTo({ y: 0, animated: true });
          } else {
            scrollRef.current?.scrollToEnd({ animated: true });
          }
        }}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={
          estaNoFimDaConversa
            ? "Rolar para o início da conversa"
            : "Rolar para as mensagens mais recentes"
        }
      >
        <Ionicons
          name={estaNoFimDaConversa ? "chevron-up" : "chevron-down"}
          size={25}
          color="#FFFFFF"
        />
      </TouchableOpacity>
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
  // Botão flutuante lateral; fica acima do conteúdo sem deslocar o layout.
  scrollSideButton: {
    position: "absolute",
    right: 14,
    top: "36%",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#D71920",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
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
  trackingBubble: {
    width: "100%",
    maxWidth: "100%",
  },
  timelineCard: {
    width: "100%",
    maxWidth: 380,
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E6EC",
  },
  timelineTitle: { fontSize: 16, fontWeight: "800", color: "#202832", marginBottom: 5 },
  timelineSubtitle: { fontSize: 12, color: "#66717F", marginTop: 3 },
  timelineList: { marginTop: 18 },
  timelineItem: { flexDirection: "row", minHeight: 58 },
  timelineRail: { width: 28, alignItems: "center" },
  timelineDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center", zIndex: 1 },
  timelineCurrentDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FFFFFF" },
  timelineLine: { position: "absolute", top: 21, width: 3, height: 42, borderRadius: 2 },
  timelineContent: { flex: 1, paddingLeft: 8, paddingBottom: 12 },
  timelineStageTitle: { fontSize: 12, fontWeight: "800", lineHeight: 17 },
  timelineDescription: { fontSize: 11, color: "#66717F", lineHeight: 16, marginTop: 2 },
  timelineCurrentLabel: { fontSize: 10, fontWeight: "800", color: "#D71920", marginTop: 4 },
  timelineForecast: { flexDirection: "row", alignItems: "center", marginTop: 8, padding: 11, borderRadius: 10, backgroundColor: "#FDEBEC" },
  timelineForecastLabel: { fontSize: 11, color: "#6B3033" },
  timelineForecastDate: { fontSize: 13, fontWeight: "800", color: "#D71920", marginTop: 3 },
  timelineWarning: { fontSize: 11, lineHeight: 16, color: "#7A5A00", marginTop: 10 },
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

