import { apiRequest } from "@/services/api";
import { GarageResponse } from "@/types/garage";
import { TrackingInfo } from "@/types/tracking";

export async function fetchGarageCurrent(token: string) {
  return apiRequest<GarageResponse>("/garage/current", {
    method: "GET",
    token,
  });
}

export async function fetchGarageStatus(token: string) {
  return apiRequest<{ tracking: TrackingInfo }>("/garage/status", {
    method: "GET",
    token,
  });
}

export async function linkGaragePurchase(
  token: string,
  payload: { purchaseId?: string; orderId?: string; email?: string }
) {
  return apiRequest<GarageResponse>("/garage/link", {
    method: "POST",
    token,
    body: payload,
  });
}
