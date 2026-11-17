import { apiRequest } from "@/services/api";
import { MOCK_GARAGE_DATA } from "@/services/garage";
import { TrackingInfo } from "@/types/tracking";

export async function fetchTrackingStatus(
  token: string
): Promise<TrackingInfo> {
  if (token === "dev-mock-access-token") {
    return MOCK_GARAGE_DATA.tracking;
  }
  try {
    const data = await apiRequest<{ tracking: TrackingInfo }>(
      "/garage/status",
      {
        method: "GET",
        token,
      }
    );
    return data.tracking;
  } catch {
    return MOCK_GARAGE_DATA.tracking;
  }
}
