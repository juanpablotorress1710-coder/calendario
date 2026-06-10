import { useState, type FormEvent } from 'react';
import { Calendar, Eye, EyeOff, LogIn, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CREDENTIALS } from '../data/credentials';
import { TEAM_DOT_COLORS } from '../data/colors';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }
    const success = login(username.trim(), password);
    if (!success) setError('Usuario o contraseña incorrectos');
  };

  const teamCredentials = CREDENTIALS.filter(c => c.usuario !== 'admin');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl p-6 text-center shadow-lg">
          <Calendar className="w-14 h-14 mx-auto text-white mb-2" />
          <h1 className="text-2xl font-bold text-white">Calendario Estratégico</h1>
          <p className="text-blue-200 text-sm">Junio 2026 – Junio 2027</p>
        </div>

        <div className="bg-white rounded-b-2xl shadow-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                placeholder="Ingrese su usuario"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  placeholder="Ingrese su contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-sm flex items-center gap-2">
                <Shield size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn size={18} />
              Iniciar sesión
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Equipos disponibles
            </h3>
            <div className="space-y-2">
              {teamCredentials.map(cred => (
                <div key={cred.usuario} className="flex items-center gap-3 py-1.5">
                  <div className={`w-3 h-3 rounded-full ${TEAM_DOT_COLORS[cred.equipo] || 'bg-gray-400'}`} />
                  <span className="text-sm text-gray-600">
                    <span className="font-mono font-medium text-gray-800">{cred.usuario}</span>
                    {' — '}
                    {cred.equipo}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
