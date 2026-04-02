'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Task, TaskStatus, TaskPriority } from '@/types';
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

export default function TasksView() {
  const { tasks, users, searchQuery, addTask, updateTask, deleteTask, darkMode } = useApp();
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some(tag => tag.toLowerCase().includes(q)));
    }

    if (filterStatus !== 'all') result = result.filter(t => t.status === filterStatus);
    if (filterPriority !== 'all') result = result.filter(t => t.priority === filterPriority);
    if (filterAssignee !== 'all') result = result.filter(t => t.assignee?.id === filterAssignee);

    result.sort((a, b) => {
      if (sortBy === 'date') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sortBy === 'priority') {
        const order = { urgent: 4, high: 3, medium: 2, low: 1 };
        return order[b.priority] - order[a.priority];
      }
      const statusOrder = { backlog: 1, todo: 2, 'in-progress': 3, review: 4, done: 5 };
      return statusOrder[a.status] - statusOrder[b.status];
    });

    return result;
  }, [tasks, searchQuery, filterStatus, filterPriority, filterAssignee, sortBy]);

  const exportCSV = () => {
    const headers = ['Title', 'Description', 'Status', 'Priority', 'Assignee', 'Tags', 'Due Date', 'Progress', 'Created'];
    const rows = filteredTasks.map(t => [
      `"${t.title}"`, `"${t.description}"`, t.status, t.priority,
      t.assignee?.name || 'Unassigned', `"${t.tags.join(', ')}"`,
      t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '', `${t.progress}%`,
      new Date(t.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openCreateModal = () => { setEditingTask(null); setShowModal(true); };
  const openEditModal = (task: Task) => { setEditingTask(task); setShowModal(true); };

  const handleSaveTask = (taskData: any) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
    setShowModal(false);
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className={`px-3 py-2 rounded-xl border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-200 bg-white'} text-sm focus:border-primary-300`}>
            <option value="all">All Statuses</option>
            <option value="backlog">Backlog</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
            className={`px-3 py-2 rounded-xl border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-200 bg-white'} text-sm focus:border-primary-300`}>
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)}
            className={`px-3 py-2 rounded-xl border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-200 bg-white'} text-sm focus:border-primary-300`}>
            <option value="all">All Assignees</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
            className={`px-3 py-2 rounded-xl border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-200 bg-white'} text-sm focus:border-primary-300`}>
            <option value="date">Sort by Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={exportCSV}
            className={`px-4 py-2 rounded-xl border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'} text-sm font-medium transition-colors flex items-center gap-2`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
          <button onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </button>
        </div>
      </div>

      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{filteredTasks.length} tasks</p>

      {/* Tasks Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-50'}>
              <tr>
                <th className={`text-left px-6 py-3 text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Task</th>
                <th className={`text-center px-4 py-3 text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
                <th className={`text-center px-4 py-3 text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Priority</th>
                <th className={`text-left px-4 py-3 text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Assignee</th>
                <th className={`text-center px-4 py-3 text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Due Date</th>
                <th className={`text-center px-4 py-3 text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Progress</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
              {filteredTasks.map(task => (
                <tr key={task.id} onClick={() => openEditModal(task)} className={`${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} cursor-pointer transition-colors`}>
                  <td className="px-6 py-4">
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{task.title}</p>
                      <div className="flex gap-1 mt-1">
                        {task.tags.slice(0, 3).map(tag => (
                          <span key={tag} className={`text-xs ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'} px-2 py-0.5 rounded`}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="text-center px-4 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[task.status]}`}>
                      {task.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="text-center px-4 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 flex items-center justify-center text-white text-xs font-bold">
                          {task.assignee.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{task.assignee.name}</span>
                      </div>
                    ) : (
                      <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Unassigned</span>
                    )}
                  </td>
                  <td className="text-center px-4 py-4">
                    <span className={`text-sm ${task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'text-red-500 font-medium' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '\u2014'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-16 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-1.5`}>
                        <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${task.progress}%` }}></div>
                      </div>
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{task.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <svg className={`w-16 h-16 mx-auto ${darkMode ? 'text-gray-600' : 'text-gray-300'} mb-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className={darkMode ? 'text-gray-500' : 'text-gray-500'}>No tasks found</p>
            <button onClick={openCreateModal} className="mt-3 text-primary-600 text-sm font-medium hover:underline">Create a task</button>
          </div>
        )}
      </div>

      {showModal && (
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
