import { apiRequest } from "@/services/api";
import { TrackingInfo } from "@/types/tracking";

export async function fetchTrackingStatus(
  token: string
): Promise<TrackingInfo> {
  const data = await apiRequest<{ tracking: TrackingInfo }>("/garage/status", {
    method: "GET",
    token,
  });
  return data.tracking;
}
