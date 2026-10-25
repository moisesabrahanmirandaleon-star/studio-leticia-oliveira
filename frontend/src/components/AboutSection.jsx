import React from 'react';
import { MapPin, Clock, ShieldCheck, Heart, Sparkles, Award } from 'lucide-react';

export function AboutSection() {
  return (
    <section id="sobre" className="py-20 bg-[#FAF6F4] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Studio details & presentation */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBDCD5] text-[#7E4E40] text-xs font-semibold tracking-wider uppercase border border-[#DDBFB2]">
              <Heart className="w-3.5 h-3.5 text-[#B87F6C]" />
              Conheça o Nosso Espaço
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 leading-tight">
              Um refúgio de acolhimento e cuidado desenhado para realçar você.
            </h2>

            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              O <strong>Studio Letícia Oliveira</strong> nasceu da paixão pelo visagismo facial e pela crença de que cada rosto possui uma harmonia única que merece ser respeitada. Com técnicas precisas de design, micropigmentação, brow lamination e despigmentação química, cada procedimento é personalizado para valorizar sua beleza com naturalidade e elegância.
            </p>

            {/* Quality Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-white p-4 rounded-2xl border border-[#EBDCD5] shadow-sm flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[#FAF6F4] text-[#B87F6C]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900">Biossegurança Rigorosa</h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Pinças esterilizadas em autoclave e materiais 100% descartáveis por cliente.
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#EBDCD5] shadow-sm flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[#FAF6F4] text-[#B87F6C]">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900">Pigmentos Premium</h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Hennas dermatologicamente testadas com tonalização equilibrada e duradoura.
                  </p>
                </div>
              </div>
            </div>

            {/* Studio Info Cards (Location & Hours) */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-white/80 rounded-2xl border border-[#DDBFB2]">
                <MapPin className="w-5 h-5 text-[#B87F6C] shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">Endereço</span>
                  <p className="text-sm font-semibold text-stone-900 mt-0.5">
                    Condomínio Altos da Theodomiro 2, 2435
                  </p>
                  <p className="text-xs text-stone-600 mt-0.5">
                    2ª portaria (último prédio da rua)<br />
                    Bloco 6, Apê 652 – 5º andar
                  </p>
                  <span className="text-[11px] text-[#B87F6C] font-medium block mt-1">
                    Ambiente privativo e acolhedor
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/80 rounded-2xl border border-[#DDBFB2]">
                <Clock className="w-5 h-5 text-[#B87F6C] shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">Horário de Atendimento</span>
                  <p className="text-sm font-semibold text-stone-900 mt-0.5">
                    Segunda a Sexta: 09:00 às 19:00
                  </p>
                  <p className="text-xs text-stone-600">Sábado: 09:00 às 17:00</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">Domingo: Fechado</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right: Studio Atmosphere Photos */}
          <div className="lg:col-span-5 relative">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-3.5">
                <img
                  src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80"
                  alt="Espaço Studio"
                  loading="lazy"
                  decoding="async"
                  className="rounded-2xl shadow-md h-48 w-full object-cover transform-gpu"
                />
                <img
                  src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80"
                  alt="Materiais higienizados"
                  loading="lazy"
                  decoding="async"
                  className="rounded-2xl shadow-md h-56 w-full object-cover transform-gpu"
                />
              </div>
              <div className="space-y-3.5 pt-6">
                <img
                  src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80"
                  alt="Atendimento personalizado"
                  loading="lazy"
                  decoding="async"
                  className="rounded-2xl shadow-md h-56 w-full object-cover transform-gpu"
                />
                <div className="bg-[#B87F6C] text-white p-5 rounded-2xl flex flex-col justify-center text-center shadow-md h-48">
                  <Sparkles className="w-6 h-6 mx-auto mb-2 text-amber-200" />
                  <span className="font-serif text-2xl font-bold">Desde 2023</span>
                  <span className="text-xs text-amber-100 uppercase tracking-widest mt-1">Dedicada à sua beleza</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
