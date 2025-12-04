export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  progress: number;
  assigneeId: string;
  sprintId?: string;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
}

export interface Stats {
  myTasks: number;
  completedToday: number;
  inProgress: number;
  completionRate: number;
}

export interface WeeklyData {
  day: string;
  completed: number;
  inProgress: number;
  total: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  tasksCount: number;
  avatar?: string;
}
export interface ProjectMember {
  userId: number;
  user: User;
  role: 'admin' | 'member' | 'viewer';
}

export interface Project {
  id: number;
  name: string;
  description: string;
  members: ProjectMember[];
  sprints: Sprint[];
  updatedAt: string;
}
