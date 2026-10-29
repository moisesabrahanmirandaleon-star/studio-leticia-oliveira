import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Clock,
  Heart
} from 'lucide-react';
import { resolveImageUrl } from '../services/imageUtils';

export function PortfolioSection({ portfolioItems = [], services = [], onSelectService }) {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [selectedItem, setSelectedItem] = useState(null);

  // Categorias dinâmicas baseadas nos itens disponíveis
  const uniqueCategories = ['Todos', ...new Set(portfolioItems.map((item) => item.category).filter(Boolean))];

  const filteredItems = activeCategory === 'Todos'
    ? portfolioItems
    : portfolioItems.filter((item) => item.category === activeCategory);

  // Navegação dentro do Modal
  const currentIndex = selectedItem
    ? filteredItems.findIndex((i) => i.id === selectedItem.id)
    : -1;

  const handlePrev = (e) => {
    e?.stopPropagation();
    if (currentIndex > 0) {
      setSelectedItem(filteredItems[currentIndex - 1]);
    } else {
      setSelectedItem(filteredItems[filteredItems.length - 1]);
    }
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    if (currentIndex < filteredItems.length - 1) {
      setSelectedItem(filteredItems[currentIndex + 1]);
    } else {
      setSelectedItem(filteredItems[0]);
    }
  };

  // Teclado (ESC para fechar, setas para navegar)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedItem) return;
      if (e.key === 'Escape') setSelectedItem(null);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, currentIndex, filteredItems]);

  // Encontra o serviço correspondente para pré-selecionar no agendamento
  const findMatchingService = (item) => {
    if (!item || !services || services.length === 0) return null;
    const itemTitle = (item.title || '').toLowerCase();
    const itemCat = (item.category || '').toLowerCase();

    // 1. Busca por nome parecido
    const byName = services.find((s) => {
      const sName = s.name.toLowerCase();
      return itemTitle.includes(sName) || sName.includes(itemCat);
    });
    if (byName) return byName;

    // 2. Busca por categoria parecida
    const byCategory = services.find((s) => {
      const sCat = (s.category || '').toLowerCase();
      return sCat.includes(itemCat) || itemCat.includes(sCat);
    });
    if (byCategory) return byCategory;

    return services[0];
  };

  const handleBookItem = (item) => {
    const matched = findMatchingService(item);
    setSelectedItem(null);
    if (onSelectService) {
      onSelectService(matched);
    }
  };

  return (
    <section id="portfolio" className="py-20 bg-[#FAF6F4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#7E4E40] text-xs font-semibold tracking-wider uppercase mb-3 border border-[#DDBFB2]">
            <Sparkles className="w-3.5 h-3.5 text-[#B87F6C]" />
            Galeria de Transformações
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Resultados Reais & Impecáveis
          </h2>
          <p className="mt-3 text-stone-600 text-sm sm:text-base">
            Toque em qualquer imagem para ampliar, ver os detalhes do procedimento e agendar o seu horário.
          </p>

          {/* Category filter pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {uniqueCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#B87F6C] text-white shadow-md scale-105'
                    : 'bg-white text-stone-600 border border-[#EBDCD5] hover:border-[#CCA08F]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group relative rounded-2xl overflow-hidden bg-white border border-[#EBDCD5] shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col hover:-translate-y-1 transform-gpu"
            >
              <div className="aspect-square overflow-hidden bg-stone-100 relative">
                <img
                  src={resolveImageUrl(item.imageUrl)}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 transform-gpu"
                  onError={(e) => {
                    const currentSrc = e.currentTarget.getAttribute('src') || '';
                    if (!e.currentTarget.dataset.fallbackApplied) {
                      e.currentTarget.dataset.fallbackApplied = 'true';
                      if (currentSrc.includes('/catalogo/')) {
                        const relativePart = currentSrc.substring(currentSrc.indexOf('/catalogo/'));
                        e.currentTarget.src = relativePart;
                      }
                    }
                  }}
                />
                
                {/* Overlay com botão de visualização ao passar o mouse */}
                <div className="absolute inset-0 bg-stone-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4 text-center">
                  <div className="p-3 rounded-full bg-white text-[#B87F6C] shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                    <Eye className="w-5 h-5" />
                  </div>
                  <span className="text-white text-xs font-bold drop-shadow">
                    Ver Detalhes & Agendar
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#B87F6C] block mb-1">
                    {item.category}
                  </span>
                  <h4 className="font-serif font-bold text-stone-900 text-sm sm:text-base leading-snug">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 mt-2 border-t border-stone-100 flex items-center justify-between text-xs text-[#B87F6C] font-semibold">
                  <span>Conhecer resultado</span>
                  <span className="text-lg">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Banner de Sincronia com o Catálogo Oficial de WhatsApp da Letícia */}
        <div className="mt-14 bg-gradient-to-br from-[#1E2E25] via-[#16231C] to-[#0E1712] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-900/40 relative overflow-hidden">
          {/* Fundo decorativo otimizado via gradiente radial sem filtro pesado de blur */}
          <div className="absolute -top-16 -right-16 w-72 h-72 bg-[radial-gradient(circle,rgba(16,185,129,0.15)_0%,transparent_70%)] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 shadow-md">
                <MessageCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold uppercase tracking-wider border border-emerald-500/30">
                  <Sparkles className="w-3 h-3" />
                  Catálogo Integrado na Página
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  Fotos Reais do Catálogo WhatsApp da Letícia
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed">
                  As fotos e resultados acima foram extraídos diretamente do catálogo oficial de procedimentos do WhatsApp <strong>(51) 99503-7223</strong>. Você pode clicar em qualquer foto para ver os detalhes e agendar diretamente!
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <a
                href="https://wa.me/5551995037223?text=Ol%C3%A1%20Let%C3%ADcia!%20Vi%20as%20fotos%20do%20seu%20cat%C3%A1logo%20no%20site%20e%20gostaria%20de%20tirar%20uma%20d%C3%BAvida%20sobre%20um%20procedimento."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-105"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Conversar no WhatsApp Oficial</span>
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL / LIGHTBOX DE DETALHES DO PROCEDIMENTO */}
      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-md animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-[#EBDCD5] overflow-hidden flex flex-col md:flex-row max-h-[92vh] relative"
          >
            {/* Botão Fechar */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-stone-100 text-stone-600 hover:text-stone-900 shadow-md transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Imagem Ampliada com Controles de Navegação */}
            <div className="md:w-1/2 bg-stone-900 relative flex items-center justify-center overflow-hidden min-h-[260px] md:min-h-[420px]">
              <img
                src={resolveImageUrl(selectedItem.imageUrl)}
                alt={selectedItem.title}
                className="w-full h-full object-cover max-h-[60vh] md:max-h-full"
                onError={(e) => {
                  const currentSrc = e.currentTarget.getAttribute('src') || '';
                  if (!e.currentTarget.dataset.fallbackApplied) {
                    e.currentTarget.dataset.fallbackApplied = 'true';
                    if (currentSrc.includes('/catalogo/')) {
                      const relativePart = currentSrc.substring(currentSrc.indexOf('/catalogo/'));
                      e.currentTarget.src = relativePart;
                    }
                  }
                }}
              />

              {/* Botões de Avançar / Voltar dentro da Imagem */}
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/75 text-white transition-all shadow-md"
                title="Foto anterior (seta esquerda)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/75 text-white transition-all shadow-md"
                title="Próxima foto (seta direita)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <span className="absolute bottom-3 right-3 text-[11px] bg-black/60 text-white px-2.5 py-1 rounded-full font-medium">
                {currentIndex + 1} de {filteredItems.length}
              </span>
            </div>

            {/* Informações e Ações do Procedimento */}
            <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F4] text-[#7E4E40] text-xs font-bold uppercase tracking-wider border border-[#DDBFB2]">
                  <Sparkles className="w-3.5 h-3.5 text-[#B87F6C]" />
                  {selectedItem.category}
                </div>

                <div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                    {selectedItem.title}
                  </h3>
                  <p className="text-xs uppercase tracking-widest font-semibold text-[#A06654] mt-1">
                    Procedimento Oficial • Studio Letícia Oliveira
                  </p>
                </div>

                <p className="text-stone-600 text-sm leading-relaxed">
                  {selectedItem.description || 'Resultado conquistado através de técnicas personalizadas de visagismo facial, valorizando a harmonia natural de cada cliente.'}
                </p>

                {/* Pilares do Procedimento */}
                <div className="space-y-2 pt-2 border-t border-[#EBDCD5] text-xs text-stone-700">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#B87F6C] shrink-0" />
                    <span>Biossegurança e materiais 100% descartáveis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#B87F6C] shrink-0" />
                    <span>Desenho harmônico respeitando sua expressão natural</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#B87F6C] shrink-0" />
                    <span>Atendimento com hora marcada e espaço privativo</span>
                  </div>
                </div>
              </div>

              {/* Botões de Ação do Modal */}
              <div className="pt-6 space-y-2.5">
                <button
                  onClick={() => handleBookItem(selectedItem)}
                  className="w-full py-3.5 px-5 rounded-2xl bg-[#B87F6C] hover:bg-[#A06654] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Agendar Este Procedimento</span>
                </button>

                <a
                  href={`https://wa.me/5551995037223?text=${encodeURIComponent(
                    `Olá Letícia! Vi o resultado de "${selectedItem.title}" na sua galeria do site e gostaria de saber mais informações!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Tirar Dúvida no WhatsApp</span>
                </a>
              </div>

            </div>

          </div>
        </div>
      )}

    </section>
  );
}
