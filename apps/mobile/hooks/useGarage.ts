import { useAuth } from "@/contexts/AuthContext";
import { hasCompleteProfile } from "@/profileValidation";
import { fetchGarageCurrent } from "@/services/garage";
import { GarageData } from "@/types/garage";
import { useCallback, useEffect, useState } from "react";

export function useGarage() {
  const { token, user } = useAuth();
  const profileReady = hasCompleteProfile(user);
  const [garage, setGarage] = useState<GarageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  useEffect(() => {
    let active = true;

    const loadGarage = async () => {
      if (!token || !profileReady) {
        if (active) setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const result = await fetchGarageCurrent(token);
        if (active) {
          setGarage(result.garage);
          setError(null);
        }
      } catch (err) {
        if (__DEV__) {
          console.warn("Failed to fetch garage", err);
        }
        if (active) {
          setError("Não foi possível carregar os dados do veículo.");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadGarage();
    return () => {
      active = false;
    };
  }, [token, profileReady, reloadKey]);

  return { garage, isLoading, error, reload };
}
