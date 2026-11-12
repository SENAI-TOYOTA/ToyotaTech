"use client";

import { useEffect, type ReactNode } from "react";
import { Provider } from "react-redux";

import { ENGAGEMENT_STORAGE_KEY, hydrateAuth, hydrateEngagement, store } from "@/store";

function readEngagement() {
  try {
    const raw = window.localStorage.getItem(ENGAGEMENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  useEffect(() => {
    store.dispatch(hydrateAuth());
    store.dispatch(hydrateEngagement(readEngagement()));
    let previous = store.getState().engagement;
    return store.subscribe(() => {
      const current = store.getState().engagement;
      if (current === previous || !current.hydrated) return;
      previous = current;
      try {
        const { points, bookings, cart, vouchers, orders } = current;
        window.localStorage.setItem(
          ENGAGEMENT_STORAGE_KEY,
          JSON.stringify({ points, bookings, cart, vouchers, orders }),
        );
      } catch {}
    });
  }, []);

  return <Provider store={store}>{children}</Provider>;
}

export default StoreProvider;

