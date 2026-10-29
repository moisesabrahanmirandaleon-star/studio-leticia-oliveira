import React, { useState } from 'react';
import { Calendar, Menu, X, Lock, Download, Smartphone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Navbar({ onOpenBooking, onOpenAdmin, onOpenInstall }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF6F4]/90 backdrop-blur-md border-b border-[#EBDCD5] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Oficial */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => scrollTo('hero')}>
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden shadow-sm border border-[#EBDCD5] bg-[#FEF1E8] shrink-0 transition-transform group-hover:scale-105">
              <img
                src="/logo-circle.png"
                alt="Studio Letícia Oliveira"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-900 block leading-none group-hover:text-[#B87F6C] transition-colors">
                Letícia Oliveira
              </span>
              <span className="text-[11px] uppercase tracking-widest text-[#A06654] font-medium block mt-1">
                Studio de Sobrancelhas
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
            <button onClick={() => scrollTo('hero')} className="hover:text-[#B87F6C] transition-colors cursor-pointer">
              Conheça a Letícia
            </button>
            <button onClick={() => scrollTo('servicos')} className="hover:text-[#B87F6C] transition-colors cursor-pointer">
              Serviços & Preços
            </button>
            <button onClick={() => scrollTo('bonus')} className="hover:text-[#B87F6C] transition-colors cursor-pointer flex items-center gap-1 text-[#B87F6C] font-semibold">
              <span>🎁 Bônus</span>
            </button>
            <button onClick={() => scrollTo('sobre')} className="hover:text-[#B87F6C] transition-colors cursor-pointer">
              Atendimento & Espaço
            </button>
            <button onClick={() => scrollTo('portfolio')} className="hover:text-[#B87F6C] transition-colors cursor-pointer">
              Galeria de Trabalhos
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Botão de Instalar App */}
            {onOpenInstall && (
              <button
                onClick={onOpenInstall}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#7E4E40] hover:text-stone-900 rounded-xl border border-[#DDBFB2] bg-[#F5ECE8]/60 hover:bg-[#F5ECE8] transition-all cursor-pointer shadow-2xs"
                title="Instalar aplicativo oficial no seu celular"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#B87F6C]" />
                <span>Instalar App</span>
              </button>
            )}

            {/* Acesso ao Painel */}
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-xl border border-[#DDBFB2] hover:bg-white transition-colors cursor-pointer"
              title="Acesso exclusivo da Dona"
            >
              <Lock className="w-3.5 h-3.5 text-[#B87F6C]" />
              <span>{isAuthenticated ? 'Painel Admin' : 'Área da Dona'}</span>
            </button>

            {/* Agendar Horário */}
            <button
              onClick={() => onOpenBooking()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#B87F6C] hover:bg-[#A06654] text-white text-sm font-medium shadow-md shadow-[#B87F6C]/20 hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-amber-200" />
              <span>Agendar Horário</span>
            </button>
          </div>

          {/* Mobile Right Bar */}
          <div className="flex md:hidden items-center gap-1.5">
            {onOpenInstall && (
              <button
                onClick={onOpenInstall}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#F5ECE8] text-[#7E4E40] border border-[#EBDCD5] text-[11px] font-bold active:scale-95"
                title="Instalar Aplicativo"
              >
                <Download className="w-3.5 h-3.5 text-[#B87F6C]" />
                <span>App</span>
              </button>
            )}

            <button
              onClick={() => onOpenBooking()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#B87F6C] text-white text-xs font-bold active:scale-95 shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-200" />
              <span>Agendar</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-stone-700 hover:bg-[#F5ECE8] active:scale-95"
              aria-label="Abrir Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#EBDCD5] px-4 pt-3 pb-6 space-y-3 shadow-xl animate-fadeIn">
          {/* Header Mobile com Logo */}
          <div className="flex items-center gap-3 pb-3 mb-2 border-b border-[#F5ECE8]">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#EBDCD5] bg-[#FEF1E8] shrink-0">
              <img src="/logo-circle.png" alt="Studio Letícia Oliveira" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-serif text-base font-bold text-stone-900 block leading-tight">
                Studio Letícia Oliveira
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#A06654] font-medium block">
                Studio de Sobrancelhas
              </span>
            </div>
          </div>

          <button
            onClick={() => scrollTo('hero')}
            className="block w-full text-left py-2 text-base font-medium text-stone-700 hover:text-[#B87F6C]"
          >
            Conheça a Letícia
          </button>
          <button
            onClick={() => scrollTo('servicos')}
            className="block w-full text-left py-2 text-base font-medium text-stone-700 hover:text-[#B87F6C]"
          >
            Serviços & Preços
          </button>
          <button
            onClick={() => scrollTo('bonus')}
            className="block w-full text-left py-2 text-base font-bold text-[#B87F6C]"
          >
            🎁 Bônus & Promoções
          </button>
          <button
            onClick={() => scrollTo('sobre')}
            className="block w-full text-left py-2 text-base font-medium text-stone-700 hover:text-[#B87F6C]"
          >
            Atendimento & Espaço
          </button>
          <button
            onClick={() => scrollTo('portfolio')}
            className="block w-full text-left py-2 text-base font-medium text-stone-700 hover:text-[#B87F6C]"
          >
            Galeria de Trabalhos
          </button>

          {/* Ações Especiais no Menu Mobile */}
          <div className="pt-3 border-t border-[#F5ECE8] flex flex-col gap-2.5">
            {onOpenInstall && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenInstall();
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-[#DDBFB2] text-sm font-bold text-[#7E4E40] bg-[#FAF6F4] shadow-xs active:scale-95"
              >
                <Smartphone className="w-4 h-4 text-[#B87F6C]" />
                <span>📱 Baixar / Instalar App Oficial</span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-50"
            >
              <Lock className="w-3.5 h-3.5 text-[#B87F6C]" />
              <span>{isAuthenticated ? 'Acessar Painel da Dona' : 'Área da Dona / Login'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
