import { useSyncExternalStore } from "react";

import { initialPoints, Product, Reward } from "@/constants/engagement";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Redemption {
  id: string;
  reward: Reward;
  code: string;
}

interface EngagementState {
  points: number;
  cart: CartItem[];
  redemptions: Redemption[];
  orders: number;
}

let state: EngagementState = {
  points: initialPoints,
  cart: [],
  redemptions: [],
  orders: 0,
};
const listeners = new Set<() => void>();

function setState(next: EngagementState) {
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return state;
}

export function useEngagement() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function redeemReward(reward: Reward) {
  if (state.points < reward.cost) {
    return null;
  }
  const redemption: Redemption = {
    id: `rd-${Date.now()}`,
    reward,
    code: `TT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
  };
  setState({
    ...state,
    points: state.points - reward.cost,
    redemptions: [redemption, ...state.redemptions],
  });
  return redemption;
}

export function addToCart(product: Product) {
  const existing = state.cart.find((item) => item.product.id === product.id);
  const cart = existing
    ? state.cart.map((item) =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    : [...state.cart, { product, quantity: 1 }];
  setState({ ...state, cart });
}

export function changeQuantity(productId: string, delta: number) {
  const cart = state.cart
    .map((item) =>
      item.product.id === productId
        ? { ...item, quantity: item.quantity + delta }
        : item
    )
    .filter((item) => item.quantity > 0);
  setState({ ...state, cart });
}

export function getCartTotal(cart: CartItem[]) {
  return cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
}

export function checkout() {
  const total = getCartTotal(state.cart);
  const earned = Math.floor(total);
  setState({
    ...state,
    cart: [],
    points: state.points + earned,
    orders: state.orders + 1,
  });
  return earned;
}
