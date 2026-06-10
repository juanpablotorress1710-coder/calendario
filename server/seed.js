import { getDb, run, queryAll } from './db.js';

const users = [
  { usuario: 'direccion', password: 'Dir2026!', equipo: 'Dirección estratégica', color: 'Púrpura' },
  { usuario: 'estudios', password: 'Est2026!', equipo: 'Estudios y prospectiva', color: 'Azul' },
  { usuario: 'comunicacion', password: 'Com2026!', equipo: 'Comunicación política', color: 'Rosa' },
  { usuario: 'operacion', password: 'Ope2026!', equipo: 'Operación política', color: 'Ámbar' },
  { usuario: 'electoral', password: 'Ele2026!', equipo: 'Operación electoral', color: 'Verde' },
  { usuario: 'admin', password: 'Admin2026!', equipo: 'Administrador', color: '—' },
];

async function seed() {
  await getDb();
  for (const u of users) {
    const existing = queryAll('SELECT id FROM users WHERE usuario = ?', [u.usuario]);
    if (existing.length === 0) {
      run('INSERT INTO users (usuario, password, equipo, color) VALUES (?, ?, ?, ?)', [u.usuario, u.password, u.equipo, u.color]);
    }
  }
  const count = queryAll('SELECT COUNT(*) as count FROM users');
  console.log(`Seed completado: ${count[0].count} usuarios en BD`);
}

seed().catch(console.error);
