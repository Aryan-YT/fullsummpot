import api from '../lib/api';
import type { Community, Link, User, Points, Notification } from '../types';

// ── Auth ────────────────────────────────────────────────────────────────
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post<{ user: User; token: string }>('/auth/login', data),

  register: (data: { username: string; email: string; password: string; niche: string }) =>
    api.post<{ user: User; token: string }>('/auth/register', data),

  me: () => api.get<User>('/auth/me'),
};

// ── Communities ─────────────────────────────────────────────────────────
export const communitiesApi = {
  list: () => api.get<Community[]>('/communities'),
  get: (id: string) => api.get<Community>(`/communities/${id}`),
  create: (data: { name: string; description: string; niche: string }) =>
    api.post<Community>('/communities', data),
  join: (id: string) => api.post(`/communities/${id}/join`),
  leave: (id: string) => api.post(`/communities/${id}/leave`),
};

// ── Links ───────────────────────────────────────────────────────────────
export const linksApi = {
  list: (communityId: string) =>
    api.get<Link[]>(`/communities/${communityId}/links`),
  submit: (communityId: string, data: { youtubeUrl: string; title: string }) =>
    api.post<Link>(`/communities/${communityId}/links`, data),
  click: (linkId: string) => api.post(`/links/${linkId}/click`),
  myLinks: () => api.get<Link[]>('/links/mine'),
};

// ── Points ──────────────────────────────────────────────────────────────
export const pointsApi = {
  myPoints: () => api.get<Points>('/points/me'),
};

// ── Notifications ────────────────────────────────────────────────────────
export const notificationsApi = {
  list: () => api.get<Notification[]>('/notifications'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};
