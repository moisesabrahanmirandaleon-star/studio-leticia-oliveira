import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { CalendarSyncService } from '../src/services/calendarSyncService.js';

async function test() {
  const service = new CalendarSyncService();
  console.log('📌 Probando Google Calendar ID:', service.calendarId);
  try {
    const res = await service.jwtClient.request({
      url: 'https://www.googleapis.com/calendar/v3/calendars/' + encodeURIComponent(service.calendarId),
      method: 'GET'
    });
    console.log('✅ ¡CONEXIÓN EXITOSA CON GOOGLE CALENDAR!');
    console.log('📅 Calendario:', res.data.summary);
    console.log('🌍 Zona horaria:', res.data.timeZone);
  } catch (err) {
    console.error('❌ Error al acceder al calendario:', err.response?.data?.error?.message || err.message);
  }
}

test();
