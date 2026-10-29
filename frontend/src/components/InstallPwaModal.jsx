import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, CheckCircle, Share, PlusSquare } from 'lucide-react';

export function InstallPwaModal({ isOpen, onClose, deferredPrompt, onInstalled }) {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        if (onInstalled) onInstalled();
        onClose();
      }
    } catch (err) {
      console.error('Erro ao acionar instalação do PWA:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#EBDCD5] overflow-hidden flex flex-col p-6 animate-slideUp">
        
        {/* Header com Ícone Oficial do App */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#FEF1E8] border border-[#EBDCD5] shadow-md shrink-0 p-1">
              <img src="/icons/icon-192.png" alt="App Studio Letícia Oliveira" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-lg leading-tight">
                Instalar Aplicativo
              </h3>
              <span className="text-xs text-[#B87F6C] font-semibold">
                Studio de Sobrancelhas • Letícia Oliveira
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 my-2">
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Tenha o Studio Letícia Oliveira direto na tela do seu celular! Agende horários com facilidade, receba avisos e consulte seus agendamentos sem abrir o navegador.
          </p>

          <div className="bg-[#FAF6F4] p-3.5 rounded-2xl border border-[#EBDCD5] space-y-2 text-xs text-stone-700">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Acesso rápido em 1 toque na sua tela inicial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Funciona super leve, sem ocupar espaço da memória</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Visualização completa do catálogo e agenda oficial</span>
            </div>
          </div>

          {/* Instruções para Android */}
          {!isIOS ? (
            <div className="space-y-3 pt-2">
              <button
                onClick={handleInstallClick}
                disabled={!deferredPrompt}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#B87F6C] hover:bg-[#A06654] text-white font-bold text-sm shadow-md shadow-[#B87F6C]/30 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-amber-200" />
                <span>Instalar Agora no Android</span>
              </button>

              {!deferredPrompt && (
                <p className="text-[11px] text-stone-500 text-center">
                  💡 No Chrome do celular, você também pode tocar nos <strong>três pontinhos (⋮)</strong> no canto superior e escolher <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                </p>
              )}
            </div>
          ) : (
            /* Instruções para iPhone / iOS */
            <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-2.5 text-xs text-stone-700">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#B87F6C]" />
                <span>Como instalar no iPhone (Safari):</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-white text-stone-700 font-bold flex items-center justify-center text-[10px] shrink-0 border border-stone-200 shadow-sm">
                  1
                </span>
                <span>Toque no botão <strong>Compartilhar</strong> <Share className="w-3.5 h-3.5 inline mx-1 text-sky-600" /> na barra inferior do Safari.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-white text-stone-700 font-bold flex items-center justify-center text-[10px] shrink-0 border border-stone-200 shadow-sm">
                  2
                </span>
                <span>Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-stone-600" />.</span>
              </div>
            </div>
          )}
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs text-stone-500 hover:text-stone-800 font-semibold"
          >
            Depois
          </button>
        </div>

      </div>
    </div>
  );
}
