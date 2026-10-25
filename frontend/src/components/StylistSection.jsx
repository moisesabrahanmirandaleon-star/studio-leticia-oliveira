import React from 'react';
import { Award, Sparkles, CheckCircle, Heart, MessageCircle, ShieldCheck, Smile } from 'lucide-react';

export function StylistSection({ stylists }) {
  const defaultBio = `Prazer, sou a Letícia! ✨

Tenho 25 anos e sempre fui apaixonada por embelezar mulheres. Antes mesmo de imaginar que isso se tornaria minha profissão, eu já era aquela pessoa que fazia as sobrancelhas de todo mundo. As pessoas gostavam de como eu fazia as minhas e logo começaram a me pedir para fazer as delas também.

Foi em 2023 que comecei a me enxergar nessa área e percebi que aquela paixão poderia se transformar em algo muito maior. Assim, dei início à minha caminhada no universo das sobrancelhas, descobrindo, a cada etapa, novas possibilidades de crescimento e realização.

Hoje, meu trabalho vai muito além de um procedimento estético. É sobre valorizar a beleza individual, respeitar cada expressão e contribuir para que cada mulher se sinta ainda mais bonita e confiante.

Sigo construindo minha história com dedicação, amor pelo que faço e o desejo de evoluir cada vez mais.

Seja bem-vinda ao meu espaço! Será um prazer cuidar de você.`;

  const mainStylist = stylists?.[0] || {
    name: 'Letícia Oliveira',
    bio: defaultBio,
    photoUrl: '/leticia-perfil.jpg',
    phone: '5551995037223'
  };

  const bioText = mainStylist.bio || defaultBio;
  const paragraphs = bioText
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section id="profissional" className="py-20 bg-gradient-to-b from-white via-[#FAF6F4] to-white border-b border-[#EBDCD5]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-5xl mx-auto bg-white rounded-3xl p-6 sm:p-10 md:p-12 border border-[#EBDCD5] shadow-lg relative overflow-hidden">
          {/* Fundo decorativo suave */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-rose-100/50 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            
            {/* Foto e Card da Letícia */}
            <div className="lg:col-span-5 flex flex-col items-center text-center">
              <div className="relative inline-block group">
                <div className="w-52 h-52 sm:w-64 sm:h-64 rounded-3xl overflow-hidden border-4 border-white shadow-2xl ring-4 ring-[#EBDCD5] transition-transform duration-300 group-hover:scale-[1.02]">
                  <img
                    src={mainStylist.photoUrl || '/leticia-perfil.jpg'}
                    alt={mainStylist.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Badge inferior sobre a foto */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#B87F6C] text-white text-xs font-bold shadow-md border-2 border-white flex items-center gap-1.5 whitespace-nowrap">
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>Desde 2023 • 25 Anos</span>
                </div>
              </div>

              {/* Redes e Contato Rápido */}
              <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
                <a
                  href="https://instagram.com/leticia_r.oliveira"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-xs font-bold text-[#B87F6C] hover:bg-rose-100 transition-colors shadow-sm"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>@leticia_r.oliveira</span>
                </a>

                <a
                  href="https://wa.me/5551995037223?text=Ol%C3%A1%20Let%C3%ADcia!%20Vi%20sua%20hist%C3%B3ria%20no%20site%20e%20gostaria%20de%20conversar%20sobre%20os%20procedimentos."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>(51) 99503-7223</span>
                </a>
              </div>

              {/* Destaques em pílulas */}
              <div className="mt-6 w-full space-y-2 text-left bg-[#FAF6F4] p-4 rounded-2xl border border-[#EBDCD5]">
                <div className="flex items-center gap-2 text-xs text-stone-700 font-medium">
                  <Heart className="w-3.5 h-3.5 text-[#B87F6C] shrink-0" />
                  <span>Atendimento acolhedor, privativo e com hora marcada</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-700 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B87F6C] shrink-0" />
                  <span>Biossegurança e materiais 100% descartáveis</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-700 font-medium">
                  <Smile className="w-3.5 h-3.5 text-[#B87F6C] shrink-0" />
                  <span>Visagismo: valorizando a sua beleza natural</span>
                </div>
              </div>
            </div>

            {/* Biografia Formatada */}
            <div className="lg:col-span-7 space-y-4 text-left">
              
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FAF6F4] text-[#7E4E40] text-xs font-bold uppercase tracking-wider border border-[#DDBFB2]">
                <Sparkles className="w-3.5 h-3.5 text-[#B87F6C]" />
                Conheça a Sua Designer
              </div>

              <div>
                <h3 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 leading-tight">
                  Prazer, sou a Letícia! ✨
                </h3>
                <p className="text-xs uppercase tracking-widest font-bold text-[#A06654] mt-1.5">
                  Designer de Sobrancelhas • Visagismo & Estética Facial
                </p>
              </div>

              {/* Texto da Biografia parágrafo a parágrafo */}
              <div className="space-y-3.5 text-stone-600 text-sm sm:text-base leading-relaxed pt-2">
                {paragraphs.map((p, idx) => {
                  // Destacar o parágrafo sobre a filosofia de transformar a autoestima
                  const isHighlight = p.includes('muito além de um procedimento estético');
                  const isGreeting = p.startsWith('Prazer, sou a Letícia');
                  const isClosing = p.includes('Seja bem-vinda ao meu espaço');

                  // Se for a saudação que já está no título, pulamos para evitar repetição
                  if (isGreeting && p.trim() === 'Prazer, sou a Letícia! ✨') {
                    return null;
                  }

                  if (isHighlight) {
                    return (
                      <div
                        key={idx}
                        className="my-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FAF6F4] to-[#F5ECE8] border-l-4 border-[#B87F6C] shadow-sm text-stone-800 font-serif italic text-sm sm:text-base leading-relaxed"
                      >
                        "{p}"
                      </div>
                    );
                  }

                  if (isClosing) {
                    return (
                      <div key={idx} className="pt-2 font-medium text-stone-800 text-sm sm:text-base">
                        <p>{p}</p>
                      </div>
                    );
                  }

                  return (
                    <p key={idx} className="text-stone-600">
                      {p}
                    </p>
                  );
                })}
              </div>

              {/* Rodapé do card da biografia */}
              <div className="pt-4 border-t border-[#EBDCD5] flex flex-wrap items-center gap-3 text-xs font-semibold text-stone-700">
                <span className="inline-flex items-center gap-1.5 bg-[#FAF6F4] px-3 py-1.5 rounded-xl border border-[#EBDCD5]">
                  <CheckCircle className="w-3.5 h-3.5 text-[#B87F6C]" />
                  Design Personalizado
                </span>
                <span className="inline-flex items-center gap-1.5 bg-[#FAF6F4] px-3 py-1.5 rounded-xl border border-[#EBDCD5]">
                  <CheckCircle className="w-3.5 h-3.5 text-[#B87F6C]" />
                  Henna & Mapeamento
                </span>
                <span className="inline-flex items-center gap-1.5 bg-[#FAF6F4] px-3 py-1.5 rounded-xl border border-[#EBDCD5]">
                  <CheckCircle className="w-3.5 h-3.5 text-[#B87F6C]" />
                  Brow Lamination
                </span>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
