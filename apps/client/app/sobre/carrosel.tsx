/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useCallback } from "react";

export default function ToyotaCarousel() {
  const slides = [
    { id: 1, image: "/img/corollah.jpeg" },
    { id: 2, image: "/img/MM.jpg" },
    { id: 3, image: "/img/GR.jpg" },
  ];

  const [current, setCurrent] = useState(0);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  // ✅ AUTOPLAY (troca a cada 4 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 4000);

    return () => clearInterval(interval);
  }, [current, nextSlide]);

  return (
    <div className="w-full mt-6">
      <div className="relative w-full h-[420px] md:h-[500px] overflow-hidden bg-gray-200">
        
        {/* IMAGEM */}
        <img
          src={slides[current]?.image}
          alt="car"
          className="w-full h-full object-cover"
        />

        {/* SETA ESQUERDA */}
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-2 rounded-full"
        >
          ‹
        </button>

        {/* SETA DIREITA */}
        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-2 rounded-full"
        >
          ›
        </button>

        {/* INDICADORES SOBRE A IMAGEM */}
        <div className="absolute bottom-4 w-full flex justify-center gap-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2.5 rounded-full transition-all ${
                current === index ? "bg-black w-5" : "bg-gray-300 w-2.5"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}