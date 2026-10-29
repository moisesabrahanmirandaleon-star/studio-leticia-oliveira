import React from 'react';
import { Sparkles, Heart, MessageCircle, MapPin, Phone, Lock, Globe } from 'lucide-react';
import { buildWhatsAppUrl } from '../utils/phoneUtils';

export function Footer({ onOpenAdmin, stylist }) {
  const currentStylist = stylist || {};
  const phone = currentStylist.phone || '5551995037223';
  const cleanPhone = phone.replace(/\D/g, '');
  const instagram = currentStylist.instagram || '@leticia_studiosobrancelhas';
  const cleanInsta = instagram.replace('@', '').trim();
  const address = currentStylist.address || 'Condomínio Altos da Theodomiro 2, 2435';
  const addressDetails = currentStylist.addressDetails || '2ª Portaria • Bloco 6, Apê 652 (5º andar)';

  let customSocials = [];
  if (currentStylist.otherSocials) {
    try {
      customSocials = typeof currentStylist.otherSocials === 'string'
        ? JSON.parse(currentStylist.otherSocials)
        : currentStylist.otherSocials;
    } catch (e) {
      customSocials = [];
    }
  }

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
                  {currentStylist.name || 'Letícia Oliveira'}
                </span>
                <span className="text-[11px] uppercase tracking-widest text-[#CCA08F] font-medium block mt-1">
                  Studio de Beleza & Sobrancelhas
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-400 max-w-sm leading-relaxed">
              Especialistas em visagismo facial, valorizando seu olhar através de técnicas exclusivas de design personalizado, henna e brow lamination.
            </p>

            {/* Redes Sociais Dinâmicas */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              {/* Instagram */}
              {cleanInsta && (
                <a
                  href={`https://instagram.com/${cleanInsta}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-800 hover:bg-[#B87F6C] text-stone-300 hover:text-white transition-colors text-xs"
                  title={`Instagram @${cleanInsta}`}
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>@{cleanInsta}</span>
                </a>
              )}

              {/* WhatsApp */}
              {phone && (
                <a
                  href={buildWhatsAppUrl(phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-stone-800 hover:bg-emerald-600 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}

              {/* Facebook */}
              {currentStylist.facebook && (
                <a
                  href={currentStylist.facebook.startsWith('http') ? currentStylist.facebook : `https://facebook.com/${currentStylist.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-stone-800 hover:bg-blue-600 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
                  title="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.688 5H18V0h-3.808C10.597 0 9 1.583 9 4.615V8z" />
                  </svg>
                </a>
              )}

              {/* Twitter / X */}
              {currentStylist.twitter && (
                <a
                  href={currentStylist.twitter.startsWith('http') ? currentStylist.twitter : `https://x.com/${currentStylist.twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-stone-800 hover:bg-neutral-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
                  title="Twitter / X"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}

              {/* TikTok */}
              {currentStylist.tiktok && (
                <a
                  href={currentStylist.tiktok.startsWith('http') ? currentStylist.tiktok : `https://tiktok.com/@${currentStylist.tiktok.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
                  title="TikTok"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.54c.03 2.51-1.01 5.01-2.9 6.64-1.9 1.64-4.57 2.37-7.05 1.83-2.49-.55-4.63-2.31-5.61-4.63-1-2.33-.65-5.13.88-7.11 1.52-1.98 4-3.08 6.52-2.84v4.11c-1.07-.15-2.19.19-2.93.97-.73.78-.96 1.94-.61 2.95.34 1.01 1.34 1.72 2.41 1.71 1.25-.01 2.31-.96 2.41-2.21.05-1.57.02-3.14.03-4.71V.02z" />
                  </svg>
                </a>
              )}

              {/* Redes Adicionais Customizadas */}
              {Array.isArray(customSocials) && customSocials.map((soc, idx) => (
                <a
                  key={idx}
                  href={soc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-full bg-stone-800 hover:bg-[#B87F6C] text-stone-300 hover:text-white transition-colors text-xs flex items-center gap-1"
                  title={soc.label || soc.name}
                >
                  <Globe className="w-3 h-3 text-[#CCA08F]" />
                  <span>{soc.label || soc.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Procedimentos */}
          <div className="md:col-span-4 space-y-3">
            <h5 className="font-serif font-bold text-white text-base">
              Procedimentos
            </h5>
            <ul className="text-xs space-y-2 text-stone-400">
              <li>• Design de Sobrancelhas Personalizado</li>
              <li>• Design com Henna & Visagismo</li>
              <li>• Brow Lamination & Alinhamento</li>
              <li>• Despigmentação Química Facial</li>
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
                  {address}<br />
                  {addressDetails}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#B87F6C] shrink-0" />
                <span>{phone}</span>
              </p>
            </div>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <p>© {new Date().getFullYear()} Studio {currentStylist.name || 'Letícia Oliveira'}. Todos os direitos reservados.</p>
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

          <div className="flex items-center gap-2">
            <span>Visagismo & Cuidado</span>
            <span className="text-[#B87F6C]">•</span>
            <span>Feito com amor</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 ml-0.5 inline" />
          </div>
        </div>

      </div>
    </footer>
  );
}
