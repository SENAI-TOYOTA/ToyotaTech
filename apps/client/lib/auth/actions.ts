"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  encodeSession,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  type SessionUser,
} from "./session";

export interface AuthFormState {
  error: string | null;
  email: string;
  name?: string;
}

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function readField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

async function persistSession(user: SessionUser) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, encodeSession(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/** Login simulado — mesmas regras de validação da tela mobile. */
export async function signInAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readField(formData, "email").trim().toLowerCase();
  const password = readField(formData, "password");
  const name = readField(formData, "name").trim().slice(0, 80);

  if (!EMAIL_PATTERN.test(email) || password.length < 8) {
    return {
      email,
      name,
      error: "Informe um e-mail válido e uma senha com pelo menos 8 caracteres.",
    };
  }

  // TODO(fase-4): substituir por chamada real à API de autenticação.
  await persistSession({ email, name });
  redirect("/cliente/acompanhamento");
}

/** Cadastro simulado — redireciona ao login com o e-mail preenchido. */
export async function signUpAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = readField(formData, "name").trim();
  const email = readField(formData, "email").trim().toLowerCase();
  const password = readField(formData, "password");

  if (!EMAIL_PATTERN.test(email)) {
    return { name, email, error: "Informe um e-mail válido." };
  }
  if (!STRONG_PASSWORD.test(password)) {
    return {
      name,
      email,
      error:
        "A senha precisa ter ao menos 8 caracteres, com uma letra maiúscula, uma minúscula e um número.",
    };
  }

  // TODO(fase-4): substituir por chamada real à API de cadastro.
  // Enquanto simulado, o nome segue via query para compor a sessão no login.
  const params = new URLSearchParams({ email, cadastro: "ok" });
  if (name) {
    params.set("nome", name);
  }
  redirect(`/login?${params.toString()}`);
}

export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete("toyotatech.token");
  cookieStore.delete("token");
  redirect("/");
}
