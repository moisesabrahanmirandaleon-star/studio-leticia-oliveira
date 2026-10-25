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
import { api } from './services/api';
import { MessageCircle, Calendar } from 'lucide-react';

export default function App() {
  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modais
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState(null);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

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

    // Acesso privado ao painel da dona via URL /admin ou #admin
    const checkAdminRoute = () => {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      
      if (
        pathname === '/admin' ||
        pathname === '/admin/' ||
        pathname.startsWith('/admin') ||
        pathname === '/gestao' ||
        pathname === '/gestao/' ||
        hash === '#admin' ||
        hash === '#gestao' ||
        hash === '#painel'
      ) {
        setAdminModalOpen(true);
      }
    };

    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    window.addEventListener('popstate', checkAdminRoute);

    return () => {
      window.removeEventListener('hashchange', checkAdminRoute);
      window.removeEventListener('popstate', checkAdminRoute);
    };
  }, []);

  const handleCloseAdmin = () => {
    setAdminModalOpen(false);
    // Limpar a rota na barra de endereços para não ficar preso no /admin
    if (
      window.location.pathname.toLowerCase().startsWith('/admin') ||
      window.location.pathname.toLowerCase().startsWith('/gestao') ||
      window.location.hash
    ) {
      window.history.replaceState(null, '', '/');
    }
  };

  const handleOpenBooking = (service = null) => {
    setSelectedServiceForBooking(service);
    setBookingModalOpen(true);
  };

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-[#FAF6F4] text-stone-800 selection:bg-[#CCA08F] selection:text-white">
        
        {/* Barra de Navegação */}
        <Navbar
          onOpenBooking={() => handleOpenBooking(null)}
          onOpenAdmin={() => setAdminModalOpen(true)}
        />

        {/* Conteúdo Principal */}
        <main className="flex-1">
          <Hero onOpenBooking={() => handleOpenBooking(null)} />

          <ServicesSection
            services={services}
            onSelectService={(service) => handleOpenBooking(service)}
          />

          <AboutSection />

          <PortfolioSection
            portfolioItems={portfolioItems}
            services={services}
            onSelectService={(service) => handleOpenBooking(service)}
          />
        </main>

        {/* Rodapé sem links visíveis para a área administrativa */}
        <Footer />

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

        {/* Painel Administrativo Responsive da Dona (acesso via /admin) */}
        <AdminPanel
          isOpen={adminModalOpen}
          onClose={handleCloseAdmin}
          onRefreshServices={loadData}
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

        {/* Botão Flutuante Rápido de Agendamento em Telas Móveis */}
        <div className="fixed bottom-5 left-5 z-30 sm:hidden">
          <button
            onClick={() => handleOpenBooking(null)}
            className="flex items-center gap-2 px-4 py-3 bg-[#B87F6C] text-white rounded-full font-bold text-xs shadow-xl active:scale-95"
          >
            <Calendar className="w-4 h-4 text-amber-200" />
            <span>Agendar</span>
          </button>
        </div>

      </div>
    </AuthProvider>
  );
}
