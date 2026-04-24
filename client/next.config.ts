import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Isso impede o erro de DOMMatrix e problemas de exportação
  serverExternalPackages: ['pdfjs-dist'],
};

export default nextConfig;