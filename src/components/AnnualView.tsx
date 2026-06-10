import { Calendar, LogOut, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTaskContext } from '../contexts/TaskContext';
import { TEAMS } from '../data/credentials';
import { generateMonths, filterTasksByTeam, getMonthStatsFromTasks } from '../data/utils';
import TeamCard from './TeamCard';
import MonthCard from './MonthCard';

const MONTHS_RANGE = generateMonths(2026, 5, 2027, 5);

interface Props {
  onSelectMonth: (year: number, month: number) => void;
}

export default function AnnualView({ onSelectMonth }: Props) {
  const { user, logout, isAdmin } = useAuth();
  const { tasks: allRawTasks, getTeamStats } = useTaskContext();

  const tasks = filterTasksByTeam(allRawTasks, user);
  const allTasks = Object.values(tasks).flat();
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.completed).length;
  const hasTasks = totalTasks > 0;

  const teamStats = getTeamStats();

  const globalPct = hasTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="px-6 py-3 flex items-center justify-between border-b border-white/20">
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheck size={16} />
            <span className="font-medium">{user?.equipo}</span>
            {isAdmin && (
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Admin</span>
            )}
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition cursor-pointer"
          >
            <LogOut size={15} />
            Cerrar sesión
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <Calendar size={28} />
            <h1 className="text-2xl font-bold">Calendario Anual</h1>
          </div>
          <p className="text-blue-200 text-sm ml-[44px]">Junio 2026 – Junio 2027</p>

          {hasTasks && (
            <div className="ml-[44px] mt-4 flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-blue-200">Total:</span>
                <span className="font-bold">{totalTasks}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-green-300" />
                <span className="text-blue-200">Completadas:</span>
                <span className="font-bold">{completedTasks}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-200">Pendientes:</span>
                <span className="font-bold">{totalTasks - completedTasks}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-200">Progreso global:</span>
                <span className="font-bold">{globalPct}%</span>
              </div>
            </div>
          )}

          {!hasTasks && (
            <p className="ml-[44px] mt-3 text-blue-200 text-sm">No hay tareas registradas</p>
          )}
        </div>
      </header>

      <div className="p-6 space-y-8">
        <section>
          <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            Equipos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {TEAMS.map(equipo => {
              const stats = teamStats.find(s => s.equipo === equipo) || { equipo, total: 0, completed: 0 };
              return <TeamCard key={equipo} equipo={equipo} stats={stats} />;
            })}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            Meses
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {MONTHS_RANGE.map(({ year, month }) => {
              const stats = getMonthStatsFromTasks(tasks, year, month);
              return (
                <MonthCard
                  key={`${year}-${month}`}
                  year={year}
                  month={month}
                  total={stats.total}
                  completed={stats.completed}
                  onClick={() => onSelectMonth(year, month)}
                />
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
