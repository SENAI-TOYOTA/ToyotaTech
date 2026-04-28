/* eslint-disable @next/next/no-img-element */
"use client";

import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import ReactCountryFlag from "react-country-flag";

export default function ToyotaLandingSection() {
  return (
    <div className="w-full">

      {/* ================= TÍTULO ================= */}
      <div className="text-center my-10">
        <h2 className="text-2xl md:text-4xl font-bold text-black">
          A Toyota oferece diversos modelos no mercado
        </h2>
      </div>

      {/* ================= BLOCO PRINCIPAL ================= */}
      <div className="bg-gray-200 py-10 px-6 flex justify-center">
        <div className="max-w-7xl w-full flex flex-col md:flex-row items-center gap-10">

          {/* IMAGEM */}
          <div className="flex-1">
            <img
              src="/img/SUV.webp"
              alt="Toyota"
              className="rounded-lg w-full object-cover"
            />
          </div>

          {/* TEXTO */}
          <div className="flex-1 text-black">
            <h3 className="text-2xl font-bold mb-4">
              What is Lorem Ipsum?
            </h3>

            <p className="text-gray-700 leading-relaxed">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
              Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s.
            </p>
          </div>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <footer className="bg-zinc-900 text-gray-400 px-6 pt-20 pb-10">

        {/* CTA dentro do footer */}
        <div className="flex justify-center -mt-28 mb-16">
          <div className="bg-red-600 text-white px-10 py-5 rounded-md flex items-center gap-6 shadow-xl">
            <span className="font-semibold text-lg">
              Entre em contato por email
            </span>

            <div className="bg-white text-red-600 font-bold px-6 py-2 rounded-md cursor-pointer hover:scale-105 transition">
              Toyota
            </div>
          </div>
        </div>

        {/* GRID */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* LOGO */}
          <div>
            <div className="text-red-600 text-2xl font-bold mb-4">
              Toyota
            </div>
            <p className="text-sm">Mobilidade para todos</p>
          </div>

          {/* ABOUT */}
          <div>
            <h4 className="font-semibold mb-4 text-white">About</h4>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-white cursor-pointer">Who we are?</li>
              <li className="hover:text-white cursor-pointer">Student Discount</li>
              <li className="hover:text-white cursor-pointer">We’re hiring!</li>
              <li className="hover:text-white cursor-pointer">Guides and Reviews</li>
              <li className="hover:text-white cursor-pointer">Press</li>
            </ul>
          </div>

          {/* HELP */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Help</h4>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-white cursor-pointer">Sellers - register to sell</li>
              <li className="hover:text-white cursor-pointer">Seller Portal</li>
              <li className="hover:text-white cursor-pointer">Payments</li>
              <li className="hover:text-white cursor-pointer">Delivery</li>
              <li className="hover:text-white cursor-pointer">Contact us</li>
            </ul>
          </div>

          {/* LEGAL */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-white cursor-pointer">Terms of service</li>
              <li className="hover:text-white cursor-pointer">Data protection</li>
              <li className="hover:text-white cursor-pointer">Cookies</li>
              <li className="hover:text-white cursor-pointer">Legal notices</li>
            </ul>

            <div className="flex gap-4 mt-5 text-lg">
              <FaFacebook className="hover:text-white cursor-pointer" />
              <FaInstagram className="hover:text-white cursor-pointer" />
              <FaLinkedin className="hover:text-white cursor-pointer" />
              <FaYoutube className="hover:text-white cursor-pointer" />
            </div>
          </div>

        </div>

        {/* DIVISÓRIA */}
        <div className="border-t border-gray-700 mt-12 pt-6">

          {/* BANDEIRAS VIA BIBLIOTECA */}
          <div className="flex justify-center gap-4">
            <ReactCountryFlag countryCode="JP" svg className="w-6 h-4 cursor-pointer hover:scale-110 transition rounded-sm" />
            <ReactCountryFlag countryCode="BR" svg className="w-6 h-4 cursor-pointer hover:scale-110 transition rounded-sm" />
            <ReactCountryFlag countryCode="US" svg className="w-6 h-4 cursor-pointer hover:scale-110 transition rounded-sm" />
            <ReactCountryFlag countryCode="ES" svg className="w-6 h-4 cursor-pointer hover:scale-110 transition rounded-sm" />
            <ReactCountryFlag countryCode="GB" svg className="w-6 h-4 cursor-pointer hover:scale-110 transition rounded-sm" />
            <ReactCountryFlag countryCode="FR" svg className="w-6 h-4 cursor-pointer hover:scale-110 transition rounded-sm" />
          </div>

          {/* COPYRIGHT */}
          <p className="text-center text-xs mt-6 text-gray-500">
            © 2025 Toyota Market
          </p>

        </div>

      </footer>

    </div>
  );
}