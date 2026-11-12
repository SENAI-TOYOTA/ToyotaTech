import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";

import { INITIAL_POINTS, type Product, type Reward } from "@/lib/mocks/engagement";

export const ENGAGEMENT_STORAGE_KEY = "toyotatech.web.engagement";
export const BOOKING_REWARD_POINTS = 100;

export interface ServiceBooking {
  id: string;
  dealership: string;
  service: string;
  date: string;
  time: string;
  notes?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Voucher {
  id: string;
  reward: Reward;
  code: string;
}

export interface EngagementState {
  points: number;
  bookings: ServiceBooking[];
  cart: CartItem[];
  vouchers: Voucher[];
  orders: number;
  hydrated: boolean;
}

const initialState: EngagementState = {
  points: INITIAL_POINTS,
  bookings: [],
  cart: [],
  vouchers: [],
  orders: 0,
  hydrated: false,
};

function voucherCode() {
  return `TT-${nanoid(6).toUpperCase().replace(/[^A-Z0-9]/g, "X")}`;
}

export function cartTotal(cart: CartItem[]) {
  return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

const engagementSlice = createSlice({
  name: "engagement",
  initialState,
  reducers: {
    hydrateEngagement(state, action: PayloadAction<Partial<EngagementState> | null>) {
      if (action.payload) {
        Object.assign(state, action.payload);
      }
      state.hydrated = true;
    },
    addBooking: {
      reducer(state, action: PayloadAction<ServiceBooking>) {
        state.bookings.unshift(action.payload);
        state.points += BOOKING_REWARD_POINTS;
      },
      prepare(booking: Omit<ServiceBooking, "id">) {
        return { payload: { ...booking, id: nanoid() } };
      },
    },
    cancelBooking(state, action: PayloadAction<string>) {
      state.bookings = state.bookings.filter((booking) => booking.id !== action.payload);
    },
    redeemReward: {
      reducer(state, action: PayloadAction<Voucher>) {
        if (state.points < action.payload.reward.cost) return;
        state.points -= action.payload.reward.cost;
        state.vouchers.unshift(action.payload);
      },
      prepare(reward: Reward) {
        return { payload: { id: nanoid(), reward, code: voucherCode() } };
      },
    },
    addToCart(state, action: PayloadAction<Product>) {
      const existing = state.cart.find((item) => item.product.id === action.payload.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.cart.push({ product: action.payload, quantity: 1 });
      }
    },
    changeQuantity(state, action: PayloadAction<{ productId: string; delta: number }>) {
      state.cart = state.cart
        .map((item) =>
          item.product.id === action.payload.productId
            ? { ...item, quantity: item.quantity + action.payload.delta }
            : item,
        )
        .filter((item) => item.quantity > 0);
    },
    checkout(state) {
      state.points += Math.floor(cartTotal(state.cart));
      state.cart = [];
      state.orders += 1;
    },
  },
});

export const {
  hydrateEngagement,
  addBooking,
  cancelBooking,
  redeemReward,
  addToCart,
  changeQuantity,
  checkout,
} = engagementSlice.actions;

export default engagementSlice.reducer;
