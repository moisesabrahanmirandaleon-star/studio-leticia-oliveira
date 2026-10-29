import React from 'react';
import { MapPin, Clock, ShieldCheck, Heart, Sparkles, Award, Coffee, CalendarCheck } from 'lucide-react';

export function AboutSection({ onOpenBooking, stylist }) {
  const currentStylist = stylist || {};
  const aboutTitle = currentStylist.aboutTitle || "Um refúgio de acolhimento e cuidado desenhado para realçar você.";
  const aboutDescription = currentStylist.aboutDescription || "O Studio Letícia Oliveira nasceu da paixão pelo visagismo facial e pela crença de que cada rosto possui uma harmonia única que merece ser respeitada. Com técnicas precisas de design, micropigmentação, brow lamination e despigmentação química, cada procedimento é personalizado para valorizar sua beleza com naturalidade e elegância.";
  const address = currentStylist.address || "Condomínio Altos da Theodomiro 2, 2435";
  const addressDetails = currentStylist.addressDetails || "2ª portaria (último prédio da rua), Bloco 6, Apê 652 – 5º andar";
  const experienceYears = (currentStylist.experienceYears || "Desde 2023")
    .replace(/[•·-]?\s*Visagismo/gi, '')
    .replace(/[•·-]?\s*Beleza/gi, '')
    .trim() || "Desde 2023";

  return (
    <section id="sobre" className="py-20 bg-[#FAF6F4] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left: Studio details & presentation */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBDCD5] text-[#7E4E40] text-xs font-semibold tracking-wider uppercase border border-[#DDBFB2]">
              <Heart className="w-3.5 h-3.5 text-[#B87F6C]" />
              Conheça o Nosso Espaço
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 leading-tight">
              {aboutTitle}
            </h2>

            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              {aboutDescription}
            </p>

            {/* Quality Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-white p-4.5 rounded-2xl border border-[#EBDCD5] shadow-xs flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[#FAF6F4] text-[#B87F6C] shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900">Biossegurança Rigorosa</h4>
                  <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                    Pinças esterilizadas em autoclave e materiais 100% descartáveis por cliente.
                  </p>
                </div>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-[#EBDCD5] shadow-xs flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[#FAF6F4] text-[#B87F6C] shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900">Pigmentos Premium</h4>
                  <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                    Hennas dermatologicamente testadas com tonalização equilibrada e duradoura.
                  </p>
                </div>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-[#EBDCD5] shadow-xs flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[#FAF6F4] text-[#B87F6C] shrink-0">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900">Atendimento Exclusivo</h4>
                  <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                    Horário dedicado a você, sem filas ou pressa, com ambiente privativo e acolhedor.
                  </p>
                </div>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-[#EBDCD5] shadow-xs flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[#FAF6F4] text-[#B87F6C] shrink-0">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900">Visagismo Personalizado</h4>
                  <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                    Mapeamento facial sob medida que respeita o formato natural do seu olhar.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Studio Card - Exclusive & Elegant */}
          <div className="lg:col-span-5">
            <div className="bg-gradient-to-br from-white via-[#FAF6F4] to-[#F5ECE8] rounded-3xl p-6 sm:p-8 border border-[#EBDCD5] shadow-lg space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#B87F6C]/10 rounded-full blur-2xl pointer-events-none" />
              
              {/* Header card badge */}
              <div className="flex items-center justify-between pb-4 border-b border-[#EBDCD5]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#B87F6C] text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-5 h-5 text-amber-200" />
                  </div>
                  <div>
                    <span className="font-serif font-bold text-stone-900 text-lg block leading-none">Studio {currentStylist.name || 'Letícia Oliveira'}</span>
                    <span className="text-[11px] text-[#A06654] font-medium tracking-wider uppercase mt-1 block">{experienceYears}</span>
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white border border-[#DDBFB2] text-[#B87F6C] shrink-0 shadow-xs">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">Endereço do Studio</span>
                  <p className="text-sm font-bold text-stone-900 mt-0.5">
                    {address}
                  </p>
                  <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                    {addressDetails}
                  </p>
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-[#EBDCD5] text-[#7E4E40] text-[10px] font-bold">
                    ✓ Ambiente privativo e acolhedor
                  </span>
                </div>
              </div>

              {/* Horário */}
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white border border-[#DDBFB2] text-[#B87F6C] shrink-0 shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">Horário de Atendimento</span>
                  <p className="text-sm font-bold text-stone-900 mt-0.5">
                    Segunda a Sexta: 09:00 às 19:00
                  </p>
                  <p className="text-xs text-stone-600 mt-0.5">Sábado: 09:00 às 17:00</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">Domingo: Fechado</p>
                </div>
              </div>

              {/* Botão de Agendamento */}
              {onOpenBooking && (
                <div className="pt-2">
                  <button
                    onClick={onOpenBooking}
                    className="w-full py-3.5 rounded-2xl bg-[#B87F6C] hover:bg-[#A06654] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>Agendar Atendimento no Studio</span>
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
