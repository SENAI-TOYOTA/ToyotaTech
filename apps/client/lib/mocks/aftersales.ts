export interface MaintenanceItem {
  id: string;
  title: string;
  mileage: number;
  months: number;
  price: number;
  items: string[];
}

export interface Dealership {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  hours: string;
  services: string[];
}

export interface WarrantyCoverage {
  id: string;
  title: string;
  description: string;
  years: number;
  mileage?: number;
}

export const CURRENT_MILEAGE = 8420;
export const WARRANTY_START_DATE = "26/05/2026";
export const ROADSIDE_PHONE = "0800 703 0206";
export const CUSTOMER_SERVICE_PHONE = "0800 703 0206";

export const MAINTENANCE_PLAN: MaintenanceItem[] = [
  {
    id: "m10",
    title: "Revisão de 10.000 km",
    mileage: 10000,
    months: 12,
    price: 690,
    items: ["Óleo e filtro do motor", "Inspeção dos freios", "Verificação do sistema híbrido"],
  },
  {
    id: "m20",
    title: "Revisão de 20.000 km",
    mileage: 20000,
    months: 24,
    price: 980,
    items: ["Óleo e filtro do motor", "Filtro de ar-condicionado", "Rodízio de pneus"],
  },
  {
    id: "m30",
    title: "Revisão de 30.000 km",
    mileage: 30000,
    months: 36,
    price: 1240,
    items: ["Óleo e filtro do motor", "Fluido de freio", "Filtro de ar", "Alinhamento"],
  },
  {
    id: "m40",
    title: "Revisão de 40.000 km",
    mileage: 40000,
    months: 48,
    price: 1050,
    items: ["Óleo e filtro do motor", "Velas de ignição", "Verificação do arrefecimento"],
  },
];

export const SERVICE_HISTORY = [
  {
    id: "h1",
    title: "Revisão de entrega",
    date: "26/05/2026",
    mileage: 12,
    dealership: "Toyota Sorocaba",
    total: "Incluso",
  },
];

export const DEALERSHIPS: Dealership[] = [
  {
    id: "d1",
    name: "Toyota Sorocaba",
    address: "Av. Dom Aguirre, 3000",
    city: "Sorocaba, SP",
    phone: "+55 15 3000-1000",
    hours: "Seg a sex 8h-18h, sáb 8h-12h",
    services: ["Vendas", "Oficina", "Peças originais", "Especialista em híbridos"],
  },
  {
    id: "d2",
    name: "Toyota Campinas",
    address: "Av. John Boyd Dunlop, 1500",
    city: "Campinas, SP",
    phone: "+55 19 3000-2000",
    hours: "Seg a sex 8h-18h, sáb 8h-13h",
    services: ["Vendas", "Oficina", "Funilaria"],
  },
  {
    id: "d3",
    name: "Toyota São Paulo Morumbi",
    address: "Av. Giovanni Gronchi, 4500",
    city: "São Paulo, SP",
    phone: "+55 11 3000-3000",
    hours: "Seg a sáb 8h-20h",
    services: ["Vendas", "Oficina", "Serviço expresso", "Especialista em híbridos"],
  },
];

export const WARRANTY_COVERAGES: WarrantyCoverage[] = [
  {
    id: "w1",
    title: "Garantia de fábrica",
    description: "Defeitos de fabricação em peças e mão de obra.",
    years: 5,
  },
  {
    id: "w2",
    title: "Bateria híbrida",
    description: "Bateria híbrida e componentes do sistema.",
    years: 8,
    mileage: 200000,
  },
  {
    id: "w3",
    title: "Pintura e corrosão",
    description: "Defeitos de pintura e corrosão perfurante.",
    years: 5,
  },
];

export const SERVICE_TYPES = [
  "Revisão programada",
  "Troca de óleo",
  "Freios",
  "Pneus e alinhamento",
  "Diagnóstico",
  "Reparo de recall",
];

export const SERVICE_TIMES = ["08:00", "09:30", "11:00", "13:30", "15:00", "16:30"];

export function getNextMaintenance() {
  return (
    MAINTENANCE_PLAN.find((item) => item.mileage > CURRENT_MILEAGE) ??
    MAINTENANCE_PLAN[MAINTENANCE_PLAN.length - 1]
  );
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export interface ServiceDate {
  iso: string;
  weekday: string;
  label: string;
  full: string;
}

export function getUpcomingServiceDates(count = 10): ServiceDate[] {
  const dates: ServiceDate[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (dates.length < count) {
    cursor.setDate(cursor.getDate() + 1);
    if (cursor.getDay() === 0) continue;
    const day = String(cursor.getDate()).padStart(2, "0");
    const month = String(cursor.getMonth() + 1).padStart(2, "0");
    dates.push({
      iso: cursor.toISOString(),
      weekday: WEEKDAYS[cursor.getDay()],
      label: `${day}/${month}`,
      full: `${day}/${month}/${cursor.getFullYear()}`,
    });
  }
  return dates;
}

export function addYears(date: string, years: number) {
  const [day, month, year] = date.split("/");
  return `${day}/${month}/${Number(year) + years}`;
}

export function mapQuery(dealership: Dealership) {
  return encodeURIComponent(`${dealership.name}, ${dealership.address}, ${dealership.city}`);
}

export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatNumber(value: number) {
  return value.toLocaleString("pt-BR");
}
