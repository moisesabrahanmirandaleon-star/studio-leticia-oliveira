import React from 'react';
import { Clock, Sparkles, ChevronRight, Check } from 'lucide-react';

export function ServicesSection({ services, onSelectService }) {
  const getBadge = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('pacote')) return { text: 'Economize R$ 45', color: 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold' };
    if (lower.includes('despigmentação')) return { text: 'Tratamento Especial', color: 'bg-purple-100 text-purple-800 border-purple-200' };
    if (lower.includes('henna')) return { text: 'Mais Pedido', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    if (lower.includes('lamination')) return { text: 'Destaque', color: 'bg-rose-100 text-[#7E4E40] border-rose-200' };
    if (lower.includes('buço')) return { text: 'Rápido 10 min', color: 'bg-stone-100 text-stone-700 border-stone-200' };
    return null;
  };

  return (
    <section id="servicos" className="py-20 bg-white border-y border-[#EBDCD5]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F4] text-[#7E4E40] text-xs font-semibold uppercase tracking-wider mb-3 border border-[#EBDCD5]">
            <Sparkles className="w-3.5 h-3.5 text-[#B87F6C]" />
            Menu de Procedimentos
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            Serviços & Investimento
          </h2>
          <p className="mt-3 text-stone-600 text-sm sm:text-base">
            Cada atendimento é realizado de forma minuciosa, com visagismo para valorizar seu formato de rosto. Escolha seu procedimento e agende online em instantes.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const badge = getBadge(service.name);

            return (
              <div
                key={service.id}
                className="group relative flex flex-col justify-between bg-[#FAF6F4]/50 hover:bg-white rounded-3xl p-6 sm:p-7 border border-[#EBDCD5] hover:border-[#CCA08F] shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 bg-white px-2.5 py-1 rounded-lg border border-[#EBDCD5]">
                      {service.category || 'Estética'}
                    </span>
                    {badge && (
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.text}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-serif text-xl font-bold text-stone-900 group-hover:text-[#B87F6C] transition-colors">
                    {service.name}
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm text-stone-600 leading-relaxed min-h-[40px]">
                    {service.description || 'Procedimento exclusivo realizado com alto padrão técnico.'}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#EBDCD5]/80">
                  <div className="flex items-center justify-between mb-4">
                    {/* Duration */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500">
                      <Clock className="w-4 h-4 text-[#B87F6C]" />
                      <span>{service.durationMinutes} minutos</span>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <span className="text-xs text-stone-500 font-medium">a partir de </span>
                      <span className="font-serif text-2xl font-bold text-stone-900">
                        R$ {service.price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  {/* Booking CTA button */}
                  <button
                    onClick={() => onSelectService(service)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white group-hover:bg-[#B87F6C] text-stone-800 group-hover:text-white border border-[#DDBFB2] group-hover:border-transparent text-sm font-semibold shadow-sm transition-all"
                  >
                    <span>Agendar este Horário</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Combo / Extra note banner */}
        <div className="mt-12 bg-gradient-to-r from-[#F5ECE8] to-[#FAF6F4] p-6 rounded-2xl border border-[#DDBFB2] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#B87F6C] text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900 text-sm sm:text-base">
                Deseja combinar mais de um procedimento?
              </h4>
              <p className="text-xs sm:text-sm text-stone-600">
                Você pode agendar sessões combinadas (ex: Design + Buço) diretamente pelo WhatsApp com a Letícia.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <a
              href="https://wa.me/5551995037223?text=Ol%C3%A1%20Let%C3%ADcia!%20Gostaria%20de%20saber%20mais%20sobre%20os%20servi%C3%A7os%20e%20valores%20do%20cat%C3%A1logo."
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-colors text-center"
            >
              Falar no WhatsApp
            </a>
            <a
              href="https://wa.me/5551995037223?text=Ol%C3%A1%20Let%C3%ADcia!%20Gostaria%20de%20montar%20um%20combo%20de%20servi%C3%A7os%20ou%20saber%20mais%20sobre%20os%20pacotes."
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-white text-stone-800 text-xs sm:text-sm font-semibold rounded-xl border border-[#DDBFB2] hover:bg-stone-50 transition-colors text-center"
            >
              Falar com a Letícia
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
