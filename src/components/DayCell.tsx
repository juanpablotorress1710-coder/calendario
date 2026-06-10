import { useState, type FormEvent } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTaskContext } from '../contexts/TaskContext';
import { TEAMS } from '../data/credentials';
import TaskItem from './TaskItem';
import { formatDateKey, isToday } from '../data/utils';

interface Props {
  date: Date;
  isCurrentMonth: boolean;
}

export default function DayCell({ date, isCurrentMonth }: Props) {
  const { user, isAdmin } = useAuth();
  const { getTasksForDate, addTask, toggleTask, deleteTask } = useTaskContext();
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>(TEAMS[0]);

  const dateKey = formatDateKey(date.getFullYear(), date.getMonth(), date.getDate());
  const rawTasks = getTasksForDate(dateKey);
  const tasks = isAdmin || !user ? rawTasks : rawTasks.filter(t => t.assignedTo === user.equipo);
  const completedCount = tasks.filter(t => t.completed).length;
  const today = isToday(date);
  const allDone = tasks.length > 0 && completedCount === tasks.length;

  const handleAddTask = (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    addTask(dateKey, newTaskText.trim(), selectedTeam);
    setNewTaskText('');
  };

  const handleToggle = (taskId: string) => {
    if (!isAdmin && user) {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.assignedTo !== user.equipo) return;
    }
    toggleTask(dateKey, taskId);
  };

  const handleDelete = (taskId: string) => {
    deleteTask(dateKey, taskId);
  };

  const dayNumber = format(date, 'd');
  const dayName = format(date, 'EEE', { locale: es });

  return (
    <div
      className={`border rounded-lg p-2 transition-colors min-h-[120px] flex flex-col ${
        !isCurrentMonth
          ? 'border-gray-100 bg-gray-50/50'
          : allDone
            ? 'border-green-300 bg-green-50/40'
            : 'border-gray-200 hover:border-indigo-200'
      } ${today && isCurrentMonth ? 'ring-2 ring-blue-600' : ''}`}
    >
      <div
        className={`flex items-center justify-between mb-1 px-1 ${
          today && isCurrentMonth ? 'bg-blue-600 text-white rounded-md px-2 py-0.5 -mx-1' : ''
        }`}
      >
        <span className={`text-xs font-bold ${today && isCurrentMonth ? 'text-white' : 'text-gray-700'}`}>
          {dayNumber}
        </span>
        {!today && (
          <span className="text-[10px] text-gray-400">{dayName}</span>
        )}
        {tasks.length > 0 && (
          <span className={`text-[10px] font-medium ${allDone ? 'text-green-600' : today ? 'text-blue-200' : 'text-blue-500'}`}>
            {completedCount}/{tasks.length}
          </span>
        )}
      </div>

      {isCurrentMonth && (
        <div className="flex-1 space-y-0.5 overflow-y-auto max-h-[180px] scrollbar-thin">
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              canDelete={isAdmin}
              canToggle={isAdmin || (user ? task.assignedTo === user.equipo : false)}
              onToggle={() => handleToggle(task.id)}
              onDelete={() => handleDelete(task.id)}
            />
          ))}
        </div>
      )}

      {isCurrentMonth && isAdmin && (
        <form onSubmit={handleAddTask} className="mt-1 flex gap-1">
          <input
            type="text"
            value={newTaskText}
            onChange={e => setNewTaskText(e.target.value)}
            placeholder="Nueva tarea..."
            className="flex-1 min-w-0 px-1.5 py-1 text-[10px] border border-gray-200 rounded focus:ring-1 focus:ring-indigo-400 outline-none"
          />
          <select
            value={selectedTeam}
            onChange={e => setSelectedTeam(e.target.value)}
            className="text-[10px] px-1 py-1 border border-gray-200 rounded outline-none focus:ring-1 focus:ring-indigo-400 max-w-[80px]"
          >
            {TEAMS.map(team => (
              <option key={team} value={team}>{team.split(' ').pop()}</option>
            ))}
          </select>
          <button
            type="submit"
            className="px-1.5 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition cursor-pointer flex-shrink-0"
          >
            <Plus size={12} />
          </button>
        </form>
      )}
    </div>
  );
}
