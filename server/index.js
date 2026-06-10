import express from 'express';
import jwt from 'jsonwebtoken';
import { getDb, queryAll, queryOne, run } from './db.js';

const app = express();
const PORT = 3001;
const JWT_SECRET = 'calendario-estrategico-secret-key-2026';

app.use(express.json());

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  try {
    const token = header.slice(7);
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

app.post('/api/auth/login', async (req, res) => {
  await getDb();
  const { usuario, password } = req.body;
  if (!usuario || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
  }

  const user = queryOne('SELECT * FROM users WHERE usuario = ?', [usuario.toLowerCase()]);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }

  const isAdmin = user.usuario === 'admin' || user.usuario === 'direccion';
  const authUser = { usuario: user.usuario, equipo: user.equipo, role: isAdmin ? 'admin' : 'team', isAdmin };
  const token = jwt.sign(authUser, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: authUser });
});

app.get('/api/tasks', authenticate, async (req, res) => {
  await getDb();
  const rows = queryAll('SELECT * FROM tasks ORDER BY created_at ASC');
  const tasks = {};
  for (const row of rows) {
    const task = { id: row.id, text: row.text, completed: Boolean(row.completed), assignedTo: row.assigned_to };
    if (!tasks[row.date_key]) tasks[row.date_key] = [];
    tasks[row.date_key].push(task);
  }
  res.json({ tasks });
});

app.post('/api/tasks', authenticate, async (req, res) => {
  await getDb();
  const { dateKey, text, assignedTo } = req.body;
  if (!dateKey || !text || !assignedTo) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }
  const id = `${dateKey}-${Date.now()}`;
  run('INSERT INTO tasks (id, date_key, text, assigned_to) VALUES (?, ?, ?, ?)', [id, dateKey, text, assignedTo]);
  res.json({ task: { id, text, completed: false, assignedTo } });
});

app.patch('/api/tasks/:id/toggle', authenticate, async (req, res) => {
  await getDb();
  const task = queryOne('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });

  const newCompleted = task.completed ? 0 : 1;
  run('UPDATE tasks SET completed = ? WHERE id = ?', [newCompleted, req.params.id]);

  res.json({ task: { id: task.id, text: task.text, completed: Boolean(newCompleted), assignedTo: task.assigned_to } });
});

app.delete('/api/tasks/:id', authenticate, async (req, res) => {
  await getDb();
  const task = queryOne('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
  run('DELETE FROM tasks WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

app.get('/api/titles/months', authenticate, async (req, res) => {
  await getDb();
  const rows = queryAll('SELECT * FROM month_titles');
  const monthTitles = {};
  for (const row of rows) monthTitles[row.month_key] = row.title;
  res.json({ monthTitles });
});

app.put('/api/titles/months/:monthKey', authenticate, async (req, res) => {
  await getDb();
  const { title } = req.body;
  const existing = queryOne('SELECT * FROM month_titles WHERE month_key = ?', [req.params.monthKey]);
  if (existing) {
    run('UPDATE month_titles SET title = ? WHERE month_key = ?', [title || '', req.params.monthKey]);
  } else {
    run('INSERT INTO month_titles (month_key, title) VALUES (?, ?)', [req.params.monthKey, title || '']);
  }
  res.json({ success: true });
});

app.get('/api/titles/weeks', authenticate, async (req, res) => {
  await getDb();
  const rows = queryAll('SELECT * FROM week_titles');
  const weekTitles = {};
  for (const row of rows) weekTitles[row.week_key] = row.title;
  res.json({ weekTitles });
});

app.put('/api/titles/weeks/:weekKey', authenticate, async (req, res) => {
  await getDb();
  const { title } = req.body;
  const existing = queryOne('SELECT * FROM week_titles WHERE week_key = ?', [req.params.weekKey]);
  if (existing) {
    run('UPDATE week_titles SET title = ? WHERE week_key = ?', [title || '', req.params.weekKey]);
  } else {
    run('INSERT INTO week_titles (week_key, title) VALUES (?, ?)', [req.params.weekKey, title || '']);
  }
  res.json({ success: true });
});

async function start() {
  await getDb();
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

start().catch(console.error);
