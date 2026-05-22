import axios from 'axios';

// ─── Axios Instance ───────────────────────────────────────────────────────────
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('crm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — redirect to login
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const loginUser    = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);
export const getMe        = ()     => API.get('/auth/me');

// ─── Leads ───────────────────────────────────────────────────────────────────
export const getLeads    = (params) => API.get('/leads', { params });
export const getLeadById = (id)     => API.get(`/leads/${id}`);
export const createLead  = (data)   => API.post('/leads', data);
export const updateLead  = (id, data) => API.put(`/leads/${id}`, data);
export const deleteLead  = (id)     => API.delete(`/leads/${id}`);

// ─── Notes ───────────────────────────────────────────────────────────────────
export const addNote    = (id, data)           => API.post(`/leads/${id}/notes`, data);
export const editNote   = (id, noteId, data)   => API.put(`/leads/${id}/notes/${noteId}`, data);
export const deleteNote = (id, noteId)         => API.delete(`/leads/${id}/notes/${noteId}`);

// ─── Score ────────────────────────────────────────────────────────────────────
export const updateScore = (id) => API.put(`/leads/${id}/score`);

// ─── Follow-up helpers ────────────────────────────────────────────────────────
export const getOverdueLeads   = () => API.get('/leads/overdue');
export const getTodayFollowUps = () => API.get('/leads/today');
export const getActivityHistory = (id) => API.get(`/leads/${id}/activity`);

// ─── Email ───────────────────────────────────────────────────────────────────
export const sendEmail = (id, data) => API.post(`/leads/${id}/email`, data);

// ─── Analytics ───────────────────────────────────────────────────────────────
export const getAnalytics = () => API.get('/leads/analytics');

// ─── Export ──────────────────────────────────────────────────────────────────
export const exportLeads = () =>
  API.get('/leads/export', { responseType: 'blob' });

export default API;
