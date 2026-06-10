import type { MonthInfo, TasksByDate, AuthUser } from '../types';

export function generateMonths(fromYear: number, fromMonth: number, toYear: number, toMonth: number): MonthInfo[] {
  const months: MonthInfo[] = [];
  let year = fromYear;
  let month = fromMonth;
  while (year < toYear || (year === toYear && month <= toMonth)) {
    months.push({ year, month });
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }
  return months;
}

export function getWeeksForMonth(year: number, month: number): Date[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  const cursor = new Date(firstDay);
  cursor.setDate(cursor.getDate() - cursor.getDay());

  const end = new Date(lastDay);
  end.setDate(end.getDate() + (6 - end.getDay()));

  while (cursor <= end) {
    currentWeek.push(new Date(cursor));
    if (cursor.getDay() === 6) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return weeks;
}

export function getMiniCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  const start = new Date(firstDay);
  start.setDate(start.getDate() - start.getDay());

  const end = new Date(lastDay);
  end.setDate(end.getDate() + (6 - end.getDay()));

  const cursor = new Date(start);
  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function formatMonthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

export function formatWeekKey(year: number, month: number, weekIndex: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-week-${weekIndex}`;
}

export function getMonthStatsFromTasks(tasks: TasksByDate, year: number, month: number): { total: number; completed: number } {
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
}

export function filterTasksByTeam(tasks: TasksByDate, user: AuthUser | null): TasksByDate {
  if (!user || user.isAdmin) return tasks;
  const filtered: TasksByDate = {};
  for (const [key, taskList] of Object.entries(tasks)) {
    const filteredList = taskList.filter(t => t.assignedTo === user.equipo);
    if (filteredList.length > 0) filtered[key] = filteredList;
  }
  return filtered;
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
}
