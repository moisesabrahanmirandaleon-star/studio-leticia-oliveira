import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { AboutSection } from './components/AboutSection';
import { PortfolioSection } from './components/PortfolioSection';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { AdminPanel } from './components/Admin/AdminPanel';
import { InstallPwaModal } from './components/InstallPwaModal';
import { api } from './services/api';
import { MessageCircle, Calendar, Download } from 'lucide-react';

export default function App() {
  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modais de Clientes
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState(null);

  // Instalação PWA
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // Roteamento de visualização: 'client' | 'admin'
  const isAdminPath = (path, hash) => {
    const p = (path || '').toLowerCase();
    const h = (hash || '').toLowerCase();
    return (
      p === '/admin' ||
      p === '/admin/' ||
      p.startsWith('/admin') ||
      p === '/gestao' ||
      p === '/gestao/' ||
      p.startsWith('/gestao') ||
      p === '/login' ||
      h === '#admin' ||
      h === '#gestao' ||
      h === '#painel'
    );
  };

  const [currentView, setCurrentView] = useState(() => {
    return isAdminPath(window.location.pathname, window.location.hash) ? 'admin' : 'client';
  });

  const loadData = async () => {
    try {
      const [servicesData, stylistsData, portfolioData] = await Promise.all([
        api.getServices(),
        api.getStylists(),
        api.getPortfolio()
      ]);
      setServices(servicesData);
      setStylists(stylistsData);
      setPortfolioItems(portfolioData);
    } catch (err) {
      console.error('Erro ao carregar dados do estúdio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Sincronizar rota da página
    const syncRoute = () => {
      const isRouteAdmin = isAdminPath(window.location.pathname, window.location.hash);
      setCurrentView(isRouteAdmin ? 'admin' : 'client');
      document.title = isRouteAdmin
        ? 'Studio Letícia Oliveira | Painel da Dona'
        : 'Letícia Oliveira | Studio de Beleza & Sobrancelhas';
    };

    syncRoute();
    window.addEventListener('hashchange', syncRoute);
    window.addEventListener('popstate', syncRoute);

    // Eventos de PWA para instalação no Android e dispositivos móveis
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      setInstallModalOpen(false);
      console.log('App instalado com sucesso no dispositivo!');
    };

    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) {
      setIsInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Se o usuário acessar com atalho de agendar (?action=agendar)
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'agendar') {
      setBookingModalOpen(true);
    }

    return () => {
      window.removeEventListener('hashchange', syncRoute);
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const navigateTo = (view) => {
    setCurrentView(view);
    if (view === 'admin') {
      window.history.pushState(null, '', '/admin');
      document.title = 'Studio Letícia Oliveira | Painel da Dona';
    } else {
      window.history.pushState(null, '', '/');
      document.title = 'Letícia Oliveira | Studio de Beleza & Sobrancelhas';
    }
  };

  const handleOpenBooking = (service = null) => {
    setSelectedServiceForBooking(service);
    setBookingModalOpen(true);
  };

  return (
    <AuthProvider>
      {currentView === 'admin' ? (
        /* PAINEL TOTALMENTE SEPARADO (SEM POPUP) PARA A DONA NO CELULAR E COMPUTADOR */
        <AdminPanel
          isOpen={true}
          onClose={() => navigateTo('client')}
          onRefreshServices={loadData}
        />
      ) : (
        /* SITE PÚBLICO DAS CLIENTES TOTALMENTE OTIMIZADO PARA MOBILE */
        <div className="min-h-screen flex flex-col bg-[#FAF6F4] text-stone-800 selection:bg-[#CCA08F] selection:text-white">
          
          {/* Barra de Navegação com botão para instalar app e acesso da dona */}
          <Navbar
            onOpenBooking={() => handleOpenBooking(null)}
            onOpenAdmin={() => navigateTo('admin')}
            onOpenInstall={!isInstalled ? () => setInstallModalOpen(true) : null}
          />

          {/* Conteúdo Principal */}
          <main className="flex-1">
            <Hero onOpenBooking={() => handleOpenBooking(null)} />

            <ServicesSection
              services={services}
              onSelectService={(service) => handleOpenBooking(service)}
            />

            <AboutSection onOpenBooking={() => handleOpenBooking(null)} />

            <PortfolioSection
              portfolioItems={portfolioItems}
              services={services}
              onSelectService={(service) => handleOpenBooking(service)}
            />
          </main>

          {/* Rodapé com link discreto para a Área da Dona */}
          <Footer onOpenAdmin={() => navigateTo('admin')} />

          {/* Modal de Agendamento Passo a Passo */}
          <BookingModal
            isOpen={bookingModalOpen}
            onClose={() => {
              setBookingModalOpen(false);
              setSelectedServiceForBooking(null);
            }}
            services={services}
            stylists={stylists}
            initialService={selectedServiceForBooking}
          />

          {/* Modal de Instalação do Aplicativo (Android / iOS) */}
          <InstallPwaModal
            isOpen={installModalOpen}
            onClose={() => setInstallModalOpen(false)}
            deferredPrompt={deferredPrompt}
            onInstalled={() => setIsInstalled(true)}
          />

          {/* Botão Flutuante de WhatsApp (Mobile & Desktop) */}
          <a
            href="https://wa.me/5551995037223?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20um%20hor%C3%A1rio%20no%20Studio%20Let%C3%ADcia%20Oliveira."
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-5 right-5 z-30 w-13 h-13 sm:w-14 sm:h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 group"
            title="Fale conosco no WhatsApp"
          >
            <MessageCircle className="w-7 h-7" />
            <span className="sr-only">WhatsApp</span>
          </a>

          {/* Botões Flutuantes Rápidos em Telas Móveis */}
          <div className="fixed bottom-5 left-5 z-30 flex items-center gap-2 sm:hidden">
            <button
              onClick={() => handleOpenBooking(null)}
              className="flex items-center gap-2 px-4 py-3 bg-[#B87F6C] text-white rounded-full font-bold text-xs shadow-xl active:scale-95 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-amber-200" />
              <span>Agendar</span>
            </button>

            {!isInstalled && (
              <button
                onClick={() => setInstallModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-3 bg-white text-[#7E4E40] border border-[#EBDCD5] rounded-full font-bold text-xs shadow-xl active:scale-95 cursor-pointer"
                title="Instalar App no celular"
              >
                <Download className="w-4 h-4 text-[#B87F6C]" />
                <span>Instalar App</span>
              </button>
            )}
          </div>

        </div>
      )}
    </AuthProvider>
  );
}
