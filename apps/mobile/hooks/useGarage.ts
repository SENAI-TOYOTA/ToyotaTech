import { useAuth } from "@/contexts/AuthContext";
import { fetchGarageCurrent } from "@/services/garage";
import { GarageData } from "@/types/garage";
import { useEffect, useState } from "react";

export function useGarage() {
  const { token } = useAuth();
  const [garage, setGarage] = useState<GarageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadGarage = async () => {
      if (!token) {
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
        if (active) setError("Falha ao carregar garagem");
        console.error("Failed to fetch garage", err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadGarage();
    return () => {
      active = false;
    };
  }, [token]);

  return { garage, isLoading, error };
}
