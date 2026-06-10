import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type { Task, TasksByDate, MonthTitles, WeekTitles, TeamStats } from '../types';
import { TEAMS } from '../data/credentials';

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

const API_URL = '/api/data';

function loadTasks(): TasksByDate {
  try {
    const data = localStorage.getItem('cal_tasks');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function loadMonthTitles(): MonthTitles {
  try {
    const data = localStorage.getItem('cal_month_titles');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function loadWeekTitles(): WeekTitles {
  try {
    const data = localStorage.getItem('cal_week_titles');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

async function syncToServer(tasks: TasksByDate, monthTitles: MonthTitles, weekTitles: WeekTitles) {
  try {
    await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks, monthTitles, weekTitles }),
    });
  } catch {
    // Server unavailable — data persists in localStorage
  }
}

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<TasksByDate>(loadTasks);
  const [monthTitles, setMonthTitles] = useState<MonthTitles>(loadMonthTitles);
  const [weekTitles, setWeekTitles] = useState<WeekTitles>(loadWeekTitles);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  // On mount: try to load from server, fall back to localStorage
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        if (data.tasks) setTasks(data.tasks);
        if (data.monthTitles) setMonthTitles(data.monthTitles);
        if (data.weekTitles) setWeekTitles(data.weekTitles);
      })
      .catch(() => {
        // Server unavailable — localStorage data was already loaded
      });
  }, []);

  // Sync to localStorage on every change
  useEffect(() => {
    localStorage.setItem('cal_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('cal_month_titles', JSON.stringify(monthTitles));
  }, [monthTitles]);

  useEffect(() => {
    localStorage.setItem('cal_week_titles', JSON.stringify(weekTitles));
  }, [weekTitles]);

  // Debounced sync to server (skip first render to avoid double-sync on mount)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      syncToServer(tasks, monthTitles, weekTitles);
    }, 1500);
    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [tasks, monthTitles, weekTitles]);

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

  const addTask = useCallback((dateKey: string, text: string, assignedTo: string) => {
    setTasks(prev => {
      const timestamp = Date.now();
      const id = `${dateKey}-${timestamp}`;
      const newTask: Task = { id, text, completed: false, assignedTo };
      const existing = prev[dateKey] || [];
      return { ...prev, [dateKey]: [...existing, newTask] };
    });
  }, []);

  const toggleTask = useCallback((dateKey: string, taskId: string) => {
    setTasks(prev => {
      const dayTasks = prev[dateKey];
      if (!dayTasks) return prev;
      return {
        ...prev,
        [dateKey]: dayTasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t),
      };
    });
  }, []);

  const deleteTask = useCallback((dateKey: string, taskId: string) => {
    setTasks(prev => {
      const dayTasks = prev[dateKey];
      if (!dayTasks) return prev;
      const filtered = dayTasks.filter(t => t.id !== taskId);
      if (filtered.length === 0) {
        const rest = { ...prev };
        delete rest[dateKey];
        return rest;
      }
      return { ...prev, [dateKey]: filtered };
    });
  }, []);

  const setMonthTitle = useCallback((monthKey: string, title: string) => {
    setMonthTitles(prev => ({ ...prev, [monthKey]: title }));
  }, []);

  const setWeekTitle = useCallback((weekKey: string, title: string) => {
    setWeekTitles(prev => ({ ...prev, [weekKey]: title }));
  }, []);

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
