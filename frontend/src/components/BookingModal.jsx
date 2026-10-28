import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  User,
  Phone,
  CreditCard,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  MessageCircle,
  Building2,
  MapPin,
  Copy,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import leticiaPerfilPhoto from '../assets/leticia-perfil.jpg';

export function BookingModal({ isOpen, onClose, services, stylists, initialService }) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(initialService || null);
  const [selectedStylist, setSelectedStylist] = useState(stylists?.[0] || null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('PRESENCIAL');
  const [notes, setNotes] = useState('');
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Estados de carregamento e slots
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotError, setSlotError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  // Helper para formatar a mensagem oficial de aviso e política
  const formatNoticeMessage = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return '';
    try {
      const dateOnly = String(dateStr).split('T')[0];
      let year, month, day;
      if (dateOnly.includes('-')) {
        const parts = dateOnly.split('-');
        year = Number(parts[0]);
        month = Number(parts[1]);
        day = Number(parts[2]);
      } else {
        const parts = dateOnly.split('/');
        day = Number(parts[0]);
        month = Number(parts[1]);
        year = Number(parts[2]) || new Date().getFullYear();
      }
      const dateObj = new Date(year, month - 1, day);
      const dayNames = [
        'domingo',
        'segunda-feira',
        'terça-feira',
        'quarta-feira',
        'quinta-feira',
        'sexta-feira',
        'sábado'
      ];
      const weekday = dayNames[dateObj.getDay()] || '';
      const dayMonth = `${day}/${month}`;

      return (
        `Combinado! ${dayMonth}, ${weekday}, às ${timeStr} ✨\n\n` +
        `📍 Condomínio Altos da Theodomiro 2, 2435\n` +
        `➡️ 2ª portaria (meu prédio é o último da rua, são dois condomínios no local)\n` +
        `🏢 Bloco 6, Apê 652 – 5º andar\n\n` +
        `Já aviso que precisa de um pouquinho de fôlego pra subir 🤭 mas vai ser super bem recebida por mim lá em cima! 💖\n\n` +
        `⏰ Política de agendamento\n` +
        `Cancelamentos ou remarcações devem ser realizados com 24h de antecedência.\n\n` +
        `Após esse prazo, será cobrado 50% do valor do procedimento. Em caso de não comparecimento, o pagamento dos 50% também é obrigatório, referente ao horário reservado exclusivamente para você.\n\n` +
        `✨ Essa política existe para que eu consiga organizar minha agenda e respeitar o horário de todas as clientes.\n\n` +
        `Qualquer dúvida, me chama! 💖`
      );
    } catch {
      return '';
    }
  };

  // Inicializar serviço selecionado se passado por props
  useEffect(() => {
    if (initialService) {
      setSelectedService(initialService);
      setStep(2); // Avança direto para escolher estilista/data
    }
  }, [initialService]);

  // Se os estilistas carregarem e nenhum estiver selecionado, seleciona o primeiro
  useEffect(() => {
    if (!selectedStylist && stylists && stylists.length > 0) {
      setSelectedStylist(stylists[0]);
    }
  }, [stylists, selectedStylist]);

  const todayDate = new Date();
  const [calendarYear, setCalendarYear] = useState(todayDate.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(todayDate.getMonth() + 1);
  const [monthScheduleDays, setMonthScheduleDays] = useState([]);
  const [loadingMonthSchedule, setLoadingMonthSchedule] = useState(false);

  // Carregar escala mensal do estilista selecionado
  useEffect(() => {
    async function loadClientMonthSchedule() {
      if (!selectedStylist) return;
      setLoadingMonthSchedule(true);
      try {
        const res = await api.getMonthSchedule(selectedStylist.id, calendarYear, calendarMonth);
        setMonthScheduleDays(res.days || []);
      } catch (err) {
        console.error('Erro ao carregar escala do mês para cliente:', err);
      } finally {
        setLoadingMonthSchedule(false);
      }
    }

    if (isOpen && selectedStylist) {
      loadClientMonthSchedule();
    }
  }, [isOpen, selectedStylist, calendarYear, calendarMonth]);

  const handleClientPrevMonth = () => {
    let y = calendarYear;
    let m = calendarMonth - 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    const now = new Date();
    if (y < now.getFullYear() || (y === now.getFullYear() && m < now.getMonth() + 1)) {
      return;
    }
    setCalendarYear(y);
    setCalendarMonth(m);
  };

  const handleClientNextMonth = () => {
    let y = calendarYear;
    let m = calendarMonth + 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setCalendarYear(y);
    setCalendarMonth(m);
  };

  const getMonthName = (m) => {
    const names = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return names[m - 1] || '';
  };

  // Buscar slots disponíveis quando stylist, service e date estiverem definidos
  useEffect(() => {
    async function fetchSlots() {
      if (!selectedStylist || !selectedService || !selectedDate) return;

      setLoadingSlots(true);
      setSlotError(null);
      setSelectedSlot(null);

      try {
        const res = await api.checkAvailability(selectedStylist.id, selectedService.id, selectedDate);
        if (res.available) {
          setAvailableSlots(res.slots || []);
        } else {
          setAvailableSlots([]);
          setSlotError(res.reason || 'Nenhum horário disponível para esta data.');
        }
      } catch (err) {
        setSlotError(err.message || 'Erro ao consultar horários.');
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }

    if (step === 4 && selectedDate) {
      fetchSlots();
    }
  }, [step, selectedDate, selectedStylist, selectedService]);

  if (!isOpen) return null;

  // Envio final do agendamento
  const handleConfirmBooking = async () => {
    if (!clientName.trim() || !clientPhone.trim()) {
      alert('Por favor, informe seu nome e WhatsApp.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createAppointment({
        clientName,
        clientPhone,
        clientEmail: clientEmail || undefined,
        stylistId: selectedStylist.id,
        serviceId: selectedService.id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        paymentMethod,
        notes
      });

      setBookingResult(res);
      setStep(7); // Tela de sucesso
    } catch (err) {
      alert(err.message || 'Erro ao confirmar agendamento. Tente outro horário.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedDate('');
    setSelectedSlot(null);
    setBookingResult(null);
    setPolicyAccepted(false);
    setCopiedNotice(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-[#EBDCD5] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header com barra de progresso */}
        <div className="bg-[#FAF6F4] p-5 border-b border-[#EBDCD5] relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#B87F6C] text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-200" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-stone-900 text-base sm:text-lg">
                  Agendar Procedimento
                </h3>
                <span className="text-xs text-stone-500 font-medium">
                  {step < 7 ? `Passo ${step} de 6` : 'Confirmado!'}
                </span>
              </div>
            </div>

            <button
              onClick={resetAndClose}
              className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Barra de progresso visual */}
          {step < 7 && (
            <div className="w-full bg-[#EBDCD5] h-1.5 rounded-full mt-4 overflow-hidden">
              <div
                className="bg-[#B87F6C] h-full transition-all duration-300"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Conteúdo Dinâmico com Scroll */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* PASSO 1: Seleção de Serviço */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-serif text-lg font-bold text-stone-900">
                  1. Escolha o serviço desejado
                </h4>
                <p className="text-xs text-stone-500">
                  Valores e durações calculados para cada procedimento.
                </p>
              </div>

              <div className="space-y-3">
                {services.map((s) => {
                  const isSelected = selectedService?.id === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedService(s)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#B87F6C] bg-[#FAF6F4] ring-2 ring-[#B87F6C]/20 shadow-sm'
                          : 'border-[#EBDCD5] hover:border-[#CCA08F] bg-white'
                      }`}
                    >
                      <div className="pr-3">
                        <div className="flex items-center gap-2">
                          <h5 className="font-serif font-bold text-stone-900 text-sm sm:text-base">
                            {s.name}
                          </h5>
                          {s.category && (
                            <span className="text-[10px] uppercase font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                              {s.category}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                          {s.description}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#A06654] mt-2">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{s.durationMinutes} minutos</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-serif text-lg font-bold text-stone-900 block">
                          R$ {s.price.toFixed(2).replace('.', ',')}
                        </span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-2 ml-auto ${
                          isSelected ? 'bg-[#B87F6C] border-[#B87F6C] text-white' : 'border-stone-300'
                        }`}>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PASSO 2: Seleção de Profissional */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-serif text-lg font-bold text-stone-900">
                  2. Escolha a profissional
                </h4>
                <p className="text-xs text-stone-500">
                  Atendimento especializado e personalizado para você.
                </p>
              </div>

              <div className="space-y-3">
                {stylists.map((stylist) => {
                  const isSelected = selectedStylist?.id === stylist.id;
                  return (
                    <div
                      key={stylist.id}
                      onClick={() => setSelectedStylist(stylist)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                        isSelected
                          ? 'border-[#B87F6C] bg-[#FAF6F4] ring-2 ring-[#B87F6C]/20 shadow-sm'
                          : 'border-[#EBDCD5] hover:border-[#CCA08F] bg-white'
                      }`}
                    >
                      <img
                        src={(!stylist.photoUrl || stylist.photoUrl === '/leticia-perfil.jpg') ? leticiaPerfilPhoto : stylist.photoUrl}
                        alt={stylist.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-serif font-bold text-stone-900 text-base">
                            {stylist.name}
                          </h5>
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Disponível
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                          {stylist.bio}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PASSO 3: Seleção de Data Conforme a Escala */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-serif text-lg font-bold text-stone-900">
                    3. Escolha o dia
                  </h4>
                  <p className="text-xs text-stone-500">
                    Selecione um dia disponível de acordo com a escala de atendimento da Letícia.
                  </p>
                </div>

                {/* Navegação de Mês */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[#FAF6F4] px-2 py-1 rounded-xl border border-[#EBDCD5]">
                  <button
                    type="button"
                    onClick={handleClientPrevMonth}
                    className="p-1 rounded-lg hover:bg-white text-stone-700 transition-colors"
                    title="Mês anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-serif font-bold text-stone-900 px-2 min-w-28 text-center">
                    {getMonthName(calendarMonth)} {calendarYear}
                  </span>
                  <button
                    type="button"
                    onClick={handleClientNextMonth}
                    className="p-1 rounded-lg hover:bg-white text-stone-700 transition-colors"
                    title="Próximo mês"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Legenda simples */}
              <div className="flex items-center gap-3 text-[11px] text-stone-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Disponível para agendamento
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                  Folga / Indisponível
                </span>
              </div>

              {/* Grade do Calendário Mensal */}
              {loadingMonthSchedule ? (
                <div className="py-12 text-center text-stone-400 text-xs">
                  <div className="w-6 h-6 border-2 border-[#B87F6C] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Consultando escala de {getMonthName(calendarMonth)}...
                </div>
              ) : (
                <div>
                  {/* Cabeçalho dias da semana */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((lbl, idx) => (
                      <div key={lbl} className={idx === 0 ? 'text-rose-400' : ''}>
                        {lbl}
                      </div>
                    ))}
                  </div>

                  {/* Dias do mês */}
                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {/* Espaços em branco antes do primeiro dia */}
                    {monthScheduleDays.length > 0 && Array.from({ length: monthScheduleDays[0].dayOfWeek }).map((_, i) => (
                      <div key={`empty-client-${i}`} className="min-h-12 rounded-xl bg-stone-50/30" />
                    ))}

                    {monthScheduleDays.map((d) => {
                      const isSelected = selectedDate === d.date;
                      const todayStr = new Date().toISOString().split('T')[0];
                      const isPast = d.date < todayStr;
                      const isAvailable = d.isOpen && !isPast;

                      return (
                        <button
                          key={d.date}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => {
                            setSelectedDate(d.date);
                            setStep(4);
                          }}
                          className={`min-h-14 sm:min-h-16 p-1.5 rounded-2xl text-center border transition-all flex flex-col items-center justify-between relative group ${
                            !isAvailable
                              ? 'opacity-35 bg-stone-100 border-stone-200 cursor-not-allowed text-stone-400'
                              : isSelected
                              ? 'bg-[#B87F6C] text-white border-[#B87F6C] shadow-md ring-2 ring-[#B87F6C]/20'
                              : 'bg-emerald-50/50 hover:bg-emerald-100/60 border-emerald-200 text-stone-800 hover:scale-[1.02]'
                          }`}
                        >
                          <span className={`text-[10px] uppercase font-bold ${
                            isSelected ? 'text-amber-200' : isAvailable ? 'text-emerald-700' : 'text-stone-400'
                          }`}>
                            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][d.dayOfWeek]}
                          </span>

                          <span className="text-base sm:text-lg font-serif font-bold my-0.5">
                            {d.day}
                          </span>

                          <span className={`text-[9px] truncate max-w-full font-medium ${
                            isSelected ? 'text-white' : isAvailable ? 'text-emerald-700' : 'text-stone-400'
                          }`}>
                            {isPast ? 'Passou' : d.isOpen ? 'Livre' : 'Folga'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PASSO 4: Seleção de Horário Dinâmico */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-serif text-lg font-bold text-stone-900">
                  4. Escolha o horário disponível
                </h4>
                <p className="text-xs text-stone-500">
                  Horários calculados para <strong className="text-stone-800">{selectedService?.name}</strong> ({selectedService?.durationMinutes} min).
                </p>
              </div>

              {loadingSlots ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-8 h-8 border-3 border-[#B87F6C] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-stone-500">Calculando horários livres na agenda...</p>
                </div>
              ) : slotError ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Aviso de disponibilidade</p>
                    <p className="mt-0.5">{slotError}</p>
                    <button
                      onClick={() => setStep(3)}
                      className="mt-2 text-xs font-bold underline text-[#B87F6C]"
                    >
                      Escolher outro dia
                    </button>
                  </div>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="py-10 text-center text-stone-500 text-xs sm:text-sm">
                  Não há horários disponíveis para esta data. Por favor, selecione outro dia.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto p-1">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlot?.startTime === slot.startTime;
                    return (
                      <button
                        key={slot.startTime}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                          isSelected
                            ? 'bg-[#B87F6C] text-white border-[#B87F6C] shadow-md'
                            : 'bg-white hover:bg-[#FAF6F4] text-stone-800 border-[#EBDCD5] hover:border-[#CCA08F]'
                        }`}
                      >
                        <span className="block font-bold">{slot.startTime}</span>
                        <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-amber-200' : 'text-stone-400'}`}>
                          até {slot.endTime}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* PASSO 5: Dados da Cliente */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-serif text-lg font-bold text-stone-900">
                  5. Seus dados de contato
                </h4>
                <p className="text-xs text-stone-500">
                  Enviaremos o lembrete e a confirmação para o seu WhatsApp.
                </p>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="Ex: Ana Clara Silva"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DDBFB2] focus:border-[#B87F6C] focus:ring-2 focus:ring-[#B87F6C]/20 text-sm text-stone-900 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    WhatsApp (com DDD) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      placeholder="Ex: (51) 99503-7223"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DDBFB2] focus:border-[#B87F6C] focus:ring-2 focus:ring-[#B87F6C]/20 text-sm text-stone-900 outline-none"
                    />
                  </div>
                  <span className="text-[11px] text-stone-500 block mt-1">
                    Insira apenas números com DDD para envio automático da confirmação.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    E-mail (Opcional)
                  </label>
                  <input
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DDBFB2] focus:border-[#B87F6C] focus:ring-2 focus:ring-[#B87F6C]/20 text-sm text-stone-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Observações ou Preferências (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Tenho a pele sensível à cera, prefiro pinça..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-[#DDBFB2] focus:border-[#B87F6C] focus:ring-2 focus:ring-[#B87F6C]/20 text-sm text-stone-900 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PASSO 6: Forma de Pagamento e Resumo */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-serif text-lg font-bold text-stone-900">
                  6. Forma de pagamento & Revisão
                </h4>
                <p className="text-xs text-stone-500">
                  Escolha como prefere acertar seu procedimento.
                </p>
              </div>

              {/* Opções de pagamento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setPaymentMethod('PRESENCIAL')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'PRESENCIAL'
                      ? 'border-[#B87F6C] bg-[#FAF6F4] ring-2 ring-[#B87F6C]/20'
                      : 'border-[#EBDCD5] bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-4 h-4 text-[#B87F6C]" />
                    <span className="font-bold text-stone-900 text-sm">Pagar no Local</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Pague no término do atendimento em Pix, Dinheiro ou Cartão.
                  </p>
                </div>

                <div
                  onClick={() => setPaymentMethod('ONLINE')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'ONLINE'
                      ? 'border-[#B87F6C] bg-[#FAF6F4] ring-2 ring-[#B87F6C]/20'
                      : 'border-[#EBDCD5] bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="w-4 h-4 text-[#B87F6C]" />
                    <span className="font-bold text-stone-900 text-sm">Pagamento Online</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Antecipe via Pix ou Cartão de Crédito (gateway seguro).
                  </p>
                </div>
              </div>

              {/* Cartão de Resumo do Agendamento */}
              <div className="bg-[#FAF6F4] p-4 rounded-2xl border border-[#DDBFB2] space-y-2.5">
                <h5 className="font-serif font-bold text-stone-900 text-sm border-b border-[#EBDCD5] pb-1.5">
                  Resumo do Agendamento
                </h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-stone-500 block">Serviço:</span>
                    <strong className="text-stone-800">{selectedService?.name}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Duração:</span>
                    <strong className="text-stone-800">{selectedService?.durationMinutes} minutos</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Profissional:</span>
                    <strong className="text-stone-800">{selectedStylist?.name}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Valor:</span>
                    <strong className="text-[#B87F6C] font-bold text-sm">
                      R$ {selectedService?.price.toFixed(2).replace('.', ',')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Data:</span>
                    <strong className="text-stone-800">{selectedDate.split('-').reverse().join('/')}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Horário:</span>
                    <strong className="text-stone-800">{selectedSlot?.startTime} às {selectedSlot?.endTime}</strong>
                  </div>
                </div>
              </div>

              {/* Política de Agendamento Oficial da Letícia */}
              <div className="bg-[#FAF6F4] p-4 sm:p-5 rounded-2xl border border-[#DDBFB2] space-y-3">
                <div className="flex items-center gap-2 text-[#7E4E40]">
                  <Clock className="w-4 h-4 text-[#B87F6C]" />
                  <h5 className="font-serif font-bold text-sm">
                    ⏰ Política de Agendamento & Cancelamento
                  </h5>
                </div>
                
                <div className="text-xs text-stone-600 space-y-2 leading-relaxed">
                  <p>
                    • <strong>Cancelamentos ou remarcações:</strong> Devem ser realizados com no mínimo <strong>24h de antecedência</strong>.
                  </p>
                  <p>
                    • <strong>Cobrança de 50%:</strong> Após esse prazo ou em caso de <strong>não comparecimento</strong>, o pagamento dos <strong>50% do valor do procedimento</strong> é obrigatório, referente ao horário reservado exclusivamente para você.
                  </p>
                  <p className="text-[11px] text-[#A06654] italic">
                    ✨ Essa política existe para que eu consiga organizar minha agenda e respeitar o horário de todas as clientes.
                  </p>
                </div>

                <label className="flex items-start gap-2.5 pt-2 border-t border-[#EBDCD5] cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={policyAccepted}
                    onChange={(e) => setPolicyAccepted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#B87F6C] focus:ring-[#B87F6C] border-stone-300 cursor-pointer"
                  />
                  <span className="text-xs text-stone-700 font-medium group-hover:text-stone-900 select-none">
                    Li e estou ciente da política de agendamento (24h de antecedência) *
                  </span>
                </label>
              </div>

            </div>
          )}

          {/* PASSO 7: Sucesso / Comprovante Oficial com Endereço e Política */}
          {step === 7 && bookingResult && (() => {
            const noticeText =
              bookingResult.clientNoticeMessage ||
              formatNoticeMessage(selectedDate, selectedSlot?.startTime);

            const clientMsgToStudio = encodeURIComponent(
              `Oi Letícia! ✨ Acabei de agendar meu horário pelo site:\n\n` +
              `💆‍♀️ *Procedimento:* ${selectedService?.name}\n` +
              `📅 *Data:* ${selectedDate.split('-').reverse().join('/')} às ${selectedSlot?.startTime}\n` +
              `👤 *Nome:* ${clientName}\n` +
              `📱 *WhatsApp:* ${clientPhone}\n\n` +
              `Pode confirmar meu horário? Obrigada! 💖`
            );

            const targetPhone = (selectedStylist?.phone || '5551995037223').replace(/\D/g, '');
            const waDirectUrl = `https://wa.me/${targetPhone}?text=${clientMsgToStudio}`;

            return (
              <div className="py-2 space-y-5 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider border border-emerald-200">
                    <Sparkles className="w-3.5 h-3.5" />
                    Agendamento Confirmado!
                  </span>
                  <h4 className="font-serif text-2xl font-bold text-stone-900 mt-2">
                    Tudo pronto para cuidar de você! ✨
                  </h4>
                  <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-md mx-auto">
                    Olá <strong className="text-stone-900">{clientName}</strong>, seu horário para <strong>{selectedService?.name}</strong> foi reservado com sucesso!
                  </p>
                </div>

                {/* Cartão de Aviso Oficial com Endereço e Política */}
                <div className="p-4 sm:p-5 bg-[#FAF6F4] rounded-2xl border border-[#DDBFB2] text-xs text-stone-700 text-left space-y-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#EBDCD5] pb-2">
                    <span className="font-serif font-bold text-stone-900 text-sm">
                      Detalhes do Seu Atendimento
                    </span>
                    <span className="text-[11px] font-semibold text-[#A06654] bg-white px-2.5 py-0.5 rounded-full border border-[#DDBFB2]">
                      {selectedSlot?.startTime} • {selectedDate.split('-').reverse().join('/')}
                    </span>
                  </div>

                  {/* Endereço Detalhado */}
                  <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-[#EBDCD5]">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#B87F6C] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-stone-900">
                          {selectedStylist?.address || 'Condomínio Altos da Theodomiro 2, 2435'}
                        </p>
                        <p className="text-stone-600 text-[11px] mt-0.5 whitespace-pre-line">
                          {selectedStylist?.addressDetails || '➡️ 2ª portaria (meu prédio é o último da rua, são dois condomínios no local)\n🏢 Bloco 6, Apê 652 – 5º andar'}
                        </p>
                      </div>
                    </div>
                    {selectedStylist?.pixKey && (
                      <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                        <span className="font-bold text-stone-700">Chave PIX:</span>
                        <span className="font-mono bg-stone-50 px-2 py-0.5 rounded border border-stone-200 text-stone-900">
                          {selectedStylist.pixKey} ({selectedStylist.pixType || 'Chave'})
                        </span>
                      </div>
                    )}
                    <p className="text-[11px] text-[#A06654] font-medium pt-1 italic border-t border-stone-100">
                      Já aviso que precisa de um pouquinho de fôlego pra subir 🤭 mas vai ser super bem recebida por mim lá em cima! 💖
                    </p>
                  </div>

                  {/* Resumo da Política */}
                  <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 space-y-1 text-[11px] text-stone-700">
                    <p className="font-bold text-[#A06654] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Política de Agendamento (24h)
                    </p>
                    <p className="text-stone-600">
                      Cancelamentos ou remarcações com <strong>24h de antecedência</strong>. Após esse prazo ou em não comparecimento, cobrança de <strong>50% do valor do procedimento</strong>.
                    </p>
                  </div>
                </div>

                {/* Ações do Cliente (Simples, Elegante e Direto) */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(noticeText);
                      setCopiedNotice(true);
                      setTimeout(() => setCopiedNotice(false), 3000);
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#B87F6C] hover:bg-[#A06654] text-white text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-105 cursor-pointer"
                  >
                    {copiedNotice ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>Endereço e Horário Copiados!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-amber-200" />
                        <span>Copiar Endereço e Detalhes</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={resetAndClose}
                    className="w-full sm:w-auto px-6 py-3 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                  >
                    Concluir
                  </button>
                </div>

                <div className="pt-1">
                  <a
                    href={`https://wa.me/${targetPhone}?text=${encodeURIComponent('Olá Letícia! Acabei de fazer um agendamento no site e gostaria de tirar uma dúvida.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#B87F6C] transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Alguma dúvida sobre o seu horário? Chamar no WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })()}

        </div>

        {/* Footer com botões de navegação */}
        {step < 7 && (
          <div className="bg-stone-50 p-4 border-t border-[#EBDCD5] flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-stone-600 hover:bg-stone-200 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
            ) : <div />}

            {step < 6 ? (
              <button
                disabled={
                  (step === 1 && !selectedService) ||
                  (step === 2 && !selectedStylist) ||
                  (step === 3 && !selectedDate) ||
                  (step === 4 && !selectedSlot) ||
                  (step === 5 && (!clientName.trim() || !clientPhone.trim()))
                }
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#B87F6C] hover:bg-[#A06654] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold shadow-md transition-all"
              >
                <span>Avançar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                disabled={isSubmitting || !policyAccepted}
                onClick={handleConfirmBooking}
                className="flex items-center gap-2 px-7 py-3 rounded-full bg-[#B87F6C] hover:bg-[#A06654] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold shadow-lg transition-all"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Confirmando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>Finalizar Agendamento</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
