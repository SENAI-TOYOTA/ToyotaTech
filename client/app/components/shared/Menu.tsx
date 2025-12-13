"use client";
import { useState } from "react";

function Menu() {
  const [isOpen, setIsOpen] = useState(false);

  function toggleMenu() {
    setIsOpen(!isOpen);
  }

  return (
    <>
      <button
        onClick={toggleMenu}
        className="cursor-pointer relative w-10 h-10 flex flex-col justify-center items-center gap-1.5 z-50"
      >
        <span
          className={`w-6 h-0.5 transition-all duration-300 ${isOpen ? "bg-black rotate-45 translate-y-2" : "bg-white"}`}
        />
        <span
          className={`w-6 h-0.5 transition-all duration-300 ${isOpen ? "bg-black opacity-0" : "bg-white"}`}
        />
        <span
          className={`w-6 h-0.5 transition-all duration-300 ${isOpen ? "bg-black -rotate-45 -translate-y-2" : "bg-white"}`}
        />
      </button>

      {isOpen && (
        <div
          onClick={toggleMenu}
          className="fixed inset-0 bg-opacity-10 z-40 transition-opacity duration-300"
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl transform transition-transform duration-300 z-40 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <nav className="p-8 mt-16">
          <ul className="space-y-6">
            <li>
              <a
                href="#"
                className="block text-lg hover:text-red-600 transition-colors"
              >
                Perfil
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block text-lg hover:text-red-600 transition-colors"
              >
                Financeiro
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block text-lg hover:text-red-600 transition-colors"
              >
                Gestão de veículo
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block text-lg hover:text-red-600 transition-colors"
              >
                Notificações
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}

export default Menu;
