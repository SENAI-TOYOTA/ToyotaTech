/* eslint-disable @next/next/no-img-element */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ToyotaCarousel from "./carrosel";
import Continuation from "./continuacao";
import { FaCar } from "react-icons/fa6";
import {
  FaPaintRoller,
  FaCogs,
  FaShip,
  FaTruck,
  FaCheckCircle,
} from "react-icons/fa";

export default function ToyotaDashboard() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen bg-gray-100"
      style={{ fontFamily: "Calibri, sans-serif" }}
    >
      {/* header compartilhado no layout */}

      {/* ================= CONTEÚDO ================= */}
      <div className="p-6">
        <h2 className="text-lg mb-4 text-black">Bem vindo, John</h2>

        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* CARD DO CARRO */}
          <div className="bg-white rounded-xl shadow-md px-6 py-5 flex items-center justify-between w-full lg:w-1/2">
            
            <div className="flex-1 flex justify-center">
              <img
                src="/img/corolla.webp"
                alt="Corolla"
                className="w-[320px] object-contain"
              />
            </div>

            <div className="flex-1 text-right text-black max-w-md">
              <h3 className="font-bold text-2xl mb-4">
                Seu Corolla Altis
              </h3>

              <p className="text-lg font-semibold mb-3 text-gray-800">
                Toyota Corolla Altis
              </p>

              <div className="grid grid-cols-2 gap-y-2 text-base">
                <span className="text-gray-500">Versão:</span>
                <span className="font-medium">Hybrid 2025</span>

                <span className="text-gray-500">Cor:</span>
                <span className="font-medium">Branco Pérola</span>

                <span className="text-gray-500">Motor:</span>
                <span className="font-medium">1.8 Hybrid</span>

                <span className="text-gray-500">Ano:</span>
                <span className="font-medium">2025</span>
              </div>

              <div className="flex gap-3 mt-5 justify-end">
                <button
                  onClick={() => router.push('/documentos')}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md"
                >
                  Documentos
                </button>
                <button
                  onClick={() => router.push('/financiamento')}
                  className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-2 rounded-md"
                >
                  Financiamento
                </button>
              </div>
            </div>
          </div>

          {/* CARD STATUS */}
          <div className="bg-white rounded-xl shadow-md p-5 w-full lg:w-1/2 border border-gray-200">
            
            <h3 className="text-xl font-semibold mb-5 text-black">
              Status da Produção
            </h3>

            <ul className="space-y-5 text-base">

              <li className="flex items-center justify-between text-gray-700">
                <div className="flex items-center gap-3">
                  <FaCar />
                  Início da produção
                </div>
                <FaCheckCircle className="text-green-600" />
              </li>

              <li className="flex items-center justify-between text-gray-700">
                <div className="flex items-center gap-3">
                  <FaPaintRoller />
                  Pintura
                </div>
                <FaCheckCircle className="text-green-600" />
              </li>

              <li className="flex items-center justify-between text-gray-700">
                <div className="flex items-center gap-3">
                  <FaCogs />
                  Processo de montagem
                </div>
                <FaCheckCircle className="text-green-600" />
              </li>

              <li className="flex items-center gap-3 text-green-600 font-semibold">
                <FaShip />
                Aguardando o embarque
              </li>

              <li className="flex items-center gap-3 text-gray-400">
                <FaTruck />
                Em trânsito
              </li>

              <li className="flex items-center gap-3 text-gray-400">
                <FaCheckCircle />
                Saiu para entrega
              </li>

            </ul>
          </div>
        </div>

        <div className="w-full text-center mt-6">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-black">
            Verifique nossas Novidades Toyota
          </h2>
        </div>

        <ToyotaCarousel />
        <Continuation />
      </div>
    </div>
  );
}