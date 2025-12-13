"use client";
import Link from "next/link";
import { useState } from "react";

interface MenuItem {
  label: string;
  href: string;
  onClick?: () => void;
}

interface User {
  name: string;
  email: string;
  type: "cliente" | "admin";
}

interface MenuProps {
  user?: User | null;
}

function Menu({ user }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  function toggleMenu() {
    setIsOpen(!isOpen);
  }

  // Links públicos
  const publicItems: MenuItem[] = [
    { label: "Home", href: "/" },
    { label: "Catálogo", href: "/catalogo" },
    { label: "Contato", href: "/contato" },
  ];

  // Links - cliente logado
  const clientItems: MenuItem[] = [
    { label: "Minha Conta", href: "/minha-conta" },
    { label: "Meus Pedidos", href: "/meus-pedidos" },
  ];

  // Links - admin logado
  const adminItems: MenuItem[] = [
    { label: "Dashboard", href: "/adm/dashboard" },
    { label: "Usuários", href: "/adm/usuarios" },
    { label: "Pedidos", href: "/adm/pedidos" },
  ];

  // Determina quais itens mostrar baseado no tipo de usuário
  let menuItems: MenuItem[] = [...publicItems];

  if (user) {
    if (user.type === "cliente") {
      menuItems = [...publicItems, ...clientItems];
    } else if (user.type === "admin") {
      menuItems = [...adminItems];
    }

    // Adiciona o botão Sair para usuários logados
    menuItems.push({ label: "Sair", href: "/SignIn-Adm" });
  }

  return (
    <>
      <button
        onClick={toggleMenu}
        className="cursor-pointer relative w-10 h-10 flex flex-col justify-center items-center gap-1.5 z-50"
      >
        <span
          className={`w-6 h-0.5 transition-all duration-300 ${
            isOpen ? "bg-white rotate-45 translate-y-2" : "bg-white"
          }`}
        />
        <span
          className={`w-6 h-0.5 transition-all duration-300 ${
            isOpen ? "bg-white opacity-0" : "bg-white"
          }`}
        />
        <span
          className={`w-6 h-0.5 transition-all duration-300 ${
            isOpen ? "bg-white -rotate-45 -translate-y-2" : "bg-white"
          }`}
        />
      </button>

      {isOpen && (
        <div
          onClick={toggleMenu}
          className="fixed inset-0 bg-black/40 z-30 transition-opacity duration-300"
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-100 bg-[#2C2C2C] shadow-2xl transform transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="bg-red-600 text-white p-6">
          {user ? (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-red-600 font-bold text-xl">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-lg">{user.name}</p>
                  <p className="text-sm text-red-100">
                    {user.type === "admin" ? "Administrador" : "Cliente"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-white border-b border-white">
              <p className="text-lg mb-4 font-semibold">Bem-vindo!</p>
              <Link
                href="/SignIn-Adm"
                onClick={toggleMenu}
                className="block w-full bg-red-600 text-white py-3 px-4 rounded-lg font-bold text-center hover:bg-white hover:text-red-600 transition-colors shadow-md"
              >
                Fazer Login
              </Link>
            </div>
          )}
        </div>

        {/* Navegação */}
        <nav className="py-8 mt-4 h-[calc(100%-200px)] flex flex-col justify-center items-center">
          <ul className="space-y-6 flex-1">
            {menuItems.map((item, index) => (
              <li
                key={index}
                className={
                  item.label === "Sair"
                    ? "mt-auto pt-8 border-t border-gray-200"
                    : ""
                }
              >
                <Link
                  href={item.href}
                  onClick={toggleMenu}
                  className={`block text-lg text-white transition-all ${
                    item.label === "Sair"
                      ? "text-center py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                      : "relative pb-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-red-600 after:transition-all after:duration-300 hover:after:w-full"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}

export default Menu;