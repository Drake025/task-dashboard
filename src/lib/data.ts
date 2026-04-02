import { Task, User, Notification, TaskStatus, TaskPriority, Subtask, TimeEntry } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const avatarColors = ['#B5D8F7', '#D4B5F7', '#F7B5D8', '#B5F7D8', '#F7F0B5', '#F7D4B5'];

function getAvatar(name: string): string {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const colorIndex = name.length % avatarColors.length;
  return `${avatarColors[colorIndex]}|${initials}`;
}

export const defaultUsers: User[] = [
  { id: '1', name: 'Alex Morgan', email: 'alex@company.com', role: 'admin', avatar: getAvatar('Alex Morgan'), department: 'Engineering' },
  { id: '2', name: 'Jordan Lee', email: 'jordan@company.com', role: 'manager', avatar: getAvatar('Jordan Lee'), department: 'Design' },
  { id: '3', name: 'Sam Taylor', email: 'sam@company.com', role: 'member', avatar: getAvatar('Sam Taylor'), department: 'Engineering' },
  { id: '4', name: 'Casey Kim', email: 'casey@company.com', role: 'member', avatar: getAvatar('Casey Kim'), department: 'Marketing' },
  { id: '5', name: 'Riley Chen', email: 'riley@company.com', role: 'member', avatar: getAvatar('Riley Chen'), department: 'Design' },
  { id: '6', name: 'Morgan Davis', email: 'morgan@company.com', role: 'viewer', avatar: getAvatar('Morgan Davis'), department: 'Product' },
];

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export const defaultTasks: Task[] = [
  {
    id: uuidv4(), title: 'Design System Implementation', description: 'Create a comprehensive design system with reusable components, color tokens, and typography guidelines.',
    status: 'done', priority: 'high', assignee: defaultUsers[1], reporter: defaultUsers[0], tags: ['design', 'ui'],
    dueDate: daysAgo(2), createdAt: daysAgo(14), updatedAt: daysAgo(2), comments: [], attachments: 3, progress: 100,
    subtasks: [
      { id: 's1', title: 'Define color palette', completed: true },
      { id: 's2', title: 'Create typography scale', completed: true },
      { id: 's3', title: 'Build component library', completed: true },
    ],
    timeEntries: [
      { id: 't1', userId: '2', userName: 'Jordan Lee', description: 'Design work', hours: 8, date: daysAgo(5) },
      { id: 't2', userId: '2', userName: 'Jordan Lee', description: 'Component implementation', hours: 6, date: daysAgo(3) },
    ],
  },
  {
    id: uuidv4(), title: 'User Authentication API', description: 'Implement JWT-based authentication with refresh tokens, password reset, and email verification.',
    status: 'done', priority: 'urgent', assignee: defaultUsers[0], reporter: defaultUsers[5], tags: ['backend', 'security'],
    dueDate: daysAgo(5), createdAt: daysAgo(20), updatedAt: daysAgo(5), comments: [], attachments: 1, progress: 100,
    subtasks: [
      { id: 's4', title: 'JWT token generation', completed: true },
      { id: 's5', title: 'Refresh token flow', completed: true },
      { id: 's6', title: 'Password reset endpoint', completed: true },
      { id: 's7', title: 'Email verification', completed: true },
    ],
    timeEntries: [
      { id: 't3', userId: '1', userName: 'Alex Morgan', description: 'API development', hours: 12, date: daysAgo(8) },
    ],
  },
  {
    id: uuidv4(), title: 'Dashboard Analytics Charts', description: 'Build interactive charts for task completion rates, team velocity, and project health metrics.',
    status: 'in-progress', priority: 'high', assignee: defaultUsers[2], reporter: defaultUsers[0], tags: ['frontend', 'charts'],
    dueDate: daysFromNow(3), createdAt: daysAgo(7), updatedAt: daysAgo(1), comments: [], attachments: 2, progress: 65,
    subtasks: [
      { id: 's8', title: 'Bar chart component', completed: true },
      { id: 's9', title: 'Pie chart component', completed: true },
      { id: 's10', title: 'Line chart component', completed: false },
      { id: 's11', title: 'Area chart component', completed: false },
    ],
    timeEntries: [
      { id: 't4', userId: '3', userName: 'Sam Taylor', description: 'Chart components', hours: 5, date: daysAgo(2) },
    ],
  },
  {
    id: uuidv4(), title: 'Real-time Notifications', description: 'Implement WebSocket-based real-time notifications for task updates, mentions, and deadlines.',
    status: 'in-progress', priority: 'medium', assignee: defaultUsers[2], reporter: defaultUsers[1], tags: ['backend', 'websocket'],
    dueDate: daysFromNow(5), createdAt: daysAgo(5), updatedAt: daysAgo(1), comments: [], attachments: 0, progress: 40,
    subtasks: [
      { id: 's12', title: 'WebSocket server setup', completed: true },
      { id: 's13', title: 'Client connection handler', completed: false },
      { id: 's14', title: 'Notification types', completed: false },
    ],
    timeEntries: [],
  },
  {
    id: uuidv4(), title: 'Mobile Responsive Layout', description: 'Ensure all dashboard components work seamlessly on mobile devices with proper touch interactions.',
    status: 'review', priority: 'high', assignee: defaultUsers[4], reporter: defaultUsers[1], tags: ['frontend', 'mobile'],
    dueDate: daysFromNow(2), createdAt: daysAgo(10), updatedAt: daysAgo(1), comments: [], attachments: 4, progress: 90,
    subtasks: [
      { id: 's15', title: 'Sidebar mobile toggle', completed: true },
      { id: 's16', title: 'Touch-friendly cards', completed: true },
      { id: 's17', title: 'Responsive tables', completed: true },
      { id: 's18', title: 'Mobile navigation', completed: false },
    ],
    timeEntries: [
      { id: 't5', userId: '5', userName: 'Riley Chen', description: 'Responsive CSS', hours: 4, date: daysAgo(1) },
    ],
  },
  {
    id: uuidv4(), title: 'CSV Export Feature', description: 'Add ability to export tasks, reports, and analytics data in CSV format with customizable columns.',
    status: 'todo', priority: 'medium', assignee: defaultUsers[3], reporter: defaultUsers[0], tags: ['feature', 'export'],
    dueDate: daysFromNow(7), createdAt: daysAgo(3), updatedAt: daysAgo(3), comments: [], attachments: 0, progress: 0,
    subtasks: [
      { id: 's19', title: 'CSV generation utility', completed: false },
      { id: 's20', title: 'Column selection UI', completed: false },
    ],
    timeEntries: [],
  },
  {
    id: uuidv4(), title: 'Database Optimization', description: 'Optimize PostgreSQL queries, add proper indexes, and implement connection pooling for better performance.',
    status: 'todo', priority: 'high', assignee: defaultUsers[0], reporter: defaultUsers[0], tags: ['backend', 'database'],
    dueDate: daysFromNow(10), createdAt: daysAgo(2), updatedAt: daysAgo(2), comments: [], attachments: 1, progress: 0,
    subtasks: [
      { id: 's21', title: 'Query analysis', completed: false },
      { id: 's22', title: 'Index optimization', completed: false },
      { id: 's23', title: 'Connection pooling', completed: false },
    ],
    timeEntries: [],
  },
  {
    id: uuidv4(), title: 'Team Calendar View', description: 'Create a calendar view showing team availability, deadlines, and scheduled events with drag-and-drop support.',
    status: 'in-progress', priority: 'medium', assignee: defaultUsers[4], reporter: defaultUsers[1], tags: ['frontend', 'calendar'],
    dueDate: daysFromNow(4), createdAt: daysAgo(8), updatedAt: daysAgo(1), comments: [], attachments: 2, progress: 55,
    subtasks: [
      { id: 's24', title: 'Calendar grid layout', completed: true },
      { id: 's25', title: 'Month navigation', completed: true },
      { id: 's26', title: 'Task display on dates', completed: true },
      { id: 's27', title: 'Week view', completed: false },
    ],
    timeEntries: [
      { id: 't6', userId: '5', userName: 'Riley Chen', description: 'Calendar implementation', hours: 6, date: daysAgo(3) },
    ],
  },
  {
    id: uuidv4(), title: 'Role-based Access Control', description: 'Implement granular RBAC with custom permissions, team hierarchies, and project-level access management.',
    status: 'backlog', priority: 'high', assignee: null, reporter: defaultUsers[0], tags: ['backend', 'security'],
    dueDate: daysFromNow(14), createdAt: daysAgo(1), updatedAt: daysAgo(1), comments: [], attachments: 0, progress: 0,
    subtasks: [],
    timeEntries: [],
  },
  {
    id: uuidv4(), title: 'Performance Monitoring', description: 'Set up application performance monitoring with error tracking, uptime checks, and alert notifications.',
    status: 'backlog', priority: 'low', assignee: null, reporter: defaultUsers[5], tags: ['devops', 'monitoring'],
    dueDate: daysFromNow(21), createdAt: daysAgo(1), updatedAt: daysAgo(1), comments: [], attachments: 0, progress: 0,
    subtasks: [],
    timeEntries: [],
  },
  {
    id: uuidv4(), title: 'User Onboarding Flow', description: 'Design and implement an interactive onboarding experience for new users with guided tours and tooltips.',
    status: 'todo', priority: 'medium', assignee: defaultUsers[1], reporter: defaultUsers[5], tags: ['design', 'ux'],
    dueDate: daysFromNow(8), createdAt: daysAgo(4), updatedAt: daysAgo(4), comments: [], attachments: 5, progress: 0,
    subtasks: [
      { id: 's28', title: 'Welcome screen design', completed: false },
      { id: 's29', title: 'Tour step system', completed: false },
      { id: 's30', title: 'Tooltip positioning', completed: false },
    ],
    timeEntries: [],
  },
  {
    id: uuidv4(), title: 'API Documentation', description: 'Create comprehensive API documentation with Swagger/OpenAPI, examples, and integration guides.',
    status: 'review', priority: 'medium', assignee: defaultUsers[3], reporter: defaultUsers[0], tags: ['docs', 'api'],
    dueDate: daysFromNow(1), createdAt: daysAgo(12), updatedAt: daysAgo(1), comments: [], attachments: 1, progress: 95,
    subtasks: [
      { id: 's31', title: 'Endpoint documentation', completed: true },
      { id: 's32', title: 'Request/Response examples', completed: true },
      { id: 's33', title: 'Authentication guide', completed: false },
    ],
    timeEntries: [
      { id: 't7', userId: '4', userName: 'Casey Kim', description: 'Documentation writing', hours: 8, date: daysAgo(2) },
    ],
  },
  {
    id: uuidv4(), title: 'Kanban Board Animations', description: 'Add smooth drag-and-drop animations, transition effects, and visual feedback for kanban interactions.',
    status: 'done', priority: 'low', assignee: defaultUsers[4], reporter: defaultUsers[1], tags: ['frontend', 'ux'],
    dueDate: daysAgo(8), createdAt: daysAgo(18), updatedAt: daysAgo(8), comments: [], attachments: 0, progress: 100,
    subtasks: [
      { id: 's34', title: 'Drag animation', completed: true },
      { id: 's35', title: 'Drop feedback', completed: true },
    ],
    timeEntries: [
      { id: 't8', userId: '5', userName: 'Riley Chen', description: 'Animation implementation', hours: 3, date: daysAgo(10) },
    ],
  },
  {
    id: uuidv4(), title: 'Email Notification Templates', description: 'Design responsive email templates for task assignments, deadline reminders, and weekly digests.',
    status: 'in-progress', priority: 'low', assignee: defaultUsers[3], reporter: defaultUsers[1], tags: ['design', 'email'],
    dueDate: daysFromNow(6), createdAt: daysAgo(6), updatedAt: daysAgo(2), comments: [], attachments: 3, progress: 30,
    subtasks: [
      { id: 's36', title: 'Assignment template', completed: true },
      { id: 's37', title: 'Deadline reminder template', completed: false },
      { id: 's38', title: 'Weekly digest template', completed: false },
    ],
    timeEntries: [
      { id: 't9', userId: '4', userName: 'Casey Kim', description: 'Email template design', hours: 4, date: daysAgo(3) },
    ],
  },
  {
    id: uuidv4(), title: 'Search & Filter System', description: 'Implement advanced search with filters by status, priority, assignee, tags, and date ranges.',
    status: 'todo', priority: 'high', assignee: defaultUsers[2], reporter: defaultUsers[0], tags: ['frontend', 'feature'],
    dueDate: daysFromNow(9), createdAt: daysAgo(3), updatedAt: daysAgo(3), comments: [], attachments: 0, progress: 0,
    subtasks: [
      { id: 's39', title: 'Text search implementation', completed: false },
      { id: 's40', title: 'Filter UI components', completed: false },
      { id: 's41', title: 'Date range picker', completed: false },
    ],
    timeEntries: [],
  },
];

