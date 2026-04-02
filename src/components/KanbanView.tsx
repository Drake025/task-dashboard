'use client';

import { useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { Task, TaskStatus } from '@/types';
import TaskModal from './TaskModal';

const columns: { id: TaskStatus; title: string; color: string; bgColor: string; darkBgColor: string }[] = [
  { id: 'backlog', title: 'Backlog', color: '#9CA3AF', bgColor: 'bg-gray-50', darkBgColor: 'dark:bg-gray-800/50' },
  { id: 'todo', title: 'To Do', color: '#F59E0B', bgColor: 'bg-yellow-50', darkBgColor: 'dark:bg-yellow-900/20' },
  { id: 'in-progress', title: 'In Progress', color: '#3B82F6', bgColor: 'bg-blue-50', darkBgColor: 'dark:bg-blue-900/20' },
  { id: 'review', title: 'Review', color: '#8B5CF6', bgColor: 'bg-purple-50', darkBgColor: 'dark:bg-purple-900/20' },
  { id: 'done', title: 'Done', color: '#10B981', bgColor: 'bg-green-50', darkBgColor: 'dark:bg-green-900/20' },
];

const priorityColors = {
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

export default function KanbanView() {
  const { tasks, moveTask, addTask, updateTask, deleteTask, users, searchQuery, darkMode } = useApp();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');

  const allTags = Array.from(new Set(tasks.flatMap(t => t.tags)));

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
    const matchesAssignee = filterAssignee === 'all' || t.assignee?.id === filterAssignee;
    const matchesTag = filterTag === 'all' || t.tags.includes(filterTag);
    return matchesSearch && matchesPriority && matchesAssignee && matchesTag;
  });

  const getColumnTasks = (status: TaskStatus) => filteredTasks.filter(t => t.status === status);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    (e.target as HTMLElement).classList.add('dragging');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTask(null);
    setDragOverColumn(null);
    (e.target as HTMLElement).classList.remove('dragging');
  };

  const handleDragOver = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== columnId) {
      moveTask(draggedTask.id, columnId);
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleSaveTask = (taskData: any) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
    setShowModal(false);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    setShowModal(false);
  };

  return (
    <div className="p-4 md:p-6 h-[calc(100vh-4rem)] flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className={`px-3 py-2 rounded-xl border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-200 bg-white'} text-sm focus:border-primary-300 focus:ring-2 focus:ring-primary-100`}
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={filterAssignee}
            onChange={e => setFilterAssignee(e.target.value)}
            className={`px-3 py-2 rounded-xl border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-200 bg-white'} text-sm focus:border-primary-300 focus:ring-2 focus:ring-primary-100`}
          >
            <option value="all">All Assignees</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <select
            value={filterTag}
            onChange={e => setFilterTag(e.target.value)}
            className={`px-3 py-2 rounded-xl border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-200 bg-white'} text-sm focus:border-primary-300 focus:ring-2 focus:ring-primary-100`}
          >
            <option value="all">All Tags</option>
            {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
          </select>
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{filteredTasks.length} tasks</span>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:from-primary-600 hover:to-primary-700 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Task
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 h-full min-w-max pb-4">
          {columns.map(column => {
            const columnTasks = getColumnTasks(column.id);
            return (
              <div
                key={column.id}
                className={`kanban-column flex flex-col w-72 rounded-2xl ${column.bgColor} ${column.darkBgColor} ${dragOverColumn === column.id ? 'drag-over ring-2 ring-primary-300' : ''}`}
                onDragOver={e => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, column.id)}
              >
                <div className="p-4 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.color }}></div>
                    <h3 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'} text-sm`}>{column.title}</h3>
                    <span className={`text-xs ${darkMode ? 'bg-gray-700/80 text-gray-400' : 'bg-white/80 text-gray-500'} px-2 py-0.5 rounded-full font-medium`}>{columnTasks.length}</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-3">
                  {columnTasks.map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={e => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      onClick={() => openEditModal(task)}
                      className={`task-card glass-card rounded-xl p-4 cursor-pointer ${darkMode ? 'border-gray-600/50' : 'border-white/50'} border`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                        <div className="flex items-center gap-2">
                          {task.subtasks.length > 0 && (
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-400'} flex items-center gap-1`}>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                              </svg>
                              {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                            </span>
                          )}
                          {task.attachments > 0 && (
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-400'} flex items-center gap-1`}>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              {task.attachments}
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'} text-sm mb-1 line-clamp-2`}>{task.title}</h4>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} line-clamp-2 mb-3`}>{task.description}</p>

                      {task.progress > 0 && task.progress < 100 && (
                        <div className="mb-3">
                          <div className={`flex justify-between text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                            <span>Progress</span>
                            <span>{task.progress}%</span>
                          </div>
                          <div className={`w-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-1.5`}>
                            <div className="progress-bar bg-primary-500 h-1.5 rounded-full" style={{ width: `${task.progress}%` }}></div>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1 mb-3">
                        {task.tags.slice(0, 3).map(tag => (
                          <span key={tag} className={`text-xs ${darkMode ? 'bg-gray-700/60 text-gray-400' : 'bg-white/60 text-gray-500'} px-2 py-0.5 rounded-md`}>
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {task.assignee ? (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 flex items-center justify-center text-white text-xs font-bold">
                              {task.assignee.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          ) : (
                            <div className={`w-6 h-6 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} flex items-center justify-center ${darkMode ? 'text-gray-400' : 'text-gray-400'} text-xs`}>?</div>
                          )}
                        </div>
                        {task.dueDate && (
                          <span className={`text-xs ${new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'text-red-500 font-medium' : darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={openCreateModal}
                    className={`w-full py-3 rounded-xl border-2 border-dashed ${darkMode ? 'border-gray-600 text-gray-500 hover:border-primary-400 hover:text-primary-400' : 'border-gray-300 text-gray-400 hover:border-primary-300 hover:text-primary-500'} transition-colors text-sm`}
                  >
                    + Add task
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <TaskModal
          task={editingTask}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          onClose={() => setShowModal(false)}
          users={users}
        />
      )}
    </div>
  );
}
