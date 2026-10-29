import React from 'react';
import { Calendar, MessageCircle, Star, Sparkles, CheckCircle2, Heart, ShieldCheck } from 'lucide-react';
import leticiaPerfilPhoto from '../assets/leticia-perfil.jpg';

export function Hero({ onOpenBooking, stylist }) {
  const currentStylist = stylist || {};
  const phone = currentStylist.phone || '5551995037223';
  const cleanPhone = phone.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent("Olá Letícia! Vi sua apresentação no site e gostaria de agendar um atendimento.")}`;

  const greetingBadge = currentStylist.greetingBadge || "Prazer, sou a Letícia! ✨ • 25 Anos";
  const headline = currentStylist.headline || "Cuidando do seu olhar com amor, visagismo & dedicação.";
  const heroQuote = currentStylist.heroQuote || `"Hoje, meu trabalho vai muito além de um procedimento estético. É sobre valorizar a beleza individual, respeitar cada expressão e contribuir para que cada mulher se sinta ainda mais bonita e confiante."`;

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

          {/* Right: Letícia's Framed Portrait & Social Badges */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm lg:max-w-none">
              
              {/* Moldura decorativa externa com blur suave */}
              <div className="absolute -inset-2.5 rounded-3xl bg-gradient-to-tr from-[#B87F6C]/30 via-[#CCA08F]/20 to-transparent blur-lg -z-10" />

              <div className="rounded-3xl overflow-hidden bg-white p-2.5 shadow-2xl border border-[#EBDCD5]">
                <img
                  src={displayPhoto}
                  alt={currentStylist.name || "Letícia Oliveira Designer de Sobrancelhas"}
                  loading="eager"
                  decoding="async"
                  className="w-full h-[400px] sm:h-[480px] object-cover rounded-2xl transform-gpu"
                />
              </div>

              {/* Floating review card */}
              <div className="absolute -bottom-6 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-[#EBDCD5] flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#FAF6F4] text-[#B87F6C] flex items-center justify-center font-serif text-lg font-bold border border-[#EBDCD5]">
                  5.0
                </div>
                <div>
                  <div className="flex text-amber-400 text-xs">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs font-bold text-stone-900 mt-0.5">Visagismo de Excelência</p>
                  <p className="text-[11px] text-stone-500">Procedimento exclusivo & natural</p>
                </div>
              </div>

              {/* Experiência Badge */}
              <div className="absolute top-4 right-4 bg-[#B87F6C] text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg border border-white/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>{currentStylist.experienceYears || 'Desde 2023'}</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
