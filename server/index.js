import express from 'express';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { v4 as uuid } from 'uuid';

const app = express();
app.use(cors());
app.use(express.json());

const db = new Low(new JSONFile('./db.json'), { users: [], logs: [] });
await db.read();
if (!db.data) db.data = { users: [], logs: [] };

app.post('/api/register', async (req, res) => {
  const user = req.body;
  await db.read();
  if (db.data.users.find(u => u.email === user.email)) {
    return res.status(400).json({ error: 'Email already registered' });
  }
  const newUser = { ...user, id: uuid() };
  db.data.users.push(newUser);
  await db.write();
  const { password, ...safe } = newUser;
  res.json(safe);
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  await db.read();
  const user = db.data.users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const { password: pw, ...safe } = user;
  res.json(safe);
});

app.get('/api/profile/:id', async (req, res) => {
  await db.read();
  const user = db.data.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, ...safe } = user;
  res.json(safe);
});

app.put('/api/profile/:id', async (req, res) => {
  await db.read();
  const idx = db.data.users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  db.data.users[idx] = { ...db.data.users[idx], ...req.body };
  await db.write();
  const { password, ...safe } = db.data.users[idx];
  res.json(safe);
});

app.get('/api/logs/:userId/:date', async (req, res) => {
  await db.read();
  const { userId, date } = req.params;
  const log = db.data.logs.find(l => l.userId === userId && l.date === date);
  res.json(log ? log.data : null);
});

app.post('/api/logs/:userId/:date', async (req, res) => {
  await db.read();
  const { userId, date } = req.params;
  const idx = db.data.logs.findIndex(l => l.userId === userId && l.date === date);
  const entry = { userId, date, data: req.body };
  if (idx === -1) db.data.logs.push(entry); else db.data.logs[idx] = entry;
  await db.write();
  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
