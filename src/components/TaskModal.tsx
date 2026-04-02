'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Task, User, TaskStatus, TaskPriority } from '@/types';

interface TaskModalProps {
  task: Task | null;
  onSave: (data: any) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  users: User[];
}

export default function TaskModal({ task, onSave, onDelete, onClose, users }: TaskModalProps) {
  const { addComment, toggleSubtask, addSubtask, removeSubtask, addTimeEntry, currentUser } = useApp();
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'todo');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'medium');
  const [assigneeId, setAssigneeId] = useState(task?.assignee?.id || '');
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.split('T')[0] : '');
  const [tags, setTags] = useState(task?.tags.join(', ') || '');
  const [progress, setProgress] = useState(task?.progress || 0);
  const [comment, setComment] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'subtasks' | 'comments' | 'time'>('details');
  const [newSubtask, setNewSubtask] = useState('');
  const [timeHours, setTimeHours] = useState('');
  const [timeDesc, setTimeDesc] = useState('');

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSave = () => {
    if (!title.trim()) return;
    const assignee = users.find(u => u.id === assigneeId) || null;
    onSave({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assignee,
      reporter: task?.reporter || users[0],
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      progress,
    });
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim() || !task) return;
    addSubtask(task.id, newSubtask.trim());
    setNewSubtask('');
  };

  const handleAddTimeEntry = () => {
    if (!timeHours || !task || !currentUser) return;
    addTimeEntry(task.id, {
      userId: currentUser.id,
      userName: currentUser.name,
      description: timeDesc || 'Work',
      hours: parseFloat(timeHours),
      date: new Date().toISOString(),
    });
    setTimeHours('');
    setTimeDesc('');
  };

  const subtaskProgress = task && task.subtasks.length > 0
    ? Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100)
    : 0;

  const totalTimeLogged = task ? task.timeEntries.reduce((sum, e) => sum + e.hours, 0) : 0;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-overlay" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        {task && (
          <div className="flex border-b border-gray-100 dark:border-gray-700 px-6">
            {(['details', 'subtasks', 'comments', 'time'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                {tab === 'details' ? 'Details' :
                 tab === 'subtasks' ? `Subtasks (${task.subtasks.length})` :
                 tab === 'comments' ? `Comments (${task.comments.length})` :
                 `Time (${totalTimeLogged}h)`}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {(activeTab === 'details' || !task) && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text" value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all"
                  placeholder="Task title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={description} onChange={e => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all resize-none"
                  placeholder="Describe the task..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value as TaskStatus)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-primary-300 focus:ring-2 focus:ring-primary-100">
                    <option value="backlog">Backlog</option>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-primary-300 focus:ring-2 focus:ring-primary-100">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assignee</label>
                  <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-primary-300 focus:ring-2 focus:ring-primary-100">
                    <option value="">Unassigned</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                  <input
                    type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma separated)</label>
                <input
                  type="text" value={tags} onChange={e => setTags(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  placeholder="design, frontend, urgent..."
                />
              </div>

              {task && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Progress ({progress}%)</label>
                  <input
                    type="range" min="0" max="100" value={progress} onChange={e => setProgress(Number(e.target.value))}
                    className="w-full accent-primary-500"
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'subtasks' && task && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text" value={newSubtask} onChange={e => setNewSubtask(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddSubtask(); }}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-primary-300 focus:ring-2 focus:ring-primary-100 text-sm"
                  placeholder="Add a subtask..."
                />
                <button onClick={handleAddSubtask} className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors">
                  Add
                </button>
              </div>

              {task.subtasks.length > 0 && (
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} completed</span>
                    <span>{subtaskProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div className="bg-primary-500 h-2 rounded-full transition-all" style={{ width: `${subtaskProgress}%` }}></div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {task.subtasks.map(subtask => (
                  <div key={subtask.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 group">
                    <button
                      onClick={() => toggleSubtask(task.id, subtask.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        subtask.completed ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-300 dark:border-gray-500 hover:border-primary-400'
                      }`}
                    >
                      {subtask.completed && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>
                      {subtask.title}
                    </span>
                    <button
                      onClick={() => removeSubtask(task.id, subtask.id)}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {task.subtasks.length === 0 && (
                <p className="text-center text-gray-400 py-8">No subtasks yet. Add one above!</p>
              )}
            </div>
          )}

          {activeTab === 'comments' && task && (
            <div className="space-y-4">
              {task.comments.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No comments yet</p>
              ) : (
                task.comments.map(c => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {c.userName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{c.userName}</span>
                        <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{c.text}</p>
                    </div>
                  </div>
                ))
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <input
                  type="text" value={comment} onChange={e => setComment(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-primary-300 focus:ring-2 focus:ring-primary-100 text-sm"
                  placeholder="Add a comment..."
                  onKeyDown={e => {
                    if (e.key === 'Enter' && comment.trim()) {
                      addComment(task.id, comment.trim());
                      setComment('');
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (comment.trim()) {
                      addComment(task.id, comment.trim());
                      setComment('');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {activeTab === 'time' && task && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="number" value={timeHours} onChange={e => setTimeHours(e.target.value)}
                  className="w-24 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-primary-300 text-sm"
                  placeholder="Hours" min="0" step="0.5"
                />
                <input
                  type="text" value={timeDesc} onChange={e => setTimeDesc(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-primary-300 text-sm"
                  placeholder="Description (optional)"
                />
                <button onClick={handleAddTimeEntry} className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors">
                  Log
                </button>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total time logged</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{totalTimeLogged}h</p>
              </div>

              <div className="space-y-2">
                {task.timeEntries.map(entry => (
                  <div key={entry.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {entry.userName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{entry.description}</p>
                      <p className="text-xs text-gray-400">{entry.userName} · {new Date(entry.date).toLocaleDateString()}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{entry.hours}h</span>
                  </div>
                ))}
              </div>

              {task.timeEntries.length === 0 && (
                <p className="text-center text-gray-400 py-8">No time entries yet</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            {task && (
              <button
                onClick={() => onDelete(task.id)}
                className="px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-colors"
              >
                Delete Task
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
