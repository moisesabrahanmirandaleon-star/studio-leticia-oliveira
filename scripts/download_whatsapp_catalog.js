/**
 * Script Automático para WhatsApp Web:
 * Extrai e baixa todas as fotos do catálogo em Alta Resolução Original
 * 
 * COMO USAR:
 * 1. Abra o WhatsApp Web no Chrome (web.whatsapp.com)
 * 2. Abra o perfil/catálogo da Letícia
 * 3. Pressione F12 (ou Ctrl + Shift + J) para abrir o Console do Desenvolvedor
 * 4. Cole todo este código e pressione ENTER
 */

(async function extrairFotosCatalogoWhatsApp() {
  console.log('🚀 Iniciando extração de fotos em alta qualidade do WhatsApp...');

  // Busca todas as imagens com resolução real presentes no catálogo aberto
  const imgElements = Array.from(document.querySelectorAll('img')).filter((img) => {
    const src = img.src || '';
    const isWhatsAppMedia = src.includes('blob:') || src.includes('whatsapp.net') || src.includes('fbcdn.net');
    return isWhatsAppMedia && (img.naturalWidth >= 200 || img.width >= 200);
  });

  if (imgElements.length === 0) {
    alert('⚠️ Nenhuma foto do catálogo foi encontrada aberta na tela!\n\nPor favor, abra a conversa da Letícia e clique no catálogo dela primeiro, depois execute este script novamente.');
    return;
  }

  console.log(`📸 Encontradas ${imgElements.length} fotos de procedimentos.`);

  let baixadas = 0;
  for (let i = 0; i < imgElements.length; i++) {
    try {
      const img = imgElements[i];
      const response = await fetch(img.src);
      const blob = await response.blob();
      
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `leticia-procedimento-${i + 1}-alta-qualidade.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
      baixadas++;
      
      // Pequena pausa para o navegador não bloquear múltiplos downloads
      await new Promise((r) => setTimeout(r, 600));
    } catch (err) {
      console.warn(`Erro ao baixar imagem ${i + 1}:`, err);
    }
  }

  alert(`✅ Sucesso! ${baixadas} fotos em alta resolução foram baixadas para a sua pasta Downloads!\n\nAgora basta movê-las para a pasta do projeto (frontend/public/catalogo/).`);
})();
