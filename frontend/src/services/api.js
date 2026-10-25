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

  // Estilistas e Portfólio
  getStylists: () => request('/stylists'),
  getStylistById: (id) => request(`/stylists/${id}`),
  getPortfolio: (category) =>
    request(`/stylists/portfolio${category ? `?category=${encodeURIComponent(category)}` : ''}`),
  createPortfolioItem: (data, token) =>
    request('/stylists/portfolio', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` }
    }),
  deletePortfolioItem: (id, token) =>
    request(`/stylists/portfolio/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }),

  // Disponibilidade e Agendamento
  checkAvailability: (stylistId, serviceId, date) =>
    request(`/schedules/availability?stylistId=${stylistId}&serviceId=${serviceId}&date=${date}`),
  createAppointment: (data) =>
    request('/appointments', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Admin Horários
  getStylistSchedule: (stylistId) =>
    request(`/schedules/stylist/${stylistId}`),
  updateStylistSchedule: (stylistId, schedules, token) =>
    request(`/schedules/stylist/${stylistId}`, {
      method: 'PUT',
      body: JSON.stringify({ schedules }),
      headers: { Authorization: `Bearer ${token}` }
    }),

  // Admin Agendamentos
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
