export interface MaintenanceItem {
  id: string;
  title: string;
  mileage: number;
  months: number;
  estimatedPrice: string;
  items: string[];
}

export interface ServiceRecord {
  id: string;
  title: string;
  date: string;
  mileage: number;
  dealership: string;
  total: string;
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

export const currentMileage = 8420;

export const maintenancePlan: MaintenanceItem[] = [
  {
    id: "m10",
    title: "10,000 km service",
    mileage: 10000,
    months: 12,
    estimatedPrice: "R$ 690,00",
    items: ["Engine oil and filter", "Brake inspection", "Hybrid system check"],
  },
  {
    id: "m20",
    title: "20,000 km service",
    mileage: 20000,
    months: 24,
    estimatedPrice: "R$ 980,00",
    items: ["Engine oil and filter", "Cabin air filter", "Tire rotation"],
  },
  {
    id: "m30",
    title: "30,000 km service",
    mileage: 30000,
    months: 36,
    estimatedPrice: "R$ 1.240,00",
    items: ["Engine oil and filter", "Brake fluid", "Air filter", "Alignment"],
  },
  {
    id: "m40",
    title: "40,000 km service",
    mileage: 40000,
    months: 48,
    estimatedPrice: "R$ 1.050,00",
    items: ["Engine oil and filter", "Spark plugs", "Coolant check"],
  },
];

export const serviceHistory: ServiceRecord[] = [
  {
    id: "h1",
    title: "Delivery inspection",
    date: "30/09/2026",
    mileage: 12,
    dealership: "Toyota Sorocaba",
    total: "Included",
  },
];

export const dealerships: Dealership[] = [
  {
    id: "d1",
    name: "Toyota Sorocaba",
    address: "Av. Dom Aguirre, 3000",
    city: "Sorocaba, SP",
    phone: "+55 15 3000-1000",
    hours: "Mon to Fri 8am-6pm, Sat 8am-12pm",
    services: ["Sales", "Service", "Genuine parts", "Hybrid specialist"],
  },
  {
    id: "d2",
    name: "Toyota Campinas",
    address: "Av. John Boyd Dunlop, 1500",
    city: "Campinas, SP",
    phone: "+55 19 3000-2000",
    hours: "Mon to Fri 8am-6pm, Sat 8am-1pm",
    services: ["Sales", "Service", "Body shop"],
  },
  {
    id: "d3",
    name: "Toyota Sao Paulo Morumbi",
    address: "Av. Giovanni Gronchi, 4500",
    city: "Sao Paulo, SP",
    phone: "+55 11 3000-3000",
    hours: "Mon to Sat 8am-8pm",
    services: ["Sales", "Service", "Express service", "Hybrid specialist"],
  },
];

export const warrantyCoverages: WarrantyCoverage[] = [
  {
    id: "w1",
    title: "Factory warranty",
    description: "Manufacturing defects on parts and labor.",
    years: 5,
  },
  {
    id: "w2",
    title: "Hybrid battery",
    description: "Hybrid battery and system components.",
    years: 8,
    mileage: 200000,
  },
  {
    id: "w3",
    title: "Paint and corrosion",
    description: "Paint defects and perforating corrosion.",
    years: 5,
  },
];

export const warrantyStartDate = "30/09/2026";

export const roadsidePhone = "0800 703 0206";
export const customerServicePhone = "0800 703 0206";

export const serviceTypes = [
  "Scheduled maintenance",
  "Oil change",
  "Brakes",
  "Tires and alignment",
  "Diagnostics",
  "Recall repair",
];

export const serviceTimes = [
  "08:00",
  "09:30",
  "11:00",
  "13:30",
  "15:00",
  "16:30",
];

export function getNextMaintenance() {
  return (
    maintenancePlan.find((item) => item.mileage > currentMileage) ??
    maintenancePlan[maintenancePlan.length - 1]
  );
}

export function getUpcomingServiceDates(count = 10) {
  const dates: Date[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (dates.length < count) {
    cursor.setDate(cursor.getDate() + 1);
    if (cursor.getDay() !== 0) {
      dates.push(new Date(cursor));
    }
  }
  return dates;
}

const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

export function formatShortDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return { weekday: weekdays[date.getDay()], label: `${day}/${month}` };
}
