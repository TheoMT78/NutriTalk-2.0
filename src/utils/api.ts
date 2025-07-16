import { User, DailyLog } from '../types';

// The API base URL can be configured at build time. Vite exposes variables
// prefixed with `VITE_` through `import.meta.env`, while a Node environment can
// use `process.env`.
const API =
  (typeof import.meta !== 'undefined'
    ? (import.meta.env as unknown as Record<string, string | undefined>)
        .VITE_API_BASE_URL
    : undefined) ||
  process.env.VITE_API_BASE_URL ||
  'http://localhost:3001/api';

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
