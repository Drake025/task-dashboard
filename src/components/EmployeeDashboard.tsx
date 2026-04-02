'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Task } from '@/types';
import TaskModal from './TaskModal';

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

const statusColors: Record<string, string> = {
  backlog: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  todo: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  review: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  done: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export default function EmployeeDashboard() {
  const { tasks, users, currentUser, updateTask, deleteTask, darkMode } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const myTasks = useMemo(() => {
    let result = tasks.filter(t => t.assignee?.id === currentUser?.id);
    if (filterStatus !== 'all') {
      result = result.filter(t => t.status === filterStatus);
    }
    return result.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [tasks, currentUser, filterStatus]);

  const stats = useMemo(() => {
    const all = tasks.filter(t => t.assignee?.id === currentUser?.id);
    return {
      total: all.length,
      completed: all.filter(t => t.status === 'done').length,
      inProgress: all.filter(t => t.status === 'in-progress').length,
      review: all.filter(t => t.status === 'review').length,
      todo: all.filter(t => t.status === 'todo').length,
      overdue: all.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length,
      completionRate: all.length > 0 ? Math.round((all.filter(t => t.status === 'done').length / all.length) * 100) : 0,
    };
  }, [tasks, currentUser]);

  const totalTimeLogged = useMemo(() => {
    return tasks
      .filter(t => t.assignee?.id === currentUser?.id)
      .reduce((sum, t) => sum + t.timeEntries.filter(e => e.userId === currentUser?.id).reduce((s, e) => s + e.hours, 0), 0);
  }, [tasks, currentUser]);

  const upcomingDeadlines = useMemo(() => {
    return tasks
      .filter(t => t.assignee?.id === currentUser?.id && t.dueDate && t.status !== 'done')
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);
  }, [tasks, currentUser]);

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleSaveTask = (taskData: any) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    }
    setShowModal(false);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 overflow-y-auto">
      {/* Welcome */}
      <div className="glass-card rounded-2xl p-6 bg-gradient-to-r from-primary-500 to-primary-600">
        <h2 className="text-2xl font-bold text-white">Welcome back, {currentUser?.name?.split(' ')[0]}!</h2>
        <p className="text-primary-100 mt-1">Here is your personal workspace</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'My Tasks', value: stats.total, color: darkMode ? 'bg-gray-700' : 'bg-blue-50' },
          { label: 'In Progress', value: stats.inProgress, color: darkMode ? 'bg-gray-700' : 'bg-yellow-50' },
          { label: 'In Review', value: stats.review, color: darkMode ? 'bg-gray-700' : 'bg-purple-50' },
          { label: 'Completed', value: stats.completed, color: darkMode ? 'bg-gray-700' : 'bg-green-50' },
          { label: 'Overdue', value: stats.overdue, color: darkMode ? 'bg-gray-700' : 'bg-red-50' },
          { label: 'Hours Logged', value: `${totalTimeLogged}h`, color: darkMode ? 'bg-gray-700' : 'bg-indigo-50' },
        ].map((stat, i) => (
          <div key={i} className={`glass-card rounded-xl p-4 ${stat.color}`}>
            <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mt-1`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>My Tasks</h3>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className={`px-3 py-1.5 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-200 bg-white'} text-sm`}
            >
              <option value="all">All</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="space-y-3">
            {myTasks.map(task => (
              <div
                key={task.id}
                onClick={() => openEditModal(task)}
                className={`glass-card rounded-xl p-4 cursor-pointer hover:shadow-md transition-all ${task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'ring-2 ring-red-300 dark:ring-red-700' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[task.status]}`}>
                        {task.status.replace('-', ' ')}
                      </span>
                    </div>
                    <h4 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'} text-sm`}>{task.title}</h4>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 line-clamp-1`}>{task.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {task.dueDate && (
                      <p className={`text-xs ${new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'text-red-500 font-medium' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                    {task.subtasks.length > 0 && (
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                        {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks
                      </p>
                    )}
                  </div>
                </div>

                {task.progress > 0 && (
                  <div className="mt-3">
                    <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-1.5`}>
                      <div className="bg-primary-500 h-1.5 rounded-full transition-all" style={{ width: `${task.progress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {myTasks.length === 0 && (
              <div className="text-center py-8">
                <svg className={`w-12 h-12 mx-auto ${darkMode ? 'text-gray-600' : 'text-gray-300'} mb-3`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className={darkMode ? 'text-gray-500' : 'text-gray-400'}>No tasks assigned to you</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Completion */}
          <div className="glass-card rounded-xl p-5">
            <h4 className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-3`}>My Progress</h4>
            <div className="flex items-center justify-center">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke={darkMode ? '#374151' : '#e5e7eb'} strokeWidth="8" fill="none" />
                  <circle
                    cx="48" cy="48" r="40"
                    stroke="#5C7CFA"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${stats.completionRate * 2.51} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{stats.completionRate}%</span>
                </div>
              </div>
            </div>
            <p className={`text-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>{stats.completed} of {stats.total} tasks completed</p>
          </div>

          {/* Upcoming Deadlines */}
          <div className="glass-card rounded-xl p-5">
            <h4 className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-3`}>Upcoming Deadlines</h4>
            <div className="space-y-2">
              {upcomingDeadlines.map(task => (
                <div key={task.id} onClick={() => openEditModal(task)} className={`flex items-center gap-3 p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} cursor-pointer`}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    new Date(task.dueDate!) < new Date() ? 'bg-red-500' :
                    Math.ceil((new Date(task.dueDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 2 ? 'bg-orange-500' :
                    'bg-blue-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} truncate`}>{task.title}</p>
                    <p className={`text-xs ${new Date(task.dueDate!) < new Date() ? 'text-red-500' : darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {new Date(task.dueDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
              {upcomingDeadlines.length === 0 && (
                <p className={`text-center text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'} py-4`}>No upcoming deadlines</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && editingTask && (
        <TaskModal
          task={editingTask}
          onSave={handleSaveTask}
          onDelete={(id) => { deleteTask(id); setShowModal(false); }}
          onClose={() => setShowModal(false)}
          users={users}
        />
      )}
    </div>
  );
}
