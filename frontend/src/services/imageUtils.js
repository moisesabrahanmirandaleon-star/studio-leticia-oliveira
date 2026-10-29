/**
 * Utilitário para compactar e converter fotos do celular, câmera ou Google Fotos
 * antes de enviar para o servidor, garantindo velocidade máxima e economia de espaço.
 */
export async function compressImageFile(file, maxWidth = 1200, maxHeight = 1200, quality = 0.82) {
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
