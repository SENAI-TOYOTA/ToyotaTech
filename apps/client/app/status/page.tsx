/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import ReactCountryFlag from "react-country-flag";

export default function OrderComplete() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">

      {/* ================= HEADER ================= */}
      <header className="bg-black text-white flex justify-between items-center px-6 py-4">
        <h1 className="text-lg font-semibold">
          <span className="text-red-600">Toyota</span>Tech
        </h1>

        {/* MENU ICON */}
        <div
          onClick={() => setMenuOpen(true)}
          className="space-y-1 cursor-pointer"
        >
          <div className="w-6 h-0.5 bg-white"></div>
          <div className="w-6 h-0.5 bg-white"></div>
          <div className="w-6 h-0.5 bg-white"></div>
        </div>
      </header>

      {/* ================= MENU ================= */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-[#1f1f1f] text-white z-50 transform transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* HEADER MENU */}
        <div className="flex justify-between items-center p-4 border-b border-gray-600">
          <span className="font-semibold">Menu</span>
          <button onClick={() => setMenuOpen(false)}>✕</button>
        </div>

        {/* USER */}
        <div className="p-4 border-b border-gray-700">
          <p className="font-semibold">Olá, John</p>
        </div>

        {/* MENU ITEMS */}
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

      {/* ================= MAIN ================= */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="bg-white w-full max-w-5xl rounded-lg shadow-md p-8 flex flex-col md:flex-row items-center justify-between">
          
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Seu pedido foi concluído!
            </h2>

            <div className="flex items-center gap-2 text-green-600 font-medium">
              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-green-500 text-white text-xs">
                ✓
              </span>
              Entregue ao cliente
            </div>

            <div>
              <p className="text-gray-600 mb-3">Informações da entrega:</p>

              <div className="space-y-3">
                <div className="bg-gray-800 text-white px-4 py-2 rounded w-fit">
                  10/10/2025
                </div>

                <div className="bg-gray-800 text-white px-4 py-2 rounded w-fit">
                  Concessionária Toyota
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 md:mt-0">
            <img
              src="/img/corolla.webp"
              alt="Carro Toyota"
              className="w-80 object-contain"
            />
          </div>
        </div>
      </main>

      {/* ================= CTA ================= */}
      <div className="flex justify-center pb-6">
        <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-3 shadow-lg transition">
          <span>Sua Jornada Continua!</span>
          <span className="bg-white text-red-600 px-3 py-1 rounded font-semibold">
            Toyota APP
          </span>
        </button>
      </div>

      {/* ================= FOOTER ================= */}
      <footer className="bg-black text-gray-400 px-6 pt-16 pb-10 text-sm">

        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          
          <div>
            <h3 className="text-white mb-3">About</h3>
            <ul className="space-y-1">
              <li className="hover:text-white cursor-pointer">Who are we?</li>
              <li className="hover:text-white cursor-pointer">Student Discount</li>
              <li className="hover:text-white cursor-pointer">We&apos;re hiring!</li>
              <li className="hover:text-white cursor-pointer">Guides and Reviews</li>
              <li className="hover:text-white cursor-pointer">Press</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white mb-3">Help</h3>
            <ul className="space-y-1">
              <li className="hover:text-white cursor-pointer">Sellers – register to sell</li>
              <li className="hover:text-white cursor-pointer">Seller Portal</li>
              <li className="hover:text-white cursor-pointer">Payments</li>
              <li className="hover:text-white cursor-pointer">Delivery</li>
              <li className="hover:text-white cursor-pointer">Contact us</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white mb-3">Law and order</h3>
            <ul className="space-y-1">
              <li className="hover:text-white cursor-pointer">Terms of service</li>
              <li className="hover:text-white cursor-pointer">General terms</li>
              <li className="hover:text-white cursor-pointer">Data protection</li>
              <li className="hover:text-white cursor-pointer">Cookies</li>
              <li className="hover:text-white cursor-pointer">Legal notices</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white mb-3">Hello there!</h3>
            <ul className="space-y-1">
              <li className="hover:text-white cursor-pointer">Trustpilot</li>
              <li className="hover:text-white cursor-pointer">Glassdoor</li>
              <li className="hover:text-white cursor-pointer">Medium</li>
              <li className="hover:text-white cursor-pointer">Deep Fried Mars Bars</li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-700 mt-10 pt-6">

          <div className="flex justify-center gap-4">
            <ReactCountryFlag countryCode="JP" svg className="w-6 h-4" />
            <ReactCountryFlag countryCode="BR" svg className="w-6 h-4" />
            <ReactCountryFlag countryCode="US" svg className="w-6 h-4" />
            <ReactCountryFlag countryCode="ES" svg className="w-6 h-4" />
            <ReactCountryFlag countryCode="GB" svg className="w-6 h-4" />
            <ReactCountryFlag countryCode="FR" svg className="w-6 h-4" />
          </div>

          <p className="text-center text-xs mt-6 text-gray-500">
            © 2025 Toyota Market
          </p>
        </div>

      </footer>
    </div>
  );
}