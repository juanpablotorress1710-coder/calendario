import type { TeamCredential } from '../types';

export const CREDENTIALS: TeamCredential[] = [
  { usuario: 'direccion', password: 'Dir2026!', equipo: 'Dirección estratégica', color: 'Púrpura' },
  { usuario: 'estudios', password: 'Est2026!', equipo: 'Estudios y prospectiva', color: 'Azul' },
  { usuario: 'comunicacion', password: 'Com2026!', equipo: 'Comunicación política', color: 'Rosa' },
  { usuario: 'operacion', password: 'Ope2026!', equipo: 'Operación política', color: 'Ámbar' },
  { usuario: 'electoral', password: 'Ele2026!', equipo: 'Operación electoral', color: 'Verde' },
  { usuario: 'admin', password: 'Admin2026!', equipo: 'Administrador', color: '—' },
];

export const TEAMS = [
  'Dirección estratégica',
  'Estudios y prospectiva',
  'Comunicación política',
  'Operación política',
  'Operación electoral',
] as const;
