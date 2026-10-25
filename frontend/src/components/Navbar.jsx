import React, { useState } from 'react';
import { Sparkles, Calendar, Menu, X, Lock, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Navbar({ onOpenBooking, onOpenAdmin }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

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
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo('hero')}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#B87F6C] to-[#CCA08F] flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-900 block leading-none">
                Letícia Oliveira
              </span>
              <span className="text-[11px] uppercase tracking-widest text-[#A06654] font-medium block mt-1">
                Studio de Beleza & Sobrancelhas
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            <button onClick={() => scrollTo('hero')} className="hover:text-[#B87F6C] transition-colors cursor-pointer">
              Conheça a Letícia
            </button>
            <button onClick={() => scrollTo('servicos')} className="hover:text-[#B87F6C] transition-colors cursor-pointer">
              Serviços & Preços
            </button>
            <button onClick={() => scrollTo('sobre')} className="hover:text-[#B87F6C] transition-colors cursor-pointer">
              Atendimento & Espaço
            </button>
            <button onClick={() => scrollTo('portfolio')} className="hover:text-[#B87F6C] transition-colors cursor-pointer">
              Galeria de Trabalhos
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-lg border border-[#DDBFB2] hover:bg-stone-50 transition-colors"
                title="Acesso da Dona / Estilista"
              >
                <Lock className="w-3.5 h-3.5 text-[#B87F6C]" />
                <span>Painel Admin</span>
              </button>
            )}

            <button
              onClick={() => onOpenBooking()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#B87F6C] hover:bg-[#A06654] text-white text-sm font-medium shadow-md shadow-[#B87F6C]/20 hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Calendar className="w-4 h-4 text-amber-200" />
              <span>Agendar Horário</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => onOpenBooking()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#B87F6C] text-white text-xs font-medium"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Agendar</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-700 hover:bg-[#F5ECE8]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#EBDCD5] px-4 pt-3 pb-6 space-y-3 shadow-xl animate-fadeIn">
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

          {isAuthenticated && (
            <div className="pt-3 border-t border-[#F5ECE8] flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-[#DDBFB2] text-sm font-semibold text-stone-700 bg-[#FAF6F4]"
              >
                <Lock className="w-4 h-4 text-[#B87F6C]" />
                <span>Acessar Painel da Dona</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
