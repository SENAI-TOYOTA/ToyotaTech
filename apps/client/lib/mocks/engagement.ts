export interface RewardTier {
  id: string;
  name: string;
  minPoints: number;
  color: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
}

export interface NewsVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  image: string;
  youtubeId?: string;
  searchQuery: string;
}

export const INITIAL_POINTS = 2350;

export const REWARD_TIERS: RewardTier[] = [
  { id: "bronze", name: "Bronze", minPoints: 0, color: "#A86B3C" },
  { id: "prata", name: "Prata", minPoints: 2000, color: "#8A919C" },
  { id: "ouro", name: "Ouro", minPoints: 5000, color: "#C99A1E" },
  { id: "platina", name: "Platina", minPoints: 10000, color: "#3B4652" },
];

export const EARN_RULES = [
  { id: "e1", title: "Revisão programada em dia", description: "Faça cada revisão em uma concessionária autorizada.", points: "+500" },
  { id: "e2", title: "Agende pelo portal", description: "Agende qualquer serviço pelo Toyota Tech.", points: "+100" },
  { id: "e3", title: "Compras na Loja Toyota", description: "Ganhe 1 ponto a cada R$ 1 gasto.", points: "1 pt / R$" },
  { id: "e4", title: "Indique um amigo", description: "Quando um amigo compra um Toyota com sua indicação.", points: "+1.000" },
  { id: "e5", title: "Avalie um serviço", description: "Conte como foi sua visita à concessionária.", points: "+50" },
  { id: "e6", title: "Perfil completo", description: "Preencha todos os seus dados pessoais.", points: "+200" },
];

export const BADGES = [
  { id: "b1", title: "Primeiro Toyota", description: "Comprou seu primeiro Toyota.", earned: true },
  { id: "b2", title: "Perfil completo", description: "Todos os dados pessoais preenchidos.", earned: true },
  { id: "b3", title: "Motorista híbrido", description: "Proprietário de um veículo híbrido.", earned: true },
  { id: "b4", title: "Revisão em dia", description: "Primeira revisão programada realizada.", earned: false },
  { id: "b5", title: "Embaixador", description: "Indicou um amigo que comprou um Toyota.", earned: false },
  { id: "b6", title: "Cliente fiel", description: "Cinco anos com a Toyota.", earned: false },
];

export const REWARDS: Reward[] = [
  { id: "r1", title: "Lavagem grátis", description: "Lavagem completa em uma concessionária participante.", cost: 800 },
  { id: "r2", title: "Alinhamento grátis", description: "Serviço de alinhamento e balanceamento.", cost: 1200 },
  { id: "r3", title: "10% de desconto na próxima revisão", description: "Válido para revisões programadas.", cost: 1500 },
  { id: "r4", title: "Carro reserva por 1 dia", description: "Use um carro reserva enquanto o seu está na revisão.", cost: 2500 },
  { id: "r5", title: "Kit de tapetes originais", description: "Tapetes originais Toyota para o seu modelo.", cost: 3000 },
];

export const PRODUCT_CATEGORIES = ["Todos", "Acessórios", "Cuidados", "Tecnologia", "Coleção"];

export const PRODUCTS: Product[] = [
  { id: "p1", name: "Tapetes originais", category: "Acessórios", price: 459.9, description: "Jogo de tapetes sob medida para o Corolla." },
  { id: "p2", name: "Barras de teto", category: "Acessórios", price: 1290, description: "Rack de alumínio com instalação na concessionária." },
  { id: "p3", name: "Organizador de porta-malas", category: "Acessórios", price: 189.9, description: "Divisórias removíveis e antiderrapantes." },
  { id: "p4", name: "Kit premium de cuidados", category: "Cuidados", price: 249.9, description: "Shampoo, cera e microfibras recomendados." },
  { id: "p5", name: "Película de proteção da pintura", category: "Cuidados", price: 890, description: "Proteção transparente para áreas expostas." },
  { id: "p6", name: "Carregador sem fio", category: "Tecnologia", price: 399.9, description: "Carregamento por indução para o console." },
  { id: "p7", name: "Câmera veicular", category: "Tecnologia", price: 699.9, description: "Gravação em Full HD com sensor de impacto." },
  { id: "p8", name: "Boné Toyota", category: "Coleção", price: 129.9, description: "Boné oficial em sarja com logo bordado." },
  { id: "p9", name: "Jaqueta Toyota Gazoo Racing", category: "Coleção", price: 549.9, description: "Jaqueta corta-vento da linha GR." },
];

export const NEWS_VIDEOS: NewsVideo[] = [
  { id: "v1", title: "Como um Toyota é fabricado", description: "Da estamparia à inspeção final na linha de produção.", duration: "8 min", category: "Produção", image: "/img/corollah.jpeg", searchQuery: "Toyota factory production line how a car is made" },
  { id: "v2", title: "Inspeção de qualidade", description: "Como cada veículo é verificado antes de sair da fábrica.", duration: "5 min", category: "Produção", image: "/img/MM.jpg", searchQuery: "Toyota quality inspection factory" },
  { id: "v3", title: "Da fábrica à concessionária", description: "A logística que leva seu carro até a concessionária.", duration: "6 min", category: "Entrega", image: "/img/hilux.jpeg", searchQuery: "Toyota vehicle logistics car carrier delivery" },
  { id: "v4", title: "O dia da sua entrega", description: "O que esperar ao retirar seu novo Toyota.", duration: "4 min", category: "Entrega", image: "/img/SUV.webp", searchQuery: "Toyota new car delivery experience" },
  { id: "v5", title: "Como funciona o sistema híbrido", description: "Motor elétrico, motor a combustão e bateria trabalhando juntos.", duration: "7 min", category: "Tecnologia", image: "/img/corolla.webp", searchQuery: "Toyota hybrid system how it works" },
  { id: "v6", title: "O que acontece em uma revisão", description: "O passo a passo da revisão na concessionária.", duration: "6 min", category: "Manutenção", image: "/img/GR.jpg", searchQuery: "Toyota scheduled maintenance service what happens" },
];

export function getTier(points: number) {
  return [...REWARD_TIERS].reverse().find((tier) => points >= tier.minPoints) ?? REWARD_TIERS[0];
}

export function getNextTier(points: number) {
  return REWARD_TIERS.find((tier) => tier.minPoints > points) ?? null;
}

export function getVideoUrl(video: NewsVideo) {
  return video.youtubeId
    ? `https://www.youtube.com/watch?v=${video.youtubeId}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(video.searchQuery)}`;
}
