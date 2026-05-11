"use client";

import { useState } from "react";

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* BOTÃO HAMBÚRGUER */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 right-4 z-50 bg-black text-white p-2 rounded"
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

        {/* ITENS */}
        <ul className="flex flex-col gap-4 p-4 text-sm">
          <li className="cursor-pointer hover:text-gray-300">Perfil</li>
          <li className="cursor-pointer hover:text-gray-300">Financeiro</li>
          <li className="cursor-pointer hover:text-gray-300">
            Gestão de veículo
          </li>
          <li className="cursor-pointer hover:text-gray-300">
            Notificações
          </li>
        </ul>
      </div>
    </>
  );
}