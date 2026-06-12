"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const nav = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <>
      {/* BOTÃO HAMBÚRGUER (sem posicionamento fixo; posicione via header) */}
      <button
        onClick={() => setOpen(true)}
        className="z-50 bg-black text-white p-2 rounded"
      >
        ☰
      </button>

      {/* OVERLAY ESCURO */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      {/* MENU LATERAL */}
      <div
        className={`fixed top-0 right-0 h-full w-[260px] bg-[#1f1f1f] text-white z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* TOPO */}
        <div className="flex justify-between items-center p-4 border-b border-gray-600">
          <span className="font-semibold">Menu</span>
          <button onClick={() => setOpen(false)}>✕</button>
        </div>

        {/* USUÁRIO */}
        <div className="p-4 border-b border-gray-700">
          <p className="font-semibold text-gray-300">Olá, John</p>
        </div>

        {/* ITENS */}
        <ul className="flex flex-col gap-4 p-4 text-sm">
          <li className="cursor-pointer hover:text-gray-300" onClick={() => nav("/sobre")}>Home</li>
          <li className="cursor-pointer hover:text-gray-300" onClick={() => nav("/perfil")}>Perfil</li>
          <li className="cursor-pointer hover:text-gray-300" onClick={() => nav("/financiamento")}>Financeiro</li>
          <li className="cursor-pointer hover:text-gray-300" onClick={() => nav("/documentos")}>Documentos</li>
          <li className="cursor-pointer hover:text-gray-300 mt-4 border-t pt-4" onClick={() => nav("/login")}>Sair</li>
        </ul>
      </div>
    </>
  );
}