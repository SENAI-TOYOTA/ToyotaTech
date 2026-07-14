"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/ui/Button';

export default function CadastroPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Estados do Formulário - Dados Pessoais
  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    cpf: '',
    telefone: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    // Veículo
    chassi: '',
    // Endereço
    cep: '',
    rua: '',
    numero: '',
    bairro: '',
    complemento: '',
    cidade: '',
    estado: ''
  });

  // Estados de controle da simulação do Chassi
  const [isChassiMode, setIsChassiMode] = useState<boolean>(true);
  const [chassiSearchActive, setChassiSearchActive] = useState<boolean>(false);
  const [carFound, setCarFound] = useState<boolean>(false);

  // Manipulador de mudanças nos inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Simulação de Busca do Chassi (Mocked)
  const handleChassiSearch = () => {
    if (!formData.chassi) return;
    setChassiSearchActive(true);
    // Simula atraso da busca da API
    setTimeout(() => {
      setCarFound(true);
      setChassiSearchActive(false);
    }, 1000);
  };

  // Simulação de preenchimento do CEP (Mocked)
  const handleCepSearch = () => {
    if (formData.cep.length >= 8) {
      setFormData(prev => ({
        ...prev,
        rua: 'Av. Paulista',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP'
      }));
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Redireciona para o portal do cliente após concluir
    router.push('/cliente');
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-between py-10 px-4">
      {/* Header */}
      <header className="max-w-[1180px] w-full mx-auto flex justify-between items-center px-4">
        <div className="text-2xl font-extrabold tracking-tight">
          <span className="text-toyota-red">Toyota</span>
          <span className="text-ink">Tech</span>
        </div>
      </header>

      {/* Card de Cadastro Centralizado */}
      <main className="flex-1 flex flex-col items-center justify-center my-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-ink tracking-tight">Bem vindo<span className="text-toyota-red">!</span></h1>
          <p className="text-ink-soft text-sm font-medium mt-1">Faça seu cadastro</p>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-toyota-md w-full max-w-[580px] p-8 md:p-10 relative">
          
          {/* Header de Progresso das Etapas */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className={`h-1.5 w-full rounded-full transition-colors ${currentStep >= 1 ? 'bg-toyota-red' : 'bg-border'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${currentStep === 1 ? 'text-toyota-red' : 'text-ink-soft'}`}>1. Identificação</span>
            </div>
            <div className="w-4" />
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className={`h-1.5 w-full rounded-full transition-colors ${currentStep >= 2 ? 'bg-toyota-red' : 'bg-border'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${currentStep === 2 ? 'text-toyota-red' : 'text-ink-soft'}`}>2. Veículo</span>
            </div>
            <div className="w-4" />
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className={`h-1.5 w-full rounded-full transition-colors ${currentStep >= 3 ? 'bg-toyota-red' : 'bg-border'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${currentStep === 3 ? 'text-toyota-red' : 'text-ink-soft'}`}>3. Acesso</span>
            </div>
          </div>

          {/* Form Multistep */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* ETAPA 1: DADOS PESSOAIS */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <h2 className="text-lg font-extrabold text-ink">Ative sua Conta ToyotaTech</h2>
                  <p className="text-xs text-ink-soft">Informe seus dados pessoais para validar sua identidade. Suas informações devem coincidir com os dados de compra do veículo.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-ink">Nome <span className="text-toyota-red">*</span></label>
                    <input 
                      type="text" name="nome" value={formData.nome} onChange={handleChange} required placeholder="Ex: Thiago"
                      className="bg-gray-50 border border-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-toyota-red"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-ink">Sobrenome <span className="text-toyota-red">*</span></label>
                    <input 
                      type="text" name="sobrenome" value={formData.sobrenome} onChange={handleChange} required placeholder="Ex: Antunes"
                      className="bg-gray-50 border border-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-toyota-red"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-ink">CPF <span className="text-toyota-red">*</span></label>
                    <input 
                      type="text" name="cpf" value={formData.cpf} onChange={handleChange} required placeholder="000.000.000-00"
                      className="bg-gray-50 border border-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-toyota-red"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-ink">Telefone <span className="text-toyota-red">*</span></label>
                    <input 
                      type="tel" name="telefone" value={formData.telefone} onChange={handleChange} required placeholder="(00) 00000-0000"
                      className="bg-gray-50 border border-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-toyota-red"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-ink">Endereço de e-mail <span className="text-toyota-red">*</span></label>
                  <input 
                    type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="usuario@gmail.com"
                    className="bg-gray-50 border border-border rounded-xl px-4 py-3 text-xs w-full focus:outline-none focus:border-toyota-red"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-ink">Senha <span className="text-toyota-red">*</span></label>
                    <input 
                      type="password" name="senha" value={formData.senha} onChange={handleChange} required placeholder="••••"
                      className="bg-gray-50 border border-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-toyota-red"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-ink">Confirmar senha <span className="text-toyota-red">*</span></label>
                    <input 
                      type="password" name="confirmarSenha" value={formData.confirmarSenha} onChange={handleChange} required placeholder="••••"
                      className="bg-gray-50 border border-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-toyota-red"
                    />
                  </div>
                </div>
                <span className="text-[10px] text-ink-soft block">🛡️ Mínimo de 6 caracteres, com letras e números.</span>

                <div className="flex justify-end pt-4">
                  <Button type="button" onClick={nextStep} variant="solid">
                    Próxima etapa
                  </Button>
                </div>
              </div>
            )}

            {/* ETAPA 2: VEÍCULO */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <h2 className="text-lg font-extrabold text-ink">Vincule seu Veículo</h2>
                  <p className="text-xs text-ink-soft">Informe o número do chassi ou a placa para identificarmos o veículo adquirido e ativar o rastreamento na plataforma.</p>
                </div>

                {/* Seletor Abstrato Chassi / Placa */}
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button 
                    type="button" onClick={() => setIsChassiMode(true)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isChassiMode ? 'bg-white shadow-sm text-ink' : 'text-ink-soft'}`}
                  >
                    Chassi
                  </button>
                  <button 
                    type="button" onClick={() => setIsChassiMode(false)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isChassiMode ? 'bg-white shadow-sm text-ink' : 'text-ink-soft'}`}
                  >
                    Placa
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-ink">Número do Chassi <span className="text-toyota-red">*</span></label>
                  <div className="flex gap-2">
                    <input 
                      type="text" name="chassi" value={formData.chassi} onChange={handleChange} required placeholder="Ex: 9BR*******3456"
                      className="bg-gray-50 border border-border rounded-xl px-4 py-3 text-xs flex-1 focus:outline-none focus:border-toyota-red"
                    />
                    <button 
                      type="button" onClick={handleChassiSearch}
                      className="bg-toyota-red hover:bg-toyota-red-deep text-white px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      🔍 Buscar
                    </button>
                  </div>
                  <span className="text-[10px] text-ink-soft">ℹ️ O chassi está na nota fiscal, CRLV-e no canto inferior do para-brisa.</span>
                </div>

                {/* Resultado Simulado da Busca */}
                {chassiSearchActive && (
                  <div className="p-4 bg-gray-50 border rounded-xl flex items-center justify-center text-xs text-ink-soft">
                    Buscando registro no banco de dados da fábrica...
                  </div>
                )}

                {carFound && (
                  <div className="p-4 bg-gray-50 border border-border rounded-xl flex gap-4 items-center animate-fadeIn">
                    <div className="w-16 h-12 bg-white rounded-lg p-1 border flex items-center justify-center">
                      <span className="text-lg">🚗</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-ink">Toyota Corolla Cross XRX</h4>
                      <p className="text-[10px] text-ink-soft">Chassi 9BR*******3456 · Ano 2026</p>
                      <span className="text-[9px] font-bold text-green-600">✓ Veículo encontrado</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t border-border">
                  <button type="button" onClick={prevStep} className="px-5 py-2.5 border border-border hover:border-ink text-ink text-xs font-bold rounded-xl transition-all">
                    ← Voltar
                  </button>
                  <Button type="button" onClick={nextStep} variant="solid" disabled={!carFound}>
                    Próxima etapa
                  </Button>
                </div>
              </div>
            )}

            {/* ETAPA 3: ENDEREÇO E SEGURANÇA */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <h2 className="text-lg font-extrabold text-ink">Endereço e Segurança</h2>
                  <p className="text-xs text-ink-soft">Seu CEP irá autocompletar os dados de localização.</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-ink">CEP <span className="text-toyota-red">*</span></label>
                  <div className="flex gap-2">
                    <input 
                      type="text" name="cep" value={formData.cep} onChange={handleChange} onKeyUp={handleCepSearch} required placeholder="00000-000"
                      className="bg-gray-50 border border-border rounded-xl px-4 py-3 text-xs flex-1 focus:outline-none focus:border-toyota-red"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-ink">Rua</label>
                    <input 
                      type="text" name="rua" value={formData.rua} onChange={handleChange} placeholder="Av. Paulista"
                      className="bg-gray-50 border border-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-toyota-red"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-ink">Nº <span className="text-toyota-red">*</span></label>
                    <input 
                      type="text" name="numero" value={formData.numero} onChange={handleChange} required placeholder="Ex: 100"
                      className="bg-gray-50 border border-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-toyota-red"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-ink">Bairro</label>
                    <input 
                      type="text" name="bairro" value={formData.bairro} onChange={handleChange} placeholder="Bela Vista"
                      className="bg-gray-50 border border-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-toyota-red"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-ink">Complemento</label>
                    <input 
                      type="text" name="complemento" value={formData.complemento} onChange={handleChange} placeholder="Apto, bloco (opcional)"
                      className="bg-gray-50 border border-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-toyota-red"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-ink">Cidade</label>
                    <input 
                      type="text" name="cidade" value={formData.cidade} onChange={handleChange} placeholder="São Paulo"
                      className="bg-gray-50 border border-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-toyota-red"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-ink">Estado</label>
                    <select 
                      name="estado" value={formData.estado} onChange={handleChange}
                      className="bg-gray-50 border border-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-toyota-red"
                    >
                      <option value="">Selecione</option>
                      <option value="SP">São Paulo</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="MG">Minas Gerais</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2">
                  <input type="checkbox" required className="mt-0.5" />
                  <span className="text-[10px] text-ink-soft">
                    Ao ativar minha conta, concordo com os <span className="text-toyota-red underline cursor-pointer">Termos de Uso</span> e a <span className="text-toyota-red underline cursor-pointer">Política de Privacidade</span> da plataforma ToyotaTech.
                  </span>
                </div>

                <div className="flex justify-between pt-4 border-t border-border">
                  <button type="button" onClick={prevStep} className="px-5 py-2.5 border border-border hover:border-ink text-ink text-xs font-bold rounded-xl transition-all">
                    ← Voltar
                  </button>
                  <Button type="submit" variant="solid">
                    Concluir cadastro
                  </Button>
                </div>
              </div>
            )}

          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-[1180px] w-full mx-auto text-center text-xs text-ink-soft pt-4 border-t border-border/10">
        © 2026 ToyotaTech. Projeto Acadêmico · UNISENAI Sorocaba.
      </footer>
    </div>
  );
}