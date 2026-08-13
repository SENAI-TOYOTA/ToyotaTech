import { apiRequest } from "@/services/api";
import { ProfileResponse, UpdateProfilePayload } from "@/types/profile";

export async function fetchProfile(token: string) {
  return apiRequest<ProfileResponse>("/profile", {
    method: "GET",
    token,
  });
}

export async function updateProfile(token: string, payload: UpdateProfilePayload) {
  return apiRequest<ProfileResponse>("/profile", {
    method: "PUT",
    body: payload,
    token,
  });
}
