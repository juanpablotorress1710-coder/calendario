import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'data.db');

let db = null;
let ready = null;

export async function getDb() {
  if (db) return db;
  if (ready) return ready;

  ready = (async () => {
    const SQL = await initSqlJs();
    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(buffer);
    } else {
      db = new SQL.Database();
    }
    initTables();
    save();
    return db;
  })();

  return ready;
}

function initTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      equipo TEXT NOT NULL,
      color TEXT NOT NULL
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      date_key TEXT NOT NULL,
      text TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      assigned_to TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_tasks_date_key ON tasks(date_key)
  `);
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to)
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS month_titles (
      month_key TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT ''
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS week_titles (
      week_key TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT ''
    )
  `);
}

export function save() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

export function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

export function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows[0] || null;
}

export function run(sql, params = []) {
  db.run(sql, params);
  save();
}
