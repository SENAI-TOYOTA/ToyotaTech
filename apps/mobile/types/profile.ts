export interface UserProfile {
  fullName: string;
  birthDate: string;
}

export interface ProfileResponse {
  profile: UserProfile;
}

export interface UpdateProfilePayload {
  fullName?: string;
  birthDate?: string;
}
