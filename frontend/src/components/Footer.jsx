import React from 'react';
import { Sparkles, Heart, MessageCircle, MapPin, Phone, Lock } from 'lucide-react';

export function Footer({ onOpenAdmin }) {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-stone-800">
          
          {/* Logo & Sobre */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#B87F6C] flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5 text-amber-100" />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-white block leading-none">
                  Letícia Oliveira
                </span>
                <span className="text-[11px] uppercase tracking-widest text-[#CCA08F] font-medium block mt-1">
                  Studio de Beleza & Sobrancelhas
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-400 max-w-sm leading-relaxed">
              Especialistas em visagismo facial, valorizando seu olhar através de técnicas exclusivas de design personalizado, henna e brow lamination.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com/leticia_r.oliveira"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-800 hover:bg-[#B87F6C] text-stone-300 hover:text-white transition-colors text-xs"
                title="Instagram @leticia_r.oliveira"
              >
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>@leticia_r.oliveira</span>
              </a>
              <a
                href="https://wa.me/5551995037223"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-stone-800 hover:bg-emerald-600 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
                title="WhatsApp (51) 99503-7223"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Procedimentos */}
          <div className="md:col-span-4 space-y-3">
            <h5 className="font-serif font-bold text-white text-base">
              Procedimentos
            </h5>
            <ul className="text-xs space-y-2 text-stone-400">
              <li>• Design de Sobrancelhas (R$ 35)</li>
              <li>• Design com Henna (R$ 50)</li>
              <li>• Brow Lamination (R$ 90)</li>
              <li>• Despigmentação Química (R$ 100)</li>
              <li>• Pacote Despigmentação 3 Sessões (R$ 255)</li>
              <li>• Epilação Facial & Buço</li>
            </ul>
          </div>

          {/* Atendimento & Local */}
          <div className="md:col-span-3 space-y-3">
            <h5 className="font-serif font-bold text-white text-base">
              Atendimento
            </h5>
            <div className="space-y-2 text-xs text-stone-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#B87F6C] shrink-0 mt-0.5" />
                <span>
                  Condomínio Altos da Theodomiro 2, 2435<br />
                  2ª Portaria • Bloco 6, Apê 652 (5º andar)
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#B87F6C] shrink-0" />
                <span>(51) 99503-7223</span>
              </p>
            </div>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <p>© {new Date().getFullYear()} Studio Letícia Oliveira. Todos os direitos reservados.</p>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="text-stone-500 hover:text-stone-300 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                title="Acesso da Dona ao painel de gestão"
              >
                <Lock className="w-3 h-3 text-[#B87F6C]" />
                <span>Área da Dona</span>
              </button>
            )}
          </div>
          <p className="flex items-center gap-1">
            Feito com <Heart className="w-3.5 h-3.5 text-[#B87F6C] fill-[#B87F6C]" /> para valorizar sua autoestima.
          </p>
        </div>

      </div>
    </footer>
  );
}
