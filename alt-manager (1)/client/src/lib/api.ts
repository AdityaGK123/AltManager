import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
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
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; name?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: any) => api.put('/user/profile', data),
  updateName: (data: { name: string }) => api.put('/user/name', data),
};

// Chat API
export const chatAPI = {
  getConversations: () => api.get('/chat/conversations'),
  createConversation: (data: { title?: string }) =>
    api.post('/chat/conversations', data),
  getMessages: (conversationId: number) =>
    api.get(`/chat/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: number, data: { content: string }) =>
    api.post(`/chat/conversations/${conversationId}/messages`, data),
  endConversation: (conversationId: number) =>
    api.post(`/chat/conversations/${conversationId}/end`),
  deleteConversation: (conversationId: number) =>
    api.delete(`/chat/conversations/${conversationId}`),
};

// Analysis/MoM API
export const analysisAPI = {
  getMoMs: (params?: { limit?: number; offset?: number }) =>
    api.get('/analysis/moms', { params }),
  getDashboard: () => api.get('/analysis/dashboard'),
  generateTrends: () => api.post('/analysis/trends'),
  generateBlindspots: () => api.post('/analysis/blindspots'),
  generateProgress: () => api.post('/analysis/progress'),
  getLatestTrends: () => api.get('/analysis/trends/latest'),
  getLatestBlindspots: () => api.get('/analysis/blindspots/latest'),
  getLatestProgress: () => api.get('/analysis/progress/latest'),
};

// Skills API
export const skillsAPI = {
  getSkills: () => api.get('/skills'),
  createSkill: (data: any) => api.post('/skills', data),
  updateSkill: (id: number, data: any) => api.put(`/skills/${id}`, data),
  deleteSkill: (id: number) => api.delete(`/skills/${id}`),
};

// Goals API
export const goalsAPI = {
  getGoals: () => api.get('/goals'),
  createGoal: (data: any) => api.post('/goals', data),
  updateGoal: (id: number, data: any) => api.put(`/goals/${id}`, data),
  deleteGoal: (id: number) => api.delete(`/goals/${id}`),
};

// Moments API
export const momentsAPI = {
  getMoments: () => api.get('/moments'),
  getProgress: () => api.get('/moments/progress'),
  getAnalytics: () => api.get('/moments/analytics'),
  startMoment: (id: number) => api.post(`/moments/${id}/start`),
  submitMoment: (id: number, data: { response: string }) =>
    api.post(`/moments/${id}/submit`, data),
};

// Achievements API
export const achievementsAPI = {
  getAchievements: () => api.get('/achievements'),
  createAchievement: (data: any) => api.post('/achievements', data),
};

// Habits API
export const habitsAPI = {
  getHabits: () => api.get('/habits'),
  createHabit: (data: any) => api.post('/habits', data),
  updateHabit: (id: number, data: any) => api.put(`/habits/${id}`, data),
  completeHabit: (id: number) => api.post(`/habits/${id}/complete`),
  deleteHabit: (id: number) => api.delete(`/habits/${id}`),
};
