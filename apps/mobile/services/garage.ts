import { apiRequest } from "@/services/api";
import { GarageResponse } from "@/types/garage";

export async function fetchGarageCurrent(token: string) {
  return apiRequest<GarageResponse>("/garage/current", {
    method: "GET",
    token,
  });
}

export async function resolveGarage(token: string) {
  return apiRequest<GarageResponse>("/garage/resolve", {
    method: "POST",
    token,
  });
}

export async function linkGaragePurchase(
  token: string,
  payload: { purchaseId?: string; orderId?: string }
) {
  return apiRequest<GarageResponse>("/garage/link", {
    method: "POST",
    token,
    body: payload,
  });
}
