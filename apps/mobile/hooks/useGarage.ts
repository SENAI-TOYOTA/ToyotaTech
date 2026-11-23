import { useAuth } from "@/contexts/AuthContext";
import { hasCompleteProfile } from "@/profileValidation";
import { fetchGarageCurrent } from "@/services/garage";
import { GarageData } from "@/types/garage";
import { useCallback, useEffect, useSyncExternalStore } from "react";

interface GarageSnapshot {
  garage: GarageData | null;
  isLoading: boolean;
  error: string | null;
}

const initialSnapshot: GarageSnapshot = {
  garage: null,
  isLoading: false,
  error: null,
};

let snapshot: GarageSnapshot = initialSnapshot;
let loadedSession: string | null = null;
let inflightSession: string | null = null;
let inflightRequest: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  snapshot = { ...snapshot };
  listeners.forEach((listener) => listener());
}

function resetGarageCache() {
  loadedSession = null;
  inflightSession = null;
  inflightRequest = null;
  snapshot = initialSnapshot;
  notifyListeners();
}

async function loadGarage(session: string, token: string, force: boolean) {
  if (!force && loadedSession === session) {
    return;
  }
  if (inflightSession === session && inflightRequest) {
    return inflightRequest;
  }

  snapshot = { ...snapshot, isLoading: true, error: null };
  notifyListeners();

  const request = fetchGarageCurrent(token)
    .then((result) => {
      loadedSession = session;
      snapshot = { garage: result.garage, isLoading: false, error: null };
    })
    .catch(() => {
      loadedSession = null;
      snapshot = {
        ...snapshot,
        isLoading: false,
        error: "Não foi possível carregar os dados do veículo.",
      };
    })
    .finally(() => {
      if (inflightRequest === request) {
        inflightSession = null;
        inflightRequest = null;
      }
      notifyListeners();
    });

  inflightSession = session;
  inflightRequest = request;

  return request;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return snapshot;
}

export function useGarage() {
  const { token, user } = useAuth();
  const session = user?.sub ?? user?.email ?? null;
  const profileReady = hasCompleteProfile(user);
  const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (!token || !profileReady || !session) {
      resetGarageCache();
      return;
    }

    void loadGarage(session, token, false);
  }, [token, profileReady, session]);

  const reload = useCallback(() => {
    if (!token || !profileReady || !session) {
      return;
    }

    void loadGarage(session, token, true);
  }, [token, profileReady, session]);

  return { ...current, reload };
}

export { resetGarageCache };
