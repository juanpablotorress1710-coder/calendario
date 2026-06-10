import { TEAM_COLORS } from '../data/colors';
import type { TeamStats } from '../types';
import { Users } from 'lucide-react';

interface Props {
  equipo: string;
  stats: TeamStats;
}

export default function TeamCard({ equipo, stats }: Props) {
  const colors = TEAM_COLORS[equipo] || { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-700', badge: 'bg-gray-600' };
  const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center gap-2 mb-3">
        <Users size={18} className={colors.text} />
        <h3 className={`font-semibold text-sm ${colors.text}`}>{equipo}</h3>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Pendientes</span>
          <span className="font-medium text-gray-700">{stats.total - stats.completed}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Completadas</span>
          <span className="font-medium text-green-600">{stats.completed}</span>
        </div>

        <div className="pt-1">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progreso</span>
            <span>{pct}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${stats.completed === stats.total && stats.total > 0 ? 'bg-green-500' : 'bg-indigo-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
