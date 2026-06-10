import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Task, TasksByDate, MonthTitles, WeekTitles, TeamStats } from '../types';
import { TEAMS } from '../data/credentials';
import { useAuth } from './AuthContext';

interface TaskContextType {
  tasks: TasksByDate;
  monthTitles: MonthTitles;
  weekTitles: WeekTitles;
  getTasksForDate: (dateKey: string) => Task[];
  getTasksForMonth: (year: number, month: number) => { dateKey: string; tasks: Task[] }[];
  addTask: (dateKey: string, text: string, assignedTo: string) => void;
  toggleTask: (dateKey: string, taskId: string) => void;
  deleteTask: (dateKey: string, taskId: string) => void;
  setMonthTitle: (monthKey: string, title: string) => void;
  setWeekTitle: (weekKey: string, title: string) => void;
  getMonthStats: (year: number, month: number) => { total: number; completed: number };
  getTeamStats: () => TeamStats[];
}

const TaskContext = createContext<TaskContextType | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<TasksByDate>({});
  const [monthTitles, setMonthTitlesState] = useState<MonthTitles>({});
  const [weekTitles, setWeekTitlesState] = useState<WeekTitles>({});

  const apiFetch = useCallback(async (path: string, options: RequestInit = {}): Promise<Response> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`/api${path}`, { ...options, headers });
  }, [token]);

  useEffect(() => {
    if (!token) {
      setTasks({});
      setMonthTitlesState({});
      setWeekTitlesState({});
      return;
    }

    Promise.all([
      apiFetch('/tasks').then(r => r.json()).then(d => setTasks(d.tasks)).catch(() => {}),
      apiFetch('/titles/months').then(r => r.json()).then(d => setMonthTitlesState(d.monthTitles)).catch(() => {}),
      apiFetch('/titles/weeks').then(r => r.json()).then(d => setWeekTitlesState(d.weekTitles)).catch(() => {}),
    ]);
  }, [token, apiFetch]);

  const getTasksForDate = useCallback((dateKey: string): Task[] => {
    return tasks[dateKey] || [];
  }, [tasks]);

  const getTasksForMonth = useCallback((year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result: { dateKey: string; tasks: Task[] }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayTasks = tasks[key];
      if (dayTasks && dayTasks.length > 0) {
        result.push({ dateKey: key, tasks: dayTasks });
      }
    }
    return result;
  }, [tasks]);

  const addTask = useCallback(async (dateKey: string, text: string, assignedTo: string) => {
    const res = await apiFetch('/tasks', {
      method: 'POST',
      body: JSON.stringify({ dateKey, text, assignedTo }),
    });
    if (!res.ok) return;
    const data = await res.json();
    setTasks(prev => {
      const existing = prev[dateKey] || [];
      return { ...prev, [dateKey]: [...existing, data.task] };
    });
  }, [apiFetch]);

  const toggleTask = useCallback(async (dateKey: string, taskId: string) => {
    const res = await apiFetch(`/tasks/${taskId}/toggle`, { method: 'PATCH' });
    if (!res.ok) return;
    const data = await res.json();
    setTasks(prev => {
      const dayTasks = prev[dateKey];
      if (!dayTasks) return prev;
      return {
        ...prev,
        [dateKey]: dayTasks.map(t => t.id === taskId ? data.task : t),
      };
    });
  }, [apiFetch]);

  const deleteTask = useCallback(async (dateKey: string, taskId: string) => {
    const res = await apiFetch(`/tasks/${taskId}`, { method: 'DELETE' });
    if (!res.ok) return;
    setTasks(prev => {
      const dayTasks = prev[dateKey];
      if (!dayTasks) return prev;
      const filtered = dayTasks.filter(t => t.id !== taskId);
      if (filtered.length === 0) {
        const { [dateKey]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [dateKey]: filtered };
    });
  }, [apiFetch]);

  const setMonthTitle = useCallback(async (monthKey: string, title: string) => {
    setMonthTitlesState(prev => ({ ...prev, [monthKey]: title }));
    await apiFetch(`/titles/months/${monthKey}`, {
      method: 'PUT',
      body: JSON.stringify({ title }),
    });
  }, [apiFetch]);

  const setWeekTitle = useCallback(async (weekKey: string, title: string) => {
    setWeekTitlesState(prev => ({ ...prev, [weekKey]: title }));
    await apiFetch(`/titles/weeks/${weekKey}`, {
      method: 'PUT',
      body: JSON.stringify({ title }),
    });
  }, [apiFetch]);

  const getMonthStats = useCallback((year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let total = 0;
    let completed = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayTasks = tasks[key];
      if (dayTasks) {
        total += dayTasks.length;
        completed += dayTasks.filter(t => t.completed).length;
      }
    }
    return { total, completed };
  }, [tasks]);

  const getTeamStats = useCallback((): TeamStats[] => {
    return TEAMS.map(equipo => {
      let total = 0;
      let completed = 0;
      for (const dateKey of Object.keys(tasks)) {
        for (const t of tasks[dateKey]) {
          if (t.assignedTo === equipo) {
            total++;
            if (t.completed) completed++;
          }
        }
      }
      return { equipo, total, completed };
    });
  }, [tasks]);

  return (
    <TaskContext.Provider value={{
      tasks,
      monthTitles,
      weekTitles,
      getTasksForDate,
      getTasksForMonth,
      addTask,
      toggleTask,
      deleteTask,
      setMonthTitle,
      setWeekTitle,
      getMonthStats,
      getTeamStats,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTaskContext must be used within TaskProvider');
  return ctx;
}
