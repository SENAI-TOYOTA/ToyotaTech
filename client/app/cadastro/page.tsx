"use client";
import React, { useState } from "react";

export default function Cadastro() {
  const [etapa, setEtapa] = useState(1);

  const [form, setForm] = useState({
    nome: "", sobrenome: "", cpf: "", telefone: "",
    email: "", senha: "", cep: "", bairro: "", rua: "",
    numero: "", cidade: "", complemento: "", estado: ""
  });

  const [erros, setErros] = useState<Record<string, string>>({});
  const [codigoEmail, setCodigoEmail] = useState("");
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [emailVerificado, setEmailVerificado] = useState(false);

  // ================= MÁSCARAS =================
  const formatCPF = (value: string) => {
    value = value.replace(/\D/g, "").slice(0, 11);
    return value
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  };

  const formatTelefone = (value: string) => {
    value = value.replace(/\D/g, "").slice(0, 11);
    return value
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  };

  const formatCEP = (value: string) => {
    value = value.replace(/\D/g, "").slice(0, 8);
    return value.replace(/^(\d{5})(\d)/, "$1-$2");
  };

  // ================= CPF REAL =================
  const validarCPF = (cpf: string) => {
    cpf = cpf.replace(/\D/g, "");

    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++)
      soma += parseInt(cpf.charAt(i)) * (10 - i);

    let resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++)
      soma += parseInt(cpf.charAt(i)) * (11 - i);

    resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;

    return resto === parseInt(cpf.charAt(10));
  };

  const senhaValida = (senha: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(senha);

  // ================= CEP =================
  const buscarCEP = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();

      if (data.erro) {
        setErros((prev) => ({ ...prev, cep: "CEP não encontrado" }));
        return;
      }

      setForm((prev) => ({
        ...prev,
        rua: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: data.uf || ""
      }));
    } catch {
      setErros((prev) => ({ ...prev, cep: "Erro ao buscar CEP" }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let novoValor = value;

    if (name === "cpf") novoValor = formatCPF(value);
    if (name === "telefone") novoValor = formatTelefone(value);
    if (name === "cep") novoValor = formatCEP(value);

    if (name === "email") {
      setCodigoEnviado(false);
      setEmailVerificado(false);
    }

    if (name === "cep" && novoValor.replace(/\D/g, "").length === 8) {
      buscarCEP(novoValor);
    }

    setForm({ ...form, [name]: novoValor });
    setErros((prev) => ({ ...prev, [name]: "" }));
  };

  const enviarCodigoEmail = () => {
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setErros((prev) => ({ ...prev, email: "Email inválido" }));
      return;
    }

    setCodigoEnviado(true);
    alert("Código enviado (simulação): 123456");
  };

  const verificarCodigo = () => {
    if (codigoEmail === "123456") {
      setEmailVerificado(true);
      alert("Email verificado!");
    } else {
      alert("Código inválido");
    }
  };

  const validarEtapa1 = () => {
    const erros: Record<string, string> = {};

    if (!form.nome) erros.nome = "Obrigatório";
    if (!form.sobrenome) erros.sobrenome = "Obrigatório";

    if (!validarCPF(form.cpf))
      erros.cpf = "CPF inválido";

    if (form.telefone.replace(/\D/g, "").length !== 11)
      erros.telefone = "Telefone inválido";

    if (!form.email) {
      erros.email = "Obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      erros.email = "Email inválido";
    } else if (!emailVerificado) {
      erros.email = "Verifique o email";
    }

    if (!form.senha) {
      erros.senha = "Obrigatório";
    } else if (!senhaValida(form.senha)) {
      erros.senha = "Senha fraca";
    }

    setErros(erros);
    return Object.keys(erros).length === 0;
  };

  const handleNext = () => {
    if (validarEtapa1()) setEtapa(2);
  };

  const inputClass = (campo: string) =>
    `w-full border p-2 rounded bg-gray-100 text-black ${
      erros[campo] ? "border-red-500" : "border-gray-300"
    }`;

  // ================= ETAPA 2 =================
  if (etapa === 2) {
    return (
      <div className="min-h-screen bg-gray-200 flex flex-col items-center p-8">
        <div className="mb-6">
          <span className="text-red-600 text-3xl font-bold italic">Toyota</span>
          <span className="text-black text-3xl font-bold ml-1">Tech</span>
        </div>

        <div className="w-full max-w-4xl bg-white rounded shadow-2xl p-10">
          <h2 className="text-center text-2xl font-bold mb-10 text-black">
            Endereço
          </h2>

          <form className="grid grid-cols-2 gap-6">
            <Campo label="CEP" name="cep" {...{form,handleChange,erros,inputClass}}/>
            <Campo label="Bairro" name="bairro" {...{form,handleChange,erros,inputClass}}/>

            <Campo label="Rua" name="rua" {...{form,handleChange,erros,inputClass}}/>
            <Campo label="Número" name="numero" {...{form,handleChange,erros,inputClass}}/>

            <Campo label="Cidade" name="cidade" {...{form,handleChange,erros,inputClass}}/>
            <Campo label="Estado" name="estado" {...{form,handleChange,erros,inputClass}}/>

            <div className="col-span-2">
              <Campo label="Complemento" name="complemento" {...{form,handleChange,erros,inputClass}}/>
            </div>

            <div className="col-span-2 flex justify-center mt-8">
              <button className="bg-red-600 text-white px-12 py-2 rounded font-bold">
                Cadastrar-se
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ================= ETAPA 1 =================
  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center p-8">
      <div className="mb-6">
        <span className="text-red-600 text-3xl font-bold italic">Toyota</span>
        <span className="text-black text-3xl font-bold ml-1">Tech</span>
      </div>

      <div className="w-full max-w-4xl bg-white rounded shadow-2xl p-10">
        <h2 className="text-center text-2xl font-bold mb-10 text-black">
          Bem vindo!
        </h2>

        <form className="grid grid-cols-2 gap-6">
          <Campo label="Primeiro nome" name="nome" {...{form,handleChange,erros,inputClass}}/>
          <Campo label="Segundo nome" name="sobrenome" {...{form,handleChange,erros,inputClass}}/>

          <Campo label="CPF" name="cpf" {...{form,handleChange,erros,inputClass}}/>
          <Campo label="Telefone" name="telefone" {...{form,handleChange,erros,inputClass}}/>

          {/* EMAIL */}
          <div className="flex flex-col">
            <label className="text-black text-xs font-bold mb-1">Email:</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className={inputClass("email")}
            />

            {!codigoEnviado && (
              <button
                type="button"
                onClick={enviarCodigoEmail}
                className="text-xs text-black underline mt-1"
              >
                Verificar email
              </button>
            )}

            {codigoEnviado && !emailVerificado && (
              <div className="flex gap-2 mt-2">
                <input
                  value={codigoEmail}
                  onChange={(e)=>setCodigoEmail(e.target.value)}
                  className="border p-1 text-xs text-black bg-white"
                />
                <button
                  type="button"
                  onClick={verificarCodigo}
                  className="bg-green-600 text-white px-2 text-xs"
                >
                  OK
                </button>
              </div>
            )}

            {emailVerificado && (
              <span className="text-green-600 text-xs mt-1">
                ✔ Verificado
              </span>
            )}
          </div>

          <Campo label="Senha" name="senha" type="password" {...{form,handleChange,erros,inputClass}}/>

          <div className="col-span-2 flex justify-center mt-8">
            <button
              type="button"
              onClick={handleNext}
              className="bg-red-600 text-white px-12 py-2 rounded font-bold"
            >
              Próximo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Campo({ 
  label, 
  name, 
  form, 
  handleChange, 
  erros, 
  inputClass, 
  type = "text" 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}: any) {
  return (
    <div className="flex flex-col">
      <label className="text-black text-xs font-bold mb-1">
        {label}:
      </label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        className={inputClass(name)}
      />
      {erros[name] && (
        <span className="text-red-500 text-xs mt-1">
          {erros[name]}
        </span>
      )}
    </div>
  );
}