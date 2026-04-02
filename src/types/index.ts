export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type UserRole = 'admin' | 'manager' | 'member' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TimeEntry {
  id: string;
  userId: string;
  userName: string;
  description: string;
  hours: number;
  date: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: User | null;
  reporter: User;
  tags: string[];
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  attachments: number;
  progress: number;
  subtasks: Subtask[];
  timeEntries: TimeEntry[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  members: User[];
  tasks: Task[];
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'task_assigned' | 'task_completed' | 'comment' | 'deadline' | 'mention';
  message: string;
  read: boolean;
  createdAt: string;
  taskId?: string;
}
