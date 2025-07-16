import { User, DailyLog } from '../types';

// Allow overriding the API URL via environment variable for easier deployment
const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function login(email: string, password: string) {
  const res = await fetch(`${API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error('Invalid credentials');
  return res.json();
}

export async function register(user: User) {
  const res = await fetch(`${API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });
  if (!res.ok) throw new Error('Registration failed');
  return res.json();
}

export async function getDailyLog(userId: string, date: string) {
  const res = await fetch(`${API}/logs/${userId}/${date}`);
  if (!res.ok) throw new Error('Failed to load log');
  return res.json();
}

export async function saveDailyLog(userId: string, date: string, log: DailyLog) {
  const res = await fetch(`${API}/logs/${userId}/${date}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log)
  });
  if (!res.ok) throw new Error('Failed to save log');
  return res.json();
}

export async function updateProfile(userId: string, data: Partial<User>) {
  const res = await fetch(`${API}/profile/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}

export async function getProfile(userId: string) {
  const res = await fetch(`${API}/profile/${userId}`);
  if (!res.ok) throw new Error('Failed to load profile');
  return res.json();
}

export async function getWeightHistory(userId: string) {
  const res = await fetch(`${API}/weights/${userId}`);
  if (!res.ok) throw new Error('Failed to load weights');
  return res.json();
}

export async function saveWeightHistory(userId: string, history: { date: string; weight: number }[]) {
  const res = await fetch(`${API}/weights/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(history)
  });
  if (!res.ok) throw new Error('Failed to save weights');
  return res.json();
}

export async function syncAll(userId: string) {
  const res = await fetch(`${API}/sync/${userId}`);
  if (!res.ok) throw new Error('Failed to sync');
  return res.json();
}
