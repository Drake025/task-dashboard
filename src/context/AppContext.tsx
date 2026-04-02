'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Task, User, Notification, TaskStatus, Subtask, TimeEntry } from '@/types';
import { defaultTasks, defaultUsers, defaultNotifications } from '@/lib/data';

interface AppState {
  tasks: Task[];
  users: User[];
  notifications: Notification[];
  currentUser: User | null;
  isAuthenticated: boolean;
  activeView: string;
  sidebarOpen: boolean;
  searchQuery: string;
  darkMode: boolean;
  toasts: Toast[];
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType extends AppState {
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (name: string, email: string, password: string) => boolean;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'attachments' | 'progress' | 'subtasks' | 'timeEntries'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  setActiveView: (view: string) => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;
  toggleDarkMode: () => void;
  markNotificationRead: (id: string) => void;
  addNotification: (notif: Omit<Notification, 'id' | 'createdAt'>) => void;
  addComment: (taskId: string, text: string) => void;
  getUnreadCount: () => number;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  removeSubtask: (taskId: string, subtaskId: string) => void;
  addTimeEntry: (taskId: string, entry: Omit<TimeEntry, 'id'>) => void;
  showToast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;
  addMember: (member: Omit<User, 'id'>) => void;
  deleteMember: (id: string) => void;
  updateMember: (id: string, updates: Partial<User>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'task-dashboard-state';

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    tasks: defaultTasks,
    users: defaultUsers,
    notifications: defaultNotifications,
    currentUser: null,
    isAuthenticated: false,
    activeView: 'dashboard',
    sidebarOpen: true,
    searchQuery: '',
    darkMode: false,
    toasts: [],
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState(prev => ({
          ...prev,
          currentUser: parsed.currentUser || null,
          isAuthenticated: parsed.isAuthenticated || false,
          tasks: parsed.tasks || defaultTasks,
          users: parsed.users || defaultUsers,
          notifications: parsed.notifications || defaultNotifications,
          darkMode: parsed.darkMode || false,
        }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        tasks: state.tasks,
        users: state.users,
        notifications: state.notifications,
        darkMode: state.darkMode,
      }));
    } catch {}
  }, [state.currentUser, state.isAuthenticated, state.tasks, state.users, state.notifications, state.darkMode]);

  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = String(Date.now()) + Math.random();
    setState(prev => ({ ...prev, toasts: [...prev.toasts, { id, message, type }] }));
    setTimeout(() => {
      setState(prev => ({ ...prev, toasts: prev.toasts.filter(t => t.id !== id) }));
    }, 3000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setState(prev => ({ ...prev, toasts: prev.toasts.filter(t => t.id !== id) }));
  }, []);

  const login = useCallback((email: string, password: string): boolean => {
    const user = state.users.find(u => u.email === email);
    if (user && password.length >= 4) {
      setState(prev => ({ ...prev, currentUser: user, isAuthenticated: true }));
      showToast(`Welcome back, ${user.name}!`, 'success');
      return true;
    }
    return false;
  }, [state.users, showToast]);

  const logout = useCallback(() => {
    setState(prev => ({ ...prev, currentUser: null, isAuthenticated: false }));
    showToast('Signed out successfully', 'info');
  }, [showToast]);

  const register = useCallback((name: string, email: string, password: string): boolean => {
    if (state.users.find(u => u.email === email)) return false;
    if (password.length < 4) return false;
    const newUser: User = {
      id: String(Date.now()),
      name,
      email,
      role: 'member',
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase(),
      department: 'General',
    };
    setState(prev => ({
      ...prev,
      users: [...prev.users, newUser],
      currentUser: newUser,
      isAuthenticated: true,
    }));
    showToast(`Account created! Welcome, ${name}!`, 'success');
    return true;
  }, [state.users, showToast]);

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'attachments' | 'progress' | 'subtasks' | 'timeEntries'>) => {
    const newTask: Task = {
      ...task,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      attachments: 0,
      progress: 0,
      subtasks: [],
      timeEntries: [],
    };
    setState(prev => ({ ...prev, tasks: [newTask, ...prev.tasks] }));
    showToast('Task created successfully', 'success');
  }, [showToast]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
    showToast('Task deleted', 'info');
  }, [showToast]);

  const moveTask = useCallback((taskId: string, newStatus: TaskStatus) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t),
    }));
    showToast(`Task moved to ${newStatus.replace('-', ' ')}`, 'success');
  }, [showToast]);

  const setActiveView = useCallback((view: string) => {
    setState(prev => ({ ...prev, activeView: view }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setState(prev => ({ ...prev, darkMode: !prev.darkMode }));
    showToast('Theme toggled', 'info');
  }, [showToast]);

  const markNotificationRead = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    }));
  }, []);

  const addNotification = useCallback((notif: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotif: Notification = {
      ...notif,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, notifications: [newNotif, ...prev.notifications] }));
  }, []);

  const addComment = useCallback((taskId: string, text: string) => {
    if (!state.currentUser) return;
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          comments: [...t.comments, {
            id: String(Date.now()),
            userId: state.currentUser!.id,
            userName: state.currentUser!.name,
            text,
            createdAt: new Date().toISOString(),
          }],
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
    showToast('Comment added', 'success');
  }, [state.currentUser, showToast]);

  const getUnreadCount = useCallback(() => {
    return state.notifications.filter(n => !n.read).length;
  }, [state.notifications]);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id !== taskId) return t;
        const updatedSubtasks = t.subtasks.map(s =>
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );
        const completedCount = updatedSubtasks.filter(s => s.completed).length;
        const progress = updatedSubtasks.length > 0 ? Math.round((completedCount / updatedSubtasks.length) * 100) : t.progress;
        return { ...t, subtasks: updatedSubtasks, progress, updatedAt: new Date().toISOString() };
      }),
    }));
  }, []);

  const addSubtask = useCallback((taskId: string, title: string) => {
    const newSubtask: Subtask = { id: String(Date.now()), title, completed: false };
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id !== taskId) return t;
        return { ...t, subtasks: [...t.subtasks, newSubtask], updatedAt: new Date().toISOString() };
      }),
    }));
  }, []);

  const removeSubtask = useCallback((taskId: string, subtaskId: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id !== taskId) return t;
        const updatedSubtasks = t.subtasks.filter(s => s.id !== subtaskId);
        const completedCount = updatedSubtasks.filter(s => s.completed).length;
        const progress = updatedSubtasks.length > 0 ? Math.round((completedCount / updatedSubtasks.length) * 100) : t.progress;
        return { ...t, subtasks: updatedSubtasks, progress, updatedAt: new Date().toISOString() };
      }),
    }));
  }, []);

  const addTimeEntry = useCallback((taskId: string, entry: Omit<TimeEntry, 'id'>) => {
    const newEntry: TimeEntry = { ...entry, id: String(Date.now()) };
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id !== taskId) return t;
        return { ...t, timeEntries: [...t.timeEntries, newEntry], updatedAt: new Date().toISOString() };
      }),
    }));
    showToast(`Logged ${entry.hours}h`, 'success');
  }, [showToast]);

  const addMember = useCallback((member: Omit<User, 'id'>) => {
    if (state.users.find(u => u.email === member.email)) {
      showToast('Email already exists', 'error');
      return;
    }
    const newUser: User = { ...member, id: String(Date.now()) };
    setState(prev => ({ ...prev, users: [...prev.users, newUser] }));
    showToast(`${newUser.name} added to team`, 'success');
  }, [state.users, showToast]);

  const deleteMember = useCallback((id: string) => {
    const user = state.users.find(u => u.id === id);
    if (user?.role === 'admin' && state.users.filter(u => u.role === 'admin').length <= 1) {
      showToast('Cannot delete the last admin', 'error');
      return;
    }
    setState(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== id),
      tasks: prev.tasks.map(t => ({
        ...t,
        assignee: t.assignee?.id === id ? null : t.assignee,
      })),
    }));
    showToast(`${user?.name} removed from team`, 'info');
  }, [state.users, showToast]);

  const updateMember = useCallback((id: string, updates: Partial<User>) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === id ? { ...u, ...updates } : u),
    }));
    showToast('Member updated', 'success');
  }, [showToast]);

  return (
    <AppContext.Provider value={{
      ...state,
      login, logout, register,
      addTask, updateTask, deleteTask, moveTask,
      setActiveView, toggleSidebar, setSearchQuery, toggleDarkMode,
      markNotificationRead, addNotification, addComment,
      getUnreadCount,
      toggleSubtask, addSubtask, removeSubtask,
      addTimeEntry,
      addMember, deleteMember, updateMember,
      showToast, dismissToast,
    }}>
      {children}
      <ToastContainer toasts={state.toasts} onDismiss={dismissToast} />
    </AppContext.Provider>
  );
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          onClick={() => onDismiss(toast.id)}
          className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 min-w-[250px] cursor-pointer transition-all animate-slide-in ${
            toast.type === 'success' ? 'bg-green-500 text-white' :
            toast.type === 'error' ? 'bg-red-500 text-white' :
            'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
          }`}
        >
          {toast.type === 'success' && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast.type === 'error' && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {toast.message}
        </div>
      ))}
    </div>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
