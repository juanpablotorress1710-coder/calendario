export interface Task {
  id: string;
  text: string;
  completed: boolean;
  assignedTo: string;
}

export interface TasksByDate {
  [dateKey: string]: Task[];
}

export interface MonthTitles {
  [monthKey: string]: string;
}

export interface WeekTitles {
  [weekKey: string]: string;
}

export interface TeamCredential {
  usuario: string;
  password: string;
  equipo: string;
  color: string;
}

export interface AuthUser {
  usuario: string;
  equipo: string;
  role: 'admin' | 'team';
  isAdmin: boolean;
}

export interface TeamStats {
  equipo: string;
  total: number;
  completed: number;
}

export interface MonthInfo {
  year: number;
  month: number;
}
