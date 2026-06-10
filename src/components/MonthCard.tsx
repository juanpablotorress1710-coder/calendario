import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays, CheckCircle2 } from 'lucide-react';
import { getMiniCalendarDays, formatDateKey, isToday, filterTasksByTeam } from '../data/utils';
import { useTaskContext } from '../contexts/TaskContext';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  year: number;
  month: number;
  total: number;
  completed: number;
  onClick: () => void;
}

export default function MonthCard({ year, month, total, completed, onClick }: Props) {
  const { monthTitles, setMonthTitle } = useTaskContext();
  const { isAdmin, user } = useAuth();
  const { tasks: rawTasks } = useTaskContext();
  const tasks = filterTasksByTeam(rawTasks, user);

  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const title = monthTitles[monthKey] || '';
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const allDone = total > 0 && completed === total;

  const minidays = getMiniCalendarDays(year, month);

  return (
    <button
      onClick={onClick}
      className={`bg-white border-2 rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-200 text-left cursor-pointer ${
        allDone ? 'border-green-400 bg-green-50/30' : 'border-gray-200 hover:border-indigo-300'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className={allDone ? 'text-green-600' : 'text-indigo-600'} />
          <h3 className="font-bold text-gray-800 capitalize text-base">
            {format(new Date(year, month, 1), 'MMMM yyyy', { locale: es })}
          </h3>
        </div>
        {allDone && <CheckCircle2 size={20} className="text-green-500" />}
      </div>

      {isAdmin && (
        <input
          value={title}
          onChange={e => setMonthTitle(monthKey, e.target.value)}
          onClick={e => e.stopPropagation()}
          className="w-full mb-2 px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-indigo-400 outline-none"
          placeholder="Título del mes..."
        />
      )}

      <div className="grid grid-cols-7 gap-0.5 mb-2">
        {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
          <div key={i} className="text-[9px] text-gray-400 font-medium text-center">{d}</div>
        ))}
        {minidays.map((day, i) => {
          const isCurrentMonth = day.getMonth() === month;
          const dateKey = formatDateKey(day.getFullYear(), day.getMonth(), day.getDate());
          const dayTasks = tasks[dateKey] || [];
          const allDayDone = dayTasks.length > 0 && dayTasks.every(t => t.completed);
          const hasTasks = dayTasks.length > 0;
          const today = isToday(day);

          let cellClass = 'h-2 w-2 rounded-sm mx-auto ';
          if (!isCurrentMonth) {
            cellClass += 'bg-transparent';
          } else if (today) {
            cellClass += 'bg-blue-700';
          } else if (allDayDone) {
            cellClass += 'bg-green-400';
          } else if (hasTasks) {
            cellClass += 'bg-blue-400';
          } else {
            cellClass += 'bg-gray-200';
          }

          return (
            <div key={i} className="flex items-center justify-center py-0.5">
              <div className={cellClass} />
            </div>
          );
        })}
      </div>

      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{total} tareas</span>
        <span>{pct}%</span>
      </div>
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${allDone ? 'bg-green-500' : 'bg-indigo-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </button>
  );
}
