"use client";

import { Document, Page, pdfjs } from "react-pdf";

// IMPORTANTE: Estilos para evitar blocos pretos/invisíveis
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configuração do Worker via CDN (Versão 5.x)
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfPreviewProps {
  url: string;
}

export default function PdfPreview({ url }: PdfPreviewProps) {
  return (
    <div className="flex items-center justify-center w-full h-full bg-white">
      <Document
        file={url}
        loading={<div className="text-[10px] text-gray-400">Carregando...</div>}
        error={<div className="text-[10px] text-red-500">Erro ao carregar PDF</div>}
      >
        <Page
          pageNumber={1}
          width={150} // Tente aumentar/diminuir para testar
          renderTextLayer={false}
          renderAnnotationLayer={false}
          className="max-w-full h-auto"
        />
      </Document>
    </div>
  );
}