export const defaultNotifications: Notification[] = [
  { id: '1', type: 'task_assigned', message: 'You were assigned to "Dashboard Analytics Charts"', read: false, createdAt: daysAgo(1), taskId: '' },
  { id: '2', type: 'deadline', message: '"Mobile Responsive Layout" is due in 2 days', read: false, createdAt: daysAgo(0), taskId: '' },
  { id: '3', type: 'comment', message: 'Jordan commented on "User Authentication API"', read: true, createdAt: daysAgo(3), taskId: '' },
  { id: '4', type: 'task_completed', message: '"Design System Implementation" was marked as done', read: true, createdAt: daysAgo(2), taskId: '' },
  { id: '5', type: 'mention', message: 'You were mentioned in "Database Optimization"', read: false, createdAt: daysAgo(0), taskId: '' },
];

// In-memory store
let tasks: Task[] = [...defaultTasks];
let users: User[] = [...defaultUsers];
let notifications: Notification[] = [...defaultNotifications];
let currentUser: User | null = null;

export function getTasks(): Task[] { return tasks; }
export function getUsers(): User[] { return users; }
export function getNotifications(): Notification[] { return notifications; }
export function getCurrentUser(): User | null { return currentUser; }

export function setCurrentUser(user: User | null): void { currentUser = user; }

