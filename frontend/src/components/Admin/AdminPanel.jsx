import React, { useState, useEffect, useRef } from 'react';
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
  RefreshCw,
  Lock,
  Image as ImageIcon,
  ExternalLink,
  Copy,
  Check,
  MapPin,
  Info,
  ChevronLeft,
  ChevronRight,
  Sliders,
  CreditCard,
  Tag,
  AlertCircle,
  Filter,
  Search,
  Layers,
  Eye,
  EyeOff,
  ArrowLeft,
  Gift,
  Globe,
  Ban,
  Unlock,
  Bell,
  Volume2,
  VolumeX,
  Mail,
  Maximize2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { AdminLoginView } from './AdminLoginView';
import { ImageUploader } from '../ImageUploader';
import { formatBrazilianPhoneInput, formatPhoneDisplay, buildWhatsAppUrl } from '../../utils/phoneUtils';
import { urlBase64ToUint8Array } from '../../utils/pushUtils';
import { resolveImageUrl, BONUS_PRESETS } from '../../services/imageUtils';

export function AdminPanel({ isOpen, onClose, onRefreshServices }) {
  const { user, token, isAuthenticated, login, logout } = useAuth();

  // Estados de login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Aba ativa: 'agenda', 'escala', 'servicos', 'portfolio', 'horarios', 'configuracoes'
  const [activeTab, setActiveTab] = useState('agenda');

  // --- DADOS DA AGENDA ---
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [newAppClientName, setNewAppClientName] = useState('');
  const [newAppClientPhone, setNewAppClientPhone] = useState('');
  const [newAppServiceId, setNewAppServiceId] = useState('');
  const [newAppDate, setNewAppDate] = useState(new Date().toISOString().split('T')[0]);
  const [newAppTime, setNewAppTime] = useState('14:00');
  const [newAppPaymentMethod, setNewAppPaymentMethod] = useState('PRESENCIAL');
  const [newAppNotes, setNewAppNotes] = useState('');
  const [creatingApp, setCreatingApp] = useState(false);

  // --- DADOS DA ESCALA MENSAL ---
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-12
  const [monthDays, setMonthDays] = useState([]);
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [selectedDayDetail, setSelectedDayDetail] = useState(null); // Dia para editar individualmente
  const [savingDayDetail, setSavingDayDetail] = useState(false);

  // Seleção em lote na escala
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState(new Set());
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchPreset, setBatchPreset] = useState('DUAL_ODD_EVEN'); // 'DUAL_ODD_EVEN', 'ODD_DAYS', 'EVEN_DAYS', 'PATTERN_1X1', 'PATTERN_2X2', 'WEEKENDS', 'WEEKDAYS', 'CUSTOM'
  const [batchIsOpen, setBatchIsOpen] = useState(true);
  const [batchStartTime, setBatchStartTime] = useState('09:00');
  const [batchEndTime, setBatchEndTime] = useState('19:00');
  const [batchBreakStart, setBatchBreakStart] = useState('12:00');
  const [batchBreakEnd, setBatchBreakEnd] = useState('13:00');
  const [batchCloseOthers, setBatchCloseOthers] = useState(false);
  const [batchNote, setBatchNote] = useState('Escala de Trabalho');
  const [applyingBatch, setApplyingBatch] = useState(false);

  // Estados específicos para Escala Dupla (Dois Empregos: Ímpares vs Pares)
  const [dualOddOpen, setDualOddOpen] = useState(true);
  const [dualOddStart, setDualOddStart] = useState('14:00');
  const [dualOddEnd, setDualOddEnd] = useState('19:00');
  const [dualOddBreakStart, setDualOddBreakStart] = useState('');
  const [dualOddBreakEnd, setDualOddBreakEnd] = useState('');
  const [dualOddNote, setDualOddNote] = useState('Escala Dias Ímpares');

  const [dualEvenOpen, setDualEvenOpen] = useState(true);
  const [dualEvenStart, setDualEvenStart] = useState('09:00');
  const [dualEvenEnd, setDualEvenEnd] = useState('13:00');
  const [dualEvenBreakStart, setDualEvenBreakStart] = useState('');
  const [dualEvenBreakEnd, setDualEvenBreakEnd] = useState('');
  const [dualEvenNote, setDualEvenNote] = useState('Escala Dias Pares');

  // --- BLOQUEIO DE MESES, SEMANAS E DIAS NA AGENDA ---
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockType, setBlockType] = useState('MONTH'); // 'MONTH' | 'WEEK' | 'RANGE' | 'DAYS'
  const [blockTargetMonth, setBlockTargetMonth] = useState(today.getMonth() + 1);
  const [blockTargetYear, setBlockTargetYear] = useState(today.getFullYear());
  const [blockStartDate, setBlockStartDate] = useState('');
  const [blockEndDate, setBlockEndDate] = useState('');
  const [blockReason, setBlockReason] = useState('Mês Lotado / Sem atendimento');
  const [blockIsOpen, setBlockIsOpen] = useState(false); // false = bloquear, true = liberar
  const [blockingPeriod, setBlockingPeriod] = useState(false);

  // --- DADOS DO SISTEMA DE BÔNUS & PROMOÇÕES ---
  const [bonusCampaigns, setBonusCampaigns] = useState([]);
  const [bonusApplications, setBonusApplications] = useState([]);
  const [loadingBonus, setLoadingBonus] = useState(false);
  const [bonusStatusFilter, setBonusStatusFilter] = useState('TODOS');
  const [bonusSubTab, setBonusSubTab] = useState('solicitacoes'); // 'solicitacoes' | 'campanhas'
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState(null);
  const [campTitle, setCampTitle] = useState('');
  const [campDesc, setCampDesc] = useState('');
  const [campDiscountType, setCampDiscountType] = useState('PERCENT'); // 'PERCENT', 'FIXED', 'GIFT'
  const [campDiscountValue, setCampDiscountValue] = useState('20');
  const [campGiftName, setCampGiftName] = useState('');
  const [campActive, setCampActive] = useState(true);
  const [campStartDate, setCampStartDate] = useState('');
  const [campEndDate, setCampEndDate] = useState('');
  const [campBadgeText, setCampBadgeText] = useState('Tempo Limitado');
  const [campImageUrl, setCampImageUrl] = useState('');
  const [expandedBonusAdmin, setExpandedBonusAdmin] = useState(null);
  const [savingCampaign, setSavingCampaign] = useState(false);

  // Modal para nota administrativa ao recusar/aprovar bônus
  const [noteModalApp, setNoteModalApp] = useState(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');

  // --- DADOS DE SERVIÇOS ---
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('30');
  const [newServiceCategory, setNewServiceCategory] = useState('Sobrancelhas');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  // --- DADOS DE HORÁRIOS SEMANAIS (FALLBACK) ---
  const [schedules, setSchedules] = useState([]);
  const [savingSchedule, setSavingSchedule] = useState(false);

  // --- DADOS DE PORTFÓLIO / FOTOS ---
  const [portfolio, setPortfolio] = useState([]);
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('Design');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoDesc, setNewPhotoDesc] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // --- DADOS DE CONFIGURAÇÃO DO STUDIO / PERFIL / BIOGRAFIA & REDES SOCIAIS ---
  const [stylistProfile, setStylistProfile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profName, setProfName] = useState('');
  const [profPhone, setProfPhone] = useState('');
  const [profBio, setProfBio] = useState('');
  const [profPhotoUrl, setProfPhotoUrl] = useState('');
  const [profAddress, setProfAddress] = useState('');
  const [profAddressDetails, setProfAddressDetails] = useState('');
  const [profInstagram, setProfInstagram] = useState('');
  const [profFacebook, setProfFacebook] = useState('');
  const [profTwitter, setProfTwitter] = useState('');
  const [profTiktok, setProfTiktok] = useState('');
  const [customSocials, setCustomSocials] = useState([]); // [{ id, label, url }]
  const [newCustomSocialLabel, setNewCustomSocialLabel] = useState('');
  const [newCustomSocialUrl, setNewCustomSocialUrl] = useState('');

  // Textos e Informações da Página (Biografia & Apresentação)
  const [profHeadline, setProfHeadline] = useState('');
  const [profGreetingBadge, setProfGreetingBadge] = useState('');
  const [profHeroQuote, setProfHeroQuote] = useState('');
  const [profAboutTitle, setProfAboutTitle] = useState('');
  const [profAboutDescription, setProfAboutDescription] = useState('');
  const [profExperienceYears, setProfExperienceYears] = useState('');

  const [profPixKey, setProfPixKey] = useState('');
  const [profPixType, setProfPixType] = useState('Telefone');
  const [profNoticeHours, setProfNoticeHours] = useState('24');
  const [profLateFeePercent, setProfLateFeePercent] = useState('50');
  const [profCustomPolicy, setProfCustomPolicy] = useState('');
  const [profBufferMinutes, setProfBufferMinutes] = useState('0');

  // --- SISTEMA DE NOTIFICAÇÕES EM TEMPO REAL DA DONA (SOM, VIBRAÇÃO, WEB PUSH & DRAWER) ---
  const [soundNotificationsEnabled, setSoundNotificationsEnabled] = useState(() => {
    return localStorage.getItem('studio_sound_notif') !== 'false';
  });
  const [browserNotificationsPermission, setBrowserNotificationsPermission] = useState(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [liveNotifications, setLiveNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [activeToastNotification, setActiveToastNotification] = useState(null);
  const knownAppointmentIdsRef = useRef(new Set());
  const knownBonusIdsRef = useRef(new Set());
  const audioContextRef = useRef(null);

  // Desbloqueio e inicialização do contexto de áudio para dispositivos móveis (Android / iOS)
  const getAudioContext = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }
      return audioContextRef.current;
    } catch {
      return null;
    }
  };

  // Sintetizador harmônico com Web Audio API (som de sino cristalino de estética)
  const playNotificationChime = async () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        await ctx.resume().catch(() => {});
      }
      const now = ctx.currentTime;

      // Nota 1: Sol 5 (784Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(784, now);
      gain1.gain.setValueAtTime(0.28, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Nota 2: Dó 6 (1046.5Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1046.5, now + 0.12);
      gain2.gain.setValueAtTime(0.32, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.65);

      // Nota 3: Mi 6 (1318.5Hz)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(1318.5, now + 0.24);
      gain3.gain.setValueAtTime(0.35, now + 0.24);
      gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.24);
      osc3.stop(now + 0.9);
    } catch (e) {
      console.warn('Web Audio indisponível:', e);
    }
  };

  const toggleSoundNotification = () => {
    const next = !soundNotificationsEnabled;
    setSoundNotificationsEnabled(next);
    localStorage.setItem('studio_sound_notif', String(next));
    if (next) playNotificationChime();
  };

  // Disparador de Notificação Nativa 100% compatível com Celular Android (via Service Worker) e Desktop
  const dispatchNativeNotification = async (title, options = {}) => {
    // 1. Vibração física imediata (compatível com 100% dos celulares Android)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([300, 100, 300, 100, 400]);
      } catch (e) {}
    }

    // 2. Disparo obrigatório via Service Worker no Android Chrome
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.showNotification) {
          await reg.showNotification(title, {
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            vibrate: [300, 100, 300, 100, 400],
            renotify: true,
            requireInteraction: true,
            tag: options.tag || `studio-${Date.now()}`,
            data: { url: options.url || '/' },
            ...options
          });
          return true;
        }
      } catch (err) {
        console.warn('Aviso no showNotification do Service Worker:', err);
      }
    }

    // 3. Fallback clássico para navegadores Desktop (PC)
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          icon: '/icons/icon-192.png',
          ...options
        });
        return true;
      } catch (err) {
        console.warn('Aviso no fallback de Notification Desktop:', err);
      }
    }

    return false;
  };

  // Inscreve o navegador / celular no Web Push do servidor
  const subscribeDeviceToWebPush = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const res = await api.getVapidPublicKey().catch(() => ({}));
      if (!res.publicKey) return;

      const applicationServerKey = urlBase64ToUint8Array(res.publicKey);
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey
        });
      }
      if (sub) {
        await api.subscribeToPush(sub.toJSON());
        console.log('✅ [Push] Celular registrado no Web Push da nuvem!');
      }
    } catch (err) {
      console.warn('Aviso ao registrar Web Push:', err.message);
    }
  };

  const requestBrowserNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Seu navegador não suporta notificações nativas.');
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      setBrowserNotificationsPermission(perm);
      if (perm === 'granted') {
        await subscribeDeviceToWebPush();
        await dispatchNativeNotification('✨ Studio Letícia Oliveira', {
          body: 'Notificações ativadas! Você receberá alertas sonoros e no celular a cada agendamento.',
          tag: 'perm-granted'
        });
        playNotificationChime();
      }
    } catch (err) {
      console.error('Erro ao pedir permissão de notificação:', err);
    }
  };

  // Testar som, vibração, push nativo no celular e toast visual
  const testNotification = async () => {
    // 1. Toca o sino no alto-falante
    playNotificationChime();

    // 2. Vibra o celular e exibe a notificação no Android / PC
    await dispatchNativeNotification('✨ Teste de Notificação - Studio Letícia', {
      body: 'O som, a vibração no celular e o alerta em tempo real estão 100% funcionando!',
      tag: 'test-notification'
    });

    // 3. Disparar teste de Push do servidor
    api.testPushNotification().catch(() => {});

    // 4. Toast flutuante imediato na tela
    setActiveToastNotification({
      id: Date.now(),
      clientName: 'Cliente Exemplo (Teste)',
      serviceName: 'Design com Henna & Visagismo',
      date: new Date().toLocaleDateString('pt-BR'),
      startTime: '14:30',
      clientPhone: '5551995037223'
    });

    // 5. Adicionar à fila de notificações
    const testItem = {
      id: Date.now(),
      title: 'Teste de Alerta Concluído',
      clientName: 'Alerta Teste do Sistema',
      phone: '5551995037223',
      details: 'Sino, vibração e banner testados com sucesso.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isNew: true
    };
    setLiveNotifications(prev => [testItem, ...prev]);
    setUnreadNotificationsCount(prev => prev + 1);
  };

  // Auxiliares visuais
  const [copiedAppId, setCopiedAppId] = useState(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  const [stylistId, setStylistId] = useState(user?.stylist?.id || 1);

  useEffect(() => {
    async function resolveStylist() {
      if (user?.stylist?.id) {
        setStylistId(user.stylist.id);
      } else {
        try {
          const all = await api.getStylists();
          if (all.length > 0) {
            setStylistId(all[0].id);
          }
        } catch {}
      }
    }
    if (isAuthenticated) {
      resolveStylist();
    }
  }, [isAuthenticated, user]);

  // Carregar dados quando autenticado
  useEffect(() => {
    if (isAuthenticated && token && stylistId) {
      loadAppointments();
      loadServices();
      loadSchedules();
      loadPortfolio();
      loadStylistProfile();
      loadMonthSchedule(currentYear, currentMonth);
      loadBonusData();
    }
  }, [isAuthenticated, token, selectedDateFilter, stylistId]);

  // 1. Canal em tempo real instantâneo (Server-Sent Events)
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    let eventSource = null;
    try {
      const streamUrl = api.getAppointmentStreamUrl(token);
      eventSource = new EventSource(streamUrl);

      eventSource.onmessage = async (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'NEW_APPOINTMENT' && payload.appointment) {
            const app = payload.appointment;
            const cleanDt = app.date ? String(app.date).split('T')[0].split('-').reverse().join('/') : '';

            // Tocar aviso sonoro
            if (soundNotificationsEnabled) {
              playNotificationChime();
            }

            // Notificação Nativa (Vibra celular + push no Android/PC)
            await dispatchNativeNotification(`✨ Novo Agendamento: ${app.clientName}`, {
              body: `${app.service?.name || 'Procedimento'} em ${cleanDt} às ${app.startTime}`,
              tag: `app-${app.id}`
            });

            // Adicionar ao topo da fila de notificações
            const newItem = {
              id: app.id,
              title: 'Novo Agendamento Confirmado',
              clientName: app.clientName,
              phone: app.clientPhone,
              details: `${app.service?.name || 'Procedimento'} • ${cleanDt} às ${app.startTime}`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isNew: true
            };
            setLiveNotifications(prev => [newItem, ...prev.filter(x => x.id !== app.id)].slice(0, 30));
            setUnreadNotificationsCount(prev => prev + 1);

            // Toast flutuante na tela
            setActiveToastNotification({
              id: app.id,
              clientName: app.clientName,
              serviceName: app.service?.name || 'Procedimento',
              date: cleanDt,
              startTime: app.startTime,
              clientPhone: app.clientPhone
            });

            // Recarregar lista para atualizar tabela e métricas
            loadAppointments(true);
          } else if (payload.type === 'NEW_BONUS' && payload.application) {
            const b = payload.application;
            if (soundNotificationsEnabled) {
              playNotificationChime();
            }
            await dispatchNativeNotification(`🎁 Novo Bônus Solicitado: ${b.clientName}`, {
              body: `Campanha: ${b.campaign?.title || 'Bônus'} (${formatPhoneDisplay(b.clientPhone)})`,
              tag: `bonus-${b.id}`
            });
            loadBonusData(true);
          }
        } catch (e) {}
      };

      eventSource.onerror = () => {
        eventSource?.close();
      };
    } catch (e) {}

    return () => {
      eventSource?.close();
    };
  }, [isAuthenticated, token, soundNotificationsEnabled]);

  // 2. Polling secundário a cada 12 segundos + wake-up quando o usuário desbloqueia o celular
  useEffect(() => {
    if (!isAuthenticated || !token || !stylistId) return;

    const interval = setInterval(() => {
      loadAppointments(true);
      loadBonusData(true);
    }, 12000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadAppointments(true);
        loadBonusData(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, token, selectedDateFilter, stylistId, soundNotificationsEnabled]);

  const loadAppointments = async (isBackgroundPoll = false) => {
    if (!isBackgroundPoll) setLoadingAppointments(true);
    try {
      const filters = {};
      if (selectedDateFilter) filters.date = selectedDateFilter;
      const data = await api.getAppointments(filters, token);

      if (Array.isArray(data)) {
        // Detectar agendamentos recém-chegados comparando com o Set de conhecidos
        if (knownAppointmentIdsRef.current.size > 0) {
          const newlyAdded = data.filter(a => !knownAppointmentIdsRef.current.has(a.id));
          if (newlyAdded.length > 0) {
            if (soundNotificationsEnabled) {
              playNotificationChime();
            }

            const latest = newlyAdded[0];
            const cleanDt = latest.date ? String(latest.date).split('T')[0].split('-').reverse().join('/') : '';

            dispatchNativeNotification(`✨ Novo Agendamento: ${latest.clientName}`, {
              body: `${latest.service?.name || 'Procedimento'} em ${cleanDt} às ${latest.startTime}`,
              tag: `app-${latest.id}`
            });

            const newNotifs = newlyAdded.map(a => ({
              id: a.id,
              title: 'Novo Agendamento Confirmado',
              clientName: a.clientName,
              phone: a.clientPhone,
              details: `${a.service?.name || 'Procedimento'} • ${a.date ? String(a.date).split('T')[0].split('-').reverse().join('/') : ''} às ${a.startTime}`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isNew: true
            }));

            setLiveNotifications(prev => [...newNotifs, ...prev].slice(0, 30));
            setUnreadNotificationsCount(prev => prev + newlyAdded.length);
            setActiveToastNotification({
              id: latest.id,
              clientName: latest.clientName,
              serviceName: latest.service?.name || 'Procedimento',
              date: cleanDt,
              startTime: latest.startTime,
              clientPhone: latest.clientPhone
            });
          }
        }

        // Se a central de notificações estiver vazia, pré-preenche com os últimos agendamentos do banco
        setLiveNotifications(prev => {
          if (prev.length > 0) return prev;
          const initialQueue = data.slice(0, 10).map(a => ({
            id: a.id,
            title: 'Agendamento no Sistema',
            clientName: a.clientName,
            phone: a.clientPhone,
            details: `${a.service?.name || 'Procedimento'} • ${a.date ? String(a.date).split('T')[0].split('-').reverse().join('/') : ''} às ${a.startTime}`,
            time: a.date ? String(a.date).split('T')[0].split('-').reverse().join('/') : '',
            isNew: false
          }));
          return initialQueue;
        });

        // Registrar IDs conhecidos
        data.forEach(a => knownAppointmentIdsRef.current.add(a.id));
      }

      setAppointments(data || []);
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err);
    } finally {
      if (!isBackgroundPoll) setLoadingAppointments(false);
    }
  };

  const loadServices = async () => {
    try {
      const data = await api.getServices(true);
      setServices(data);
      if (data.length > 0 && !newAppServiceId) {
        setNewAppServiceId(String(data[0].id));
      }
    } catch (err) {
      console.error('Erro ao carregar serviços:', err);
    }
  };

  const loadSchedules = async () => {
    try {
      const data = await api.getStylistSchedule(stylistId);
      setSchedules(data);
    } catch (err) {
      console.error('Erro ao carregar horários semanais:', err);
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

  const loadStylistProfile = async () => {
    try {
      const data = await api.getStylistById(stylistId);
      setStylistProfile(data);
      setProfName(data.name || 'Letícia Oliveira');
      setProfPhone(data.phone || '5551995037223');
      setProfBio(data.bio || '');
      setProfPhotoUrl(data.photoUrl || '/leticia-perfil.jpg');
      setProfAddress(data.address || 'Condomínio Altos da Theodomiro 2, 2435');
      setProfAddressDetails(data.addressDetails || '2ª portaria (último prédio da rua), Bloco 6, Apê 652 – 5º andar');
      setProfInstagram(data.instagram || '@leticia_studiosobrancelhas');
      setProfFacebook(data.facebook || '');
      setProfTwitter(data.twitter || '');
      setProfTiktok(data.tiktok || '');
      try {
        setCustomSocials(data.otherSocials ? JSON.parse(data.otherSocials) : []);
      } catch (e) {
        setCustomSocials([]);
      }

      setProfHeadline(data.headline || 'Cuidando do seu olhar com amor, visagismo & dedicação.');
      setProfGreetingBadge(data.greetingBadge || 'Prazer, sou a Letícia! ✨ • 25 Anos');
      setProfHeroQuote(data.heroQuote || 'Hoje, meu trabalho vai muito além de um procedimento estético. É sobre valorizar a beleza individual, respeitar cada expressão e contribuir para que cada mulher se sinta ainda mais bonita e confiante.');
      setProfAboutTitle(data.aboutTitle || 'Um refúgio de acolhimento e cuidado desenhado para realçar você.');
      setProfAboutDescription(data.aboutDescription || 'O Studio Letícia Oliveira nasceu da paixão pelo visagismo facial e pela crença de que cada rosto possui uma harmonia única que merece ser respeitada.');
      setProfExperienceYears(data.experienceYears || 'Desde 2023 · Beleza & Visagismo');

      setProfPixKey(data.pixKey || '5551995037223');
      setProfPixType(data.pixType || 'Telefone');
      setProfNoticeHours(String(data.cancellationNoticeHours ?? 24));
      setProfLateFeePercent(String(data.cancellationFeePercent ?? 50));
      setProfCustomPolicy(data.customPolicyText || 'Cancelamentos ou remarcações devem ser realizados com 24h de antecedência. Após esse prazo ou em caso de não comparecimento, é cobrado 50% do valor do procedimento, referente ao horário reservado exclusivamente para você.');
      setProfBufferMinutes(String(data.bufferMinutes ?? 0));
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    }
  };

  const loadBonusData = async (isBackgroundPoll = false) => {
    if (!token) return;
    if (!isBackgroundPoll) setLoadingBonus(true);
    try {
      const [camps, apps] = await Promise.all([
        api.getAdminBonusCampaigns(token),
        api.getBonusApplications({}, token)
      ]);
      setBonusCampaigns(camps || []);

      if (Array.isArray(apps)) {
        if (knownBonusIdsRef.current.size > 0) {
          const newApps = apps.filter(a => !knownBonusIdsRef.current.has(a.id) && a.status === 'PENDENTE');
          if (newApps.length > 0) {
            if (soundNotificationsEnabled) playNotificationChime();
            const first = newApps[0];
            if ('Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification(`🎁 Novo Pedido de Bônus: ${first.clientName}`, {
                  body: `Campanha: ${first.campaign?.title || 'Promoção'} • Aguardando sua liberação`,
                  icon: '/pwa-192x192.png'
                });
              } catch (e) {}
            }
            setLiveNotifications(prev => [
              ...newApps.map(a => ({
                id: `bonus-${a.id}`,
                title: '🎁 Pedido de Bônus Recebido',
                clientName: a.clientName,
                phone: a.clientPhone,
                details: `Bônus: ${a.campaign?.title || 'Campanha'} • WhatsApp: ${a.clientPhone}`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              })),
              ...prev
            ].slice(0, 30));
            setUnreadNotificationsCount(prev => prev + newApps.length);
          }
        }
        apps.forEach(a => knownBonusIdsRef.current.add(a.id));
      }

      setBonusApplications(apps || []);
    } catch (err) {
      console.error('Erro ao carregar dados de bônus:', err);
    } finally {
      if (!isBackgroundPoll) setLoadingBonus(false);
    }
  };

  const loadMonthSchedule = async (year, month) => {
    setLoadingMonth(true);
    try {
      const res = await api.getMonthSchedule(stylistId, year, month);
      setMonthDays(res.days || []);
    } catch (err) {
      console.error('Erro ao carregar escala do mês:', err);
    } finally {
      setLoadingMonth(false);
    }
  };

  // Navegação de mês
  const handlePrevMonth = () => {
    let newM = currentMonth - 1;
    let newY = currentYear;
    if (newM < 1) {
      newM = 12;
      newY -= 1;
    }
    setCurrentMonth(newM);
    setCurrentYear(newY);
    setSelectedDates(new Set());
    loadMonthSchedule(newY, newM);
  };

  const handleNextMonth = () => {
    let newM = currentMonth + 1;
    let newY = currentYear;
    if (newM > 12) {
      newM = 1;
      newY += 1;
    }
    setCurrentMonth(newM);
    setCurrentYear(newY);
    setSelectedDates(new Set());
    loadMonthSchedule(newY, newM);
  };

  const handleGoToCurrentMonth = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
    setSelectedDates(new Set());
    loadMonthSchedule(now.getFullYear(), now.getMonth() + 1);
  };

  // Login
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

  // Alteração rápida de status de agendamento
  const handleStatusChange = async (id, status) => {
    try {
      await api.updateAppointmentStatus(id, status, token);
      loadAppointments();
      loadMonthSchedule(currentYear, currentMonth);
    } catch (err) {
      alert(err.message || 'Erro ao alterar status.');
    }
  };

  // Excluir agendamento
  const handleDeleteAppointment = async (id) => {
    if (!confirm('Deseja realmente excluir este agendamento? Esta ação não pode ser desfeita.')) return;
    try {
      await api.deleteAppointment(id, token);
      loadAppointments();
      loadMonthSchedule(currentYear, currentMonth);
    } catch (err) {
      alert(err.message || 'Erro ao excluir agendamento.');
    }
  };

  // Criar Agendamento Manual pela Dona
  const handleCreateManualAppointment = async (e) => {
    e.preventDefault();
    if (!newAppClientName.trim() || !newAppClientPhone.trim() || !newAppServiceId || !newAppDate || !newAppTime) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setCreatingApp(true);
    try {
      await api.createAppointment({
        clientName: newAppClientName.trim(),
        clientPhone: formatPhoneDisplay(newAppClientPhone),
        stylistId,
        serviceId: Number(newAppServiceId),
        date: newAppDate,
        startTime: newAppTime,
        paymentMethod: newAppPaymentMethod,
        notes: newAppNotes.trim() || undefined
      });

      setShowNewAppointmentModal(false);
      setNewAppClientName('');
      setNewAppClientPhone('');
      setNewAppNotes('');
      loadAppointments();
      loadMonthSchedule(currentYear, currentMonth);
      alert('Agendamento cadastrado com sucesso!');
    } catch (err) {
      alert(err.message || 'Erro ao cadastrar agendamento.');
    } finally {
      setCreatingApp(false);
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

  const handleDeleteService = async (serviceId) => {
    if (!confirm('Deseja realmente remover este serviço do catálogo?')) return;
    try {
      await api.deleteService(serviceId, token);
      loadServices();
      if (onRefreshServices) onRefreshServices();
    } catch (err) {
      alert('Erro ao remover serviço.');
    }
  };

  // Salvar foto no portfólio
  const handleSavePortfolioItem = async (e) => {
    e.preventDefault();
    if (!newPhotoTitle || !newPhotoUrl) {
      alert('Por favor, informe título e link da imagem.');
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

  // Salvar horários padrão da semana (Fallback)
  const handleScheduleChange = (index, field, value) => {
    const updated = [...schedules];
    updated[index][field] = value;
    setSchedules(updated);
  };

  const handleSaveSchedules = async () => {
    setSavingSchedule(true);
    try {
      let syncMonth = false;
      const hasMonthOverrides = monthDays && monthDays.some(d => d.isOverride && d.isOpen);
      if (hasMonthOverrides) {
        syncMonth = window.confirm(
          `Você possui dias já configurados na Escala Mensal de ${getMonthName(currentMonth)}/${currentYear}.\n\nDeseja aplicar estes novos horários também a todos os dias abertos desse mês?`
        );
      }

      const res = await api.updateStylistSchedule(stylistId, schedules, token, {
        syncMonth,
        year: currentYear,
        month: currentMonth
      });
      alert(res.message || 'Horários padrão da semana atualizados com sucesso!');
      loadMonthSchedule(currentYear, currentMonth);
    } catch (err) {
      alert(err.message || 'Erro ao salvar horários.');
    } finally {
      setSavingSchedule(false);
    }
  };

  // Salvar configurações do Studio / Perfil da Letícia
  const handleSaveStylistProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMsg('');
    try {
      await api.updateStylistProfile(
        stylistId,
        {
          name: profName,
          phone: profPhone,
          bio: profBio,
          photoUrl: profPhotoUrl,
          address: profAddress,
          addressDetails: profAddressDetails,
          instagram: profInstagram,
          facebook: profFacebook,
          twitter: profTwitter,
          tiktok: profTiktok,
          otherSocials: JSON.stringify(customSocials),
          headline: profHeadline,
          greetingBadge: profGreetingBadge,
          heroQuote: profHeroQuote,
          aboutTitle: profAboutTitle,
          aboutDescription: profAboutDescription,
          experienceYears: profExperienceYears,
          pixKey: profPixKey,
          pixType: profPixType,
          cancellationNoticeHours: Number(profNoticeHours),
          cancellationFeePercent: Number(profLateFeePercent),
          customPolicyText: profCustomPolicy,
          bufferMinutes: Number(profBufferMinutes)
        },
        token
      );
      setProfileSuccessMsg('Configurações e informações do site salvas com sucesso!');
      loadStylistProfile();
      if (onRefreshServices) onRefreshServices();
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Erro ao salvar configurações do Studio.');
    } finally {
      setSavingProfile(false);
    }
  };

  // --- BLOQUEIO DE MESES, SEMANAS E DIAS ---
  const handleApplyBlockPeriod = async () => {
    setBlockingPeriod(true);
    try {
      const payload = {
        stylistId,
        type: blockType,
        isOpen: blockIsOpen,
        reason: blockReason || (blockIsOpen ? 'Atendimento confirmado' : 'Sem atendimento / Bloqueado')
      };

      if (blockType === 'MONTH') {
        payload.year = Number(blockTargetYear);
        payload.month = Number(blockTargetMonth);
      } else if (blockType === 'WEEK' || blockType === 'RANGE') {
        if (!blockStartDate || !blockEndDate) {
          alert('Por favor, informe a data inicial e final do período.');
          setBlockingPeriod(false);
          return;
        }
        payload.startDate = blockStartDate;
        payload.endDate = blockEndDate;
      } else if (blockType === 'DAYS') {
        if (selectedDates.size === 0) {
          alert('Selecione ao menos um dia no calendário antes de aplicar.');
          setBlockingPeriod(false);
          return;
        }
        payload.dates = Array.from(selectedDates);
      }

      const res = await api.blockSchedulePeriod(payload, token);
      alert(res.message || 'Bloqueio/Liberação aplicado com sucesso!');
      setShowBlockModal(false);
      setSelectedDates(new Set());
      setMultiSelectMode(false);
      loadMonthSchedule(currentYear, currentMonth);
    } catch (err) {
      alert(err.message || 'Erro ao aplicar bloqueio na agenda.');
    } finally {
      setBlockingPeriod(false);
    }
  };

  // --- GESTÃO DE BÔNUS & PROMOÇÕES ---
  const handleOpenNewCampaignModal = (campaign = null) => {
    if (campaign) {
      setEditingCampaignId(campaign.id);
      setCampTitle(campaign.title || '');
      setCampDesc(campaign.description || '');
      setCampDiscountType(campaign.discountType || 'PERCENT');
      setCampDiscountValue(String(campaign.discountValue ?? 20));
      setCampGiftName(campaign.giftName || '');
      setCampActive(campaign.active !== false);
      setCampStartDate(campaign.startDate || '');
      setCampEndDate(campaign.endDate || '');
      setCampBadgeText(campaign.badgeText || 'Tempo Limitado');
      setCampImageUrl(campaign.imageUrl || '');
    } else {
      setEditingCampaignId(null);
      setCampTitle('');
      setCampDesc('');
      setCampDiscountType('PERCENT');
      setCampDiscountValue('20');
      setCampGiftName('');
      setCampActive(true);
      setCampStartDate('');
      setCampEndDate('');
      setCampBadgeText('Tempo Limitado');
      setCampImageUrl('');
    }
    setShowCampaignModal(true);
  };

  const handleSaveCampaign = async (e) => {
    e.preventDefault();
    if (!campTitle.trim()) {
      alert('Informe o título do bônus.');
      return;
    }
    setSavingCampaign(true);
    try {
      const payload = {
        title: campTitle.trim(),
        description: campDesc.trim() || null,
        discountType: campDiscountType,
        discountValue: Number(campDiscountValue) || 0,
        giftName: campGiftName.trim() || null,
        active: Boolean(campActive),
        startDate: campStartDate || null,
        endDate: campEndDate || null,
        badgeText: campBadgeText.trim() || 'Tempo Limitado',
        imageUrl: campImageUrl.trim() || null
      };

      if (editingCampaignId) {
        await api.updateBonusCampaign(editingCampaignId, payload, token);
        alert('Campanha de bônus atualizada com sucesso!');
      } else {
        await api.createBonusCampaign(payload, token);
        alert('Campanha de bônus criada e publicada com sucesso!');
      }

      setShowCampaignModal(false);
      loadBonusData();
    } catch (err) {
      alert(err.message || 'Erro ao salvar campanha de bônus.');
    } finally {
      setSavingCampaign(false);
    }
  };

  const handleToggleCampaignActive = async (campaign) => {
    try {
      await api.updateBonusCampaign(campaign.id, { active: !campaign.active }, token);
      loadBonusData();
    } catch (err) {
      alert('Erro ao alterar status da campanha.');
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!confirm('Deseja realmente excluir esta campanha de bônus?')) return;
    try {
      await api.deleteBonusCampaign(id, token);
      loadBonusData();
    } catch (err) {
      alert('Erro ao excluir campanha.');
    }
  };

  const handleUpdateAppStatus = async (applicationId, status, note = null) => {
    try {
      const res = await api.updateBonusApplicationStatus(applicationId, { status, adminNote: note }, token);
      alert(`Status atualizado para: ${status}!`);
      loadBonusData();

      // Se foi aprovado e gerou link do WhatsApp, oferecer para enviar imediatamente
      if (res.whatsappNotifyUrl) {
        if (confirm('Deseja enviar a mensagem de liberação do bônus para o WhatsApp da cliente agora?')) {
          window.open(res.whatsappNotifyUrl, '_blank');
        }
      }
    } catch (err) {
      alert(err.message || 'Erro ao atualizar solicitação.');
    }
  };

  // --- ESCALA MENSAL & EM LOTE ---

  // Alternar dia específico (abrir/fechar rápido com 1 clique)
  const handleQuickToggleDay = async (dayItem, e) => {
    e.stopPropagation();
    try {
      const willOpen = !dayItem.isOpen;
      await api.updateDateSchedule(
        {
          stylistId,
          date: dayItem.date,
          isOpen: willOpen,
          startTime: dayItem.startTime || '09:00',
          endTime: dayItem.endTime || '19:00',
          breakStart: dayItem.breakStart || '12:00',
          breakEnd: dayItem.breakEnd || '13:00',
          note: willOpen ? 'Atendimento confirmado' : 'Folga / Escala obrigatória'
        },
        token
      );
      loadMonthSchedule(currentYear, currentMonth);
    } catch (err) {
      alert('Erro ao alterar status do dia.');
    }
  };

  // Salvar detalhe de um dia específico
  const handleSaveDayDetail = async () => {
    if (!selectedDayDetail) return;
    setSavingDayDetail(true);
    try {
      await api.updateDateSchedule(
        {
          stylistId,
          date: selectedDayDetail.date,
          isOpen: Boolean(selectedDayDetail.isOpen),
          startTime: selectedDayDetail.startTime || '09:00',
          endTime: selectedDayDetail.endTime || '19:00',
          breakStart: selectedDayDetail.breakStart || null,
          breakEnd: selectedDayDetail.breakEnd || null,
          note: selectedDayDetail.note || null
        },
        token
      );
      setSelectedDayDetail(null);
      loadMonthSchedule(currentYear, currentMonth);
    } catch (err) {
      alert('Erro ao salvar escala do dia.');
    } finally {
      setSavingDayDetail(false);
    }
  };

  // Alternar seleção de data individual
  const toggleDateSelection = (dateStr) => {
    const updated = new Set(selectedDates);
    if (updated.has(dateStr)) {
      updated.delete(dateStr);
    } else {
      updated.add(dateStr);
    }
    setSelectedDates(updated);
    if (updated.size > 0) {
      setMultiSelectMode(true);
    }
  };

  // Seleção rápida por filtro no calendário (Ímpares, Pares, etc.)
  const handleSelectFilter = (filterType) => {
    const newSelected = new Set();
    monthDays.forEach((d) => {
      const dayNum = d.day;
      const dow = d.dayOfWeek;
      if (filterType === 'ODD' && dayNum % 2 !== 0) newSelected.add(d.date);
      if (filterType === 'EVEN' && dayNum % 2 === 0) newSelected.add(d.date);
      if (filterType === 'WEEKDAYS' && dow >= 1 && dow <= 5) newSelected.add(d.date);
      if (filterType === 'WEEKENDS' && (dow === 0 || dow === 6)) newSelected.add(d.date);
      if (filterType === 'ALL') newSelected.add(d.date);
    });
    setSelectedDates(newSelected);
    setMultiSelectMode(true);
  };

  // Seleção de data ao clicar no card
  const handleDateClick = (dayItem) => {
    if (multiSelectMode) {
      toggleDateSelection(dayItem.date);
    } else {
      // Abre o modal de detalhe daquele dia
      setSelectedDayDetail({ ...dayItem });
    }
  };

  // Ação rápida em lote para datas selecionadas (ex: fechar todas ou abrir todas em 1 clique)
  const handleBatchSetStatus = async (isOpen, defaultNote = '') => {
    if (selectedDates.size === 0) return;
    setApplyingBatch(true);
    try {
      const payload = {
        stylistId,
        year: currentYear,
        month: currentMonth,
        mode: 'CUSTOM_DATES',
        customDates: Array.from(selectedDates),
        closeOthers: false,
        isOpen,
        startTime: isOpen ? '09:00' : null,
        endTime: isOpen ? '19:00' : null,
        note: defaultNote || (isOpen ? 'Atendimento confirmado' : 'Folga / Outro trabalho')
      };
      const res = await api.batchUpdateSchedule(payload, token);
      alert(res.message || 'Escala atualizada com sucesso!');
      setSelectedDates(new Set());
      setMultiSelectMode(false);
      loadMonthSchedule(currentYear, currentMonth);
    } catch (err) {
      alert(err.message || 'Erro ao atualizar datas selecionadas.');
    } finally {
      setApplyingBatch(false);
    }
  };

  // Aplicar regra de escala em lote (Escala Dupla, Dias Ímpares, Dias Pares, etc.)
  const handleApplyBatchSchedule = async () => {
    setApplyingBatch(true);
    try {
      const payload = {
        stylistId,
        year: currentYear,
        month: currentMonth,
        mode: batchPreset,
        closeOthers: batchCloseOthers,
        isOpen: batchIsOpen,
        startTime: batchStartTime,
        endTime: batchEndTime,
        breakStart: batchBreakStart || null,
        breakEnd: batchBreakEnd || null,
        note: batchNote
      };

      if (batchPreset === 'DUAL_ODD_EVEN') {
        payload.oddConfig = {
          isOpen: dualOddOpen,
          startTime: dualOddStart,
          endTime: dualOddEnd,
          breakStart: dualOddBreakStart || null,
          breakEnd: dualOddBreakEnd || null,
          note: dualOddNote
        };
        payload.evenConfig = {
          isOpen: dualEvenOpen,
          startTime: dualEvenStart,
          endTime: dualEvenEnd,
          breakStart: dualEvenBreakStart || null,
          breakEnd: dualEvenBreakEnd || null,
          note: dualEvenNote
        };
      } else if (batchPreset === 'CUSTOM') {
        payload.mode = 'CUSTOM_DATES';
        payload.customDates = Array.from(selectedDates);
      }

      const res = await api.batchUpdateSchedule(payload, token);
      alert(res.message || 'Escala em lote aplicada com sucesso!');
      setShowBatchModal(false);
      setMultiSelectMode(false);
      setSelectedDates(new Set());
      loadMonthSchedule(currentYear, currentMonth);
    } catch (err) {
      alert(err.message || 'Erro ao aplicar escala em lote.');
    } finally {
      setApplyingBatch(false);
    }
  };

  // Resetar escala do mês (voltar ao padrão semanal)
  const handleResetMonth = async () => {
    if (!confirm(`Deseja limpar as regras especiais de ${getMonthName(currentMonth)}/${currentYear} e retornar ao horário padrão semanal?`)) return;
    try {
      await api.resetMonthSchedule(stylistId, currentYear, currentMonth, token);
      loadMonthSchedule(currentYear, currentMonth);
      alert('Escala do mês redefinida com sucesso.');
    } catch (err) {
      alert('Erro ao redefinir mês.');
    }
  };

  // Formatar mensagem oficial da Letícia para envio no WhatsApp
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

      const addr = profAddress || 'Condomínio Altos da Theodomiro 2, 2435';
      const addrDet = profAddressDetails || '2ª portaria (meu prédio é o último da rua, são dois condomínios no local)\n🏢 Bloco 6, Apê 652 – 5º andar';
      const polText = profCustomPolicy || `Cancelamentos ou remarcações devem ser realizados com ${profNoticeHours}h de antecedência.\n\nApós esse prazo, será cobrado ${profLateFeePercent}% do valor do procedimento. Em caso de não comparecimento, o pagamento dos ${profLateFeePercent}% também é obrigatório, referente ao horário reservado exclusivamente para você.`;
      const pix = profPixKey ? `\n💳 Chave PIX: ${profPixKey} (${profPixType})\n` : '';

      return (
        `Combinado! ${dayMonth}, ${weekday}, às ${app.startTime} ✨\n\n` +
        `📍 ${addr}\n` +
        `➡️ ${addrDet}\n\n` +
        `Já aviso que precisa de um pouquinho de fôlego pra subir 🤭 mas vai ser super bem recebida por mim lá em cima! 💖\n` +
        pix +
        `\n⏰ Política de agendamento\n` +
        `${polText}\n\n` +
        `✨ Essa política existe para que eu consiga organizar minha agenda e respeitar o horário de todas as clientes.\n\n` +
        `Qualquer dúvida, me chama! 💖`
      );
    } catch {
      return '';
    }
  };

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
      `WhatsApp: ${formatPhoneDisplay(app.clientPhone)}\n` +
      `Procedimento: ${app.service?.name} (${app.service?.durationMinutes} min)\n` +
      `Valor: R$ ${app.service?.price?.toFixed(2)}\n\n` +
      `📍 Endereço: ${profAddress || 'Condomínio Altos da Theodomiro 2, 2435, Bloco 6, Apê 652'}\n\n` +
      `⏰ Política de cancelamento: ${profNoticeHours}h de antecedência ou ${profLateFeePercent}% do valor.`
    );
    const location = encodeURIComponent(profAddress || 'Condomínio Altos da Theodomiro 2, 2435, Bloco 6, Apê 652');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
  };

  if (!isOpen) return null;

  if (!isAuthenticated) {
    return (
      <AdminLoginView
        onBackToClient={onClose}
        onSuccessLogin={() => {
          loadAppointments();
          loadMonthSchedule();
          if (onRefreshServices) onRefreshServices();
        }}
      />
    );
  }

  const dayLabels = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const weekShortLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  function getMonthName(m) {
    const names = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return names[m - 1] || '';
  }

  // Métricas rápidas
  const todayDateStr = new Date().toISOString().split('T')[0];
  const currentMonthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  const todayAppointments = appointments.filter((a) => a.date === todayDateStr);
  const monthAppointments = appointments.filter((a) => a.date?.startsWith(currentMonthPrefix));

  const totalRevenueExpectedToday = todayAppointments
    .filter((a) => a.status !== 'CANCELADO')
    .reduce((acc, curr) => acc + (curr.service?.price || 0), 0);

  const totalRevenueExpectedMonth = monthAppointments
    .filter((a) => a.status !== 'CANCELADO')
    .reduce((acc, curr) => acc + (curr.service?.price || 0), 0);

  // Filtragem na aba agenda
  const filteredAppointments = appointments.filter((app) => {
    if (statusFilter !== 'TODOS' && app.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = app.clientName?.toLowerCase().includes(q);
      const matchPhone = app.clientPhone?.includes(q);
      const matchService = app.service?.name?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchService) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen w-full bg-[#FAF6F4] text-stone-800 flex flex-col selection:bg-[#CCA08F] selection:text-white overflow-x-hidden">
      
      {/* Top Header Barra Superior Fixa */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EBDCD5] px-4 sm:px-6 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#EBDCD5] bg-[#FEF1E8] shadow-xs flex-shrink-0">
              <img src="/logo-circle.png" alt="Studio Letícia Oliveira" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-stone-900 text-base sm:text-lg leading-tight">
                  Painel da Dona
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#F5ECE8] text-[#7E4E40] text-[10px] font-sans font-bold">
                  Gestão Total
                </span>
              </div>
              <span className="text-xs text-stone-500 font-medium">
                Studio Letícia Oliveira • {profName || 'Letícia Oliveira'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Botão de Notificações com Badge */}
            <button
              onClick={() => {
                setShowNotificationDrawer(!showNotificationDrawer);
                setUnreadNotificationsCount(0);
              }}
              className="relative p-2 sm:px-3 sm:py-2 rounded-xl text-stone-700 hover:text-stone-900 bg-[#FAF6F4] hover:bg-stone-100 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer border border-[#EBDCD5]"
              title="Central de Notificações em Tempo Real da Dona"
            >
              <Bell className={`w-4 h-4 ${unreadNotificationsCount > 0 ? 'text-[#B87F6C] animate-bounce' : 'text-stone-500'}`} />
              <span className="hidden sm:inline">Notificações</span>
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold leading-none animate-pulse shadow-md">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                loadAppointments();
                loadMonthSchedule();
                loadBonusData();
              }}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Atualizar dados da agenda e escala"
            >
              <RefreshCw className="w-4 h-4 text-[#B87F6C]" />
              <span className="hidden sm:inline">Atualizar</span>
            </button>

            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF6F4] text-[#7E4E40] border border-[#DDBFB2] text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
              title="Voltar para a página pública de clientes"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#B87F6C]" />
              <span className="hidden sm:inline">Ver Site de Clientes</span>
              <span className="sm:hidden">Ver Site</span>
            </button>

            <button
              onClick={logout}
              className="p-2 rounded-xl text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Sair do painel (Logout)"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Toast Banner Flutuante de Novo Agendamento Recebido em Tempo Real */}
      {activeToastNotification && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-20 left-3 right-3 sm:left-auto sm:right-6 z-50 sm:max-w-md bg-white border-2 border-emerald-500 rounded-3xl shadow-2xl p-4 sm:p-5 animate-slideDown"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FEF1E8] border border-[#EBDCD5] overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
              <img src="/logo-circle.png" alt="Studio" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  Novo Agendamento Confirmado!
                </span>
                <button
                  onClick={() => setActiveToastNotification(null)}
                  className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm font-bold text-stone-900 mt-1 truncate">
                {activeToastNotification.clientName}
              </p>
              <p className="text-xs text-stone-600 mt-0.5">
                {activeToastNotification.serviceName} • {activeToastNotification.date} às {activeToastNotification.startTime}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <a
                  href={buildWhatsAppUrl(activeToastNotification.clientPhone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chamar no WhatsApp</span>
                </a>
                <button
                  onClick={() => {
                    setActiveTab('agenda');
                    setActiveToastNotification(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer"
                >
                  Ver na Agenda
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Drawer Lateral: Central de Notificações */}
      {showNotificationDrawer && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-fadeIn"
          onClick={() => setShowNotificationDrawer(false)}
        >
          <div
            className="w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl flex flex-col p-5 overflow-y-auto animate-slideLeft"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#EBDCD5] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF6F4] text-[#B87F6C] flex items-center justify-center border border-[#EBDCD5] shadow-xs">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-base">Notificações da Dona</h3>
                  <p className="text-[11px] text-stone-500">Alertas ao vivo de agendamentos e promoções</p>
                </div>
              </div>
              <button
                onClick={() => setShowNotificationDrawer(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Painel Rápido de Configuração: Som & Push */}
            <div className="my-3 p-3.5 rounded-2xl bg-[#FAF6F4] border border-[#EBDCD5] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {soundNotificationsEnabled ? (
                    <Volume2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-stone-400" />
                  )}
                  <span className="font-bold text-stone-800">Sino de Notificação Sonora:</span>
                </div>
                <button
                  type="button"
                  onClick={toggleSoundNotification}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    soundNotificationsEnabled ? 'bg-emerald-600 text-white shadow-xs' : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {soundNotificationsEnabled ? 'Ativado 🔔' : 'Silenciado 🔕'}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#EBDCD5]">
                <span className="font-medium text-stone-600">Push no Celular/PC:</span>
                <button
                  type="button"
                  onClick={requestBrowserNotificationPermission}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-bold border border-stone-300 cursor-pointer"
                >
                  {browserNotificationsPermission === 'granted' ? 'Permitido ✅ (Reconectar)' : 'Ativar Push 📱'}
                </button>
              </div>
            </div>

            {/* Lista de Alertas Recentes */}
            <div className="flex-1 space-y-2.5 overflow-y-auto py-2">
              {liveNotifications.length === 0 ? (
                <div className="text-center py-16 text-stone-400">
                  <Bell className="w-10 h-10 mx-auto mb-2 opacity-25" />
                  <p className="text-xs font-medium">Nenhum novo agendamento na fila no momento.</p>
                  <p className="text-[11px] text-stone-400 mt-1 max-w-xs mx-auto">
                    Assim que uma cliente agendar pelo site, você ouvirá o sino de notificação e verá o alerta aqui!
                  </p>
                </div>
              ) : (
                liveNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-2xl border transition-all space-y-1.5 shadow-2xs ${
                      notif.isNew
                        ? 'border-emerald-300 bg-emerald-50/70 ring-1 ring-emerald-300'
                        : 'border-[#EBDCD5] bg-[#FAF6F4]/60 hover:bg-[#FAF6F4]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#B87F6C] flex items-center gap-1">
                        <Bell className="w-3.5 h-3.5 text-amber-500" />
                        {notif.title}
                        {notif.isNew && (
                          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider animate-pulse">
                            Novo!
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">{notif.time}</span>
                    </div>
                    <p className="text-xs font-bold text-stone-900">{notif.clientName}</p>
                    <p className="text-[11px] text-stone-600">{notif.details}</p>
                    {notif.phone && (
                      <div className="pt-1 flex items-center gap-2">
                        <a
                          href={buildWhatsAppUrl(notif.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 shadow-2xs cursor-pointer"
                        >
                          <MessageCircle className="w-3 h-3" />
                          Conversar no WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Botão de Teste */}
            <div className="border-t border-[#EBDCD5] pt-3 mt-auto space-y-1">
              <button
                type="button"
                onClick={testNotification}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#B87F6C] hover:bg-[#A06654] text-white text-xs font-bold transition-all shadow-md cursor-pointer active:scale-[0.98]"
              >
                <Volume2 className="w-4 h-4 text-white" />
                <span>🔊 📡 Testar Som, Vibração e Alerta Agora</span>
              </button>
              <span className="text-[10px] text-stone-400 text-center block">
                Toca o sino, vibra o celular e dispara a notificação no Android.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Principal Full Screen */}
      <main className="max-w-7xl mx-auto w-full p-3 sm:p-6 flex-1 pb-28 md:pb-12">
        <div className="space-y-6">
              
              {/* Cards de Métricas Rápidas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#FAF6F4] border border-[#EBDCD5]">
                  <span className="text-[11px] font-bold uppercase text-stone-500 block">Hoje</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="font-serif text-2xl font-bold text-stone-900">
                      {todayAppointments.length}
                    </span>
                    <span className="text-xs text-[#B87F6C] font-bold">
                      R$ {totalRevenueExpectedToday.toFixed(0)}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-500">atendimentos hoje</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF6F4] border border-[#EBDCD5]">
                  <span className="text-[11px] font-bold uppercase text-stone-500 block">Mês Atual</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="font-serif text-2xl font-bold text-[#B87F6C]">
                      {monthAppointments.length}
                    </span>
                    <span className="text-xs text-stone-700 font-bold">
                      R$ {totalRevenueExpectedMonth.toFixed(0)}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-500">faturamento previsto</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF6F4] border border-[#EBDCD5]">
                  <span className="text-[11px] font-bold uppercase text-stone-500 block">Dias no Mês</span>
                  <span className="font-serif text-2xl font-bold text-stone-900 block mt-1">
                    {monthDays.filter((d) => d.isOpen).length} / {monthDays.length}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">dias abertos para agendar</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF6F4] border border-[#EBDCD5]">
                  <span className="text-[11px] font-bold uppercase text-stone-500 block">Serviços Ativos</span>
                  <span className="font-serif text-2xl font-bold text-stone-900 block mt-1">
                    {services.filter((s) => s.active).length}
                  </span>
                  <span className="text-[10px] text-stone-500">no catálogo público</span>
                </div>
              </div>

              {/* Seletor Rápido de Abas (Mobile) */}
              <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                <button
                  onClick={() => setActiveTab('agenda')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === 'agenda' ? 'bg-[#B87F6C] text-white shadow-xs' : 'bg-white text-stone-600 border border-[#EBDCD5]'
                  }`}
                >
                  Agenda
                </button>
                <button
                  onClick={() => setActiveTab('escala')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === 'escala' ? 'bg-[#B87F6C] text-white shadow-xs' : 'bg-white text-stone-600 border border-[#EBDCD5]'
                  }`}
                >
                  Escala Mensal
                </button>
                <button
                  onClick={() => setActiveTab('bonus')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                    activeTab === 'bonus' ? 'bg-[#B87F6C] text-white shadow-xs' : 'bg-white text-stone-600 border border-[#EBDCD5]'
                  }`}
                >
                  <Gift className="w-3 h-3 text-rose-500" />
                  <span>Bônus</span>
                  {bonusApplications.filter(a => a.status === 'PENDENTE').length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] flex items-center justify-center font-bold">
                      {bonusApplications.filter(a => a.status === 'PENDENTE').length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('servicos')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === 'servicos' ? 'bg-[#B87F6C] text-white shadow-xs' : 'bg-white text-stone-600 border border-[#EBDCD5]'
                  }`}
                >
                  Serviços
                </button>
                <button
                  onClick={() => setActiveTab('portfolio')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === 'portfolio' ? 'bg-[#B87F6C] text-white shadow-xs' : 'bg-white text-stone-600 border border-[#EBDCD5]'
                  }`}
                >
                  Galeria
                </button>
                <button
                  onClick={() => setActiveTab('horarios')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === 'horarios' ? 'bg-[#B87F6C] text-white shadow-xs' : 'bg-white text-stone-600 border border-[#EBDCD5]'
                  }`}
                >
                  Horários
                </button>
                <button
                  onClick={() => setActiveTab('configuracoes')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === 'configuracoes' ? 'bg-[#B87F6C] text-white shadow-xs' : 'bg-white text-stone-600 border border-[#EBDCD5]'
                  }`}
                >
                  Perfil & Studio
                </button>
              </div>

              {/* Barra de Abas (Desktop) */}
              <div className="hidden md:flex border-b border-[#EBDCD5] gap-1 sm:gap-4 overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveTab('agenda')}
                  className={`pb-3 px-2 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                    activeTab === 'agenda'
                      ? 'border-[#B87F6C] text-[#B87F6C]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Agenda & Citas</span>
                </button>

                <button
                  onClick={() => setActiveTab('escala')}
                  className={`pb-3 px-2 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                    activeTab === 'escala'
                      ? 'border-[#B87F6C] text-[#B87F6C]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-[#B87F6C]" />
                  <span>Escala Mensal & Lotes</span>
                </button>

                <button
                  onClick={() => setActiveTab('bonus')}
                  className={`pb-3 px-2 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                    activeTab === 'bonus'
                      ? 'border-[#B87F6C] text-[#B87F6C]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Gift className="w-4 h-4 text-rose-500" />
                  <span>Bônus & Promoções</span>
                  {bonusApplications.filter(a => a.status === 'PENDENTE').length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                      {bonusApplications.filter(a => a.status === 'PENDENTE').length} pendente(s)
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('servicos')}
                  className={`pb-3 px-2 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
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
                  className={`pb-3 px-2 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                    activeTab === 'portfolio'
                      ? 'border-[#B87F6C] text-[#B87F6C]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Galeria & Fotos</span>
                </button>

                <button
                  onClick={() => setActiveTab('horarios')}
                  className={`pb-3 px-2 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                    activeTab === 'horarios'
                      ? 'border-[#B87F6C] text-[#B87F6C]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Horário Padrão</span>
                </button>

                <button
                  onClick={() => setActiveTab('configuracoes')}
                  className={`pb-3 px-2 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                    activeTab === 'configuracoes'
                      ? 'border-[#B87F6C] text-[#B87F6C]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  <span>Studio & Perfil</span>
                </button>
              </div>

              {/* ========================================================= */}
              {/* ABA 1: AGENDA & CITAS */}
              {/* ========================================================= */}
              {activeTab === 'agenda' && (
                <div className="space-y-4">
                  {/* Barra de Ações Rápidas */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#FAF6F4] p-3 rounded-2xl border border-[#EBDCD5]">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setShowNewAppointmentModal(true)}
                        className="px-4 py-2 rounded-xl bg-[#B87F6C] hover:bg-[#A06654] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Novo Agendamento Manual</span>
                      </button>

                      <button
                        onClick={() => setShowPolicyModal(true)}
                        className="px-3 py-2 rounded-xl bg-white hover:bg-[#FAF6F4] text-[#7E4E40] font-bold text-xs border border-[#DDBFB2] shadow-sm flex items-center gap-1.5 transition-colors"
                      >
                        <Info className="w-3.5 h-3.5 text-[#B87F6C]" />
                        <span>Ver Aviso & Política Oficial</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-600">Data:</span>
                      <input
                        type="date"
                        value={selectedDateFilter}
                        onChange={(e) => setSelectedDateFilter(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                      />
                      {selectedDateFilter && (
                        <button
                          onClick={() => setSelectedDateFilter('')}
                          className="text-xs text-rose-600 hover:underline font-bold"
                        >
                          Limpar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filtros por status e busca */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
                      {['TODOS', 'CONFIRMADO', 'CONCLUIDO', 'CANCELADO'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setStatusFilter(st)}
                          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                            statusFilter === st
                              ? 'bg-stone-900 text-white'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          {st === 'TODOS' ? 'Todos' : st === 'CONFIRMADO' ? 'Confirmados' : st === 'CONCLUIDO' ? 'Concluídos' : 'Cancelados'}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por cliente, tel ou serviço..."
                        className="w-full sm:w-64 pl-8 pr-3 py-1.5 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                      />
                    </div>
                  </div>

                  {/* Lista de Agendamentos */}
                  {loadingAppointments ? (
                    <div className="py-12 text-center text-stone-400 text-sm">
                      <div className="w-6 h-6 border-2 border-[#B87F6C] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Carregando agendamentos...
                    </div>
                  ) : filteredAppointments.length === 0 ? (
                    <div className="py-12 text-center bg-stone-50 rounded-2xl border border-stone-200 text-stone-500 text-xs">
                      Nenhum agendamento encontrado com os filtros selecionados.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredAppointments.map((app) => {
                        const noticeMsg = formatNoticeMessage(app);
                        const waUrl = buildWhatsAppUrl(app.clientPhone, noticeMsg);
                        const gCalUrl = getGoogleCalendarUrl(app);

                        return (
                          <div
                            key={app.id}
                            className={`p-4 rounded-2xl border transition-all ${
                              app.status === 'CONCLUIDO'
                                ? 'bg-emerald-50/50 border-emerald-200 opacity-90'
                                : app.status === 'CANCELADO'
                                ? 'bg-stone-50 border-stone-200 opacity-60'
                                : 'bg-white border-[#EBDCD5] shadow-sm hover:border-[#DDBFB2]'
                            }`}
                          >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                              {/* Dados principais da cliente e serviço */}
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-[#FAF6F4] text-[#B87F6C] border border-[#EBDCD5] flex items-center justify-center font-bold font-serif shrink-0">
                                  {app.clientName?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h5 className="font-bold text-stone-900 text-sm">
                                      {app.clientName}
                                    </h5>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        app.status === 'CONCLUIDO'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : app.status === 'CANCELADO'
                                          ? 'bg-rose-100 text-rose-800'
                                          : 'bg-amber-100 text-amber-800'
                                      }`}
                                    >
                                      {app.status}
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-1">
                                    <span className="flex items-center gap-1 font-semibold text-stone-800">
                                      <Tag className="w-3.5 h-3.5 text-[#B87F6C]" />
                                      {app.service?.name} (R$ {app.service?.price?.toFixed(2)})
                                    </span>
                                    <span className="flex items-center gap-1 text-stone-600">
                                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                                      {app.date} às {app.startTime} - {app.endTime}
                                    </span>
                                    <span className="flex items-center gap-1 text-stone-600">
                                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                                      {formatPhoneDisplay(app.clientPhone)}
                                    </span>
                                  </div>

                                  {app.notes && (
                                    <p className="text-[11px] text-stone-500 italic mt-1 bg-stone-50 p-1.5 rounded-lg border border-stone-200">
                                      Obs: {app.notes}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Ações Rápidas */}
                              <div className="flex flex-wrap items-center gap-2 shrink-0">
                                {/* Botão WhatsApp Oficial com a política de 24h e endereço */}
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
                                  title="Enviar mensagem oficial completa no WhatsApp da cliente"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>Enviar WhatsApp</span>
                                </a>

                                {/* Copiar texto da confirmação */}
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(noticeMsg);
                                    setCopiedAppId(app.id);
                                    setTimeout(() => setCopiedAppId(null), 2000);
                                  }}
                                  className="p-2 rounded-xl bg-white hover:bg-stone-100 text-stone-600 border border-stone-200 transition-colors"
                                  title="Copiar mensagem com endereço e regras"
                                >
                                  {copiedAppId === app.id ? (
                                    <Check className="w-4 h-4 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </button>

                                {/* Adicionar ao Google Calendar */}
                                <a
                                  href={gCalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-xl bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 transition-colors"
                                  title="Salvar na Agenda Google (Alerta no Android)"
                                >
                                  <Calendar className="w-4 h-4" />
                                </a>

                                {/* Concluir Atendimento */}
                                {app.status !== 'CONCLUIDO' && (
                                  <button
                                    onClick={() => handleStatusChange(app.id, 'CONCLUIDO')}
                                    className="p-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-600 border border-emerald-200 transition-colors"
                                    title="Marcar como Concluído"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                )}

                                {/* Cancelar Atendimento */}
                                {app.status !== 'CANCELADO' && (
                                  <button
                                    onClick={() => handleStatusChange(app.id, 'CANCELADO')}
                                    className="p-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 transition-colors"
                                    title="Cancelar agendamento"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                )}

                                {/* Excluir agendamento */}
                                <button
                                  onClick={() => handleDeleteAppointment(app.id)}
                                  className="p-2 rounded-xl bg-white hover:bg-stone-100 text-stone-400 hover:text-rose-600 border border-stone-200 transition-colors"
                                  title="Excluir agendamento"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* ABA 2: ESCALA MENSAL & EM LOTES (O PRINCIPAL PEDIDO) */}
              {/* ========================================================= */}
              {activeTab === 'escala' && (
                <div className="space-y-4">
                  {/* Banner de Ajuda da Escala */}
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-[#FAF6F4] rounded-2xl border border-amber-200 text-xs text-stone-800 space-y-2">
                    <div className="flex items-center gap-2 text-[#7E4E40] font-bold text-sm">
                      <Calendar className="w-4 h-4 text-[#B87F6C]" />
                      <span>Controle de Escala & Autonomia de Horários Mensais</span>
                    </div>
                    <p className="text-stone-600 leading-relaxed">
                      Leticia, aqui você define quais dias do mês você estará disponível de acordo com a escala do seu outro trabalho. 
                      Você pode usar as ações em lote (como <strong>Dias Ímpares</strong> ou <strong>Dias Pares</strong>) para configurar o mês inteiro com 1 clique, ou clicar diretamente nos dias para liberar ou fechar. 
                      Os clientes só conseguirão agendar nos dias que você definir como abertos aqui!
                    </p>
                  </div>

                  {/* Barra de Navegação do Mês & Ferramentas de Lote */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#FAF6F4] p-3 rounded-2xl border border-[#EBDCD5]">
                    
                    {/* Seletor de Mês */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrevMonth}
                        className="p-2 rounded-xl bg-white hover:bg-stone-100 border border-[#DDBFB2] text-stone-700 transition-colors"
                        title="Mês anterior"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <div className="text-center px-3 min-w-36">
                        <span className="font-serif font-bold text-base text-stone-900 block leading-tight">
                          {getMonthName(currentMonth)} {currentYear}
                        </span>
                        <span className="text-[10px] text-stone-500 font-medium">
                          {monthDays.filter(d => d.isOpen).length} dias com atendimento
                        </span>
                      </div>

                      <button
                        onClick={handleNextMonth}
                        className="p-2 rounded-xl bg-white hover:bg-stone-100 border border-[#DDBFB2] text-stone-700 transition-colors"
                        title="Próximo mês"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={handleGoToCurrentMonth}
                        className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-[#DDBFB2] text-[11px] font-bold text-[#7E4E40]"
                      >
                        Mês Atual
                      </button>
                    </div>

                    {/* Botões de Ação em Lote */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Botão de Predefinições Rápidas */}
                      <button
                        type="button"
                        onClick={() => {
                          setBatchPreset('DUAL_ODD_EVEN');
                          setShowBatchModal(true);
                        }}
                        className="px-3 py-2 rounded-xl bg-[#B87F6C] hover:bg-[#A06654] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Sliders className="w-3.5 h-3.5 text-amber-200" />
                        <span>Gerador de Escala</span>
                      </button>

                      {/* Botão de Bloqueio de Mês / Semana */}
                      <button
                        type="button"
                        onClick={() => {
                          setBlockType('MONTH');
                          setBlockTargetMonth(currentMonth);
                          setBlockTargetYear(currentYear);
                          setBlockIsOpen(false);
                          setBlockReason(`Mês de ${getMonthName(currentMonth)} Lotado / Sem atendimento`);
                          setShowBlockModal(true);
                        }}
                        className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Bloquear mês inteiro, semanas ou intervalos para não ter agendamentos"
                      >
                        <Ban className="w-3.5 h-3.5 text-rose-200" />
                        <span>Bloquear Mês / Semana</span>
                      </button>

                      {/* Modo Multi-Seleção Livre */}
                      <button
                        type="button"
                        onClick={() => {
                          const nextState = !multiSelectMode;
                          setMultiSelectMode(nextState);
                          if (!nextState) setSelectedDates(new Set());
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                          multiSelectMode
                            ? 'bg-amber-100 border-amber-300 text-amber-900'
                            : 'bg-white border-[#DDBFB2] text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>{multiSelectMode ? 'Sair da Seleção' : 'Seleção Livre'}</span>
                      </button>

                      {/* Restaurar Padrão */}
                      <button
                        type="button"
                        onClick={handleResetMonth}
                        className="px-2.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                        title="Remover todas as regras deste mês e usar horário semanal"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Restaurar</span>
                      </button>
                    </div>
                  </div>

                  {/* Atalhos Rápidos de Seleção no Calendário */}
                  <div className="flex flex-wrap items-center gap-2 p-2.5 bg-gradient-to-r from-[#FAF6F4] to-white rounded-2xl border border-[#EBDCD5] text-xs">
                    <span className="font-bold text-stone-700 flex items-center gap-1.5 text-xs">
                      <CheckCircle className="w-3.5 h-3.5 text-[#B87F6C]" />
                      <span>Selecionar no Calendário:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectFilter('ODD')}
                      className="px-2.5 py-1 rounded-xl bg-white hover:bg-amber-50 text-stone-700 font-bold border border-[#DDBFB2] transition-colors cursor-pointer"
                      title="Selecionar todos os dias ímpares do mês (1, 3, 5, 7...)"
                    >
                      🎯 Dias Ímpares (1, 3, 5...)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectFilter('EVEN')}
                      className="px-2.5 py-1 rounded-xl bg-white hover:bg-amber-50 text-stone-700 font-bold border border-[#DDBFB2] transition-colors cursor-pointer"
                      title="Selecionar todos os dias pares do mês (2, 4, 6, 8...)"
                    >
                      🎯 Dias Pares (2, 4, 6...)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectFilter('WEEKDAYS')}
                      className="px-2.5 py-1 rounded-xl bg-white hover:bg-amber-50 text-stone-700 font-bold border border-[#DDBFB2] transition-colors cursor-pointer"
                      title="Selecionar segunda a sexta"
                    >
                      💼 Seg a Sex
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectFilter('WEEKENDS')}
                      className="px-2.5 py-1 rounded-xl bg-white hover:bg-amber-50 text-stone-700 font-bold border border-[#DDBFB2] transition-colors cursor-pointer"
                      title="Selecionar sábados e domingos"
                    >
                      🏖️ Sáb e Dom
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectFilter('ALL')}
                      className="px-2.5 py-1 rounded-xl bg-white hover:bg-amber-50 text-stone-700 font-bold border border-[#DDBFB2] transition-colors cursor-pointer"
                    >
                      ✨ Todos do Mês
                    </button>
                    {selectedDates.size > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDates(new Set());
                          setMultiSelectMode(false);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 transition-colors cursor-pointer ml-auto"
                      >
                        ✕ Limpar Seleção ({selectedDates.size})
                      </button>
                    )}
                  </div>

                  {/* Banner de Aviso de Mês Inteiro Bloqueado */}
                  {monthDays.length > 0 && monthDays.every(d => !d.isOpen) && (
                    <div className="p-4 bg-rose-50 border-2 border-rose-300 text-rose-950 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-bold animate-fadeIn">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                          <Ban className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-sm font-extrabold block text-rose-900">
                            Mês de {getMonthName(currentMonth)} Totalmente BLOQUEADO!
                          </span>
                          <span className="font-medium text-rose-700 block text-[11px] mt-0.5">
                            Nenhum cliente conseguirá agendar horários neste mês. Motivo configurado: "{monthDays[0]?.note || 'Sem atendimento'}"
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setBlockType('MONTH');
                          setBlockTargetMonth(currentMonth);
                          setBlockTargetYear(currentYear);
                          setBlockIsOpen(true);
                          setBlockReason('Atendimento liberado');
                          setShowBlockModal(true);
                        }}
                        className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Desbloquear / Liberar Mês</span>
                      </button>
                    </div>
                  )}

                  {/* Barra flutuante quando datas estiverem selecionadas */}
                  {selectedDates.size > 0 && (
                    <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 animate-fadeIn text-xs shadow-md">
                      <div className="font-bold text-amber-950 flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-full bg-[#B87F6C] text-white flex items-center justify-center text-xs font-bold shadow-xs shrink-0">
                          {selectedDates.size}
                        </span>
                        <div>
                          <span className="text-xs font-extrabold block text-amber-950">
                            {selectedDates.size} dia(s) selecionado(s) em {getMonthName(currentMonth)}:
                          </span>
                          <span className="text-[10px] text-amber-800 font-medium block">
                            Dias: {Array.from(selectedDates).map(d => Number(d.split('-')[2])).sort((a,b)=>a-b).join(', ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setBatchPreset('CUSTOM');
                            setShowBatchModal(true);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-[#B87F6C] hover:bg-[#A06654] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Definir Horário</span>
                        </button>

                        <button
                          type="button"
                          disabled={applyingBatch}
                          onClick={() => handleBatchSetStatus(false, 'Folga / Outro Emprego')}
                          className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Marcar todos os dias selecionados como Folga / Fechado"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Marcar Folga</span>
                        </button>

                        <button
                          type="button"
                          disabled={applyingBatch}
                          onClick={() => handleBatchSetStatus(true, 'Atendimento confirmado')}
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Liberar todos os selecionados com horário padrão (09h às 19h)"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Liberar (09h-19h)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDates(new Set());
                            setMultiSelectMode(false);
                          }}
                          className="px-2.5 py-2 rounded-xl bg-white text-stone-600 font-bold border border-stone-200 hover:bg-stone-100 text-xs transition-colors cursor-pointer"
                          title="Cancelar seleção"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Legenda de Cores */}
                  <div className="flex flex-wrap items-center gap-4 text-xs px-1 text-stone-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                      <strong>Verde:</strong> Atendimento Liberado
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-400" />
                      <strong>Vermelho:</strong> Fechado / Escala Obrigatória (Folga)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-amber-400" />
                      <strong>Amarelo:</strong> Horário Personalizado
                    </span>
                    <span className="text-[11px] text-stone-400 italic">
                      Dica: Marque os quadradinhos para selecionar dias ou clique no círculo do dia para abrir/fechar na hora!
                    </span>
                  </div>

                  {/* Grade do Calendário Mensal */}
                  {loadingMonth ? (
                    <div className="py-16 text-center text-stone-400 text-sm">
                      <div className="w-6 h-6 border-2 border-[#B87F6C] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Carregando escala de {getMonthName(currentMonth)}...
                    </div>
                  ) : (
                    <div>
                      {/* Cabeçalho dos Dias da Semana */}
                      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1.5 text-center text-xs font-bold text-stone-500 uppercase tracking-wider">
                        {weekShortLabels.map((lbl, i) => (
                          <div
                            key={lbl}
                            className={`py-1.5 rounded-lg ${i === 0 ? 'text-rose-500' : ''}`}
                          >
                            {lbl}
                          </div>
                        ))}
                      </div>

                      {/* Células dos Dias */}
                      <div className="grid grid-cols-7 gap-1 sm:gap-2">
                        {/* Espaçamento vazio antes do dia 1 de acordo com o dayOfWeek inicial */}
                        {monthDays.length > 0 && Array.from({ length: monthDays[0].dayOfWeek }).map((_, i) => (
                          <div key={`empty-${i}`} className="min-h-16 sm:min-h-24 bg-stone-50/50 rounded-xl sm:rounded-2xl border border-stone-100" />
                        ))}

                        {/* Dias Reais do Mês */}
                        {monthDays.map((dayItem) => {
                          const isSelected = selectedDates.has(dayItem.date);
                          const isTodayDate = dayItem.date === todayDateStr;

                          return (
                            <div
                              key={dayItem.date}
                              onClick={() => handleDateClick(dayItem)}
                              className={`min-h-16 sm:min-h-24 p-1 sm:p-2.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative group min-w-0 ${
                                isSelected
                                  ? 'ring-2 ring-[#B87F6C] bg-amber-50/80 border-[#B87F6C] shadow-sm'
                                  : dayItem.isOpen
                                  ? dayItem.isOverride
                                    ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                                    : 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                                  : 'bg-stone-50 border-stone-200 opacity-70 hover:opacity-100'
                              }`}
                            >
                              {/* Topo do Card: Checkbox de seleção, Número do dia e botão toggle */}
                              <div className="flex items-center justify-between gap-0.5">
                                <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      toggleDateSelection(dayItem.date);
                                    }}
                                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded text-[#B87F6C] focus:ring-[#B87F6C] cursor-pointer shrink-0"
                                    title="Selecionar este dia para edição em lote"
                                  />
                                  <span
                                    className={`text-[10px] sm:text-sm font-bold font-serif w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full shrink-0 ${
                                      isTodayDate
                                        ? 'bg-[#B87F6C] text-white shadow-sm'
                                        : 'text-stone-900'
                                    }`}
                                  >
                                    {dayItem.day}
                                  </span>
                                </div>

                                {/* Botão rápido para alternar aberto/fechado com 1 clique */}
                                <button
                                  type="button"
                                  onClick={(e) => handleQuickToggleDay(dayItem, e)}
                                  className={`p-0.5 sm:p-1 rounded-full transition-transform active:scale-90 shrink-0 ${
                                    dayItem.isOpen
                                      ? 'text-emerald-600 hover:bg-emerald-100'
                                      : 'text-rose-500 hover:bg-rose-100'
                                  }`}
                                  title={dayItem.isOpen ? 'Clique para fechar este dia' : 'Clique para abrir este dia'}
                                >
                                  {dayItem.isOpen ? (
                                    <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                  ) : (
                                    <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                  )}
                                </button>
                              </div>

                              {/* Conteúdo Central: Horário e Status */}
                              <div className="my-0.5 sm:my-1 min-w-0">
                                {dayItem.isOpen ? (
                                  <div>
                                    <span className="text-[8px] sm:text-[11px] font-bold text-stone-800 block truncate leading-tight">
                                      {dayItem.startTime} às {dayItem.endTime}
                                    </span>
                                    {dayItem.breakStart && (
                                      <span className="hidden sm:block text-[9px] text-stone-500 truncate">
                                        Pausa: {dayItem.breakStart}-{dayItem.breakEnd}
                                      </span>
                                    )}
                                    {dayItem.note && (
                                      <span className="text-[7px] sm:text-[9px] text-amber-700 font-medium block truncate">
                                        {dayItem.note}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <div>
                                    <span className="text-[8px] sm:text-[10px] font-bold text-rose-600 block leading-tight">
                                      Folga
                                    </span>
                                    {dayItem.note && (
                                      <span className="text-[7px] sm:text-[9px] text-stone-500 block truncate">
                                        {dayItem.note}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Rodapé do Dia: Agendamentos marcados */}
                              <div className="flex items-center justify-between text-[8px] sm:text-[10px] min-w-0">
                                {dayItem.appointmentCount > 0 ? (
                                  <span className="px-1 sm:px-1.5 py-0.5 rounded-md bg-[#B87F6C] text-white font-bold text-[7px] sm:text-[10px] truncate">
                                    {dayItem.appointmentCount} <span className="hidden sm:inline">agendamento(s)</span><span className="sm:hidden">ag.</span>
                                  </span>
                                ) : (
                                  <span className="text-stone-400 text-[8px] sm:text-[9px]">Livre</span>
                                )}

                                <Edit2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* ABA NOVO: BÔNUS & PROMOÇÕES ESPECIAIS (APROVAÇÃO & 15 DIAS) */}
              {/* ========================================================= */}
              {activeTab === 'bonus' && (
                <div className="space-y-6">
                  {/* Banner de Apresentação */}
                  <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-50 via-[#FAF6F4] to-amber-50 rounded-2xl border border-rose-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                        <Gift className="w-5 h-5 text-rose-600" />
                        <span>Gestão de Bônus & Promoções Exclusivas</span>
                      </div>
                      <p className="text-stone-600 text-xs leading-relaxed max-w-2xl">
                        Leticia, lance campanhas de bônus e descontos dinâmicos para a página inicial. As clientes solicitam o bônus no site e você aprova aqui no painel. O sistema aplica automaticamente a <strong>trava de segurança de 1 solicitação a cada 15 dias</strong> por cliente!
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenNewCampaignModal()}
                        className="px-4 py-2.5 rounded-xl bg-[#B87F6C] hover:bg-[#A06654] text-white text-xs font-bold shadow-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
                      >
                        <Plus className="w-4 h-4 text-amber-200" />
                        <span>Criar Nova Campanha de Bônus</span>
                      </button>
                    </div>
                  </div>

                  {/* Sub-abas de Bônus: Solicitações vs Campanhas */}
                  <div className="flex items-center justify-between border-b border-[#EBDCD5] pb-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setBonusSubTab('solicitacoes')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                          bonusSubTab === 'solicitacoes'
                            ? 'bg-[#B87F6C] text-white shadow-xs'
                            : 'bg-white text-stone-600 border border-[#EBDCD5] hover:bg-stone-50'
                        }`}
                      >
                        <span>Fila de Aprovação de Clientes</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          bonusSubTab === 'solicitacoes' ? 'bg-white text-[#7E4E40]' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {bonusApplications.filter(a => a.status === 'PENDENTE').length} pendente(s)
                        </span>
                      </button>

                      <button
                        onClick={() => setBonusSubTab('campanhas')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                          bonusSubTab === 'campanhas'
                            ? 'bg-[#B87F6C] text-white shadow-xs'
                            : 'bg-white text-stone-600 border border-[#EBDCD5] hover:bg-stone-50'
                        }`}
                      >
                        <Tag className="w-3.5 h-3.5" />
                        <span>Campanhas Ativas & Criadas ({bonusCampaigns.length})</span>
                      </button>
                    </div>

                    <button
                      onClick={loadBonusData}
                      className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-white text-xs flex items-center gap-1 cursor-pointer"
                      title="Recarregar solicitações"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Atualizar</span>
                    </button>
                  </div>

                  {/* SUB-ABA 1: SOLICITAÇÕES DE CLIENTES */}
                  {bonusSubTab === 'solicitacoes' && (
                    <div className="space-y-4">
                      {/* Filtros de Status */}
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {['TODOS', 'PENDENTE', 'APROVADO', 'UTILIZADO', 'RECUSADO'].map((st) => (
                          <button
                            key={st}
                            onClick={() => setBonusStatusFilter(st)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                              bonusStatusFilter === st
                                ? 'bg-[#7E4E40] text-white shadow-xs'
                                : 'bg-white text-stone-600 border border-[#EBDCD5] hover:bg-stone-50'
                            }`}
                          >
                            {st === 'TODOS' && 'Todas as Solicitações'}
                            {st === 'PENDENTE' && `⏳ Pendentes (${bonusApplications.filter(a => a.status === 'PENDENTE').length})`}
                            {st === 'APROVADO' && `✓ Aprovadas (${bonusApplications.filter(a => a.status === 'APROVADO').length})`}
                            {st === 'UTILIZADO' && 'Utilizadas'}
                            {st === 'RECUSADO' && 'Recusadas'}
                          </button>
                        ))}
                      </div>

                      {/* Lista de Solicitações */}
                      {loadingBonus ? (
                        <div className="py-12 text-center text-xs text-stone-500">
                          <RefreshCw className="w-6 h-6 text-[#B87F6C] animate-spin mx-auto mb-2" />
                          Carregando solicitações de bônus...
                        </div>
                      ) : bonusApplications.filter(a => bonusStatusFilter === 'TODOS' ? true : a.status === bonusStatusFilter).length === 0 ? (
                        <div className="p-8 text-center bg-white rounded-3xl border border-[#EBDCD5] space-y-2">
                          <Gift className="w-10 h-10 text-stone-300 mx-auto" />
                          <h6 className="font-serif font-bold text-stone-800 text-sm">
                            Nenhuma solicitação encontrada
                          </h6>
                          <p className="text-stone-500 text-xs">
                            Quando as clientes solicitarem bônus na página principal, elas aparecerão listadas aqui para sua aprovação!
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {bonusApplications
                            .filter(a => bonusStatusFilter === 'TODOS' ? true : a.status === bonusStatusFilter)
                            .map((app) => {
                              const isPending = app.status === 'PENDENTE';
                              const isApproved = app.status === 'APROVADO';
                              const isUsed = app.status === 'UTILIZADO';
                              const isRejected = app.status === 'RECUSADO';

                              return (
                                <div
                                  key={app.id}
                                  className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 ${
                                    isPending
                                      ? 'bg-amber-50/70 border-amber-300 shadow-sm'
                                      : isApproved
                                      ? 'bg-emerald-50/50 border-emerald-300 shadow-2xs'
                                      : 'bg-white border-[#EBDCD5]'
                                  }`}
                                >
                                  {/* Top header do card */}
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-start gap-2.5 min-w-0">
                                      {app.campaign?.imageUrl && (
                                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-stone-200 shrink-0 bg-stone-100">
                                          <img
                                            src={resolveImageUrl(app.campaign.imageUrl)}
                                            alt={app.campaign?.title || 'Bônus'}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                          />
                                        </div>
                                      )}
                                      <div className="min-w-0">
                                        <span className="text-[10px] font-bold uppercase text-stone-500 block">
                                          Campanha Solicitada:
                                        </span>
                                        <strong className="text-stone-900 text-sm font-serif font-bold block truncate">
                                          {app.campaign?.title || 'Bônus Especial'}
                                        </strong>
                                        {app.serviceName && (
                                          <span className="text-[11px] text-[#A06654] font-medium block truncate">
                                            Procedimento: {app.serviceName}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Badge de status */}
                                    <span
                                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        isPending
                                          ? 'bg-amber-500 text-white'
                                          : isApproved
                                          ? 'bg-emerald-600 text-white'
                                          : isUsed
                                          ? 'bg-stone-500 text-white'
                                          : 'bg-rose-500 text-white'
                                      }`}
                                    >
                                      {isPending && 'Pendente'}
                                      {isApproved && 'Aprovado'}
                                      {isUsed && 'Utilizado'}
                                      {isRejected && 'Recusado'}
                                    </span>
                                  </div>

                                  {/* Dados da Cliente */}
                                  <div className="p-3 bg-white/90 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-1">
                                    <p className="flex items-center gap-2">
                                      <User className="w-3.5 h-3.5 text-[#B87F6C]" />
                                      <strong>{app.clientName}</strong>
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <Phone className="w-3.5 h-3.5 text-[#B87F6C]" />
                                      <span>{formatPhoneDisplay(app.clientPhone)}</span>
                                      <a
                                        href={buildWhatsAppUrl(app.clientPhone)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-emerald-700 hover:text-emerald-800 text-[11px] font-bold ml-1 inline-flex items-center gap-0.5"
                                      >
                                        <MessageCircle className="w-3 h-3 text-emerald-600" />
                                        <span>Abrir WhatsApp</span>
                                      </a>
                                    </p>
                                    <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[11px] text-stone-500">
                                      <span>Código: <strong className="font-mono text-[#7E4E40]">{app.code}</strong></span>
                                      <span>{new Date(app.appliedAt).toLocaleDateString('pt-BR')} às {new Date(app.appliedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                  </div>

                                  {app.adminNote && (
                                    <p className="text-[11px] text-stone-500 italic bg-[#FAF6F4] p-2 rounded-lg">
                                      Nota: "{app.adminNote}"
                                    </p>
                                  )}

                                  {/* Ações de Liberação e Gestão */}
                                  <div className="pt-2 flex flex-wrap items-center gap-2">
                                    {isPending && (
                                      <>
                                        <button
                                          onClick={() => handleUpdateAppStatus(app.id, 'APROVADO')}
                                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                          <span>Aprovar Bônus</span>
                                        </button>

                                        <button
                                          onClick={() => {
                                            setNoteModalApp(app);
                                            setAdminNoteInput('');
                                          }}
                                          className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all cursor-pointer"
                                        >
                                          Recusar
                                        </button>
                                      </>
                                    )}

                                    {isApproved && (
                                      <>
                                        <button
                                          onClick={() => handleUpdateAppStatus(app.id, 'UTILIZADO')}
                                          className="flex-1 py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                          <span>Marcar como Utilizado no Atendimento</span>
                                        </button>

                                        <a
                                          href={buildWhatsAppUrl(
                                            app.clientPhone,
                                            `Olá ${app.clientName}! 💖\nSeu bônus *${app.campaign?.title}* está LIBERADO no Studio Letícia Oliveira!\n✨ Código: ${app.code}\nApresente no seu atendimento!`
                                          )}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center gap-1"
                                        >
                                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                          <span>WhatsApp</span>
                                        </a>
                                      </>
                                    )}

                                    {isUsed && (
                                      <span className="text-[11px] text-stone-500 font-medium">
                                        ✓ Este bônus já foi resgatado pela cliente.
                                      </span>
                                    )}

                                    {isRejected && (
                                      <button
                                        onClick={() => handleUpdateAppStatus(app.id, 'APROVADO')}
                                        className="py-1.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-bold"
                                      >
                                        Reverter para Aprovado
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

                  {/* SUB-ABA 2: CAMPANHAS DE BÔNUS CRIADAS */}
                  {bonusSubTab === 'campanhas' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {bonusCampaigns.map((camp) => (
                          <div
                            key={camp.id}
                            className="bg-white rounded-2xl p-5 border border-[#EBDCD5] shadow-xs flex flex-col justify-between space-y-3"
                          >
                            <div className="space-y-2">
                              {/* Header com Toggle Ativo/Oculto */}
                              <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF6F4] text-[#B87F6C] text-[10px] font-bold">
                                  {camp.badgeText || 'Promoção'}
                                </span>

                                <button
                                  onClick={() => handleToggleCampaignActive(camp)}
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                                    camp.active
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : 'bg-stone-100 text-stone-500 border border-stone-200'
                                  }`}
                                  title="Clique para ativar ou ocultar da página principal"
                                >
                                  {camp.active ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-stone-400" />}
                                  <span>{camp.active ? 'Ativo no Site' : 'Oculto'}</span>
                                </button>
                              </div>

                              {camp.imageUrl && (
                                <div
                                  onClick={() => setExpandedBonusAdmin(camp)}
                                  className="w-full h-32 rounded-xl overflow-hidden border border-stone-200 bg-stone-900 cursor-pointer relative group/campimg flex items-center justify-center"
                                  title="Clique para ver o cupom/banner ampliado"
                                >
                                  <img
                                    src={resolveImageUrl(camp.imageUrl)}
                                    alt={camp.title}
                                    className="w-full h-full object-contain group-hover/campimg:scale-105 transition-transform"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                  />
                                  <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-full bg-black/75 text-white text-[10px] font-bold flex items-center gap-1 shadow">
                                    <Maximize2 className="w-2.5 h-2.5 text-amber-300" />
                                    <span>Ampliar</span>
                                  </div>
                                </div>
                              )}

                              <h6 className="font-serif font-bold text-stone-900 text-base leading-snug">
                                {camp.title}
                              </h6>

                              {camp.description && (
                                <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                                  {camp.description}
                                </p>
                              )}

                              <div className="p-2.5 bg-[#FAF6F4] rounded-xl border border-[#EBDCD5] text-xs">
                                <span className="text-[10px] uppercase font-bold text-stone-500 block">Vantagem:</span>
                                <strong className="text-[#7E4E40]">
                                  {camp.discountType === 'PERCENT' && `${camp.discountValue}% OFF`}
                                  {camp.discountType === 'FIXED' && `R$ ${camp.discountValue} OFF`}
                                  {camp.discountType === 'GIFT' && (camp.giftName || 'Brinde')}
                                </strong>
                              </div>

                              {/* Validade */}
                              <div className="text-[11px] text-stone-500">
                                {camp.endDate ? (
                                  <span>Válido até: <strong>{camp.endDate.split('-').reverse().join('/')}</strong></span>
                                ) : (
                                  <span>Sem data limite (Ativo contínuo)</span>
                                )}
                              </div>
                            </div>

                            {/* Ações */}
                            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                              <span className="text-[10px] text-stone-400">
                                {camp._count?.applications || 0} solicitações
                              </span>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleOpenNewCampaignModal(camp)}
                                  className="p-1.5 rounded-lg text-stone-600 hover:text-[#B87F6C] hover:bg-[#FAF6F4] transition-colors"
                                  title="Editar campanha"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCampaign(camp.id)}
                                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Excluir campanha"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* ABA 3: SERVIÇOS & PREÇOS */}
              {/* ========================================================= */}
              {activeTab === 'servicos' && (
                <div className="space-y-6">
                  {/* Formulário de Adicionar / Editar Serviço */}
                  <form
                    onSubmit={handleSaveService}
                    className="p-4 sm:p-5 rounded-2xl bg-[#FAF6F4] border border-[#EBDCD5] space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-serif font-bold text-stone-900 text-sm">
                        {editingService ? `Editar Serviço: ${editingService.name}` : 'Cadastrar Novo Serviço no Catálogo'}
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
                          className="text-xs text-rose-600 hover:underline font-bold"
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
                          placeholder="Ex: Design com Henna & Nutrição"
                          className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none focus:border-[#B87F6C]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                          Preço (R$) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={newServicePrice}
                          onChange={(e) => setNewServicePrice(e.target.value)}
                          placeholder="Ex: 50.00"
                          className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none focus:border-[#B87F6C]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                          Duração *
                        </label>
                        <select
                          value={newServiceDuration}
                          onChange={(e) => setNewServiceDuration(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none focus:border-[#B87F6C]"
                        >
                          <option value="10">10 minutos (Buço / Rápido)</option>
                          <option value="15">15 minutos</option>
                          <option value="20">20 minutos (Epilação facial)</option>
                          <option value="30">30 minutos (Design tradicional)</option>
                          <option value="45">45 minutos</option>
                          <option value="60">60 minutos (1 hora - Henna / Lamination)</option>
                          <option value="90">90 minutos (1h30 - Despigmentação)</option>
                          <option value="120">120 minutos (2 horas)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                          Categoria
                        </label>
                        <input
                          type="text"
                          value={newServiceCategory}
                          onChange={(e) => setNewServiceCategory(e.target.value)}
                          placeholder="Ex: Sobrancelhas, Facial, Cílios"
                          className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                          Descrição detalhada para a cliente
                        </label>
                        <input
                          type="text"
                          value={newServiceDesc}
                          onChange={(e) => setNewServiceDesc(e.target.value)}
                          placeholder="Ex: Mapeamento facial personalizado, tonalização com henna e hidratação dos fios."
                          className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#B87F6C] hover:bg-[#A06654] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{editingService ? 'Salvar Alterações do Serviço' : 'Adicionar ao Catálogo'}</span>
                    </button>
                  </form>

                  {/* Tabela de Serviços Cadastrados */}
                  <div className="space-y-3">
                    <h6 className="font-serif font-bold text-stone-900 text-sm">
                      Serviços no Catálogo ({services.length})
                    </h6>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {services.map((svc) => (
                        <div
                          key={svc.id}
                          className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                            svc.active
                              ? 'bg-white border-[#EBDCD5] shadow-sm'
                              : 'bg-stone-50 border-stone-200 opacity-60'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase text-[#B87F6C]">
                                {svc.category || 'Geral'}
                              </span>
                              <span className="font-serif font-bold text-stone-900 text-base">
                                R$ {svc.price.toFixed(2)}
                              </span>
                            </div>
                            <h5 className="font-bold text-stone-900 text-sm mt-0.5">
                              {svc.name}
                            </h5>
                            <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                              {svc.description || 'Sem descrição cadastrada.'}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-3 mt-2 border-t border-stone-100 text-xs">
                            <span className="text-stone-500 font-medium">
                              ⏱️ {svc.durationMinutes} minutos
                            </span>

                            <div className="flex items-center gap-1.5">
                              {/* Toggle ativo/inativo */}
                              <button
                                onClick={() => handleToggleServiceActive(svc)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                                  svc.active
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-stone-200 text-stone-600'
                                }`}
                              >
                                {svc.active ? 'Ativo no Site' : 'Pausado'}
                              </button>

                              <button
                                onClick={() => handleEditClick(svc)}
                                className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                                title="Editar serviço"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteService(svc.id)}
                                className="p-1.5 rounded-lg bg-stone-100 hover:bg-rose-100 text-stone-400 hover:text-rose-600 transition-colors"
                                title="Excluir serviço"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* ABA 4: PORTFÓLIO & FOTOS DE CLIENTES */}
              {/* ========================================================= */}
              {activeTab === 'portfolio' && (
                <div className="space-y-6">
                  {/* Formulário para Adicionar Foto */}
                  <form
                    onSubmit={handleSavePortfolioItem}
                    className="p-4 sm:p-5 rounded-2xl bg-[#FAF6F4] border border-[#EBDCD5] space-y-4"
                  >
                    <h5 className="font-serif font-bold text-stone-900 text-sm">
                      Adicionar Nova Foto de Trabalho / Cliente à Galeria
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                          Título do Procedimento *
                        </label>
                        <input
                          type="text"
                          required
                          value={newPhotoTitle}
                          onChange={(e) => setNewPhotoTitle(e.target.value)}
                          placeholder="Ex: Design com Henna Castanho Médio"
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
                          <option value="Design">Design de Sobrancelhas</option>
                          <option value="Henna">Henna</option>
                          <option value="Lamination">Brow Lamination</option>
                          <option value="Facial">Epilação Facial / Buço</option>
                          <option value="Despigmentacao">Despigmentação Química</option>
                          <option value="Outros">Outros Procedimentos</option>
                        </select>
                      </div>
                    </div>

                    {/* Componente Dinâmico de Upload da Foto (Celular, Câmera ou Google Fotos) */}
                    <div className="bg-white p-3.5 rounded-2xl border border-[#EBDCD5]">
                      <ImageUploader
                        value={newPhotoUrl}
                        onChange={setNewPhotoUrl}
                        token={token}
                        label="Foto do Procedimento / Cliente (Celular, Google Fotos ou Arquivo) *"
                        placeholder="https://images.unsplash.com/... ou selecione do celular"
                        recommendedSize="Toque para abrir a galeria do celular, Google Fotos ou tirar foto. A imagem é comprimida automaticamente!"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                        Descrição / Detalhes do Trabalho (Opcional)
                      </label>
                      <input
                        type="text"
                        value={newPhotoDesc}
                        onChange={(e) => setNewPhotoDesc(e.target.value)}
                        placeholder="Ex: Realinhamento completo com pinça e tonalização natural respeitando o arqueamento."
                        className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={uploadingPhoto}
                      className="px-5 py-2.5 rounded-xl bg-[#B87F6C] hover:bg-[#A06654] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{uploadingPhoto ? 'Publicando...' : 'Publicar na Galeria do Site'}</span>
                    </button>
                  </form>

                  {/* Grid de Fotos Existentes */}
                  <div>
                    <h6 className="font-serif font-bold text-stone-900 text-sm mb-3">
                      Fotos Atualmente em Exibição ({portfolio.length})
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
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
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

              {/* ========================================================= */}
              {/* ABA 5: HORÁRIO PADRÃO SEMANAL (FALLBACK) */}
              {/* ========================================================= */}
              {activeTab === 'horarios' && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2">
                    <p>
                      ⚙️ <strong>Horário Padrão Semanal (Base):</strong> Este é o seu horário fixo da semana. Quando você não definir nenhuma escala especial na aba "Escala Mensal", o sistema usará esta jornada base como padrão.
                    </p>
                    <p className="text-amber-800 bg-amber-100/60 p-2.5 rounded-xl border border-amber-200/80 leading-relaxed">
                      💡 <strong>Como funciona o último horário de atendimento:</strong> O último horário visível para a cliente agendar é sempre o horário de término menos o tempo do procedimento. Por exemplo: se o expediente encerra às <strong>19:00</strong> e o serviço dura <strong>30 minutos (ex: Design)</strong>, o último agendamento oferecido será às <strong>18:30</strong> (das 18:30 até as 19:00). Se deseja atender às <strong>19:00, 19:30 ou 20:00</strong>, basta definir o término do seu expediente para <strong>20:00, 20:30 ou mais tarde</strong>.
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 bg-[#FAF6F3] p-3 rounded-2xl border border-[#EBDCD5]">
                    <span className="text-xs text-stone-700 font-medium">
                      Salve após alterar qualquer horário:
                    </span>
                    <button
                      disabled={savingSchedule}
                      onClick={handleSaveSchedules}
                      className="px-4 py-2 rounded-full bg-[#B87F6C] hover:bg-[#A06654] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 shrink-0"
                    >
                      {savingSchedule ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-amber-200" />
                      )}
                      <span>Salvar Horários</span>
                    </button>
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
                            className="rounded text-[#B87F6C] focus:ring-[#B87F6C] w-4 h-4 cursor-pointer"
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
                              {(sch.endTime === '00:00' || sch.endTime === '24:00') && (
                                <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-bold" title="00:00 equivale a meia-noite (final do dia). Se deseja fechar no início da noite, selecione 19:00, 20:00 ou 21:00.">
                                  Meia-noite (24h)
                                </span>
                              )}
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

              {/* ========================================================= */}
              {/* ABA 6: STUDIO & PERFIL (AUTONOMIA TOTAL) */}
              {/* ========================================================= */}
              {activeTab === 'configuracoes' && (
                <div className="space-y-6">
                  {profileSuccessMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>{profileSuccessMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveStylistProfile} className="space-y-6">
                    
                    {/* Seção 1: Dados Pessoais & Contato */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF6F4] border border-[#EBDCD5] space-y-4">
                      <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                        <User className="w-4 h-4 text-[#B87F6C]" />
                        <span>Identificação & Redes Sociais</span>
                      </div>

                      {/* Foto de Perfil da Letícia */}
                      <div className="bg-white p-3.5 rounded-2xl border border-[#EBDCD5]">
                        <ImageUploader
                          value={profPhotoUrl}
                          onChange={setProfPhotoUrl}
                          token={token}
                          label="Foto de Perfil & Apresentação (Celular, Câmera ou Google Fotos)"
                          placeholder="Link da sua foto ou selecione do celular"
                          recommendedSize="Esta foto aparecerá em destaque na apresentação principal do site!"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                            Seu Nome Profissional
                          </label>
                          <input
                            type="text"
                            required
                            value={profName}
                            onChange={(e) => setProfName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                            Tempo de Experiência / Badge
                          </label>
                          <input
                            type="text"
                            value={profExperienceYears}
                            onChange={(e) => setProfExperienceYears(e.target.value)}
                            placeholder="Ex: Desde 2023 · Beleza & Visagismo"
                            className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                          />
                        </div>
                      </div>

                      {/* Redes Sociais Completas */}
                      <div className="p-3 bg-white rounded-2xl border border-[#EBDCD5] space-y-3">
                        <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-[#B87F6C]" />
                          <span>Redes Sociais & Canais de Atendimento</span>
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">
                              WhatsApp Comercial (com DDD) *
                            </label>
                            <input
                              type="text"
                              required
                              value={profPhone}
                              onChange={(e) => setProfPhone(e.target.value)}
                              placeholder="(51) 99503-7223"
                              className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">
                              Instagram do Studio
                            </label>
                            <input
                              type="text"
                              value={profInstagram}
                              onChange={(e) => setProfInstagram(e.target.value)}
                              placeholder="@leticia_r.oliveira"
                              className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">
                              Facebook (Página ou Perfil)
                            </label>
                            <input
                              type="text"
                              value={profFacebook}
                              onChange={(e) => setProfFacebook(e.target.value)}
                              placeholder="facebook.com/studioleticia ou link"
                              className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">
                              Twitter / X
                            </label>
                            <input
                              type="text"
                              value={profTwitter}
                              onChange={(e) => setProfTwitter(e.target.value)}
                              placeholder="@studioleticia"
                              className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">
                              TikTok do Studio
                            </label>
                            <input
                              type="text"
                              value={profTiktok}
                              onChange={(e) => setProfTiktok(e.target.value)}
                              placeholder="@leticia_oliveira_studio"
                              className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                            />
                          </div>
                        </div>

                        {/* Redes Sociais Adicionais / Personalizadas */}
                        <div className="pt-2 border-t border-[#F5ECE8] space-y-2">
                          <span className="text-[11px] font-bold text-stone-700 block">
                            Outras Redes Sociais / Links Personalizados:
                          </span>

                          {customSocials.map((soc, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-[#FAF6F4] p-2 rounded-xl border border-[#EBDCD5]">
                              <span className="text-xs font-bold text-stone-800 w-28 truncate">{soc.label}</span>
                              <span className="text-xs text-stone-500 flex-1 truncate">{soc.url}</span>
                              <button
                                type="button"
                                onClick={() => setCustomSocials(customSocials.filter((_, i) => i !== idx))}
                                className="p-1 rounded text-rose-500 hover:bg-rose-100"
                                title="Remover rede"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}

                          <div className="flex flex-col sm:flex-row gap-2 pt-1">
                            <input
                              type="text"
                              value={newCustomSocialLabel}
                              onChange={(e) => setNewCustomSocialLabel(e.target.value)}
                              placeholder="Nome (Ex: Threads, Pinterest)"
                              className="px-3 py-1.5 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none sm:w-1/3"
                            />
                            <input
                              type="text"
                              value={newCustomSocialUrl}
                              onChange={(e) => setNewCustomSocialUrl(e.target.value)}
                              placeholder="URL (Ex: https://threads.net/@leticia)"
                              className="px-3 py-1.5 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (newCustomSocialLabel.trim() && newCustomSocialUrl.trim()) {
                                  setCustomSocials([...customSocials, { label: newCustomSocialLabel.trim(), url: newCustomSocialUrl.trim() }]);
                                  setNewCustomSocialLabel('');
                                  setNewCustomSocialUrl('');
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl bg-stone-800 text-white font-bold text-xs hover:bg-stone-900 cursor-pointer"
                            >
                              + Adicionar
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Conteúdo Dinâmico do Site (Biografia, Headlines e Citações) */}
                      <div className="p-3 bg-white rounded-2xl border border-[#EBDCD5] space-y-3">
                        <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                          <Edit2 className="w-3.5 h-3.5 text-[#B87F6C]" />
                          <span>Textos da Página & Biografia (Edição Autônoma)</span>
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">
                              Badge de Boas-Vindas (Topo do Site)
                            </label>
                            <input
                              type="text"
                              value={profGreetingBadge}
                              onChange={(e) => setProfGreetingBadge(e.target.value)}
                              placeholder="Ex: Prazer, sou a Letícia! • 25 Anos"
                              className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">
                              Título Principal (Headline)
                            </label>
                            <input
                              type="text"
                              value={profHeadline}
                              onChange={(e) => setProfHeadline(e.target.value)}
                              placeholder="Ex: Cuidando do seu olhar com amor, visagismo & dedicação."
                              className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">
                            Citação em Destaque (Pull-Quote com aspas)
                          </label>
                          <input
                            type="text"
                            value={profHeroQuote}
                            onChange={(e) => setProfHeroQuote(e.target.value)}
                            placeholder='Ex: "Hoje, meu trabalho vai muito além de um procedimento estético..."'
                            className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">
                            Biografia Completa (Parágrafos separados por linha em branco)
                          </label>
                          <textarea
                            rows={5}
                            value={profBio}
                            onChange={(e) => setProfBio(e.target.value)}
                            placeholder="Conte sua história, sua paixão pelas sobrancelhas e visagismo..."
                            className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none leading-relaxed"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">
                              Título da Seção "Nosso Espaço"
                            </label>
                            <input
                              type="text"
                              value={profAboutTitle}
                              onChange={(e) => setProfAboutTitle(e.target.value)}
                              placeholder="Um refúgio de acolhimento e cuidado desenhado para realçar você."
                              className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">
                              Descrição da Seção "Nosso Espaço"
                            </label>
                            <textarea
                              rows={2}
                              value={profAboutDescription}
                              onChange={(e) => setProfAboutDescription(e.target.value)}
                              placeholder="Descrição sobre os pilares, biossegurança e conforto..."
                              className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none leading-relaxed"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Seção 2: Endereço & Como Chegar */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF6F4] border border-[#EBDCD5] space-y-4">
                      <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                        <MapPin className="w-4 h-4 text-[#B87F6C]" />
                        <span>Endereço do Studio & Orientações de Acesso</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                            Endereço Principal (Condomínio / Rua)
                          </label>
                          <input
                            type="text"
                            value={profAddress}
                            onChange={(e) => setProfAddress(e.target.value)}
                            placeholder="Condomínio Altos da Theodomiro 2, 2435"
                            className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                            Instruções de Acesso (Portaria, Bloco, Apê, Andar)
                          </label>
                          <input
                            type="text"
                            value={profAddressDetails}
                            onChange={(e) => setProfAddressDetails(e.target.value)}
                            placeholder="2ª portaria, Bloco 6, Apê 652 – 5º andar"
                            className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-stone-500 italic">
                        Essas informações são enviadas automaticamente para o WhatsApp da cliente quando o agendamento é confirmado!
                      </p>
                    </div>

                    {/* Seção 3: Chave PIX & Políticas de Agendamento */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF6F4] border border-[#EBDCD5] space-y-4">
                      <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                        <CreditCard className="w-4 h-4 text-[#B87F6C]" />
                        <span>Chave PIX & Regras de Cancelamento</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                            Chave PIX para Depósitos / Sinal
                          </label>
                          <input
                            type="text"
                            value={profPixKey}
                            onChange={(e) => setProfPixKey(e.target.value)}
                            placeholder="Ex: 5551995037223 ou CPF"
                            className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                            Tipo de Chave PIX
                          </label>
                          <select
                            value={profPixType}
                            onChange={(e) => setProfPixType(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                          >
                            <option value="Telefone">Telefone</option>
                            <option value="CPF">CPF</option>
                            <option value="Email">E-mail</option>
                            <option value="Aleatória">Chave Aleatória</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                            Buffer entre Atendimentos
                          </label>
                          <select
                            value={profBufferMinutes}
                            onChange={(e) => setProfBufferMinutes(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                          >
                            <option value="0">0 min (Sem pausa)</option>
                            <option value="5">5 minutos</option>
                            <option value="10">10 minutos (Higienização)</option>
                            <option value="15">15 minutos (Recomendado)</option>
                            <option value="20">20 minutos</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                            Antecedência Mínima para Cancelar (Horas)
                          </label>
                          <input
                            type="number"
                            value={profNoticeHours}
                            onChange={(e) => setProfNoticeHours(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                            Taxa Cobrada por Falta / Desistência (%)
                          </label>
                          <input
                            type="number"
                            value={profLateFeePercent}
                            onChange={(e) => setProfLateFeePercent(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                          Texto Completo da Política (Exibido nos Avisos)
                        </label>
                        <textarea
                          rows={3}
                          value={profCustomPolicy}
                          onChange={(e) => setProfCustomPolicy(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                        />
                      </div>
                    </div>

                    {/* Seção 4: Canais de Notificação da Dona & Alertas Automáticos */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF6F4] border border-[#EBDCD5] space-y-4">
                      <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                        <Bell className="w-4 h-4 text-[#B87F6C]" />
                        <span>Canais de Notificação & Alertas da Dona</span>
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed">
                        Configure e teste como você receberá avisos em tempo real a cada novo agendamento realizado pelas clientes.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                        {/* Canal 1: Som & Alerta no Painel */}
                        <div className="p-3.5 rounded-2xl bg-white border border-[#EBDCD5] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                              <Volume2 className="w-4 h-4 text-[#B87F6C]" />
                              Sino Harmônico (Web Audio)
                            </span>
                            <button
                              type="button"
                              onClick={toggleSoundNotification}
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold cursor-pointer ${
                                soundNotificationsEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                              }`}
                            >
                              {soundNotificationsEnabled ? 'Ativado 🔔' : 'Mudo 🔕'}
                            </button>
                          </div>
                          <p className="text-[11px] text-stone-500">
                            Toca um sino harmônico e agradável de salão a cada novo agendamento que entra no site.
                          </p>
                        </div>

                        {/* Canal 2: Push no Celular/Desktop */}
                        <div className="p-3.5 rounded-2xl bg-white border border-[#EBDCD5] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                              <Bell className="w-4 h-4 text-amber-500" />
                              Notificações Push / Celular
                            </span>
                            <button
                              type="button"
                              onClick={requestBrowserNotificationPermission}
                              className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-bold border border-stone-300 cursor-pointer"
                            >
                              {browserNotificationsPermission === 'granted' ? 'Ativadas ✅' : 'Habilitar 📱'}
                            </button>
                          </div>
                          <p className="text-[11px] text-stone-500">
                            Exibe um pop-up de notificação no seu celular ou computador a cada agendamento recebido.
                          </p>
                        </div>

                        {/* Canal 3: WhatsApp Direto */}
                        <div className="p-3.5 rounded-2xl bg-white border border-[#EBDCD5] space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp do Studio Ativo
                          </div>
                          <p className="text-[11px] text-stone-600">
                            A cliente recebe um botão em destaque para te avisar no WhatsApp ({profPhone || '(51) 99503-7223'}) logo após confirmar.
                          </p>
                        </div>

                        {/* Canal 4: E-mail da Dona & Google Agenda */}
                        <div className="p-3.5 rounded-2xl bg-white border border-[#EBDCD5] space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                            <Mail className="w-4 h-4 text-[#B87F6C]" />
                            E-mail & Google Calendar
                          </div>
                          <p className="text-[11px] text-stone-600">
                            Destino oficial: <strong className="font-mono text-stone-800">estudioleticiaoliveira@gmail.com</strong> com lembretes automáticos.
                          </p>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={testNotification}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 border border-[#DDBFB2] text-stone-700 text-xs font-bold shadow-2xs cursor-pointer"
                        >
                          <Volume2 className="w-4 h-4 text-[#B87F6C]" />
                          <span>🔊 Testar Sino e Notificação Agora</span>
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-6 py-3 rounded-full bg-[#B87F6C] hover:bg-[#A06654] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2"
                    >
                      {savingProfile ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 text-amber-200" />
                      )}
                      <span>Salvar Todas as Configurações do Studio</span>
                    </button>
                  </form>
                </div>
              )}

            </div>

        {/* ========================================================= */}
        {/* MODAL: GERENCIADOR DE BLOQUEIOS (MÊS, SEMANA, DIAS) */}
        {/* ========================================================= */}
        {showBlockModal && (
          <div className="fixed inset-0 z-60 flex justify-center p-2 sm:p-4 bg-stone-900/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
            <div
              style={{ maxHeight: 'min(92vh, calc(100dvh - 1rem))' }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#DDBFB2] flex flex-col overflow-hidden my-auto"
            >
              <div className="flex items-center justify-between border-b border-stone-100 p-4 sm:p-5 shrink-0 bg-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold shrink-0">
                    <Ban className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-serif font-bold text-stone-900 text-sm sm:text-base leading-tight">
                      Gerenciador de Bloqueios de Agenda
                    </h5>
                    <span className="text-[11px] text-stone-500">
                      Feche ou libere meses inteiros, semanas ou dias no site
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
                {/* Seletor do Tipo de Bloqueio */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-stone-700 uppercase">
                    O que você deseja bloquear ou liberar?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setBlockType('MONTH');
                        setBlockReason(`Mês de ${getMonthName(blockTargetMonth)} Lotado / Sem atendimento`);
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        blockType === 'MONTH'
                          ? 'bg-[#B87F6C] text-white border-[#B87F6C] shadow-xs'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      🚫 Mês Inteiro
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBlockType('RANGE');
                        setBlockReason('Semana Bloqueada / Sem atendimento');
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        blockType === 'RANGE' || blockType === 'WEEK'
                          ? 'bg-[#B87F6C] text-white border-[#B87F6C] shadow-xs'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      📅 Semana / Período
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBlockType('DAYS');
                        setBlockReason('Dias Bloqueados / Sem atendimento');
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        blockType === 'DAYS'
                          ? 'bg-[#B87F6C] text-white border-[#B87F6C] shadow-xs'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      ❌ Dias Livres ({selectedDates.size})
                    </button>
                  </div>
                </div>

                {/* Configurações conforme o tipo selecionado */}
                {blockType === 'MONTH' && (
                  <div className="p-3 bg-[#FAF6F4] rounded-2xl border border-[#EBDCD5] space-y-2">
                    <span className="text-[11px] font-bold text-stone-700 block">
                      Escolha o Mês para Aplicar a Regra:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-stone-500 font-bold block mb-1">Mês</label>
                        <select
                          value={blockTargetMonth}
                          onChange={(e) => {
                            const m = Number(e.target.value);
                            setBlockTargetMonth(m);
                            setBlockReason(`Mês de ${getMonthName(m)} Lotado / Sem atendimento`);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                            <option key={m} value={m}>
                              {getMonthName(m)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-stone-500 font-bold block mb-1">Ano</label>
                        <input
                          type="number"
                          value={blockTargetYear}
                          onChange={(e) => setBlockTargetYear(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white"
                        >
                        </input>
                      </div>
                    </div>
                  </div>
                )}

                {(blockType === 'RANGE' || blockType === 'WEEK') && (
                  <div className="p-3 bg-[#FAF6F4] rounded-2xl border border-[#EBDCD5] space-y-2">
                    <span className="text-[11px] font-bold text-stone-700 block">
                      Defina o Intervalo de Datas da Semana / Período:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-stone-500 font-bold block mb-1">A partir de (Início):</label>
                        <input
                          type="date"
                          value={blockStartDate}
                          onChange={(e) => setBlockStartDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-stone-500 font-bold block mb-1">Até (Término):</label>
                        <input
                          type="date"
                          value={blockEndDate}
                          onChange={(e) => setBlockEndDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {blockType === 'DAYS' && (
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
                    {selectedDates.size === 0 ? (
                      <span>⚠️ Ative o modo "Seleção Livre de Dias" no calendário para escolher os dias específicos antes de bloquear.</span>
                    ) : (
                      <span>Serão bloqueados <strong>{selectedDates.size} dia(s)</strong> selecionados no calendário.</span>
                    )}
                  </div>
                )}

                {/* Motivo do Bloqueio */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                    Motivo que será exibido (Ex: Mês Lotado, Férias, Sem atendimento):
                  </label>
                  <input
                    type="text"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="Ex: Mês de Novembro Lotado"
                    className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                  />
                </div>
              </div>

              {/* Ações */}
              <div className="p-3.5 sm:p-4 border-t border-stone-100 shrink-0 bg-stone-50/60 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  disabled={blockingPeriod}
                  onClick={() => {
                    setBlockIsOpen(false);
                    handleApplyBlockPeriod();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Ban className="w-4 h-4" />
                  <span>{blockingPeriod ? 'Aplicando...' : 'Confirmar Bloqueio (Fechar Horários)'}</span>
                </button>

                <button
                  type="button"
                  disabled={blockingPeriod}
                  onClick={() => {
                    setBlockIsOpen(true);
                    handleApplyBlockPeriod();
                  }}
                  className="py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Liberar / Abrir</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: CRIAR / EDITAR CAMPANHA DE BÔNUS */}
        {/* ========================================================= */}
        {showCampaignModal && (
          <div className="fixed inset-0 z-60 flex justify-center p-2 sm:p-4 bg-stone-900/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
            <div
              style={{ maxHeight: 'min(92vh, calc(100dvh - 1rem))' }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#DDBFB2] flex flex-col overflow-hidden my-auto"
            >
              <div className="flex items-center justify-between border-b border-stone-100 p-4 sm:p-5 shrink-0 bg-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold shrink-0">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-serif font-bold text-stone-900 text-sm sm:text-base leading-tight">
                      {editingCampaignId ? 'Editar Campanha de Bônus' : 'Criar Nova Campanha de Bônus'}
                    </h5>
                    <span className="text-[11px] text-stone-500">
                      Configure benefícios dinâmicos para a página inicial
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowCampaignModal(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCampaign} className="flex flex-col flex-1 overflow-hidden min-h-0">
                <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                      Título do Bônus *
                    </label>
                    <input
                      type="text"
                      required
                      value={campTitle}
                      onChange={(e) => setCampTitle(e.target.value)}
                      placeholder="Ex: 20% OFF no Design com Henna"
                      className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                      Badge / Selo
                    </label>
                    <input
                      type="text"
                      value={campBadgeText}
                      onChange={(e) => setCampBadgeText(e.target.value)}
                      placeholder="Tempo Limitado"
                      className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                    />
                  </div>
                </div>

                {/* Tipo de Benefício */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                      Tipo de Benefício
                    </label>
                    <select
                      value={campDiscountType}
                      onChange={(e) => setCampDiscountType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                    >
                      <option value="PERCENT">Desconto em Porcentagem (%)</option>
                      <option value="FIXED">Desconto em Valor Fixo (R$)</option>
                      <option value="GIFT">Brinde / Cortesia Especial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                      {campDiscountType === 'GIFT' ? 'Nome do Brinde' : 'Valor do Desconto'}
                    </label>
                    {campDiscountType === 'GIFT' ? (
                      <input
                        type="text"
                        value={campGiftName}
                        onChange={(e) => setCampGiftName(e.target.value)}
                        placeholder="Ex: Epilação de buço grátis"
                        className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                      />
                    ) : (
                      <input
                        type="number"
                        min="1"
                        value={campDiscountValue}
                        onChange={(e) => setCampDiscountValue(e.target.value)}
                        placeholder="Ex: 20"
                        className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                    Descrição dos Benefícios & Detalhes
                  </label>
                  <textarea
                    rows={2}
                    value={campDesc}
                    onChange={(e) => setCampDesc(e.target.value)}
                    placeholder="Descreva para quais clientes ou procedimentos este bônus é válido..."
                    className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none leading-relaxed"
                  />
                </div>

                {/* Validade: Dias, Semanas ou Meses */}
                <div className="p-3 bg-[#FAF6F4] rounded-2xl border border-[#EBDCD5] space-y-2">
                  <span className="text-[11px] font-bold text-stone-700 block">
                    Período de Validade (Dias, Semanas ou Meses):
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-stone-500 font-bold block mb-1">Data Início (Opcional):</label>
                      <input
                        type="date"
                        value={campStartDate}
                        onChange={(e) => setCampStartDate(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-[#DDBFB2] text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-500 font-bold block mb-1">Data Fim (Opcional):</label>
                      <input
                        type="date"
                        value={campEndDate}
                        onChange={(e) => setCampEndDate(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-[#DDBFB2] text-xs bg-white"
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-stone-400 italic block">
                    Deixe em branco se quiser manter o bônus ativo sem prazo de encerramento.
                  </span>
                </div>

                {/* Uploader de Banner ou Foto da Campanha (Celular, Câmera ou Modelos Prontos) */}
                <div className="bg-[#FAF6F4] p-3.5 rounded-2xl border border-[#EBDCD5] space-y-3">
                  <ImageUploader
                    value={campImageUrl}
                    onChange={setCampImageUrl}
                    token={token}
                    presets={BONUS_PRESETS}
                    label="Foto ou Imagem Promocional do Bônus (Anexar Imagem)"
                    placeholder="Cole um link ou escolha do celular / modelos prontos"
                    recommendedSize="Pode escolher foto do celular, câmera, galeria ou modelos prontos do studio!"
                  />

                  {/* PRÉVIA AO VIVO DO CARD NA PÁGINA INICIAL */}
                  <div className="mt-3 pt-3 border-t border-[#EBDCD5]">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1 mb-2">
                      <Eye className="w-3 h-3 text-amber-500" />
                      Visualização em Tempo Real (Como o cliente verá no site):
                    </span>

                    <div className="bg-white rounded-2xl p-4 border border-[#EBDCD5] shadow-xs space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF6F4] text-[#B87F6C] border border-[#EBDCD5] text-[10px] font-bold">
                          <Gift className="w-2.5 h-2.5 text-amber-500" />
                          {campBadgeText || 'Tempo Limitado'}
                        </span>
                        {campEndDate && (
                          <span className="text-[10px] font-medium text-stone-500 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-stone-400" />
                            Até {campEndDate.split('-').reverse().join('/')}
                          </span>
                        )}
                      </div>

                      {campImageUrl ? (
                        <div
                          onClick={() => setExpandedBonusAdmin({
                            title: campTitle || 'Prévia do Bônus',
                            imageUrl: campImageUrl,
                            badgeText: campBadgeText,
                            discountType: campDiscountType,
                            discountValue: campDiscountValue,
                            giftName: campGiftName,
                            description: campDesc
                          })}
                          className="w-full min-h-[140px] max-h-[220px] rounded-xl overflow-hidden border border-[#EBDCD5] bg-stone-900 cursor-pointer relative group/prev flex items-center justify-center"
                          title="Clique para ver como as clientes verão a imagem expandida"
                        >
                          <img
                            src={resolveImageUrl(campImageUrl)}
                            alt="Prévia"
                            className="w-full h-full object-contain group-hover/prev:scale-105 transition-transform"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-full bg-black/75 text-white text-[10px] font-bold flex items-center gap-1 shadow">
                            <Maximize2 className="w-2.5 h-2.5 text-amber-300" />
                            <span>Ampliar Prévia</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-20 rounded-xl bg-stone-50 border border-dashed border-stone-200 flex items-center justify-center text-stone-400 text-xs gap-1">
                          <Gift className="w-4 h-4 text-stone-300" />
                          <span>Sem imagem anexada (ficará em formato compacto)</span>
                        </div>
                      )}

                      <h6 className="font-serif font-bold text-stone-900 text-sm">
                        {campTitle || 'Título do Bônus'}
                      </h6>

                      {campDesc && (
                        <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                          {campDesc}
                        </p>
                      )}

                      <div className="p-2.5 rounded-xl bg-[#FAF6F4] border border-[#EBDCD5] flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-stone-500 block">Benefício:</span>
                          <strong className="text-xs font-bold text-[#7E4E40]">
                            {campDiscountType === 'PERCENT' && `${campDiscountValue || 0}% de Desconto`}
                            {campDiscountType === 'FIXED' && `R$ ${campDiscountValue || 0} OFF`}
                            {campDiscountType === 'GIFT' && (campGiftName || 'Brinde Especial')}
                          </strong>
                        </div>
                        <Tag className="w-3.5 h-3.5 text-[#B87F6C]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Ativo / Oculto */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="campActiveCheck"
                    checked={campActive}
                    onChange={(e) => setCampActive(e.target.checked)}
                    className="w-4 h-4 accent-[#B87F6C] rounded cursor-pointer"
                  />
                  <label htmlFor="campActiveCheck" className="text-xs font-bold text-stone-800 cursor-pointer">
                    Publicar imediatamente na página principal do site
                  </label>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 border-t border-stone-100 shrink-0 bg-stone-50/60 flex gap-2">
                  <button
                    type="submit"
                    disabled={savingCampaign}
                    className="flex-1 py-3 rounded-xl bg-[#B87F6C] hover:bg-[#A06654] text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {savingCampaign ? 'Salvando...' : editingCampaignId ? 'Salvar Alterações' : 'Publicar Bônus no Site'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCampaignModal(false)}
                    className="py-3 px-4 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: MOTIVO DA RECUSA DE BÔNUS */}
        {/* ========================================================= */}
        {noteModalApp && (
          <div className="fixed inset-0 z-60 flex justify-center p-2 sm:p-4 bg-stone-900/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
            <div
              style={{ maxHeight: 'min(92vh, calc(100dvh - 1rem))' }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#DDBFB2] flex flex-col overflow-hidden my-auto"
            >
              <div className="p-4 sm:p-5 border-b border-stone-100 shrink-0 bg-white flex items-center justify-between">
                <div>
                  <h5 className="font-serif font-bold text-stone-900 text-sm sm:text-base">
                    Recusar Solicitação de Bônus
                  </h5>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Cliente: <strong>{noteModalApp.clientName}</strong> ({formatPhoneDisplay(noteModalApp.clientPhone)})
                  </p>
                </div>
                <button
                  onClick={() => setNoteModalApp(null)}
                  className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                    Motivo da Recusa (Opcional - visível para a cliente):
                  </label>
                  <input
                    type="text"
                    value={adminNoteInput}
                    onChange={(e) => setAdminNoteInput(e.target.value)}
                    placeholder="Ex: Campanha válida apenas para novos agendamentos"
                    className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white outline-none"
                  />
                </div>
              </div>

              <div className="p-3.5 sm:p-4 border-t border-stone-100 shrink-0 bg-stone-50/60 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateAppStatus(noteModalApp.id, 'RECUSADO', adminNoteInput);
                    setNoteModalApp(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Confirmar Recusa
                </button>
                <button
                  type="button"
                  onClick={() => setNoteModalApp(null)}
                  className="py-2.5 px-4 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: GERADOR DE ESCALA EM LOTE */}
        {/* ========================================================= */}
        {showBatchModal && (
          <div className="fixed inset-0 z-60 flex justify-center p-2 sm:p-4 bg-stone-900/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
            <div
              style={{ maxHeight: 'min(92vh, calc(100dvh - 1rem))' }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#DDBFB2] flex flex-col overflow-hidden my-auto"
            >
              <div className="flex items-center justify-between border-b border-stone-100 p-4 sm:p-5 shrink-0 bg-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#7E4E40] flex items-center justify-center font-bold shrink-0">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-serif font-bold text-stone-900 text-sm sm:text-base leading-tight">
                      Gerador de Escala de Trabalho
                    </h5>
                    <span className="text-[11px] text-stone-500">
                      Mês de {getMonthName(currentMonth)}/{currentYear}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowBatchModal(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3.5 text-xs">
                {/* Escolha da Regra / Preset */}
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Selecione o Padrão da sua Escala:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Opção Recomendada: Ímpares & Pares Juntos (Dois Empregos) */}
                    <button
                      type="button"
                      onClick={() => setBatchPreset('DUAL_ODD_EVEN')}
                      className={`col-span-2 p-3 rounded-2xl border-2 text-left font-bold transition-all cursor-pointer relative overflow-hidden ${
                        batchPreset === 'DUAL_ODD_EVEN'
                          ? 'bg-gradient-to-r from-amber-50 to-[#FAF6F4] border-[#B87F6C] text-[#7E4E40] shadow-sm'
                          : 'bg-white border-[#EBDCD5] text-stone-700 hover:border-[#B87F6C]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-[#7E4E40]">
                          <Calendar className="w-4 h-4 text-[#B87F6C] shrink-0" />
                          Escala 2 Empregos (Ímpares & Pares)
                        </span>
                        <span className="self-start sm:self-auto px-2 py-0.5 rounded-full bg-[#B87F6C] text-white text-[10px] font-bold">
                          Recomendado
                        </span>
                      </div>
                      <span className="text-[11px] block font-normal text-stone-600 mt-1 leading-snug">
                        Configure horários diferentes para dias ímpares e dias pares ao mesmo tempo. Sem que um apague o outro!
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBatchPreset('ODD_DAYS')}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer min-w-0 ${
                        batchPreset === 'ODD_DAYS'
                          ? 'bg-amber-100 border-[#B87F6C] text-[#7E4E40]'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <span className="block truncate">Apenas Dias Ímpares</span>
                      <span className="text-[10px] block font-normal text-stone-500">1, 3, 5, 7, 9...</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBatchPreset('EVEN_DAYS')}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer min-w-0 ${
                        batchPreset === 'EVEN_DAYS'
                          ? 'bg-amber-100 border-[#B87F6C] text-[#7E4E40]'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <span className="block truncate">Apenas Dias Pares</span>
                      <span className="text-[10px] block font-normal text-stone-500">2, 4, 6, 8, 10...</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBatchPreset('PATTERN_1X1')}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer min-w-0 ${
                        batchPreset === 'PATTERN_1X1'
                          ? 'bg-amber-100 border-[#B87F6C] text-[#7E4E40]'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <span className="block truncate">Escala 1x1 (Dia sim/não)</span>
                      <span className="text-[10px] block font-normal text-stone-500">Alternado dia a dia</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBatchPreset('PATTERN_2X2')}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer min-w-0 ${
                        batchPreset === 'PATTERN_2X2'
                          ? 'bg-amber-100 border-[#B87F6C] text-[#7E4E40]'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <span className="block truncate">Escala 2x2</span>
                      <span className="text-[10px] block font-normal text-stone-500">2 trabalha, 2 folga</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBatchPreset('WEEKDAYS')}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer min-w-0 ${
                        batchPreset === 'WEEKDAYS'
                          ? 'bg-amber-100 border-[#B87F6C] text-[#7E4E40]'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <span className="block truncate">Segunda a Sexta</span>
                      <span className="text-[10px] block font-normal text-stone-500">Dias úteis</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBatchPreset('WEEKENDS')}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer min-w-0 ${
                        batchPreset === 'WEEKENDS'
                          ? 'bg-amber-100 border-[#B87F6C] text-[#7E4E40]'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <span className="block truncate">Finais de Semana</span>
                      <span className="text-[10px] block font-normal text-stone-500">Sábados e Domingos</span>
                    </button>

                    {selectedDates.size > 0 && (
                      <button
                        type="button"
                        onClick={() => setBatchPreset('CUSTOM')}
                        className={`col-span-2 p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                          batchPreset === 'CUSTOM'
                            ? 'bg-amber-100 border-[#B87F6C] text-[#7E4E40]'
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <span>Datas Selecionadas no Calendário ({selectedDates.size} dias)</span>
                        <span className="text-[10px] block font-normal text-stone-500">
                          Dias: {Array.from(selectedDates).map(d => Number(d.split('-')[2])).sort((a,b)=>a-b).join(', ')}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* FORMULÁRIO 1: MODO DUPLO (ÍMPARES & PARES JUNTOS) */}
                {batchPreset === 'DUAL_ODD_EVEN' ? (
                  <div className="space-y-3 pt-2">
                    {/* Bloco 1: Dias Ímpares */}
                    <div className="p-3.5 rounded-2xl bg-[#FAF6F4] border border-[#EBDCD5] space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="font-extrabold text-[#7E4E40] text-xs flex items-center gap-1.5">
                          <span>📅 DIAS ÍMPARES (1, 3, 5, 7, 9...)</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setDualOddOpen(!dualOddOpen)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto ${
                            dualOddOpen
                              ? 'bg-emerald-600 text-white'
                              : 'bg-rose-600 text-white'
                          }`}
                        >
                          {dualOddOpen ? 'Atendimento Aberto' : 'Folga / Sem Atendimento'}
                        </button>
                      </div>

                      {dualOddOpen ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="min-w-0">
                              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                                Início:
                              </label>
                              <input
                                type="time"
                                value={dualOddStart}
                                onChange={(e) => setDualOddStart(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-xl border border-[#DDBFB2] bg-white text-xs font-semibold"
                              />
                            </div>
                            <div className="min-w-0">
                              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                                Fim:
                              </label>
                              <input
                                type="time"
                                value={dualOddEnd}
                                onChange={(e) => setDualOddEnd(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-xl border border-[#DDBFB2] bg-white text-xs font-semibold"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="min-w-0">
                              <label className="block text-[10px] font-medium text-stone-500 mb-0.5">
                                Pausa Início (opcional):
                              </label>
                              <input
                                type="time"
                                value={dualOddBreakStart}
                                onChange={(e) => setDualOddBreakStart(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-xl border border-[#DDBFB2] bg-white text-xs"
                              />
                            </div>
                            <div className="min-w-0">
                              <label className="block text-[10px] font-medium text-stone-500 mb-0.5">
                                Pausa Fim (opcional):
                              </label>
                              <input
                                type="time"
                                value={dualOddBreakEnd}
                                onChange={(e) => setDualOddBreakEnd(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-xl border border-[#DDBFB2] bg-white text-xs"
                              />
                            </div>
                          </div>
                          <div>
                            <input
                              type="text"
                              value={dualOddNote}
                              onChange={(e) => setDualOddNote(e.target.value)}
                              placeholder="Nota (Ex: Turno da Tarde)"
                              className="w-full px-2.5 py-1.5 rounded-xl border border-[#DDBFB2] bg-white text-[11px]"
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-rose-700 font-medium">
                          Todos os dias ímpares ficarão bloqueados (sem agendamentos).
                        </p>
                      )}
                    </div>

                    {/* Bloco 2: Dias Pares */}
                    <div className="p-3.5 rounded-2xl bg-white border border-[#DDBFB2] space-y-2.5 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="font-extrabold text-stone-800 text-xs flex items-center gap-1.5">
                          <span>📅 DIAS PARES (2, 4, 6, 8, 10...)</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setDualEvenOpen(!dualEvenOpen)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto ${
                            dualEvenOpen
                              ? 'bg-emerald-600 text-white'
                              : 'bg-rose-600 text-white'
                          }`}
                        >
                          {dualEvenOpen ? 'Atendimento Aberto' : 'Folga / Sem Atendimento'}
                        </button>
                      </div>

                      {dualEvenOpen ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="min-w-0">
                              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                                Início:
                              </label>
                              <input
                                type="time"
                                value={dualEvenStart}
                                onChange={(e) => setDualEvenStart(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-xl border border-[#DDBFB2] bg-white text-xs font-semibold"
                              />
                            </div>
                            <div className="min-w-0">
                              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                                Fim:
                              </label>
                              <input
                                type="time"
                                value={dualEvenEnd}
                                onChange={(e) => setDualEvenEnd(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-xl border border-[#DDBFB2] bg-white text-xs font-semibold"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="min-w-0">
                              <label className="block text-[10px] font-medium text-stone-500 mb-0.5">
                                Pausa Início (opcional):
                              </label>
                              <input
                                type="time"
                                value={dualEvenBreakStart}
                                onChange={(e) => setDualEvenBreakStart(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-xl border border-[#DDBFB2] bg-white text-xs"
                              />
                            </div>
                            <div className="min-w-0">
                              <label className="block text-[10px] font-medium text-stone-500 mb-0.5">
                                Pausa Fim (opcional):
                              </label>
                              <input
                                type="time"
                                value={dualEvenBreakEnd}
                                onChange={(e) => setDualEvenBreakEnd(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-xl border border-[#DDBFB2] bg-white text-xs"
                              />
                            </div>
                          </div>
                          <div>
                            <input
                              type="text"
                              value={dualEvenNote}
                              onChange={(e) => setDualEvenNote(e.target.value)}
                              placeholder="Nota (Ex: Turno da Manhã)"
                              className="w-full px-2.5 py-1.5 rounded-xl border border-[#DDBFB2] bg-white text-[11px]"
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-rose-700 font-medium">
                          Todos os dias pares ficarão bloqueados (sem agendamentos).
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  /* FORMULÁRIO 2: MODO PADRÃO INDIVIDUAL OU DATAS SELECIONADAS */
                  <div className="space-y-3 pt-2">
                    {/* Status de Atendimento Aberto ou Fechado */}
                    <div className="p-3 rounded-2xl bg-[#FAF6F4] border border-[#EBDCD5] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-stone-900 block text-xs">
                          Status dos Dias Selecionados
                        </span>
                        <span className="text-[10px] text-stone-500">
                          {batchIsOpen ? 'Liberar horários para atendimento' : 'Marcar como Folga / Fechado'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBatchIsOpen(!batchIsOpen)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer self-start sm:self-auto ${
                          batchIsOpen ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                        }`}
                      >
                        {batchIsOpen ? 'Atendimento Aberto' : 'Fechado (Folga)'}
                      </button>
                    </div>

                    {batchIsOpen && (
                      <>
                        {/* Horários aplicados */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="min-w-0">
                            <label className="block text-[11px] font-bold text-stone-700 mb-1">
                              Início do Atendimento:
                            </label>
                            <input
                              type="time"
                              value={batchStartTime}
                              onChange={(e) => setBatchStartTime(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2]"
                            />
                          </div>

                          <div className="min-w-0">
                            <label className="block text-[11px] font-bold text-stone-700 mb-1">
                              Fim do Atendimento:
                            </label>
                            <input
                              type="time"
                              value={batchEndTime}
                              onChange={(e) => setBatchEndTime(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2]"
                            />
                          </div>
                        </div>

                        {/* Intervalo de Almoço */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="min-w-0">
                            <label className="block text-[11px] font-bold text-stone-700 mb-1">
                              Início do Almoço:
                            </label>
                            <input
                              type="time"
                              value={batchBreakStart}
                              onChange={(e) => setBatchBreakStart(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2]"
                            />
                          </div>

                          <div className="min-w-0">
                            <label className="block text-[11px] font-bold text-stone-700 mb-1">
                              Fim do Almoço:
                            </label>
                            <input
                              type="time"
                              value={batchBreakEnd}
                              onChange={(e) => setBatchBreakEnd(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2]"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Fechar os outros dias */}
                    <div className="pt-2">
                      <label className="flex items-start gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={batchCloseOthers}
                          onChange={(e) => setBatchCloseOthers(e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded text-[#B87F6C] focus:ring-[#B87F6C]"
                        />
                        <div>
                          <span className="font-bold text-stone-800 text-xs">
                            Bloquear os outros dias do mês como FOLGA
                          </span>
                          <p className="text-[10px] text-stone-500 mt-0.5 leading-tight">
                            (Deixe <strong>desmarcado</strong> se você já configurou ou quer configurar os outros dias separadamente).
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Nota do Lote */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Identificação / Nota Interna:
                      </label>
                      <input
                        type="text"
                        value={batchNote}
                        onChange={(e) => setBatchNote(e.target.value)}
                        placeholder="Ex: Escala 12x36 ou Plantão externo"
                        className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 p-3.5 sm:p-4 border-t border-stone-100 shrink-0 bg-stone-50/60">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={applyingBatch}
                  onClick={handleApplyBatchSchedule}
                  className="px-5 py-2.5 rounded-xl bg-[#B87F6C] hover:bg-[#A06654] text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {applyingBatch ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Aplicar ao Mês de {getMonthName(currentMonth)}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: AJUSTE FINO DE UM DIA ESPECÍFICO */}
        {/* ========================================================= */}
        {selectedDayDetail && (
          <div className="fixed inset-0 z-60 flex justify-center p-2 sm:p-4 bg-stone-900/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
            <div
              style={{ maxHeight: 'min(92vh, calc(100dvh - 1rem))' }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#DDBFB2] flex flex-col overflow-hidden my-auto"
            >
              <div className="flex items-center justify-between border-b border-stone-100 p-4 sm:p-5 shrink-0 bg-white">
                <div>
                  <h5 className="font-serif font-bold text-stone-900 text-sm sm:text-base leading-tight">
                    Configuração do Dia {selectedDayDetail.day}
                  </h5>
                  <span className="text-[11px] text-stone-500 font-medium">
                    {selectedDayDetail.date} ({dayLabels[selectedDayDetail.dayOfWeek]})
                  </span>
                </div>
                <button
                  onClick={() => setSelectedDayDetail(null)}
                  className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
                {/* Toggle Aberto ou Fechado */}
                <div className="p-3 rounded-2xl bg-[#FAF6F4] border border-[#EBDCD5] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-stone-900 block text-xs">
                      Atendimento neste Dia
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {selectedDayDetail.isOpen ? 'Disponível para clientes' : 'Dia bloqueado no site'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedDayDetail({
                        ...selectedDayDetail,
                        isOpen: !selectedDayDetail.isOpen
                      })
                    }
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                      selectedDayDetail.isOpen
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {selectedDayDetail.isOpen ? 'Aberto' : 'Fechado (Folga)'}
                  </button>
                </div>

                {/* Se estiver aberto, configurar horário daquele dia */}
                {selectedDayDetail.isOpen && (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Início:
                        </label>
                        <input
                          type="time"
                          value={selectedDayDetail.startTime || '09:00'}
                          onChange={(e) =>
                            setSelectedDayDetail({
                              ...selectedDayDetail,
                              startTime: e.target.value
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Término:
                        </label>
                        <input
                          type="time"
                          value={selectedDayDetail.endTime || '19:00'}
                          onChange={(e) =>
                            setSelectedDayDetail({
                              ...selectedDayDetail,
                              endTime: e.target.value
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2]"
                        />
                        {(selectedDayDetail.endTime === '00:00' || selectedDayDetail.endTime === '24:00') && (
                          <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-bold block mt-1">
                            Meia-noite (24h). Para fechar no início da noite, use 20:00 ou 21:00.
                          </span>
                        )}
                        <span className="text-[10px] text-stone-500 mt-1 block leading-tight">
                          O último horário visível ao cliente é o término menos a duração do serviço (ex: para atender às 19h com serviço de 30m, defina término 19:30 ou 20h).
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Pausa Almoço (Início):
                        </label>
                        <input
                          type="time"
                          value={selectedDayDetail.breakStart || ''}
                          onChange={(e) =>
                            setSelectedDayDetail({
                              ...selectedDayDetail,
                              breakStart: e.target.value
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Pausa Almoço (Fim):
                        </label>
                        <input
                          type="time"
                          value={selectedDayDetail.breakEnd || ''}
                          onChange={(e) =>
                            setSelectedDayDetail({
                              ...selectedDayDetail,
                              breakEnd: e.target.value
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Nota interna */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Motivo / Nota Interna (Ex: Escala hospital, plantão, folga):
                  </label>
                  <input
                    type="text"
                    value={selectedDayDetail.note || ''}
                    onChange={(e) =>
                      setSelectedDayDetail({
                        ...selectedDayDetail,
                        note: e.target.value
                      })
                    }
                    placeholder="Ex: Escala de trabalho obrigatória"
                    className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2]"
                  />
                </div>

                {/* Se houver clientes agendadas neste dia */}
                {selectedDayDetail.appointmentCount > 0 && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <span className="font-bold text-amber-900 block text-xs">
                      ⚠️ Atenção: {selectedDayDetail.appointmentCount} cliente(s) agendada(s) nesta data!
                    </span>
                    <span className="text-[10px] text-amber-700">
                      Se você fechar o dia, lembre-se de avisar as clientes pela aba de Agenda.
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 p-3.5 sm:p-4 border-t border-stone-100 shrink-0 bg-stone-50/60">
                <button
                  type="button"
                  onClick={() => setSelectedDayDetail(null)}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={savingDayDetail}
                  onClick={handleSaveDayDetail}
                  className="px-5 py-2.5 rounded-xl bg-[#B87F6C] hover:bg-[#A06654] text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {savingDayDetail ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Salvar Dia</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: NOVO AGENDAMENTO MANUAL PELA DONA */}
        {/* ========================================================= */}
        {showNewAppointmentModal && (
          <div className="fixed inset-0 z-60 flex justify-center p-2 sm:p-4 bg-stone-900/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
            <div
              style={{ maxHeight: 'min(92vh, calc(100dvh - 1rem))' }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#DDBFB2] flex flex-col overflow-hidden my-auto"
            >
              <div className="flex items-center justify-between border-b border-stone-100 p-4 sm:p-5 shrink-0 bg-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF6F4] text-[#B87F6C] flex items-center justify-center font-bold shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-serif font-bold text-stone-900 text-sm sm:text-base leading-tight">
                      Novo Agendamento Manual
                    </h5>
                    <span className="text-[11px] text-stone-500">
                      Cadastre a cliente que te chamou no WhatsApp
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewAppointmentModal(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateManualAppointment} className="flex flex-col flex-1 overflow-hidden min-h-0">
                <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 uppercase mb-1">
                      Nome Completo da Cliente *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAppClientName}
                      onChange={(e) => setNewAppClientName(e.target.value)}
                      placeholder="Ex: Amanda Silva"
                      className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 uppercase mb-1">
                      WhatsApp da Cliente (Brasil) *
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 flex items-center gap-1.5 pointer-events-none select-none text-xs font-bold text-stone-700">
                        <span className="text-sm">🇧🇷</span>
                        <span>+55</span>
                        <span className="text-stone-300">|</span>
                      </div>
                      <input
                        type="text"
                        required
                        value={newAppClientPhone}
                        onChange={(e) => setNewAppClientPhone(formatBrazilianPhoneInput(e.target.value))}
                        placeholder="(51) 98047-0713"
                        className="w-full pl-20 pr-3 py-2 rounded-xl border border-[#DDBFB2]"
                      />
                    </div>
                    <span className="text-[10px] text-stone-500 block mt-1">
                      Padrão Brasil (+55). Insira DDD e número da cliente.
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 uppercase mb-1">
                      Procedimento / Serviço *
                    </label>
                    <select
                      value={newAppServiceId}
                      onChange={(e) => setNewAppServiceId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2]"
                    >
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} — R$ {s.price.toFixed(2)} ({s.durationMinutes} min)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="min-w-0">
                      <label className="block font-bold text-stone-700 uppercase mb-1">
                        Data *
                      </label>
                      <input
                        type="date"
                        required
                        value={newAppDate}
                        onChange={(e) => setNewAppDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2]"
                      />
                    </div>

                    <div className="min-w-0">
                      <label className="block font-bold text-stone-700 uppercase mb-1">
                        Horário de Início *
                      </label>
                      <input
                        type="time"
                        required
                        value={newAppTime}
                        onChange={(e) => setNewAppTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 uppercase mb-1">
                      Forma de Pagamento
                    </label>
                    <select
                      value={newAppPaymentMethod}
                      onChange={(e) => setNewAppPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2]"
                    >
                      <option value="PRESENCIAL">Pagar no Local (Presencial)</option>
                      <option value="ONLINE">Pagamento Antecipado / Pix</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 uppercase mb-1">
                      Observações Internas (Opcional)
                    </label>
                    <input
                      type="text"
                      value={newAppNotes}
                      onChange={(e) => setNewAppNotes(e.target.value)}
                      placeholder="Ex: Alérgica a esmalte, prefere sobrancelha mais marcada"
                      className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 p-3.5 sm:p-4 border-t border-stone-100 shrink-0 bg-stone-50/60">
                  <button
                    type="button"
                    onClick={() => setShowNewAppointmentModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creatingApp}
                    className="px-5 py-2.5 rounded-xl bg-[#B87F6C] hover:bg-[#A06654] text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {creatingApp ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>Confirmar Agendamento</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: PRÉ-VISUALIZAÇÃO DA POLÍTICA & AVISO OFICIAL */}
        {/* ========================================================= */}
        {showPolicyModal && (
          <div className="fixed inset-0 z-60 flex justify-center p-2 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
            <div
              style={{ maxHeight: 'min(92vh, calc(100dvh - 1rem))' }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#DDBFB2] flex flex-col overflow-hidden my-auto"
            >
              <div className="flex items-center justify-between border-b border-stone-100 p-4 sm:p-5 shrink-0 bg-white">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#B87F6C] shrink-0" />
                  <h5 className="font-serif font-bold text-stone-900 text-sm sm:text-base leading-tight">
                    Modelo do Aviso Oficial de Confirmação
                  </h5>
                </div>
                <button
                  onClick={() => setShowPolicyModal(false)}
                  className="p-1 rounded-lg text-stone-400 hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-xs">
                <div className="p-4 rounded-2xl bg-[#FAF6F4] border border-[#EBDCD5] text-xs text-stone-800 whitespace-pre-line leading-relaxed font-mono select-all">
                  {formatNoticeMessage({
                    date: todayDateStr,
                    startTime: '14:00',
                    clientName: 'Nome da Cliente',
                    service: { name: 'Design com Henna' }
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs p-3.5 sm:p-4 border-t border-stone-100 shrink-0 bg-stone-50/60">
                <span className="text-stone-500">
                  Você pode editar o endereço e as regras na aba <strong>Studio & Perfil</strong>!
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      formatNoticeMessage({
                        date: todayDateStr,
                        startTime: '14:00',
                        clientName: 'Nome da Cliente',
                        service: { name: 'Design com Henna' }
                      })
                    );
                    alert('Modelo copiado!');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#B87F6C] hover:bg-[#A06654] text-white font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Modelo</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Barra de Navegação Inferior Móvel Fixa (Estilo App Nativo para Celular) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EBDCD5] py-2 px-2 shadow-2xl flex items-center justify-around">
          <button
            onClick={() => setActiveTab('agenda')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'agenda' ? 'text-[#B87F6C] font-bold bg-[#F5ECE8]' : 'text-stone-500 font-medium'
            }`}
          >
            <Calendar className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Agenda</span>
          </button>

          <button
            onClick={() => setActiveTab('escala')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'escala' ? 'text-[#B87F6C] font-bold bg-[#F5ECE8]' : 'text-stone-500 font-medium'
            }`}
          >
            <Clock className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Escala</span>
          </button>

          <button
            onClick={() => setActiveTab('bonus')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer relative ${
              activeTab === 'bonus' ? 'text-[#B87F6C] font-bold bg-[#F5ECE8]' : 'text-stone-500 font-medium'
            }`}
          >
            <Gift className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Bônus</span>
            {bonusApplications.filter(a => a.status === 'PENDENTE').length > 0 && (
              <span className="absolute top-1 right-2 w-3.5 h-3.5 rounded-full bg-rose-600 text-white text-[8px] flex items-center justify-center font-bold">
                {bonusApplications.filter(a => a.status === 'PENDENTE').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('servicos')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'servicos' ? 'text-[#B87F6C] font-bold bg-[#F5ECE8]' : 'text-stone-500 font-medium'
            }`}
          >
            <DollarSign className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Serviços</span>
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'portfolio' ? 'text-[#B87F6C] font-bold bg-[#F5ECE8]' : 'text-stone-500 font-medium'
            }`}
          >
            <ImageIcon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Fotos</span>
          </button>

          <button
            onClick={() => setActiveTab('configuracoes')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'configuracoes' || activeTab === 'horarios' ? 'text-[#B87F6C] font-bold bg-[#F5ECE8]' : 'text-stone-500 font-medium'
            }`}
          >
            <Sliders className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Ajustes</span>
          </button>
        </nav>

        {/* MODAL DE AMPLIAÇÃO / EXPANSÃO DE FOTO DE BÔNUS NO PAINEL ADMIN */}
        {expandedBonusAdmin && (
          <div
            onClick={() => setExpandedBonusAdmin(null)}
            className="fixed inset-0 z-[120] flex justify-center p-2 sm:p-6 bg-stone-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ maxHeight: 'min(92vh, calc(100dvh - 1rem))' }}
              className="bg-white rounded-3xl max-w-2xl w-full border border-[#EBDCD5] shadow-2xl overflow-hidden flex flex-col relative my-auto"
            >
              <button
                onClick={() => setExpandedBonusAdmin(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white transition-colors cursor-pointer shadow-md"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-4 bg-[#FAF6F4] border-b border-[#EBDCD5] flex items-center justify-between gap-3 pr-14 shrink-0">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-[#B87F6C]" />
                  <h4 className="font-serif font-bold text-stone-900 text-sm sm:text-base leading-tight">
                    {expandedBonusAdmin.title || 'Foto do Bônus'}
                  </h4>
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-stone-500 uppercase shrink-0">
                  {expandedBonusAdmin.badgeText || 'Tempo Limitado'}
                </span>
              </div>

              <div className="p-3 sm:p-6 bg-stone-900 flex items-center justify-center overflow-auto flex-1 min-h-[220px] max-h-[60dvh]">
                <img
                  src={resolveImageUrl(expandedBonusAdmin.imageUrl)}
                  alt="Ampliação"
                  className="w-auto h-auto max-w-full max-h-[55dvh] object-contain rounded-xl shadow-2xl"
                />
              </div>

              <div className="p-3.5 sm:p-4 bg-white border-t border-[#EBDCD5] flex items-center justify-between shrink-0">
                <p className="text-xs text-stone-500 truncate mr-2">
                  Visualização de alta resolução como a cliente verá ao clicar.
                </p>
                <button
                  onClick={() => setExpandedBonusAdmin(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
