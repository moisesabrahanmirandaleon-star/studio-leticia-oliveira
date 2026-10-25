import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle,
  XCircle,
  MessageCircle,
  Settings,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  TrendingUp,
  LogOut,
  Sparkles,
  RefreshCw,
  Lock,
  Image as ImageIcon,
  ExternalLink,
  Copy,
  Check,
  MapPin,
  Info
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

export function AdminPanel({ isOpen, onClose, onRefreshServices }) {
  const { user, token, isAuthenticated, login, logout } = useAuth();

  // Estados de login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Aba ativa: 'agenda', 'servicos', 'portfolio', 'horarios'
  const [activeTab, setActiveTab] = useState('agenda');

  // Dados da agenda
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState('');

  // Dados de serviços
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('30');
  const [newServiceCategory, setNewServiceCategory] = useState('Sobrancelhas');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  // Dados de horários
  const [schedules, setSchedules] = useState([]);
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Dados de portfólio / galeria de fotos de clientes
  const [portfolio, setPortfolio] = useState([]);
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('Design');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoDesc, setNewPhotoDesc] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [copiedAppId, setCopiedAppId] = useState(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  // Carregar dados quando autenticado
  useEffect(() => {
    if (isAuthenticated && token) {
      loadAppointments();
      loadServices();
      loadSchedules();
      loadPortfolio();
    }
  }, [isAuthenticated, token, selectedDateFilter]);

  const loadAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const filters = {};
      if (selectedDateFilter) filters.date = selectedDateFilter;
      const data = await api.getAppointments(filters, token);
      setAppointments(data);
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const loadServices = async () => {
    try {
      const data = await api.getServices(true);
      setServices(data);
    } catch (err) {
      console.error('Erro ao carregar serviços:', err);
    }
  };

  const loadSchedules = async () => {
    try {
      const stylistId = user?.stylist?.id || 1;
      const data = await api.getStylistSchedule(stylistId);
      setSchedules(data);
    } catch (err) {
      console.error('Erro ao carregar horários:', err);
    }
  };

  const loadPortfolio = async () => {
    try {
      const data = await api.getPortfolio();
      setPortfolio(data);
    } catch (err) {
      console.error('Erro ao carregar portfólio:', err);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    try {
      await login(email, password);
    } catch (err) {
      setLoginError(err.message || 'Falha no login. Verifique email e senha.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.updateAppointmentStatus(id, status, token);
      loadAppointments();
    } catch (err) {
      alert(err.message || 'Erro ao alterar status.');
    }
  };

  // Salvar serviço (criar ou atualizar)
  const handleSaveService = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await api.updateService(
          editingService.id,
          {
            name: newServiceName,
            price: parseFloat(newServicePrice),
            durationMinutes: parseInt(newServiceDuration, 10),
            category: newServiceCategory,
            description: newServiceDesc
          },
          token
        );
      } else {
        await api.createService(
          {
            name: newServiceName,
            price: parseFloat(newServicePrice),
            durationMinutes: parseInt(newServiceDuration, 10),
            category: newServiceCategory,
            description: newServiceDesc
          },
          token
        );
      }

      setEditingService(null);
      setNewServiceName('');
      setNewServicePrice('');
      setNewServiceDuration('30');
      setNewServiceDesc('');
      loadServices();
      if (onRefreshServices) onRefreshServices();
    } catch (err) {
      alert(err.message || 'Erro ao salvar serviço.');
    }
  };

  const handleEditClick = (service) => {
    setEditingService(service);
    setNewServiceName(service.name);
    setNewServicePrice(service.price.toString());
    setNewServiceDuration(service.durationMinutes.toString());
    setNewServiceCategory(service.category || 'Sobrancelhas');
    setNewServiceDesc(service.description || '');
  };

  const handleToggleServiceActive = async (service) => {
    try {
      await api.updateService(service.id, { active: !service.active }, token);
      loadServices();
      if (onRefreshServices) onRefreshServices();
    } catch (err) {
      alert('Erro ao alterar status do serviço.');
    }
  };

  // Salvar foto de cliente no portfólio
  const handleSavePortfolioItem = async (e) => {
    e.preventDefault();
    if (!newPhotoTitle || !newPhotoUrl) {
      alert('Por favor, informe título e URL da imagem.');
      return;
    }
    setUploadingPhoto(true);
    try {
      await api.createPortfolioItem(
        {
          title: newPhotoTitle,
          category: newPhotoCategory,
          imageUrl: newPhotoUrl,
          description: newPhotoDesc
        },
        token
      );
      setNewPhotoTitle('');
      setNewPhotoUrl('');
      setNewPhotoDesc('');
      loadPortfolio();
      if (onRefreshServices) onRefreshServices();
      alert('Foto adicionada à galeria com sucesso!');
    } catch (err) {
      alert(err.message || 'Erro ao adicionar foto.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePortfolioItem = async (id) => {
    if (!confirm('Deseja realmente remover esta foto da galeria?')) return;
    try {
      await api.deletePortfolioItem(id, token);
      loadPortfolio();
      if (onRefreshServices) onRefreshServices();
    } catch (err) {
      alert('Erro ao remover foto.');
    }
  };

  // Salvar horários
  const handleScheduleChange = (index, field, value) => {
    const updated = [...schedules];
    updated[index][field] = value;
    setSchedules(updated);
  };

  const handleSaveSchedules = async () => {
    setSavingSchedule(true);
    try {
      const stylistId = user?.stylist?.id || 1;
      await api.updateStylistSchedule(stylistId, schedules, token);
      alert('Horários de atendimento atualizados com sucesso!');
    } catch (err) {
      alert(err.message || 'Erro ao salvar horários.');
    } finally {
      setSavingSchedule(false);
    }
  };

  // Formata o aviso oficial com data, dia da semana e política de 24h
  const formatNoticeMessage = (app) => {
    if (!app || !app.date || !app.startTime) return '';
    try {
      const dateOnly = String(app.date).split('T')[0];
      const parts = dateOnly.split('-');
      const year = Number(parts[0]);
      const month = Number(parts[1]);
      const day = Number(parts[2]);
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
        `Combinado! ${dayMonth}, ${weekday}, às ${app.startTime} ✨\n\n` +
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

  // Gera o link de Google Calendar com alerta automático no Android
  const getGoogleCalendarUrl = (app) => {
    if (!app || !app.date || !app.startTime) return '';
    const cleanDate = app.date.split('T')[0].replace(/-/g, '');
    const [startH, startM] = app.startTime.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = startTotal + Number(app.service?.durationMinutes || 30);
    const endH = String(Math.floor(endTotal / 60)).padStart(2, '0');
    const endM = String(endTotal % 60).padStart(2, '0');

    const startIso = `${cleanDate}T${String(startH).padStart(2, '0')}${String(startM).padStart(2, '0')}00`;
    const endIso = `${cleanDate}T${endH}${endM}00`;

    const title = encodeURIComponent(`✨ Studio Letícia: ${app.service?.name} - ${app.clientName}`);
    const details = encodeURIComponent(
      `Cliente: ${app.clientName}\n` +
      `WhatsApp: ${app.clientPhone}\n` +
      `Procedimento: ${app.service?.name} (${app.service?.durationMinutes} min)\n` +
      `Valor: R$ ${app.service?.price?.toFixed(2)}\n\n` +
      `📍 Endereço: Condomínio Altos da Theodomiro 2, 2435\n` +
      `➡️ 2ª portaria (último prédio da rua)\n` +
      `🏢 Bloco 6, Apê 652 – 5º andar\n\n` +
      `⏰ Política de cancelamento: 24h de antecedência ou 50% do valor.`
    );
    const location = encodeURIComponent('Condomínio Altos da Theodomiro 2, 2435, Bloco 6, Apê 652');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
  };

  if (!isOpen) return null;

  const dayLabels = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  // Métricas rápidas
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.date === todayDateStr);
  const totalRevenueExpected = todayAppointments
    .filter((a) => a.status !== 'CANCELADO')
    .reduce((acc, curr) => acc + (curr.service?.price || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-[#EBDCD5] overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Top Header */}
        <div className="bg-[#FAF6F4] p-4 sm:p-5 border-b border-[#EBDCD5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#B87F6C] text-white flex items-center justify-center shadow-sm">
              <Settings className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-lg leading-tight">
                Painel Privado de Gestão
              </h3>
              <span className="text-xs text-stone-500 font-medium">
                {isAuthenticated ? `Olá, ${user?.stylist?.name || 'Letícia Oliveira'}` : 'Acesso Restrito'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={logout}
                className="p-2 rounded-xl text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Sair do painel"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-stone-200 text-stone-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corpo principal */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          
          {/* Tela de Login se não estiver autenticado */}
          {!isAuthenticated ? (
            <div className="max-w-md mx-auto py-8">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-[#FAF6F4] border border-[#DDBFB2] text-[#B87F6C] flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-2xl font-bold text-stone-900">
                  Acesso Restrito da Dona
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  Entre com suas credenciais de administradora para gerenciar a agenda, fotos e serviços.
                </p>
              </div>

              {loginError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="seu-email@dominio.com"
                    autoComplete="username"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DDBFB2] text-sm outline-none focus:border-[#B87F6C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Senha
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DDBFB2] text-sm outline-none focus:border-[#B87F6C]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loggingIn}
                  className="w-full py-3 rounded-xl bg-[#B87F6C] hover:bg-[#A06654] text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {loggingIn ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Entrar no Painel</span>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* SE ESTIVER LOGADO */
            <div className="space-y-6">
              
              {/* Cards de Métricas do Dia */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-[#FAF6F4] border border-[#EBDCD5]">
                  <span className="text-[11px] font-bold uppercase text-stone-500 block">Hoje</span>
                  <span className="font-serif text-2xl font-bold text-stone-900 block mt-1">
                    {todayAppointments.length}
                  </span>
                  <span className="text-[10px] text-stone-500">atendimentos</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF6F4] border border-[#EBDCD5]">
                  <span className="text-[11px] font-bold uppercase text-stone-500 block">Previsto Hoje</span>
                  <span className="font-serif text-2xl font-bold text-[#B87F6C] block mt-1">
                    R$ {totalRevenueExpected.toFixed(0)}
                  </span>
                  <span className="text-[10px] text-stone-500">em procedimentos</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF6F4] border border-[#EBDCD5]">
                  <span className="text-[11px] font-bold uppercase text-stone-500 block">Total Geral</span>
                  <span className="font-serif text-2xl font-bold text-stone-900 block mt-1">
                    {appointments.length}
                  </span>
                  <span className="text-[10px] text-stone-500">agendamentos salvos</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF6F4] border border-[#EBDCD5]">
                  <span className="text-[11px] font-bold uppercase text-stone-500 block">Serviços Ativos</span>
                  <span className="font-serif text-2xl font-bold text-stone-900 block mt-1">
                    {services.filter((s) => s.active).length}
                  </span>
                  <span className="text-[10px] text-stone-500">no catálogo</span>
                </div>
              </div>

              {/* Barra de Abas (Mobile-first) */}
              <div className="flex border-b border-[#EBDCD5] gap-2 sm:gap-6 overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveTab('agenda')}
                  className={`pb-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                    activeTab === 'agenda'
                      ? 'border-[#B87F6C] text-[#B87F6C]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Agenda & Citas</span>
                </button>

                <button
                  onClick={() => setActiveTab('servicos')}
                  className={`pb-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                    activeTab === 'servicos'
                      ? 'border-[#B87F6C] text-[#B87F6C]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Serviços & Preços</span>
                </button>

                <button
                  onClick={() => setActiveTab('portfolio')}
                  className={`pb-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                    activeTab === 'portfolio'
                      ? 'border-[#B87F6C] text-[#B87F6C]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Galeria & Fotos de Clientes</span>
                </button>

                <button
                  onClick={() => setActiveTab('horarios')}
                  className={`pb-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                    activeTab === 'horarios'
                      ? 'border-[#B87F6C] text-[#B87F6C]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Horários de Atendimento</span>
                </button>
              </div>

              {/* ABA 1: AGENDA */}
              {activeTab === 'agenda' && (
                <div className="space-y-4">
                  
                  {/* Banner Oficial de Aviso e Política */}
                  <div className="p-3.5 bg-gradient-to-r from-[#FAF6F4] to-[#F5ECE8] rounded-2xl border border-[#DDBFB2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2.5 text-stone-800">
                      <Sparkles className="w-4 h-4 text-[#B87F6C] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#7E4E40] block">Mensagem Padrão de Aviso & Política de 24h</span>
                        <span className="text-stone-600 text-[11px]">
                          Envie com 1 clique o aviso com endereço (Altos da Theodomiro 2, 2435, 2ª portaria, Apê 652) e a política de cancelamento de 50%.
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPolicyModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF6F4] text-[#7E4E40] font-bold text-xs border border-[#DDBFB2] shrink-0 shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <Info className="w-3.5 h-3.5 text-[#B87F6C]" />
                      <span>Ver Modelo de Aviso</span>
                    </button>
                  </div>

                  {/* Banner Explicativo de Google Calendar no Android */}
                  <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 flex items-start gap-2.5 text-xs text-blue-900">
                    <Calendar className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>📲 Alerta no seu Android:</strong> Toque no ícone de calendário em qualquer agendamento para salvar na sua <strong>Agenda Google</strong>. O Google avisará você 15 a 30 minutos antes do atendimento!
                    </div>
                  </div>

                  {/* Filtro de data */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#FAF6F4] p-3 rounded-2xl border border-[#EBDCD5]">
                    <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
                      <span>Filtrar por data:</span>
                      <input
                        type="date"
                        value={selectedDateFilter}
                        onChange={(e) => setSelectedDateFilter(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                      />
                      {selectedDateFilter && (
                        <button
                          onClick={() => setSelectedDateFilter('')}
                          className="text-xs text-[#B87F6C] underline"
                        >
                          Limpar filtro
                        </button>
                      )}
                    </div>

                    <button
                      onClick={loadAppointments}
                      className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-xl bg-white border border-[#DDBFB2]"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Atualizar</span>
                    </button>
                  </div>

                  {/* Lista de agendamentos */}
                  {loadingAppointments ? (
                    <div className="py-10 text-center">
                      <div className="w-8 h-8 border-3 border-[#B87F6C] border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  ) : appointments.length === 0 ? (
                    <div className="p-8 text-center text-stone-500 text-xs sm:text-sm bg-stone-50 rounded-2xl border border-dashed border-stone-300">
                      Nenhum agendamento encontrado para os filtros selecionados.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {appointments.map((app) => {
                        const statusColors = {
                          PENDENTE: 'bg-amber-100 text-amber-800 border-amber-200',
                          CONFIRMADO: 'bg-blue-100 text-blue-800 border-blue-200',
                          CONCLUIDO: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                          CANCELADO: 'bg-rose-100 text-rose-800 border-rose-200 line-through opacity-70'
                        };

                        const cleanPhone = app.clientPhone.replace(/\D/g, '');
                        const noticeMessage = formatNoticeMessage(app);
                        const waNoticeLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(noticeMessage)}`;
                        const gcalUrl = getGoogleCalendarUrl(app);
                        const isCopied = copiedAppId === app.id;

                        return (
                          <div
                            key={app.id}
                            className="p-4 rounded-2xl border border-[#EBDCD5] bg-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="font-serif font-bold text-stone-900 text-base">
                                  {app.clientName}
                                </h5>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[app.status] || 'bg-stone-100'}`}>
                                  {app.status}
                                </span>
                                <span className="text-[11px] text-stone-500 font-medium">
                                  Pagamento: {app.paymentMethod === 'ONLINE' ? 'Online' : 'No Local'}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600">
                                <div className="flex items-center gap-1 font-semibold text-stone-800">
                                  <Sparkles className="w-3.5 h-3.5 text-[#B87F6C]" />
                                  <span>{app.service?.name} ({app.service?.durationMinutes} min)</span>
                                </div>
                                <div className="flex items-center gap-1 text-[#B87F6C] font-bold">
                                  <span>R$ {app.service?.price?.toFixed(2).replace('.', ',')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>{app.date.split('-').reverse().join('/')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{app.startTime} às {app.endTime}</span>
                                </div>
                              </div>

                              {app.notes && (
                                <p className="text-xs text-stone-500 italic mt-1">
                                  Obs: "{app.notes}"
                                </p>
                              )}
                            </div>

                            {/* Ações rápidas da dona */}
                            <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                              {/* Botão de Enviar Aviso Oficial via WhatsApp */}
                              <a
                                href={waNoticeLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm text-xs font-semibold transition-all"
                                title="Enviar aviso oficial de confirmação com endereço e política para a cliente"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>Enviar Aviso</span>
                              </a>

                              {/* Botão de Copiar Texto do Aviso */}
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(noticeMessage);
                                  setCopiedAppId(app.id);
                                  setTimeout(() => setCopiedAppId(null), 2500);
                                }}
                                className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 flex items-center transition-all"
                                title="Copiar texto do aviso com política e endereço"
                              >
                                {isCopied ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 text-stone-600" />
                                )}
                              </button>

                              {/* Botão de Google Calendar com alerta */}
                              <a
                                href={gcalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-1"
                                title="Salvar na Agenda Google (Alerta no Android)"
                              >
                                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                <span className="text-[10px] font-bold hidden md:inline">Google</span>
                              </a>

                              {app.status !== 'CONCLUIDO' && (
                                <button
                                  onClick={() => handleStatusChange(app.id, 'CONCLUIDO')}
                                  className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold shadow-sm"
                                  title="Marcar como Concluído"
                                >
                                  Concluir
                                </button>
                              )}

                              {app.status !== 'CANCELADO' && (
                                <button
                                  onClick={() => handleStatusChange(app.id, 'CANCELADO')}
                                  className="px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold border border-rose-200"
                                  title="Cancelar e liberar vaga"
                                >
                                  Cancelar
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              )}

              {/* ABA 2: SERVIÇOS & PREÇOS (EXPANSIBILIDADE) */}
              {activeTab === 'servicos' && (
                <div className="space-y-6">
                  
                  {/* Formulário de Adicionar / Editar Serviço */}
                  <form onSubmit={handleSaveService} className="bg-[#FAF6F4] p-4 sm:p-5 rounded-2xl border border-[#DDBFB2] space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="font-serif font-bold text-stone-900 text-sm sm:text-base">
                        {editingService ? `Editar Serviço: ${editingService.name}` : 'Cadastrar Novo Serviço (Expansão do Studio)'}
                      </h5>
                      {editingService && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingService(null);
                            setNewServiceName('');
                            setNewServicePrice('');
                            setNewServiceDuration('30');
                            setNewServiceDesc('');
                          }}
                          className="text-xs text-stone-500 hover:underline"
                        >
                          Cancelar Edição
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                          Nome do Procedimento *
                        </label>
                        <input
                          type="text"
                          required
                          value={newServiceName}
                          onChange={(e) => setNewServiceName(e.target.value)}
                          placeholder="Ex: Micropigmentação Labial, Cílios Fio a Fio..."
                          className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                          Preço em R$ *
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          required
                          value={newServicePrice}
                          onChange={(e) => setNewServicePrice(e.target.value)}
                          placeholder="Ex: 50.00"
                          className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                          Duração em Minutos *
                        </label>
                        <select
                          value={newServiceDuration}
                          onChange={(e) => setNewServiceDuration(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                        >
                          <option value="10">10 minutos (Ex: Buço)</option>
                          <option value="20">20 minutos (Ex: Epilação)</option>
                          <option value="30">30 minutos (Ex: Design Simples)</option>
                          <option value="45">45 minutos</option>
                          <option value="60">60 minutos (Ex: Henna / Lamination)</option>
                          <option value="90">90 minutos (Ex: Despigmentação)</option>
                          <option value="120">120 minutos (Ex: Micropigmentação)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                          Categoria
                        </label>
                        <select
                          value={newServiceCategory}
                          onChange={(e) => setNewServiceCategory(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                        >
                          <option value="Sobrancelhas">Sobrancelhas</option>
                          <option value="Facial">Facial</option>
                          <option value="Micropigmentação">Micropigmentação</option>
                          <option value="Despigmentação">Despigmentação</option>
                          <option value="Cílios">Cílios</option>
                          <option value="Pacotes Promocionais">Pacotes Promocionais</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                          Descrição Breve para as Clientes
                        </label>
                        <input
                          type="text"
                          value={newServiceDesc}
                          onChange={(e) => setNewServiceDesc(e.target.value)}
                          placeholder="Ex: Realce hiper-realista que valoriza o formato natural dos seus olhos."
                          className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#B87F6C] hover:bg-[#A06654] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                    >
                      {editingService ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{editingService ? 'Salvar Alterações' : 'Cadastrar Serviço'}</span>
                    </button>
                  </form>

                  {/* Lista de Serviços */}
                  <div className="space-y-2.5">
                    {services.map((s) => (
                      <div
                        key={s.id}
                        className="p-3.5 rounded-2xl border border-[#EBDCD5] bg-white flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h6 className="font-serif font-bold text-stone-900 text-sm">
                              {s.name}
                            </h6>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                              {s.category || 'Geral'}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.active ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                              {s.active ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5">
                            {s.durationMinutes} min • R$ {s.price.toFixed(2).replace('.', ',')}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(s)}
                            className="p-2 rounded-xl text-stone-600 hover:bg-stone-100"
                            title="Editar preço e duração"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleServiceActive(s)}
                            className="text-xs px-2.5 py-1 rounded-lg border border-[#DDBFB2] text-stone-700 hover:bg-stone-50"
                          >
                            {s.active ? 'Desativar' : 'Ativar'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* ABA 3: GALERIA & FOTOS DE CLIENTES (PORTFÓLIO & CATÁLOGO) */}
              {activeTab === 'portfolio' && (
                <div className="space-y-6">
                  
                  {/* Banner do Catálogo de WhatsApp da Letícia */}
                  <div className="p-4 rounded-2xl bg-[#F5ECE8] border border-[#DDBFB2] flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-serif font-bold text-stone-900 text-sm sm:text-base">
                          Catálogo WhatsApp Business Vinculado
                        </h5>
                        <p className="text-xs text-stone-600">
                          Seu catálogo oficial no WhatsApp já está sincronizado com o número <strong>(51) 99503-7223</strong>.
                        </p>
                      </div>
                    </div>

                    <a
                      href="https://wa.me/5551995037223"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Abrir Catálogo no WhatsApp</span>
                    </a>
                  </div>

                  {/* Formulário para Subir / Adicionar Nova Foto */}
                  <form onSubmit={handleSavePortfolioItem} className="bg-[#FAF6F4] p-4 sm:p-5 rounded-2xl border border-[#DDBFB2] space-y-4">
                    <h5 className="font-serif font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                      <Plus className="w-4 h-4 text-[#B87F6C]" />
                      Adicionar Nova Foto de Cliente à Galeria
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                          Título do Trabalho *
                        </label>
                        <input
                          type="text"
                          required
                          value={newPhotoTitle}
                          onChange={(e) => setNewPhotoTitle(e.target.value)}
                          placeholder="Ex: Brow Lamination na Cliente Ana"
                          className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                          Categoria *
                        </label>
                        <select
                          value={newPhotoCategory}
                          onChange={(e) => setNewPhotoCategory(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                        >
                          <option value="Design">Design</option>
                          <option value="Henna">Henna</option>
                          <option value="Lamination">Lamination</option>
                          <option value="Micropigmentação">Micropigmentação</option>
                          <option value="Despigmentação">Despigmentação</option>
                          <option value="Facial">Facial</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                          Link da Foto (URL ou Imagem) *
                        </label>
                        <input
                          type="url"
                          required
                          value={newPhotoUrl}
                          onChange={(e) => setNewPhotoUrl(e.target.value)}
                          placeholder="https://exemplo.com/foto-cliente.jpg"
                          className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                        Descrição ou Detalhes Técnicos (Opcional)
                      </label>
                      <input
                        type="text"
                        value={newPhotoDesc}
                        onChange={(e) => setNewPhotoDesc(e.target.value)}
                        placeholder="Ex: Mapeamento facial completo com tonalização castanho médio e nutrição."
                        className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={uploadingPhoto}
                      className="px-5 py-2.5 rounded-xl bg-[#B87F6C] hover:bg-[#A06654] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{uploadingPhoto ? 'Adicionando...' : 'Publicar na Galeria do Site'}</span>
                    </button>
                  </form>

                  {/* Grid de Fotos Existentes */}
                  <div>
                    <h6 className="font-serif font-bold text-stone-900 text-sm mb-3">
                      Fotos Atualmente em Exibição no Site ({portfolio.length})
                    </h6>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {portfolio.map((item) => (
                        <div
                          key={item.id}
                          className="group relative rounded-2xl overflow-hidden border border-[#EBDCD5] bg-white shadow-sm flex flex-col justify-between"
                        >
                          <div className="aspect-square overflow-hidden bg-stone-100 relative">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => handleDeletePortfolioItem(item.id)}
                              className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600 text-white shadow-md hover:bg-rose-700 transition-colors"
                              title="Remover esta foto da galeria"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="p-2.5">
                            <span className="text-[10px] font-bold uppercase text-[#B87F6C] block">
                              {item.category}
                            </span>
                            <p className="text-xs font-bold text-stone-900 truncate">
                              {item.title}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* ABA 4: HORÁRIOS DE ATENDIMENTO */}
              {activeTab === 'horarios' && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                    ⚙️ Configure os dias e horários em que você atende. A grade do site recalcula instantaneamente os horários disponíveis de acordo com a duração de cada serviço.
                  </div>

                  <div className="space-y-3">
                    {schedules.map((sch, idx) => (
                      <div
                        key={sch.dayOfWeek}
                        className="p-3.5 rounded-2xl border border-[#EBDCD5] bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 w-40">
                          <input
                            type="checkbox"
                            checked={sch.isActive}
                            onChange={(e) => handleScheduleChange(idx, 'isActive', e.target.checked)}
                            className="rounded text-[#B87F6C] focus:ring-[#B87F6C] w-4 h-4"
                          />
                          <span className="font-bold text-stone-900">
                            {dayLabels[sch.dayOfWeek]}
                          </span>
                        </div>

                        {sch.isActive ? (
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-stone-500">Expediente:</span>
                              <input
                                type="time"
                                value={sch.startTime}
                                onChange={(e) => handleScheduleChange(idx, 'startTime', e.target.value)}
                                className="px-2 py-1 rounded-lg border border-[#DDBFB2]"
                              />
                              <span>às</span>
                              <input
                                type="time"
                                value={sch.endTime}
                                onChange={(e) => handleScheduleChange(idx, 'endTime', e.target.value)}
                                className="px-2 py-1 rounded-lg border border-[#DDBFB2]"
                              />
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="text-stone-500">Almoço:</span>
                              <input
                                type="time"
                                value={sch.breakStart || ''}
                                onChange={(e) => handleScheduleChange(idx, 'breakStart', e.target.value)}
                                className="px-2 py-1 rounded-lg border border-[#DDBFB2]"
                              />
                              <span>às</span>
                              <input
                                type="time"
                                value={sch.breakEnd || ''}
                                onChange={(e) => handleScheduleChange(idx, 'breakEnd', e.target.value)}
                                className="px-2 py-1 rounded-lg border border-[#DDBFB2]"
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-stone-400 italic">Fechado / Folga</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    disabled={savingSchedule}
                    onClick={handleSaveSchedules}
                    className="px-6 py-2.5 rounded-full bg-[#B87F6C] hover:bg-[#A06654] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2"
                  >
                    {savingSchedule ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-200" />
                    )}
                    <span>Salvar Horários da Semana</span>
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal de Pré-visualização da Mensagem Oficial & Política */}
        {showPolicyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-[#EBDCD5] space-y-4 relative">
              <div className="flex items-center justify-between border-b border-[#EBDCD5] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#B87F6C]" />
                  <h4 className="font-serif font-bold text-stone-900 text-lg">
                    Mensagem Padrão de Aviso & Política
                  </h4>
                </div>
                <button
                  onClick={() => setShowPolicyModal(false)}
                  className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-stone-600">
                Este é o modelo oficial da Letícia. Quando você clica em <strong>"Enviar Aviso"</strong> em qualquer agendamento, os dados de data (X/X), dia da semana e horário são preenchidos dinamicamente e enviados direto no WhatsApp da cliente.
              </p>

              <div className="p-4 rounded-2xl bg-[#FAF6F4] border border-[#DDBFB2] text-xs text-stone-800 whitespace-pre-wrap font-sans leading-relaxed select-all max-h-72 overflow-y-auto">
{`Combinado! X/X, X-feira, às X ✨

📍 Condomínio Altos da Theodomiro 2, 2435
➡️ 2ª portaria (meu prédio é o último da rua, são dois condomínios no local)
🏢 Bloco 6, Apê 652 – 5º andar

Já aviso que precisa de um pouquinho de fôlego pra subir 🤭 mas vai ser super bem recebida por mim lá em cima! 💖

⏰ Política de agendamento
Cancelamentos ou remarcações devem ser realizados com 24h de antecedência.

Após esse prazo, será cobrado 50% do valor do procedimento. Em caso de não comparecimento, o pagamento dos 50% também é obrigatório, referente ao horário reservado exclusivamente para você.

✨ Essa política existe para que eu consiga organizar minha agenda e respeitar o horário de todas as clientes.

Qualquer dúvida, me chama! 💖`}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    const text = `Combinado! X/X, X-feira, às X ✨\n\n📍 Condomínio Altos da Theodomiro 2, 2435\n➡️ 2ª portaria (meu prédio é o último da rua, são dois condomínios no local)\n🏢 Bloco 6, Apê 652 – 5º andar\n\nJá aviso que precisa de um pouquinho de fôlego pra subir 🤭 mas vai ser super bem recebida por mim lá em cima! 💖\n\n⏰ Política de agendamento\nCancelamentos ou remarcações devem ser realizados com 24h de antecedência.\n\nApós esse prazo, será cobrado 50% do valor do procedimento. Em caso de não comparecimento, o pagamento dos 50% também é obrigatório, referente ao horário reservado exclusivamente para você.\n\n✨ Essa política existe para que eu consiga organizar minha agenda e respeitar o horário de todas as clientes.\n\nQualquer dúvida, me chama! 💖`;
                    navigator.clipboard.writeText(text);
                    alert('Modelo copiado com sucesso!');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#B87F6C] hover:bg-[#A06654] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copiar Modelo Base</span>
                </button>
                <button
                  onClick={() => setShowPolicyModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
