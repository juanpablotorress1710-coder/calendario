import { useState } from 'react';
import { X, Check } from 'lucide-react';
import type { Task } from '../types';
import { TEAM_COLORS } from '../data/colors';

interface Props {
  task: Task;
  canDelete: boolean;
  canToggle: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

export default function TaskItem({ task, canDelete, canToggle, onToggle, onDelete }: Props) {
  const [showDelete, setShowDelete] = useState(false);
  const teamColor = TEAM_COLORS[task.assignedTo];

  return (
    <div
      className={`flex items-start gap-1.5 px-2 py-1.5 rounded-md text-xs transition-colors group ${
        task.completed ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50'
      }`}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      {canToggle ? (
        <button
          onClick={onToggle}
          className={`mt-0.5 w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 cursor-pointer transition ${
            task.completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-indigo-400'
          }`}
        >
          {task.completed && <Check size={10} strokeWidth={3} />}
        </button>
      ) : (
        <div className={`mt-0.5 w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${
          task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
        }`}>
          {task.completed && <Check size={10} strokeWidth={3} className="text-white" />}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <span className={`block leading-tight ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
          {task.text}
        </span>
        {task.completed && (
          <span className="text-[10px] text-green-600 font-medium flex items-center gap-0.5 mt-0.5">
            <Check size={9} /> Completada
          </span>
        )}
      </div>

      {teamColor && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap ${teamColor.badge} text-white`}>
          {task.assignedTo.split(' ').pop()}
        </span>
      )}

      {canDelete && (
        <button
          onClick={onDelete}
          className={`mt-0.5 text-gray-300 hover:text-red-500 transition-opacity cursor-pointer ${
            showDelete ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
