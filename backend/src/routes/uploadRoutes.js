import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const router = Router();

/**
 * Upload de imagem via Base64 (suporta fotos tiradas na hora pelo celular,
 * Google Fotos, galeria do dispositivo ou upload de arquivos).
 */
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { image, filename } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Nenhuma imagem foi enviada.' });
    }

    // Se já for uma URL externa pública válida (http / https), retorna ela mesma
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return res.json({ url: image });
    }

    // Extrair mime type e dados base64
    const matches = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      // Se não tem prefixo data:, mas é base64 puro
      return res.status(400).json({ error: 'Formato de imagem inválido. Envie um arquivo de imagem válido.' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Limite de segurança: 15MB
    if (buffer.length > 15 * 1024 * 1024) {
      return res.status(400).json({ error: 'A imagem não pode exceder 15MB.' });
    }

    let extension = 'jpg';
    if (mimeType.includes('png')) extension = 'png';
    else if (mimeType.includes('webp')) extension = 'webp';
    else if (mimeType.includes('jpeg')) extension = 'jpg';

    const safeName = (filename || 'foto')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30);

    const uniqueFilename = `${safeName}-${Date.now()}.${extension}`;
    const filePath = path.resolve(uploadsDir, uniqueFilename);

    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${uniqueFilename}`;
    return res.status(201).json({
      url: fileUrl,
      size: buffer.length,
      mimeType,
      message: 'Foto carregada com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao salvar upload de imagem:', error);
    return res.status(500).json({ error: 'Erro ao processar e salvar a imagem.' });
  }
});

export default router;
