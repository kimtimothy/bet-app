import axios from 'axios';

/**
 * Configure the base URL of your API here.  When running the backend
 * locally, use the LAN IP of your machine so your mobile device can
 * reach it.  Remember to update this in production.
 */
const BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: BASE_URL,
});

/**
 * Set the JWT token on the default axios instance.  This should be
 * called after login and removed on logout.
 */
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

// Note: Registration and login are handled by Supabase on the client.
// This file exposes only bet‑related API calls.

export async function fetchBets() {
  return api.get('/bets');
}

export async function createBet(description: string, wager: number, opponentId: string) {
  // Opponent ID should be a Supabase UUID string
  return api.post('/bets', { description, wager, opponent_id: opponentId });
}

export async function resolveBet(betId: number, winnerId: string, result: string) {
  return api.put(`/bets/${betId}/resolve`, null, {
    params: { winner_id: winnerId, result },
  });
}

// Profile and friendship APIs

export interface User {
  id: string;
  username?: string | null;
  email?: string | null;
}

export async function updateProfile(data: { username?: string; email?: string }) {
  return api.put<User>('/users/me', data);
}

export async function searchUsers(query: string) {
  return api.get<User[]>('/users/search', { params: { query } });
}

export async function addFriend(friendId: string) {
  return api.post(`/friends/${friendId}`);
}

export async function getFriends() {
  return api.get<User[]>('/friends');
}

export default api;