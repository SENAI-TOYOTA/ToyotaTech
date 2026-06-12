/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [codigo, setCodigo] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("admin@admin");
  const [senha, setSenha] = useState("123456");
  const [erro, setErro] = useState("");

  const router = useRouter();
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleCodigoChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const novoCodigo = [...codigo];
    novoCodigo[index] = value;
    setCodigo(novoCodigo);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !codigo[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleLogin = () => {
    if (email === "admin@admin" && senha === "123456") {
      alert("Login realizado com sucesso!");
      router.push("/sobre");
    } else {
      setErro("Email ou senha inválidos");
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      
      {/* LADO ESQUERDO */}
      <div className="w-1/2 relative hidden md:block">
        <img
          src="/img/hilux.jpeg"
          alt="Toyota Hilux"
          className="w-full h-full object-cover object-center"
        />

        {/* FADE MELHORADO */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-transparent" />

        {/* LOGO */}
        <div className="absolute top-6 left-6 text-3xl drop-shadow-lg">
          <span className="text-red-500 font-bold italic">Toyota</span>
          <span className="text-white font-bold">Tech</span>
        </div>

        {/* TEXTO */}
        <div className="absolute bottom-20 left-6 text-white max-w-xs">
          <h2 className="text-3xl font-bold leading-tight drop-shadow-md">
            Sua Jornada Continua
          </h2>
          <p className="text-base mt-1">Seguimos com você!</p>
        </div>
      </div>

      {/* LADO DIREITO */}
      <div className="w-full md:w-1/2 bg-gray-100 flex items-center justify-center p-8">

        <div className="w-full max-w-md">

          {/* TÍTULO */}
          <h2
            className="text-5xl text-black mb-2 text-center"
            style={{ fontFamily: "Calibri, sans-serif", fontWeight: 400 }}
          >
            Bem vindo!
          </h2>

          <p className="text-gray-600 text-sm mb-8 text-center">
            Faça seu login
          </p>

          {/* EMAIL */}
          <div className="mb-4">
            <label className="text-sm text-black font-semibold">
              CPF ou endereço de email:
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded mt-1 bg-white text-black"
              placeholder="admin@admin"
            />
          </div>

          {/* SENHA */}
          <div className="mb-4">
            <label className="text-sm text-black font-semibold">
              Senha:
            </label>

            <div className="relative">
              <input
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                type={mostrarSenha ? "text" : "password"}
                className="w-full border p-2 rounded mt-1 bg-white text-black pr-10"
              />

              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-2.5 text-gray-600 hover:text-black"
              >
                {mostrarSenha ? (
                  /* OLHO FECHADO */
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.94 10.94 0 0110 20C5 20 1 16 1 12a10.94 10.94 0 013.06-5.94M9.88 9.88a3 3 0 104.24 4.24"/>
                    <path d="M1 1l22 22"/>
                  </svg>
                ) : (
                  /* OLHO ABERTO */
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 9-8 9 8 9 8-4 8-9 8-9-8-9-8z"/>
                    <circle cx="10" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* ERRO */}
          {erro && (
            <p className="text-red-500 text-sm mb-4">{erro}</p>
          )}

          {/* LEMBRAR */}
          <div className="flex justify-between items-center text-sm mb-6">
            <label className="flex items-center gap-2 text-black">
              <input type="checkbox" />
              Lembre de mim
            </label>

            <button className="text-gray-500 underline hover:text-black">
              Esqueceu a senha?
            </button>
          </div>

          {/* LOGIN */}
          <button
            onClick={handleLogin}
            className="w-full bg-red-600 hover:bg-red-700 transition text-white py-2 rounded font-bold mb-6"
          >
            Login
          </button>

          {/* DIVISOR */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 h-px bg-gray-400"></div>
            <span className="text-gray-500 text-sm">Ou</span>
            <div className="flex-1 h-px bg-gray-400"></div>
          </div>

          {/* CÓDIGO */}
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Código de compra
            </p>

            <div className="flex gap-2">
              {codigo.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputsRef.current[i] = el; }}
                  value={digit}
                  onChange={(e) =>
                    handleCodigoChange(i, e.target.value)
                  }
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  maxLength={1}
                  className="w-10 h-10 text-center border rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}