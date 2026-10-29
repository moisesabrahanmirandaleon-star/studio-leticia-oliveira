import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import stylistRoutes from './routes/stylistRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import bonusRoutes from './routes/bonusRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../../frontend/dist');
const uploadsPath = path.resolve(__dirname, '../uploads');

// Garantir que a pasta de uploads exista
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir arquivos de upload estáticos (fotos de clientes, procedimentos, banners)
app.use('/uploads', express.static(uploadsPath));

// Rota de Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Studio de Beleza API',
    timestamp: new Date().toISOString()
  });
});

// Registro de rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/stylists', stylistRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/bonus', bonusRoutes);
app.use('/api/notifications', notificationRoutes);

// Servir frontend compilado em produção caso a pasta dist exista
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

// Tratamento de rotas de API inexistentes (404)
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Endpoint da API não encontrado.' });
});

// Tratamento de rotas gerais inexistentes (404 caso não haja dist)
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado.' });
});

// Middleware global de erro
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Ocorreu um erro interno no servidor.',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;
