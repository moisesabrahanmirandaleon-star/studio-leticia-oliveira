import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Link as LinkIcon, Check, Loader2, X, Sparkles, Smartphone } from 'lucide-react';
import { compressImageFile } from '../services/imageUtils';
import { api } from '../services/api';

export function ImageUploader({
  value,
  onChange,
  token,
  label = 'Foto ou Imagem',
  placeholder = 'https://images.unsplash.com/... ou escolha do celular',
  recommendedSize = 'Recomendado: Formato quadrado ou retrato (até 1200px)'
}) {
  const [mode, setMode] = useState('device'); // 'device' | 'url'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setLoading(true);
    setSuccess(false);

    try {
      // 1. Comprimir imagem no navegador para ultra velocidade
      const compressed = await compressImageFile(file, 1200, 1200, 0.85);

      // 2. Fazer upload para o servidor
      if (token) {
        try {
          const res = await api.uploadImage(compressed.dataUrl, file.name, token);
          if (res.url) {
            onChange(res.url);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            return;
          }
        } catch (uploadErr) {
          console.warn('Upload via backend falhou, usando dataUrl local otimizado:', uploadErr);
        }
      }

      // Fallback: usar o dataUrl comprimido diretamente
      onChange(compressed.dataUrl);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao processar foto:', err);
      setError(err.message || 'Erro ao carregar a imagem.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider">
          {label}
        </label>
        
        {/* Alternador de Modo */}
        <div className="flex items-center gap-1 bg-[#F5ECE8] p-0.5 rounded-lg border border-[#DDBFB2]">
          <button
            type="button"
            onClick={() => setMode('device')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              mode === 'device'
                ? 'bg-white text-[#B87F6C] shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>Celular / Google Fotos</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              mode === 'url'
                ? 'bg-white text-[#B87F6C] shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>Link URL</span>
          </button>
        </div>
      </div>

      {mode === 'device' ? (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            disabled={loading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-[#DDBFB2] hover:border-[#B87F6C] bg-white hover:bg-[#FAF6F4] transition-all cursor-pointer group text-center"
          >
            {loading ? (
              <div className="flex flex-col items-center gap-2 py-2 text-[#B87F6C]">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs font-bold">Otimizando e enviando foto...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 py-1">
                <div className="w-10 h-10 rounded-full bg-[#FAF6F4] group-hover:bg-[#EBDCD5] text-[#B87F6C] flex items-center justify-center transition-colors">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-stone-800">
                  Toque para escolher do celular ou Google Fotos
                </div>
                <div className="text-[11px] text-stone-500">
                  Galeria do aparelho • Câmera • Google Fotos
                </div>
              </div>
            )}
          </button>
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 rounded-xl border border-[#DDBFB2] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#B87F6C]/20"
          />
        </div>
      )}

      {error && (
        <p className="text-[11px] text-rose-600 font-medium">⚠️ {error}</p>
      )}

      {success && (
        <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
          <Check className="w-3.5 h-3.5" /> Foto carregada com sucesso!
        </p>
      )}

      {/* Miniatura de Pré-visualização com opção de excluir */}
      {value && (
        <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-[#EBDCD5] shadow-2xs">
          <div className="w-14 h-14 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 shrink-0">
            <img
              src={value}
              alt="Pré-visualização"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-bold text-stone-800 block truncate">
              Foto Selecionada
            </span>
            <span className="text-[10px] text-stone-500 block truncate">
              {value.startsWith('data:') ? 'Imagem carregada do dispositivo' : value}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Remover foto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <p className="text-[10px] text-stone-400 italic">
        {recommendedSize}
      </p>
    </div>
  );
}
