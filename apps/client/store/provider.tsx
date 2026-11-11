"use client";

import { useEffect, type ReactNode } from "react";
import { Provider } from "react-redux";

import { hydrateAuth, store } from "@/store";

export interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  useEffect(() => {
    store.dispatch(hydrateAuth());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}

export default StoreProvider;

