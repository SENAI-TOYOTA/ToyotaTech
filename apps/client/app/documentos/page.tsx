/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import ReactCountryFlag from "react-country-flag";

// --- COMPONENTE DE PREVIEW PDF ---
interface PdfPreviewProps {
  url: string;
}

const PdfPreview = dynamic<PdfPreviewProps>(
  () => import("../componentes/pdfPreview").then((mod) => mod.default),
  { 
    ssr: false, 
    loading: () => <div className="text-[10px] text-gray-400">Carregando...</div> 
  }
);

export default function VehicleManagement() {
  
  const [mounted, setMounted] = useState(false);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [documents, setDocuments] = useState<
    Array<{ title: string; date: string; file: { url: string; type: string } | null }>
  >([
    { title: "Nota Fiscal", date: "03/10/2025", file: null },
    { title: "CRLV-e", date: "03/10/2025", file: null },
    { title: "Documentos", date: "03/10/2025", file: null },
    { title: "Manual do Veículo", date: "03/10/2025", file: null },
  ]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  const handleUpload = (index: number, file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const updated = [...documents];
      updated[index].file = { url: e.target?.result as string, type: file.type };
      setDocuments(updated);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f4f4] text-black">
      
      {/* header compartilhado no layout */}

      {/* ================= CONTEÚDO PRINCIPAL ================= */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-8 py-12">
        <h2 className="text-3xl font-bold mb-1">Documentos</h2>
        <p className="text-gray-500 text-sm mb-12">Documentos digitais, lembretes e mais - tudo num só lugar</p>

        {/* GRID SUPERIOR (DOCS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {documents.map((doc, i) => (
            <div key={i} className="bg-white rounded-[25px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 flex flex-col min-h-[350px]">
              <div className="h-40 bg-[#f9f9f9] rounded-2xl mb-5 flex items-center justify-center overflow-hidden relative border border-gray-50">
                {/* SÓ APARECE O PDF SE TIVER ARQUIVO */}
                {!doc.file ? (
                  <span className="text-gray-300 text-[10px] font-bold tracking-widest uppercase">Preview</span>
                ) : (
                  <>
                    {doc.file.type.startsWith("image") ? (
                      <img src={doc.file.url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      mounted && <PdfPreview url={doc.file.url} />
                    )}
                  </>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base mb-0.5">{doc.title}</h3>
                <p className="text-[11px] text-gray-400 mb-4">{doc.date}</p>
              </div>
              <div className="mt-auto">
                <p className="text-[10px] text-gray-400 mb-1">Nenhum arquivo escolhido</p>
                <input type="file" ref={el => { fileInputRefs.current[i] = el }} className="hidden" accept="image/*,.pdf" onChange={(e) => handleUpload(i, e.target.files?.[0])} />
                <button onClick={() => fileInputRefs.current[i]?.click()} className="text-[11px] font-bold text-gray-500 hover:text-black underline transition-all">
                  Escolher arquivo
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* SEÇÕES INFERIORES (MAIORES HORIZONTALMENTE) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Docs Digitais */}
          <div className="bg-white p-10 rounded-[25px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between min-h-[320px]">
            <div>
              <h3 className="font-bold text-xl mb-2">Documentos digitais</h3>
              <p className="text-xs text-gray-400 mb-8 leading-relaxed">Envie e guarde versões digitais do IPVA, licenciamento e garantia.</p>
              <select className="w-full border-gray-100 border rounded-xl p-4 text-sm bg-[#fafafa] mb-6 outline-none appearance-none">
                <option>IPVA</option>
                <option>Licenciamento</option>
                <option>Garantia</option>
              </select>
            </div>
            <button className="bg-[#efefef] text-gray-800 px-6 py-2.5 rounded-xl text-[11px] font-bold self-start">Escolher arquivo</button>
          </div>

          {/* Lembretes */}
          <div className="bg-white p-10 rounded-[25px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[320px]">
            <h3 className="font-bold text-xl mb-2">Lembretes</h3>
            <p className="text-xs text-gray-400 mb-8 leading-relaxed">Seguros, renovação e vencimentos - ative notificações.</p>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="text-sm font-bold">Seguro<br/><span className="text-[10px] font-normal text-gray-400">Renovação anual</span></div>
                <input type="date" className="border-gray-100 border rounded-xl p-3 text-xs w-40 bg-[#fafafa] outline-none" />
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm font-bold">Licenciamento<br/><span className="text-[10px] font-normal text-gray-400">Data de vencimento</span></div>
                <input type="date" className="border-gray-100 border rounded-xl p-3 text-xs w-40 bg-[#fafafa] outline-none" />
              </div>
            </div>
          </div>

          {/* Recall */}
          <div className="bg-white p-10 rounded-[25px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between min-h-[320px]">
            <div>
              <h3 className="font-bold text-xl mb-2">Programas de recall</h3>
              <p className="text-xs text-gray-400 mb-8 leading-relaxed">Notificações e agendamentos de reparos obrigatórios.</p>
              <p className="text-xs text-black mb-8 italic">Nenhum recall registrado.</p>
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="Título do recall" className="flex-1 border-gray-100 border rounded-xl p-3 text-xs bg-[#fafafa] outline-none" />
              <button className="bg-[#e40000] text-white px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest">Adicionar</button>
            </div>
          </div>

        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="bg-black text-gray-400 px-8 pt-20 pb-10 text-xs mt-20">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          <div>
            <h3 className="text-white font-bold mb-4 text-sm">About</h3>
            <ul className="space-y-2">
              <li className="hover:text-white cursor-pointer">Who are we?</li>
              <li className="hover:text-white cursor-pointer">Student Discount</li>
              <li className="hover:text-white cursor-pointer">We&apos;re hiring!</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4 text-sm">Help</h3>
            <ul className="space-y-2">
              <li className="hover:text-white cursor-pointer">Seller Portal</li>
              <li className="hover:text-white cursor-pointer">Payments</li>
              <li className="hover:text-white cursor-pointer">Contact us</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4 text-sm">Law and order</h3>
            <ul className="space-y-2">
              <li className="hover:text-white cursor-pointer">Terms of service</li>
              <li className="hover:text-white cursor-pointer">Data protection</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4 text-sm">Hello there!</h3>
            <ul className="space-y-2">
              <li className="hover:text-white cursor-pointer">Trustpilot</li>
              <li className="hover:text-white cursor-pointer">Glassdoor</li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto border-t border-gray-800 pt-8 flex flex-col items-center">
          <div className="flex gap-4 mb-6">
            <ReactCountryFlag countryCode="JP" svg style={{width: '20px'}} />
            <ReactCountryFlag countryCode="BR" svg style={{width: '20px'}} />
            <ReactCountryFlag countryCode="US" svg style={{width: '20px'}} />
            <ReactCountryFlag countryCode="GB" svg style={{width: '20px'}} />
          </div>
          <p className="text-[10px] tracking-[3px] text-gray-600 uppercase">© 2025 Toyota Market</p>
        </div>
      </footer>
    </div>
  );
}