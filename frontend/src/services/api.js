const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Erro na requisição com o servidor.');
  }

  return data;
}

export const api = {
  // Serviços
  getServices: (includeInactive = false) =>
    request(`/services${includeInactive ? '?includeInactive=true' : ''}`),
  createService: (data, token) =>
    request('/services', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` }
    }),
  updateService: (id, data, token) =>
    request(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` }
    }),
  deleteService: (id, token) =>
    request(`/services/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }),

  // Estilistas e Configurações do Studio
  getStylists: () => request('/stylists'),
  getStylistById: (id) => request(`/stylists/${id}`),
  updateStylistProfile: (id, data, token) =>
    request(`/stylists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` }
    }),

  // Portfólio / Galeria
  getPortfolio: (category) =>
    request(`/stylists/portfolio${category ? `?category=${encodeURIComponent(category)}` : ''}`),
  createPortfolioItem: (data, token) =>
    request('/stylists/portfolio', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` }
    }),
  updatePortfolioItem: (id, data, token) =>
    request(`/stylists/portfolio/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` }
    }),
  deletePortfolioItem: (id, token) =>
    request(`/stylists/portfolio/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }),

  // Disponibilidade e Escala Mensal
  checkAvailability: (stylistId, serviceId, date) =>
    request(`/schedules/availability?stylistId=${stylistId}&serviceId=${serviceId}&date=${date}`),
  getMonthSchedule: (stylistId, year, month) =>
    request(`/schedules/month?stylistId=${stylistId}&year=${year}&month=${month}`),
  updateDateSchedule: (data, token) =>
    request('/schedules/date', {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` }
    }),
  batchUpdateSchedule: (data, token) =>
    request('/schedules/batch', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` }
    }),
  resetMonthSchedule: (stylistId, year, month, token) =>
    request(`/schedules/month?stylistId=${stylistId}&year=${year}&month=${month}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }),

  // Horários Padrão Semanais
  getStylistSchedule: (stylistId) =>
    request(`/schedules/stylist/${stylistId}`),
  updateStylistSchedule: (stylistId, schedules, token) =>
    request(`/schedules/stylist/${stylistId}`, {
      method: 'PUT',
      body: JSON.stringify({ schedules }),
      headers: { Authorization: `Bearer ${token}` }
    }),

  // Agendamentos
  createAppointment: (data) =>
    request('/appointments', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getAppointments: (filters = {}, token) => {
    const params = new URLSearchParams(filters).toString();
    return request(`/appointments${params ? `?${params}` : ''}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  updateAppointmentStatus: (id, status, token) =>
    request(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
      headers: { Authorization: `Bearer ${token}` }
    }),
  rescheduleAppointment: (id, date, startTime, token) =>
    request(`/appointments/${id}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify({ date, startTime }),
      headers: { Authorization: `Bearer ${token}` }
    }),
  deleteAppointment: (id, token) =>
    request(`/appointments/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }),

  // Autenticação
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  getMe: (token) =>
    request('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
};