export function addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'attachments' | 'progress' | 'subtasks' | 'timeEntries'>): Task {
  const newTask: Task = {
    ...task,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    comments: [],
    attachments: 0,
    progress: 0,
    subtasks: [],
    timeEntries: [],
  };
  tasks = [newTask, ...tasks];
  return newTask;
}

export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return null;
  tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date().toISOString() };
  return tasks[index];
}

export function deleteTask(id: string): boolean {
  const len = tasks.length;
  tasks = tasks.filter(t => t.id !== id);
  return tasks.length < len;
}

export function moveTask(taskId: string, newStatus: TaskStatus): Task | null {
  return updateTask(taskId, { status: newStatus });
}

export function addNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Notification {
  const newNotif: Notification = {
    ...notification,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  notifications = [newNotif, ...notifications];
  return newNotif;
}

export function markNotificationRead(id: string): void {
  notifications = notifications.map(n => n.id === id ? { ...n, read: true } : n);
}

export function getUnreadCount(): number {
  return notifications.filter(n => !n.read).length;
}

export function addUser(user: Omit<User, 'id'>): User {
  const newUser: User = { ...user, id: uuidv4() };
  users = [...users, newUser];
  return newUser;
}

export function getTasksByStatus(status: TaskStatus): Task[] {
  return tasks.filter(t => t.status === status);
}

export function getTasksByAssignee(userId: string): Task[] {
  return tasks.filter(t => t.assignee?.id === userId);
}

export function getTasksByPriority(priority: TaskPriority): Task[] {
  return tasks.filter(t => t.priority === priority);
}

export function searchTasks(query: string): Task[] {
  const q = query.toLowerCase();
  return tasks.filter(t =>
    t.title.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.tags.some(tag => tag.toLowerCase().includes(q))
  );
}

export function exportTasksCSV(): string {
  const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Assignee', 'Tags', 'Due Date', 'Created At', 'Progress'];
  const rows = tasks.map(t => [
    t.id, `"${t.title}"`, `"${t.description}"`, t.status, t.priority,
    t.assignee?.name || 'Unassigned', `"${t.tags.join(', ')}"`,
    t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No due date',
    new Date(t.createdAt).toLocaleDateString(), `${t.progress}%`
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function toggleSubtask(taskId: string, subtaskId: string): Task | null {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return null;
  const updatedSubtasks = task.subtasks.map(s =>
    s.id === subtaskId ? { ...s, completed: !s.completed } : s
  );
  const completedCount = updatedSubtasks.filter(s => s.completed).length;
  const progress = updatedSubtasks.length > 0 ? Math.round((completedCount / updatedSubtasks.length) * 100) : task.progress;
  return updateTask(taskId, { subtasks: updatedSubtasks, progress });
}

export function addSubtask(taskId: string, title: string): Task | null {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return null;
  const newSubtask: Subtask = { id: uuidv4(), title, completed: false };
  return updateTask(taskId, { subtasks: [...task.subtasks, newSubtask] });
}

export function removeSubtask(taskId: string, subtaskId: string): Task | null {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return null;
  const updatedSubtasks = task.subtasks.filter(s => s.id !== subtaskId);
  const completedCount = updatedSubtasks.filter(s => s.completed).length;
  const progress = updatedSubtasks.length > 0 ? Math.round((completedCount / updatedSubtasks.length) * 100) : task.progress;
  return updateTask(taskId, { subtasks: updatedSubtasks, progress });
}

export function addTimeEntry(taskId: string, entry: Omit<TimeEntry, 'id'>): Task | null {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return null;
  const newEntry: TimeEntry = { ...entry, id: uuidv4() };
  return updateTask(taskId, { timeEntries: [...task.timeEntries, newEntry] });
}

export function getTotalTimeLogged(taskId: string): number {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return 0;
  return task.timeEntries.reduce((sum, e) => sum + e.hours, 0);
}
