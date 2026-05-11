"use client";
import React, { useState } from "react";
import { Camera, Trash2, Save, Menu } from "lucide-react";

export default function Perfil() {
  // Estado para os campos do formulário
  const [formData, setFormData] = useState({
    primeiroNome: "",
    sobrenome: "",
    email: "admin@toyota.com",
    telefone: "",
    cep: "",
    numero: "",
    id: "123456",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSalvar = () => {
    alert("Dados salvos com sucesso!");
    // Aqui entraria a lógica de API
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* HEADER - Mantendo a identidade do Login */}
      <header className="bg-[#262626] text-white p-4 flex justify-between items-center shadow-md">
        <div className="text-2xl">
          <span className="text-red-600 font-bold italic">Toyota</span>
          <span className="text-white font-bold">Tech</span>
        </div>
        <button className="p-2 hover:bg-gray-700 rounded-full transition">
          <Menu size={24} />
        </button>
      </header>

      <main className="flex-1 flex justify-center items-start p-4 md:p-10">
        <div className="bg-white w-full max-w-5xl shadow-sm rounded-sm p-6 md:p-12">
          <h2 className="text-2xl font-bold text-black mb-10 border-b pb-4">
            Informações pessoais
          </h2>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* SEÇÃO DA FOTO */}
            <div className="flex flex-col items-center gap-6">
              <div className="relative group">
                <div className="w-44 h-44 bg-gray-200 rounded-full flex items-center justify-center border-4 border-gray-50 overflow-hidden shadow-inner">
                  <svg className="w-24 h-24 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <button className="absolute bottom-2 right-2 bg-[#262626] p-2.5 rounded-full text-white border-2 border-white hover:bg-black transition shadow-lg">
                  <Camera size={18} />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button className="flex-1 bg-[#262626] text-white px-6 py-2 rounded font-semibold hover:bg-black transition flex items-center justify-center gap-2">
                  Upload
                </button>
                <button className="flex-1 bg-red-600 text-white px-6 py-2 rounded font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2">
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>

            {/* FORMULÁRIO */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              <div className="flex flex-col">
                <label className="text-sm font-bold text-black mb-1">
                  Primeiro nome: <span className="text-red-600">*</span>
                </label>
                <input
                  name="primeiroNome"
                  value={formData.primeiroNome}
                  onChange={handleChange}
                  className="bg-gray-200 border-none p-3 rounded focus:ring-2 focus:ring-red-500 outline-none text-black"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-bold text-black mb-1">
                  Sobrenome: <span className="text-red-600">*</span>
                </label>
                <input
                  name="sobrenome"
                  value={formData.sobrenome}
                  onChange={handleChange}
                  className="bg-gray-200 border-none p-3 rounded focus:ring-2 focus:ring-red-500 outline-none text-black"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-bold text-black mb-1">
                  Email: <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-gray-200 border-none p-3 rounded focus:ring-2 focus:ring-red-500 outline-none text-black"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-bold text-black mb-1">
                  Telefone: <span className="text-red-600">*</span>
                </label>
                <input
                  placeholder="(xx) xxxxx-xxxx"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  className="bg-gray-200 border-none p-3 rounded focus:ring-2 focus:ring-red-500 outline-none text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-black mb-1">CEP:</label>
                  <input
                    name="cep"
                    value={formData.cep}
                    onChange={handleChange}
                    className="bg-gray-200 border-none p-3 rounded focus:ring-2 focus:ring-red-500 outline-none text-black"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-black mb-1">Número:</label>
                  <input
                    name="numero"
                    value={formData.numero}
                    onChange={handleChange}
                    className="bg-gray-200 border-none p-3 rounded focus:ring-2 focus:ring-red-500 outline-none text-black"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-bold text-black mb-1">ID:</label>
                <input
                  value={formData.id}
                  disabled
                  className="bg-gray-200 border-none p-3 rounded text-gray-500 cursor-not-allowed outline-none"
                />
              </div>

              {/* Botão Salvar alinhado à direita na última linha em telas grandes */}
              <div className="md:col-span-2 flex justify-end mt-4">
                <button
                  onClick={handleSalvar}
                  className="bg-[#262626] hover:bg-black transition text-white px-12 py-3 rounded font-bold flex items-center gap-2 shadow-md"
                >
                  <Save size={18} />
                  Salvar
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}