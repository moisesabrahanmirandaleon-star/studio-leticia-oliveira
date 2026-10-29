import React, { useState, useEffect } from 'react';
import { Gift, Clock, CheckCircle2, ShieldCheck, Tag, Search, ArrowRight, X, AlertCircle, Heart, Phone, MessageCircle, Maximize2 } from 'lucide-react';
import { api } from '../services/api';
import { formatBrazilianPhoneInput, formatPhoneDisplay } from '../utils/phoneUtils';
import { resolveImageUrl } from '../services/imageUtils';

export function BonusSection({ onOpenBooking }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal de Ampliação / Expansão do Cupom de Bônus
  const [expandedBonusCampaign, setExpandedBonusCampaign] = useState(null);

  // Modal de Aplicação de Bônus
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [applying, setApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(null);
  const [applicationError, setApplicationError] = useState('');

  // Modal de Consulta de Status por Telefone
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusPhone, setStatusPhone] = useState('');
  const [statusResults, setStatusResults] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');

  useEffect(() => {
    loadCampaigns();
  }, []);

  // Fechar modais ao pressionar tecla ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (expandedBonusCampaign) setExpandedBonusCampaign(null);
        else if (selectedCampaign) setSelectedCampaign(null);
        else if (showStatusModal) setShowStatusModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expandedBonusCampaign, selectedCampaign, showStatusModal]);

  const loadCampaigns = async () => {
    try {
      const data = await api.getActiveBonusCampaigns();
      setCampaigns(data || []);
    } catch (err) {
      console.error('Erro ao buscar campanhas de bônus:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApplyModal = (campaign) => {
    setSelectedCampaign(campaign);
    setApplicationError('');
    setApplicationSuccess(null);
    setServiceName(campaign.title || '');
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim() || !selectedCampaign) {
      setApplicationError('Por favor, informe seu nome e WhatsApp.');
      return;
    }

    setApplying(true);
    setApplicationError('');
    setApplicationSuccess(null);

    try {
      const res = await api.applyForBonus({
        campaignId: selectedCampaign.id,
        clientName: clientName.trim(),
        clientPhone: formatPhoneDisplay(clientPhone),
        clientEmail: clientEmail.trim() || null,
        serviceName: serviceName.trim() || selectedCampaign.title
      });

      setApplicationSuccess(res);
      setClientName('');
      setClientPhone('');
      setClientEmail('');
    } catch (err) {
      setApplicationError(err.message || 'Erro ao solicitar bônus.');
    } finally {
      setApplying(false);
    }
  };

  const handleCheckStatus = async (e) => {
    e.preventDefault();
    if (!statusPhone.trim()) {
      setStatusError('Informe seu número de WhatsApp.');
      return;
    }

    setStatusLoading(true);
    setStatusError('');
    setStatusResults(null);

    try {
      const res = await api.checkBonusStatus(statusPhone.trim());
      if (!res || res.length === 0) {
        setStatusError('Nenhuma solicitação de bônus foi encontrada para este número.');
      } else {
        setStatusResults(res);
      }
    } catch (err) {
      setStatusError(err.message || 'Erro ao consultar status.');
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return null; // Não trava o carregamento inicial da página
  }

  // Se a administradora não tiver nenhuma campanha ativa no momento
  if (campaigns.length === 0) {
    return null;
  }

  return (
    <section id="bonus" className="py-20 bg-gradient-to-b from-[#FAF6F4] via-[#F5ECE8] to-[#FAF6F4] relative overflow-hidden border-t border-[#EBDCD5]">
      {/* Elementos decorativos */}
      <div className="absolute top-0 right-10 w-72 h-72 bg-[#B87F6C]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-72 h-72 bg-[#CCA08F]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Cabeçalho da Seção */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBDCD5] text-[#7E4E40] text-xs font-bold uppercase tracking-wider border border-[#DDBFB2]">
              <Gift className="w-3.5 h-3.5 text-[#B87F6C]" />
              <span>Vantagens & Ofertas Exclusivas</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 leading-tight">
              Bônus Especiais do <span className="italic font-normal text-[#B87F6C]">Studio Letícia Oliveira</span>
            </h2>

            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Solicite seu benefício especial e aguarde a aprovação da Letícia. Cada cliente pode resgatar 1 bônus exclusivo a cada 15 dias!
            </p>
          </div>

          {/* Botão de Consulta de Status */}
          <div>
            <button
              onClick={() => {
                setShowStatusModal(true);
                setStatusResults(null);
                setStatusError('');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-stone-50 border border-[#DDBFB2] text-xs font-bold text-stone-700 shadow-xs hover:border-[#B87F6C] transition-all cursor-pointer whitespace-nowrap"
            >
              <Search className="w-4 h-4 text-[#B87F6C]" />
              <span>Consultar Meus Bônus Solicitados</span>
            </button>
          </div>
        </div>

        {/* Grid de Campanhas Ativas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp) => {
            const hasDates = camp.startDate || camp.endDate;
            const endDateFormatted = camp.endDate ? camp.endDate.split('-').reverse().join('/') : null;

            return (
              <div
                key={camp.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EBDCD5] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative group overflow-hidden"
              >
                {/* Linha superior decorativa de destaque */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#B87F6C] via-[#CCA08F] to-[#B87F6C]" />

                <div className="space-y-4">
                  {/* Badge de tipo de benefício e tempo */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F4] text-[#B87F6C] border border-[#EBDCD5] text-[11px] font-bold">
                      <Gift className="w-3.5 h-3.5 text-[#B87F6C]" />
                      {camp.badgeText || 'Especial'}
                    </span>

                    {endDateFormatted && (
                      <span className="text-[11px] font-medium text-stone-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        Até {endDateFormatted}
                      </span>
                    )}
                  </div>

                  {/* Foto / Banner da Campanha com Ampliação em Tela Cheia */}
                  {camp.imageUrl ? (
                    <div
                      onClick={() => setExpandedBonusCampaign(camp)}
                      className="w-full min-h-[190px] sm:min-h-[210px] rounded-2xl overflow-hidden border border-[#EBDCD5] relative bg-gradient-to-br from-[#FAF6F4] via-[#F5ECE8] to-[#EBDCD5] cursor-pointer group/img shadow-inner flex items-center justify-center"
                      title="Clique para ver o cupom completo em tela cheia"
                    >
                      <img
                        src={resolveImageUrl(camp.imageUrl)}
                        alt={camp.title}
                        className="w-full h-full object-contain sm:object-cover group-hover/img:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fb = e.currentTarget.parentElement?.querySelector('.card-fallback-banner');
                          if (fb) fb.style.display = 'flex';
                        }}
                      />
                      <div className="card-fallback-banner hidden w-full h-full bg-gradient-to-br from-[#FAF6F4] via-[#F5ECE8] to-[#EBDCD5] items-center justify-center p-4 text-center">
                        <div className="flex flex-col items-center gap-1.5 text-[#B87F6C]">
                          <Gift className="w-8 h-8 text-[#B87F6C]" />
                          <span className="font-serif text-sm font-bold text-stone-800">{camp.title}</span>
                          <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Studio Letícia Oliveira</span>
                        </div>
                      </div>

                      {/* Botão Flutuante de Ampliação */}
                      <div className="absolute bottom-2.5 right-2.5 z-10">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedBonusCampaign(camp);
                          }}
                          className="px-2.5 py-1 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-xs transition-all cursor-pointer hover:scale-105"
                        >
                          <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
                          <span>Clique para Ampliar</span>
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* Título & Descrição */}
                  <div>
                    <h3 className="font-serif text-xl font-bold text-stone-900 group-hover:text-[#B87F6C] transition-colors leading-snug">
                      {camp.title}
                    </h3>
                    {camp.description && (
                      <p className="text-stone-600 text-xs sm:text-sm mt-2 leading-relaxed">
                        {camp.description}
                      </p>
                    )}
                  </div>

                  {/* Destaque do Desconto ou Brinde */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF6F4] border border-[#EBDCD5] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-500 block">
                        Benefício Garantido:
                      </span>
                      <strong className="text-sm font-bold text-[#7E4E40]">
                        {camp.discountType === 'PERCENT' && `${camp.discountValue}% de Desconto`}
                        {camp.discountType === 'FIXED' && `R$ ${camp.discountValue} OFF`}
                        {camp.discountType === 'GIFT' && (camp.giftName || 'Brinde Especial')}
                      </strong>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#EBDCD5] text-[#7E4E40] flex items-center justify-center shrink-0">
                      <Tag className="w-4 h-4 text-[#B87F6C]" />
                    </div>
                  </div>
                </div>

                {/* Ação: Solicitar Bônus */}
                <div className="mt-6 pt-4 border-t border-[#EBDCD5] space-y-2">
                  <button
                    onClick={() => handleOpenApplyModal(camp)}
                    className="w-full py-3 rounded-2xl bg-[#B87F6C] hover:bg-[#A06654] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <span>Quero Meu Bônus</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-[10px] text-center text-stone-400">
                    *Regra: 1 solicitação a cada 15 dias por cliente
                  </p>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* ======================================================== */}
      {/* MODAL LIGHTBOX: FOTO EXPANDIDA DO BÔNUS / CUPOM          */}
      {/* ======================================================== */}
      {expandedBonusCampaign && (
        <div
          onClick={() => setExpandedBonusCampaign(null)}
          className="fixed inset-0 z-[100] flex justify-center p-2 sm:p-6 bg-stone-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: 'min(92vh, calc(100dvh - 1rem))' }}
            className="bg-white rounded-3xl max-w-3xl w-full border border-[#EBDCD5] shadow-2xl overflow-hidden flex flex-col relative my-auto"
          >
            {/* Botão Fechar no Canto */}
            <button
              onClick={() => setExpandedBonusCampaign(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white transition-colors cursor-pointer shadow-md"
              title="Fechar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho do Cupom */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#FAF6F4] via-[#F5ECE8] to-[#FAF6F4] border-b border-[#EBDCD5] flex items-center justify-between gap-3 pr-14">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EBDCD5] text-[#7E4E40] flex items-center justify-center shrink-0">
                  <Gift className="w-5 h-5 text-[#B87F6C]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#B87F6C] block">
                    {expandedBonusCampaign.badgeText || 'Vantagem Exclusiva'}
                  </span>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 leading-tight">
                    {expandedBonusCampaign.title}
                  </h3>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-[#B87F6C] text-white text-xs font-bold shrink-0 shadow-xs">
                {expandedBonusCampaign.discountType === 'PERCENT' && `${expandedBonusCampaign.discountValue}% OFF`}
                {expandedBonusCampaign.discountType === 'FIXED' && `R$ ${expandedBonusCampaign.discountValue} OFF`}
                {expandedBonusCampaign.discountType === 'GIFT' && (expandedBonusCampaign.giftName || 'Brinde')}
              </span>
            </div>

            {/* Imagem Ampliada em Alta Resolução */}
            <div className="p-3 sm:p-6 bg-stone-950 flex items-center justify-center overflow-auto flex-1 min-h-[300px] max-h-[66vh]">
              <img
                src={resolveImageUrl(expandedBonusCampaign.imageUrl)}
                alt={expandedBonusCampaign.title}
                className="w-auto h-auto max-w-full max-h-[62vh] object-contain rounded-xl shadow-2xl"
              />
            </div>

            {/* Rodapé com Ação */}
            <div className="p-4 sm:p-5 bg-white border-t border-[#EBDCD5] flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-stone-600 leading-relaxed text-center sm:text-left flex-1">
                {expandedBonusCampaign.description || 'Apresente este voucher ou solicite online para garantir seu benefício no Studio Letícia Oliveira.'}
              </p>

              <button
                onClick={() => {
                  const camp = expandedBonusCampaign;
                  setExpandedBonusCampaign(null);
                  handleOpenApplyModal(camp);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#B87F6C] hover:bg-[#A06654] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <span>Solicitar Este Bônus</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: SOLICITAR BÔNUS                                  */}
      {/* ======================================================== */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex justify-center p-2 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div
            style={{ maxHeight: 'min(92vh, calc(100dvh - 1rem))' }}
            className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-8 shadow-2xl border border-[#EBDCD5] relative overflow-y-auto my-auto"
          >
            
            <button
              onClick={() => setSelectedCampaign(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {applicationSuccess ? (
              <div className="text-center space-y-5 py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-2xl font-bold text-stone-900">
                    Solicitação Enviada! 🎉
                  </h3>
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                    {applicationSuccess.details || 'A Letícia irá conferir sua solicitação. Assim que aprovada, seu bônus estará pronto para uso.'}
                  </p>
                </div>

                {/* Código de Identificação */}
                <div className="p-4 rounded-2xl bg-[#FAF6F4] border-2 border-dashed border-[#B87F6C] inline-block w-full">
                  <span className="text-[11px] font-bold text-stone-500 uppercase block">
                    Seu Código de Solicitação:
                  </span>
                  <span className="font-mono text-2xl font-extrabold text-[#7E4E40] tracking-wider block mt-1">
                    {applicationSuccess.code}
                  </span>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 text-left">
                  💡 <strong>Dica:</strong> Guarde esse código ou consulte o status a qualquer momento aqui na página principal digitando seu WhatsApp!
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setSelectedCampaign(null);
                      if (onOpenBooking) onOpenBooking();
                    }}
                    className="flex-1 py-3 bg-[#B87F6C] text-white rounded-2xl font-bold text-xs hover:bg-[#A06654] transition-all cursor-pointer"
                  >
                    Agendar Horário Agora
                  </button>
                  <button
                    onClick={() => setSelectedCampaign(null)}
                    className="py-3 px-6 bg-stone-100 text-stone-700 rounded-2xl font-bold text-xs hover:bg-stone-200 transition-all cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-5">
                {/* Banner Visual Ilustrativo do Bônus ao Aplicar com Opção de Ampliar */}
                {selectedCampaign.imageUrl ? (
                  <div
                    onClick={() => setExpandedBonusCampaign(selectedCampaign)}
                    className="w-full min-h-[180px] max-h-[260px] rounded-2xl overflow-hidden border border-[#EBDCD5] relative bg-stone-900 cursor-pointer group/modalimg shadow-inner flex items-center justify-center"
                    title="Clique para ver o cupom completo em tela cheia"
                  >
                    <img
                      src={resolveImageUrl(selectedCampaign.imageUrl)}
                      alt={selectedCampaign.title}
                      className="w-full h-full object-contain group-hover/modalimg:scale-102 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fb = e.currentTarget.parentElement?.querySelector('.modal-fallback-banner');
                        if (fb) fb.style.display = 'flex';
                      }}
                    />
                    <div className="modal-fallback-banner hidden w-full h-full bg-gradient-to-br from-[#FAF6F4] via-[#F5ECE8] to-[#EBDCD5] items-center justify-center p-4 text-center">
                      <div className="flex flex-col items-center gap-1 text-[#B87F6C]">
                        <Gift className="w-8 h-8" />
                        <span className="font-serif text-sm font-bold text-stone-800">{selectedCampaign.title}</span>
                        <span className="text-[10px] text-stone-500">Studio Letícia Oliveira</span>
                      </div>
                    </div>
                    {/* Badge flutuante sobre a foto */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[#B87F6C] text-[11px] font-bold shadow-sm">
                        <Gift className="w-3.5 h-3.5 text-[#B87F6C]" />
                        {selectedCampaign.badgeText || 'Tempo Limitado'}
                      </span>
                    </div>

                    {/* Botão de Ampliação */}
                    <div className="absolute bottom-2.5 right-2.5">
                      <span className="px-2.5 py-1 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md backdrop-blur-xs">
                        <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
                        <span>Ampliar Cupom</span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-[#FAF6F4] via-[#F5ECE8] to-[#FAF6F4] border border-[#EBDCD5] flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-stone-500 block">Benefício Selecionado</span>
                      <strong className="text-sm font-bold text-[#7E4E40] block">{selectedCampaign.title}</strong>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#EBDCD5] text-[#7E4E40] flex items-center justify-center shrink-0">
                      <Gift className="w-5 h-5 text-[#B87F6C]" />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBDCD5] text-[#7E4E40] text-[11px] font-bold uppercase">
                    <Gift className="w-3.5 h-3.5 text-[#B87F6C]" />
                    <span>Inscrição para Bônus</span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-stone-900">
                    {selectedCampaign.title}
                  </h3>
                  <p className="text-stone-500 text-xs leading-relaxed">
                    Preencha seus dados para receber este benefício exclusivo do Studio.
                  </p>
                </div>

                {/* Aviso da Regra de 15 Dias */}
                <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
                  <ShieldCheck className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <strong>Regra de Boas Práticas:</strong>
                    <p className="text-[11px] text-rose-700 leading-snug">
                      Cada cliente tem direito a 1 solicitação de bônus a cada 15 dias. A liberação passa pela aprovação da dona.
                    </p>
                  </div>
                </div>

                {applicationError && (
                  <div className="p-3 bg-rose-100 border border-rose-300 text-rose-800 rounded-xl text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{applicationError}</span>
                  </div>
                )}

                <div className="space-y-3.5 text-left">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                      Seu Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ex: Ana Clara Souza"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none focus:ring-2 focus:ring-[#B87F6C]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                      Seu WhatsApp (Brasil) *
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 flex items-center gap-1 pointer-events-none select-none text-[11px] font-bold text-stone-700">
                        <span className="text-xs">🇧🇷</span>
                        <span>+55</span>
                        <span className="text-stone-300">|</span>
                      </div>
                      <input
                        type="tel"
                        required
                        value={clientPhone}
                        onChange={(e) => setClientPhone(formatBrazilianPhoneInput(e.target.value))}
                        placeholder="(51) 98047-0713"
                        className="w-full pl-18 pr-3.5 py-2.5 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none focus:ring-2 focus:ring-[#B87F6C]/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                      Procedimento de Interesse (Opcional)
                    </label>
                    <input
                      type="text"
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      placeholder="Ex: Design com Henna, Brow Lamination..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none focus:ring-2 focus:ring-[#B87F6C]/20"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={applying}
                    className="w-full py-3.5 rounded-2xl bg-[#B87F6C] hover:bg-[#A06654] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {applying ? (
                      <span>Verificando e enviando...</span>
                    ) : (
                      <>
                        <Gift className="w-4 h-4 text-amber-200" />
                        <span>Confirmar Solicitação do Bônus</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CONSULTAR STATUS DO BÔNUS                        */}
      {/* ======================================================== */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex justify-center p-2 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div
            style={{ maxHeight: 'min(92vh, calc(100dvh - 1rem))' }}
            className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-8 shadow-2xl border border-[#EBDCD5] relative overflow-y-auto space-y-6 my-auto"
          >
            
            <button
              onClick={() => setShowStatusModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBDCD5] text-[#7E4E40] text-[11px] font-bold uppercase mb-2">
                <Search className="w-3.5 h-3.5 text-[#B87F6C]" />
                <span>Consulta de Bônus</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-stone-900">
                Verificar Meu Bônus
              </h3>
              <p className="text-stone-500 text-xs">
                Digite seu número de WhatsApp para ver se a Letícia já liberou seu benefício:
              </p>
            </div>

            <form onSubmit={handleCheckStatus} className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute left-3 top-2.5 flex items-center gap-1 pointer-events-none select-none text-[11px] font-bold text-stone-700">
                  <span className="text-xs">🇧🇷</span>
                  <span>+55</span>
                  <span className="text-stone-300">|</span>
                </div>
                <input
                  type="tel"
                  required
                  value={statusPhone}
                  onChange={(e) => setStatusPhone(formatBrazilianPhoneInput(e.target.value))}
                  placeholder="(51) 98047-0713"
                  className="w-full pl-18 pr-3.5 py-2.5 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={statusLoading}
                className="px-4 py-2.5 rounded-xl bg-[#B87F6C] hover:bg-[#A06654] text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
              >
                {statusLoading ? 'Buscando...' : 'Consultar'}
              </button>
            </form>

            {statusError && (
              <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
                {statusError}
              </p>
            )}

            {/* Resultados da Consulta */}
            {statusResults && statusResults.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Suas Solicitações Encontradas ({statusResults.length}):
                </h4>

                <div className="space-y-3">
                  {statusResults.map((item) => {
                    const isApproved = item.status === 'APROVADO';
                    const isPending = item.status === 'PENDENTE';
                    const isUsed = item.status === 'UTILIZADO';
                    const isRejected = item.status === 'RECUSADO';

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border text-left space-y-2 ${
                          isApproved
                            ? 'bg-emerald-50 border-emerald-300'
                            : isPending
                            ? 'bg-amber-50 border-amber-300'
                            : isUsed
                            ? 'bg-stone-50 border-stone-300'
                            : 'bg-rose-50 border-rose-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {item.campaign?.imageUrl && (
                              <div className="w-10 h-10 rounded-xl overflow-hidden border border-stone-200 shrink-0 bg-stone-100">
                                <img
                                  src={resolveImageUrl(item.campaign.imageUrl)}
                                  alt={item.campaign?.title || 'Bônus'}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              </div>
                            )}
                            <strong className="text-stone-900 text-xs sm:text-sm font-bold truncate">
                              {item.campaign?.title || 'Campanha de Bônus'}
                            </strong>
                          </div>

                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              isApproved
                                ? 'bg-emerald-600 text-white'
                                : isPending
                                ? 'bg-amber-600 text-white'
                                : isUsed
                                ? 'bg-stone-600 text-white'
                                : 'bg-rose-600 text-white'
                            }`}
                          >
                            {isApproved && 'Liberado! 🎉'}
                            {isPending && 'Em Análise ⏳'}
                            {isUsed && 'Utilizado ✓'}
                            {isRejected && 'Não Liberado'}
                          </span>
                        </div>

                        <div className="text-[11px] text-stone-600 space-y-1">
                          <p>
                            <strong>Código:</strong>{' '}
                            <span className="font-mono font-bold text-[#7E4E40]">
                              {item.code}
                            </span>
                          </p>
                          <p>
                            <strong>Data da Solicitação:</strong>{' '}
                            {new Date(item.appliedAt).toLocaleDateString('pt-BR')}
                          </p>
                          {item.adminNote && (
                            <p className="italic text-stone-500">
                              Nota da Dona: "{item.adminNote}"
                            </p>
                          )}
                        </div>

                        {isApproved && (
                          <div className="pt-2 flex items-center gap-2">
                            <button
                              onClick={() => {
                                setShowStatusModal(false);
                                if (onOpenBooking) onOpenBooking();
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                            >
                              Agendar com este Bônus
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </section>
  );
}
