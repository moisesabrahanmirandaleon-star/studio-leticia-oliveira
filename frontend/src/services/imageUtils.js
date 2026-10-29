/**
 * Utilitário para compactar e converter fotos do celular, câmera ou Google Fotos
 * antes de enviar para o servidor, garantindo velocidade máxima e economia de espaço.
 */
export async function compressImageFile(file, maxWidth = 1000, maxHeight = 1000, quality = 0.80) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('Nenhum arquivo de imagem foi selecionado.'));
    }

    // Se não for imagem válida
    if (!file.type.startsWith('image/')) {
      return reject(new Error('O arquivo selecionado não é uma imagem válida.'));
    }

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calcular proporção reduzida
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Exportar como JPEG de alta qualidade otimizada
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({
          dataUrl,
          originalName: file.name,
          width,
          height,
          sizeEstimate: Math.round((dataUrl.length * 3) / 4)
        });
      };

      img.onerror = () => {
        reject(new Error('Falha ao processar a imagem. Tente outro arquivo.'));
      };

      img.src = readerEvent.target.result;
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo no dispositivo.'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Resolve qualquer URL de imagem, seja ela Base64 (data:), externa (https://)
 * ou caminho relativo do backend (/uploads/...), prevenindo erros 404 entre Vercel e Render.
 */
export function resolveImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return trimmed;
  }

  // Se for caminho relativo (ex: /uploads/...)
  const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
  const backendOrigin = apiBase.replace(/\/api\/?$/, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${backendOrigin}${cleanPath}`;
}

/**
 * Presets de imagens temáticas para campanhas de bônus do Studio
 */
export const BONUS_PRESETS = [
  {
    id: 'indicacao',
    title: 'Indicação de Amiga',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
    description: 'Ideal para bônus de indicação e parcerias'
  },
  {
    id: 'sobrancelhas',
    title: 'Design & Sobrancelhas',
    url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
    description: 'Foco no olhar, visagismo e sobrancelhas perfeitas'
  },
  {
    id: 'henna',
    title: 'Henna & Definição',
    url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80',
    description: 'Preenchimento e realce marcante com henna'
  },
  {
    id: 'lamination',
    title: 'Brow Lamination & Lash',
    url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&auto=format&fit=crop&q=80',
    description: 'Fios alinhados, laminados e efeito de salão'
  },
  {
    id: 'brinde',
    title: 'Brinde & Cortesia VIP',
    url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80',
    description: 'Presentes exclusivos (ex: buço grátis, hidratação)'
  }
];
