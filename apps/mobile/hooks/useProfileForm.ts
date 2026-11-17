import { useAuth } from "@/contexts/AuthContext";
import { validateBirthDate } from "@/profileValidation";
import { ApiError } from "@/services/api";
import { resolveGarage } from "@/services/garage";
import { fetchProfile, updateProfile } from "@/services/profile";
import { formatBirthDate, formatCpf, normalizeCpf } from "@/utils/format";
import { useEffect, useState } from "react";

export function useProfileForm() {
  const { token, user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [cpf, setCpf] = useState("");
  const [isCpfLocked, setIsCpfLocked] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const loadedCpf = user?.profile?.cpf ?? "";
    if (normalizeCpf(loadedCpf).length === 11) {
      setCpf(formatCpf(loadedCpf));
      setIsCpfLocked(true);
    }
  }, [user?.profile]);

  useEffect(() => {
    if (user?.profile) {
      setFullName(user.profile.fullName ?? "");
      setBirthDate(formatBirthDate(user.profile.birthDate ?? ""));
    }
  }, [user?.profile]);

  useEffect(() => {
    let isActive = true;
    const loadProfile = async () => {
      if (!token) {
        setIsLoadingProfile(false);
        return;
      }
      setIsLoadingProfile(true);
      try {
        const profileResult = await fetchProfile(token);
        if (!isActive) return;
        const loadedCpf = profileResult.profile.cpf ?? "";
        setFullName(profileResult.profile.fullName ?? "");
        setBirthDate(formatBirthDate(profileResult.profile.birthDate ?? ""));
        setCpf(formatCpf(loadedCpf));
        setIsCpfLocked(normalizeCpf(loadedCpf).length === 11);
        setFormError(null);
      } catch (error) {
        if (!isActive) return;
        if (error instanceof ApiError && error.status === 404) {
          setFormError(null);
        } else if (error instanceof ApiError) {
          setFormError(error.message);
        } else {
          setFormError("Unable to load profile.");
        }
      } finally {
        if (isActive) setIsLoadingProfile(false);
      }
    };
    void loadProfile();
    return () => {
      isActive = false;
    };
  }, [token]);

  const saveProfile = async () => {
    if (!token) {
      setFormError("Invalid session. Sign in again.");
      return false;
    }
    const normalizedCpf = normalizeCpf(cpf);
    if (!fullName.trim()) {
      setFormError("Enter your full name.");
      return false;
    }
    const birthDateError = validateBirthDate(birthDate.trim());
    if (birthDateError) {
      setFormError(birthDateError);
      return false;
    }
    if (!isCpfLocked && normalizedCpf.length !== 11) {
      setFormError("Enter a valid CPF.");
      return false;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      await updateProfile(token, {
        fullName: fullName.trim(),
        birthDate: birthDate.trim(),
        ...(isCpfLocked ? {} : { cpf: normalizedCpf }),
      });
      await resolveGarage(token);
      await refreshUser();
      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError("Unable to save profile.");
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    fullName,
    setFullName,
    birthDate,
    setBirthDate,
    cpf,
    setCpf,
    isCpfLocked,
    isLoadingProfile,
    isSaving,
    formError,
    setFormError,
    saveProfile,
    formatBirthDate,
    formatCpf,
  };
}
