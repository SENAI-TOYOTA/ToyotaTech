/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useCallback } from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ReactCountryFlag from "react-country-flag";

export default function FinanceiroSection() {
  const totalImages = 11;
  const [currentIndex, setCurrentIndex] = useState(0);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const lastIndex = useRef(0);

  const imagesArray = Array.from({ length: totalImages }, (_, i) => `/models/${i + 1}.jpg`);

  const goTo = useCallback((index: number) => {
    const clamped = ((index % totalImages) + totalImages) % totalImages;
    setCurrentIndex(clamped);
    lastIndex.current = clamped;
  }, []);

  const prev = () => goTo(currentIndex - 1);
  const next = () => goTo(currentIndex + 1);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const diff = e.clientX - startX.current;
    if (Math.abs(diff) > 20) {
      goTo(lastIndex.current + (diff > 0 ? -1 : 1));
      startX.current = e.clientX;
    }
  };

  const handleMouseUp = () => { isDragging.current = false; };

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = e.touches[0].clientX - startX.current;
    if (Math.abs(diff) > 20) {
      goTo(lastIndex.current + (diff > 0 ? -1 : 1));
      startX.current = e.touches[0].clientX;
    }
  };

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="bg-zinc-900 text-white flex items-center justify-between px-6 py-4">
        <div className="text-xl font-semibold">
          <span className="text-red-600">Toyota</span>Tech
        </div>
        <div className="flex flex-col gap-1 cursor-pointer">
          <span className="w-6 h-[2px] bg-white"></span>
          <span className="w-6 h-[2px] bg-white"></span>
          <span className="w-6 h-[2px] bg-white"></span>
        </div>
      </div>

      {/* VISUALIZADOR 360 */}
      <div className="bg-white py-12 px-6 flex flex-col items-center border-b">
        <div className="w-full max-w-4xl text-center mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-zinc-800">
            Conheça seu Corolla Altis 2025
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Clique e arraste para girar o veículo.
          </p>
        </div>

        <div className="relative w-full max-w-4xl">
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white border border-gray-200 shadow-md rounded-full p-2 transition"
          >
            <ChevronLeft className="w-6 h-6 text-zinc-700" />
          </button>

          <div
            className="w-full aspect-[16/9] rounded-xl overflow-hidden border bg-white cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            <img
              src={imagesArray[currentIndex]}
              alt={`Ângulo ${currentIndex + 1}`}
              className="w-full h-full object-contain pointer-events-none"
              draggable={false}
            />
          </div>

          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white border border-gray-200 shadow-md rounded-full p-2 transition"
          >
            <ChevronRight className="w-6 h-6 text-zinc-700" />
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-3">
          Ângulo {currentIndex + 1} de {totalImages}
        </p>
      </div>

      {/* CONTEÚDO */}
      <div className="bg-gray-200 py-16 px-6 flex flex-col items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-black mb-10 text-center">
          Acompanhamento Financeiro
        </h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* FINANCIAMENTO */}
          <div className="bg-white rounded-lg border p-6 w-[320px] shadow-sm text-black !text-black">
            <h2 className="text-lg font-semibold mb-4 text-center">Financiamento</h2>
            <p className="text-sm"><strong>Veículo:</strong> Corolla Altis 2025</p>
            <p className="text-sm mt-2"><strong>Parcelas pagas:</strong> 30/60</p>
            <div className="mt-3">
              <div className="w-full bg-gray-300 h-3 rounded-full">
                <div className="bg-green-500 h-3 rounded-full w-1/2"></div>
              </div>
              <p className="text-xs text-black mt-1 text-right">50%</p>
            </div>
            <p className="text-sm mt-4"><strong>Instituição:</strong> Banco Toyota do Brasil S.A</p>
          </div>

          {/* BOLETO */}
          <div className="bg-white rounded-lg border p-6 w-[320px] shadow-sm flex flex-col items-center text-center text-black !text-black">
            <h2 className="text-lg font-semibold mb-4">2º Via do Boleto</h2>
            <p className="text-sm mb-6">Baixe seus boletos com facilidade</p>
            <button className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition">
              Acessar boletos
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-zinc-900 text-gray-400 px-6 pt-20 pb-10">
        <div className="flex justify-center -mt-28 mb-16">
          <div className="bg-red-600 text-white px-10 py-5 rounded-md flex items-center gap-6 shadow-xl">
            <span className="font-semibold text-lg">Entre em contato por email</span>
            <div className="bg-white text-red-600 font-bold px-6 py-2 rounded-md cursor-pointer hover:scale-105 transition">
              Toyota
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="text-red-600 text-2xl font-bold mb-4">Toyota</div>
            <p className="text-sm">Mobilidade para todos</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-white">About</h4>
            <ul className="space-y-2 text-sm">
              <li>Who we are?</li>
              <li>Student Discount</li>
              <li>We&apos;re hiring!</li>
              <li>Guides and Reviews</li>
              <li>Press</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-white">Help</h4>
            <ul className="space-y-2 text-sm">
              <li>Seller Portal</li>
              <li>Payments</li>
              <li>Delivery</li>
              <li>Contact us</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>Terms of service</li>
              <li>Data protection</li>
              <li>Cookies</li>
            </ul>
            <div className="flex gap-4 mt-5 text-lg">
              <FaFacebook />
              <FaInstagram />
              <FaLinkedin />
              <FaYoutube />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-6">
          <div className="flex justify-center gap-4">
            <ReactCountryFlag countryCode="JP" svg className="w-6 h-4" />
            <ReactCountryFlag countryCode="BR" svg className="w-6 h-4" />
            <ReactCountryFlag countryCode="US" svg className="w-6 h-4" />
          </div>
          <p className="text-center text-xs mt-6 text-gray-500">© 2025 Toyota Market</p>
        </div>
      </footer>
    </div>
  );
}