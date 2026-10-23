export interface Tier {
  id: string;
  name: string;
  minPoints: number;
  color: string;
}

export interface EarnRule {
  id: string;
  title: string;
  description: string;
  points: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  earned: boolean;
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
  points: number;
}

export interface NewsVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  youtubeId?: string;
  searchQuery: string;
}

export const initialPoints = 2350;

export const tiers: Tier[] = [
  { id: "bronze", name: "Bronze", minPoints: 0, color: "#A86B3C" },
  { id: "silver", name: "Silver", minPoints: 2000, color: "#8A919C" },
  { id: "gold", name: "Gold", minPoints: 5000, color: "#C99A1E" },
  { id: "platinum", name: "Platinum", minPoints: 10000, color: "#3B4652" },
];

export const earnRules: EarnRule[] = [
  {
    id: "e1",
    title: "Scheduled maintenance on time",
    description: "Do each scheduled service at an authorized dealership.",
    points: "+500",
  },
  {
    id: "e2",
    title: "Book through the app",
    description: "Schedule any service using ToyotaTech.",
    points: "+100",
  },
  {
    id: "e3",
    title: "Toyota Store purchases",
    description: "Earn 1 point for every R$ 1 spent.",
    points: "1 pt / R$",
  },
  {
    id: "e4",
    title: "Refer a friend",
    description: "When a friend buys a Toyota with your referral.",
    points: "+1,000",
  },
  {
    id: "e5",
    title: "Rate a service",
    description: "Tell us how your dealership visit went.",
    points: "+50",
  },
  {
    id: "e6",
    title: "Complete profile",
    description: "Fill in all your personal information.",
    points: "+200",
  },
];

export const badges: Badge[] = [
  {
    id: "b1",
    title: "First Toyota",
    description: "Bought your first Toyota.",
    earned: true,
  },
  {
    id: "b2",
    title: "Complete profile",
    description: "All personal data filled in.",
    earned: true,
  },
  {
    id: "b3",
    title: "Hybrid driver",
    description: "Owner of a hybrid vehicle.",
    earned: true,
  },
  {
    id: "b4",
    title: "Maintenance on time",
    description: "First scheduled service done.",
    earned: false,
  },
  {
    id: "b5",
    title: "Ambassador",
    description: "Referred a friend who bought a Toyota.",
    earned: false,
  },
  {
    id: "b6",
    title: "Loyal customer",
    description: "Five years with Toyota.",
    earned: false,
  },
];

export const rewards: Reward[] = [
  {
    id: "r1",
    title: "Free car wash",
    description: "Complete wash at a participating dealership.",
    cost: 800,
  },
  {
    id: "r2",
    title: "Free alignment",
    description: "Alignment and balancing service.",
    cost: 1200,
  },
  {
    id: "r3",
    title: "10% off your next service",
    description: "Valid for scheduled maintenance.",
    cost: 1500,
  },
  {
    id: "r4",
    title: "Courtesy car for 1 day",
    description: "Use a courtesy car while yours is serviced.",
    cost: 2500,
  },
  {
    id: "r5",
    title: "Genuine floor mats kit",
    description: "Original Toyota floor mats for your model.",
    cost: 3000,
  },
];

export const productCategories = [
  "All",
  "Accessories",
  "Care",
  "Technology",
  "Collection",
];

export const products: Product[] = [
  {
    id: "p1",
    name: "Genuine floor mats",
    category: "Accessories",
    price: 459.9,
    points: 459,
  },
  {
    id: "p2",
    name: "Roof rack bars",
    category: "Accessories",
    price: 1290,
    points: 1290,
  },
  {
    id: "p3",
    name: "Trunk organizer",
    category: "Accessories",
    price: 189.9,
    points: 189,
  },
  {
    id: "p4",
    name: "Premium car care kit",
    category: "Care",
    price: 249.9,
    points: 249,
  },
  {
    id: "p5",
    name: "Paint protection film",
    category: "Care",
    price: 890,
    points: 890,
  },
  {
    id: "p6",
    name: "Wireless phone charger",
    category: "Technology",
    price: 399.9,
    points: 399,
  },
  {
    id: "p7",
    name: "Dash camera",
    category: "Technology",
    price: 699.9,
    points: 699,
  },
  {
    id: "p8",
    name: "Toyota cap",
    category: "Collection",
    price: 129.9,
    points: 129,
  },
  {
    id: "p9",
    name: "Toyota Gazoo Racing jacket",
    category: "Collection",
    price: 549.9,
    points: 549,
  },
];

export const newsVideos: NewsVideo[] = [
  {
    id: "v1",
    title: "How a Toyota is built",
    description: "From stamping to final inspection on the production line.",
    duration: "8 min",
    category: "Production",
    searchQuery: "Toyota factory production line how a car is made",
  },
  {
    id: "v2",
    title: "Quality inspection",
    description: "How every vehicle is checked before leaving the factory.",
    duration: "5 min",
    category: "Production",
    searchQuery: "Toyota quality inspection factory",
  },
  {
    id: "v3",
    title: "From factory to dealership",
    description: "The logistics that bring your car to the dealership.",
    duration: "6 min",
    category: "Delivery",
    searchQuery: "Toyota vehicle logistics car carrier delivery",
  },
  {
    id: "v4",
    title: "Your delivery day",
    description: "What to expect when you pick up your new Toyota.",
    duration: "4 min",
    category: "Delivery",
    searchQuery: "Toyota new car delivery experience",
  },
  {
    id: "v5",
    title: "How the hybrid system works",
    description: "Electric motor, engine and battery working together.",
    duration: "7 min",
    category: "Technology",
    searchQuery: "Toyota hybrid system how it works",
  },
  {
    id: "v6",
    title: "What happens in a scheduled service",
    description: "Step by step of the maintenance at the dealership.",
    duration: "6 min",
    category: "Maintenance",
    searchQuery: "Toyota scheduled maintenance service what happens",
  },
];

export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function getTier(points: number) {
  return [...tiers].reverse().find((tier) => points >= tier.minPoints)!;
}

export function getNextTier(points: number) {
  return tiers.find((tier) => tier.minPoints > points) ?? null;
}
