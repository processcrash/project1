import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
};

export const projects = {
  list: () => api.get('/projects'),
  get: (id: string) => api.get(`/projects/${id}`),
  create: (data: { name: string; description?: string; repoUrl?: string; language?: string }) =>
    api.post('/projects', data),
  update: (id: string, data: Partial<{ name: string; description: string; repoUrl: string; language: string }>) =>
    api.patch(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  regenerateKey: (id: string) => api.post(`/projects/${id}/regenerate-key`),
};

export const reviews = {
  create: (data: { projectId: string; code?: string; diff?: string; language?: string }) =>
    api.post('/reviews', data),
  get: (id: string) => api.get(`/reviews/${id}`),
  getByProject: (projectId: string) => api.get(`/reviews/project/${projectId}`),
  getRecent: (limit?: number) => api.get('/reviews/recent', { params: { limit } }),
};

export default api;