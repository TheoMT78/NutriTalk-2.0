const express = require('express');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const USERS_FILE = __dirname + '/users.json';
const JWT_SECRET = 'change_this_secret';

const app = express();
app.use(cors());
app.use(express.json());

function loadUsers() {
  if (fs.existsSync(USERS_FILE)) {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  }
  return [];
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

app.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;
  const users = loadUsers();
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = { id: Date.now(), email, password: hashed, name };
  users.push(user);
  saveUsers(users);
  res.json({ token: jwt.sign({ id: user.id }, JWT_SECRET) });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  res.json({ token: jwt.sign({ id: user.id }, JWT_SECRET) });
});

app.get('/profile', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const users = loadUsers();
    const user = users.find(u => u.id === payload.id);
    if (!user) return res.status(401).json({ message: 'Invalid token' });
    res.json({ email: user.email, name: user.name });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log('Auth server running on ' + PORT));
