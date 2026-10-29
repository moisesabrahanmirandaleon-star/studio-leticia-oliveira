import React from 'react';
import { Calendar, MessageCircle, Star, Sparkles, CheckCircle2, Heart, ShieldCheck } from 'lucide-react';
import leticiaPerfilPhoto from '../assets/leticia-perfil.jpg';
import { formatPhoneDisplay, buildWhatsAppUrl } from '../utils/phoneUtils';

export function Hero({ onOpenBooking, stylist }) {
  const currentStylist = stylist || {};
  const rawPhone = currentStylist.phone || '5551995037223';
  const displayPhone = formatPhoneDisplay(rawPhone) || '(51) 99503-7223';
  const whatsappUrl = buildWhatsAppUrl(rawPhone, "Olá Letícia! Vi sua apresentação no site e gostaria de agendar um atendimento.");

  const rawInstagram = currentStylist.instagram || '@leticia_studiosobrancelhas';
  const cleanInstagramHandle = rawInstagram.replace(/^@/, '').trim() || 'leticia_studiosobrancelhas';
  const displayInstagram = `@${cleanInstagramHandle}`;
  const instagramUrl = `https://instagram.com/${cleanInstagramHandle}`;

  const greetingBadge = currentStylist.greetingBadge || "Prazer, sou a Letícia! ✨ • 25 Anos";
  const headline = currentStylist.headline || "Cuidando do seu olhar com amor, visagismo & dedicação.";
  const heroQuote = currentStylist.heroQuote || `"Hoje, meu trabalho vai muito além de um procedimento estético. É sobre valorizar a beleza individual, respeitar cada expressão e contribuir para que cada mulher se sinta ainda mais bonita e confiante."`;

  const rawExperienceYears = currentStylist.experienceYears || 'Desde 2023';
  const cleanExperienceYears = rawExperienceYears
    .replace(/[•·-]?\s*Visagismo/gi, '')
    .replace(/[•·-]?\s*Beleza/gi, '')
    .trim() || 'Desde 2023';

  const defaultBio = `Sempre fui apaixonada por embelezar mulheres. Antes mesmo de imaginar que isso se tornaria minha profissão, eu já era aquela pessoa que fazia as sobrancelhas de todo mundo. As pessoas gostavam de como eu fazia as minhas e logo começaram a me pedir para fazer as delas também.\n\nFoi em 2023 que comecei a me enxergar nessa área e percebi que aquela paixão poderia se transformar em algo muito maior. Assim, dei início à minha caminhada no universo das sobrancelhas, descobrindo novas possibilidades de crescimento e realização.`;

  const bioText = currentStylist.bio || defaultBio;
  const bioParagraphs = bioText.split('\n\n').map(p => p.trim()).filter(Boolean);

  const displayPhoto = (currentStylist.photoUrl && currentStylist.photoUrl !== '/leticia-perfil.jpg')
    ? currentStylist.photoUrl
    : leticiaPerfilPhoto;

  return (
    <section id="hero" className="relative overflow-hidden pt-8 pb-16 md:py-20 bg-gradient-to-b from-[#FAF6F4] via-[#F5ECE8] to-[#FAF6F4]">
      {/* Decorative ambient elements */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-[#CCA08F]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-20 right-0 w-80 h-80 bg-[#B87F6C]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left: Letícia's Presentation & Biography */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBDCD5] text-[#7E4E40] text-xs sm:text-sm font-semibold tracking-wide border border-[#DDBFB2]/60 shadow-sm">
              <Sparkles className="w-4 h-4 text-[#B87F6C]" />
              <span>{greetingBadge}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 tracking-tight leading-[1.2]">
              {headline}
            </h1>

            {/* Texto Autêntico da Biografia (Totalmente editável pelo Admin) */}
            <div className="space-y-3.5 text-stone-600 text-sm sm:text-base leading-relaxed text-left">
              {bioParagraphs.map((par, idx) => (
                <p key={idx}>{par}</p>
              ))}

              {/* Citação em destaque (Pull-quote editável) */}
              {heroQuote && (
                <div className="my-2 p-4 rounded-2xl bg-white/90 border-l-4 border-[#B87F6C] shadow-sm text-stone-800 font-serif italic text-sm sm:text-base leading-relaxed">
                  {heroQuote.startsWith('"') ? heroQuote : `"${heroQuote}"`}
                </div>
              )}

              <p className="font-medium text-stone-800">
                Sigo construindo minha história com amor pelo que faço. Seja bem-vinda ao meu espaço! Será um prazer cuidar de você. 💖
              </p>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <button
                onClick={() => onOpenBooking()}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-[#B87F6C] hover:bg-[#A06654] text-white text-sm sm:text-base font-semibold shadow-xl shadow-[#B87F6C]/25 hover:shadow-2xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Calendar className="w-5 h-5 text-amber-200" />
                <span>Agendar Horário Online</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-stone-50 text-stone-800 text-sm sm:text-base font-semibold border border-[#DDBFB2] shadow-sm hover:border-[#B87F6C] transition-all"
              >
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <span>Conversar no WhatsApp</span>
              </a>
            </div>

            {/* Micro pilares de confiança */}
            <div className="pt-2 flex flex-wrap justify-center lg:justify-start gap-3 text-xs text-stone-700 font-medium">
              <div className="flex items-center gap-1.5 bg-white/70 px-3 py-1.5 rounded-xl border border-[#EBDCD5]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#B87F6C]" />
                <span>Atendimento exclusivo e privativo</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/70 px-3 py-1.5 rounded-xl border border-[#EBDCD5]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B87F6C]" />
                <span>Biossegurança e descartáveis</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/70 px-3 py-1.5 rounded-xl border border-[#EBDCD5]">
                <Heart className="w-3.5 h-3.5 text-[#B87F6C]" />
                <span>Visagismo personalizado</span>
              </div>
            </div>

          </div>

          {/* Right: Letícia's Framed Portrait & Floating Social Badges */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative mx-auto max-w-sm lg:max-w-none">
              
              {/* Moldura decorativa externa com blur suave */}
              <div className="absolute -inset-2.5 rounded-3xl bg-gradient-to-tr from-[#B87F6C]/30 via-[#CCA08F]/20 to-transparent blur-lg -z-10" />

              <div className="rounded-3xl overflow-hidden bg-white p-2.5 shadow-2xl border border-[#EBDCD5]">
                <img
                  src={displayPhoto}
                  alt={currentStylist.name || "Letícia Oliveira Designer de Sobrancelhas"}
                  loading="eager"
                  decoding="async"
                  className="w-full h-[410px] sm:h-[490px] object-cover rounded-2xl transform-gpu"
                />
              </div>

              {/* Floating Experiência Badge (Top-Left) */}
              <div className="absolute top-5 -left-2 sm:-left-4 z-20 bg-[#B87F6C] text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg border border-white/40 flex items-center gap-1.5 transform hover:scale-105 transition-transform">
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>{cleanExperienceYears}</span>
              </div>

              {/* Floating Instagram Icon Button (Bottom-Left) */}
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute -bottom-4 left-3 sm:left-4 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shadow-xl border-2 border-white hover:scale-110 active:scale-95 transition-all cursor-pointer group"
                title="Instagram da Letícia"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current transition-transform group-hover:rotate-6" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* Floating WhatsApp Icon Button (Bottom-Right - Na outra esquina da foto) */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute -bottom-4 right-3 sm:right-4 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-xl border-2 border-white hover:scale-110 active:scale-95 transition-all cursor-pointer group"
                title="Conversar no WhatsApp"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-current transition-transform group-hover:scale-110" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 border-2 border-white"></span>
                </span>
              </a>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
