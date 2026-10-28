import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function AdminLoginView({ onBackToClient, onSuccessLogin }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      if (onSuccessLogin) {
        onSuccessLogin();
      }
    } catch (err) {
      console.error('Erro de autenticação:', err);
      setError(err.message || 'E-mail ou senha inválidos. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF6F4] flex flex-col justify-between p-4 sm:p-6 selection:bg-[#CCA08F] selection:text-white">
      {/* Top Bar com Botão de Voltar ao Site */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between py-2">
        <button
          onClick={onBackToClient}
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white/80 hover:bg-white px-3.5 py-2 rounded-xl border border-[#EBDCD5] shadow-sm transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-[#B87F6C]" />
          <span>Voltar ao Site de Clientes</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#7E4E40] bg-[#F5ECE8] px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-[#B87F6C]" />
          <span>Acesso Restrito</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-white rounded-3xl shadow-xl border border-[#EBDCD5] p-6 sm:p-8 relative overflow-hidden">
          
          {/* Decoração sutil de fundo */}
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#FAF6F4] border border-[#EBDCD5]/60 pointer-events-none" />

          {/* Logo & Título */}
          <div className="text-center mb-6 relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#B87F6C] to-[#CCA08F] flex items-center justify-center text-white mx-auto mb-3 shadow-md">
              <Sparkles className="w-8 h-8 text-amber-100" />
            </div>
            
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              Studio Letícia Oliveira
            </h1>
            <p className="text-xs uppercase tracking-widest text-[#B87F6C] font-bold mt-1">
              Portal de Gestão & Administração
            </p>
            <p className="text-xs text-stone-500 mt-2 max-w-xs mx-auto">
              Acesso exclusivo para gerenciar agenda, escala mensal de trabalho, preços e configurações do Studio.
            </p>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulário de Login */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                E-mail da Dona
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu-email@dominio.com"
                autoComplete="email"
                inputMode="email"
                className="w-full px-4 py-3 rounded-2xl border border-[#DDBFB2] text-sm text-stone-800 placeholder-stone-400 bg-[#FAF6F4]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B87F6C]/30 focus:border-[#B87F6C] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 rounded-2xl border border-[#DDBFB2] text-sm text-stone-800 placeholder-stone-400 bg-[#FAF6F4]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B87F6C]/30 focus:border-[#B87F6C] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                  title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-[#B87F6C] hover:bg-[#A06654] active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-[#B87F6C]/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Entrando no Painel...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-200" />
                  <span>Entrar no Painel</span>
                </>
              )}
            </button>
          </form>

          {/* Dica de Segurança e Rodapé */}
          <div className="mt-6 pt-4 border-t border-stone-100 text-center">
            <span className="text-[11px] text-stone-400 font-medium">
              Conexão protegida & criptografada • Studio Letícia Oliveira
            </span>
          </div>

        </div>
      </main>

      {/* Footer simples */}
      <footer className="max-w-md w-full mx-auto text-center py-2 text-xs text-stone-400">
        &copy; {new Date().getFullYear()} Studio Letícia Oliveira. Todos os direitos reservados.
      </footer>
    </div>
  );
}
