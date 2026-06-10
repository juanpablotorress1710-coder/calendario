import express from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, 'data.json');
const PORT = process.env.PORT || 3001;

if (!existsSync(DATA_FILE)) {
  writeFileSync(DATA_FILE, JSON.stringify({ tasks: {}, monthTitles: {}, weekTitles: {} }, null, 2));
}

const app = express();
app.use(express.json());

app.get('/api/data', (_req, res) => {
  try {
    const data = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Error reading data' });
  }
});

app.put('/api/data', (req, res) => {
  try {
    const body = req.body;
    const current = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
    const updated = { ...current, ...body };
    writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2));
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Error saving data' });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
