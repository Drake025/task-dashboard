'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Task } from '@/types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const priorityDots: Record<string, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-blue-500',
  low: 'bg-gray-400',
};

export default function CalendarView() {
  const { tasks, darkMode } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const daysInPrevMonth = getDaysInMonth(year, month - 1);
    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month - 1, daysInPrevMonth - i), isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  }, [year, month]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach(task => {
      if (task.dueDate) {
        const key = new Date(task.dueDate).toISOString().split('T')[0];
        if (!map[key]) map[key] = [];
        map[key].push(task);
      }
    });
    return map;
  }, [tasks]);

  const getDateKey = (date: Date) => date.toISOString().split('T')[0];

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const navigateMonth = (dir: number) => {
    setCurrentDate(new Date(year, month + dir, 1));
  };

  const selectedDateTasks = selectedDate ? tasksByDate[getDateKey(selectedDate)] || [] : [];

  return (
    <div className="p-4 md:p-6 h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button onClick={() => navigateMonth(-1)} className={`p-2 rounded-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}>
              <svg className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className={`text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'} min-w-[200px] text-center`}>
              {MONTHS[month]} {year}
            </h3>
            <button onClick={() => navigateMonth(1)} className={`p-2 rounded-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}>
              <svg className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <button
            onClick={() => setCurrentDate(new Date())}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium text-primary-600 ${darkMode ? 'bg-primary-900/30 hover:bg-primary-900/50' : 'bg-primary-50 hover:bg-primary-100'} transition-colors`}
          >
            Today
          </button>
        </div>

        <div className={`flex items-center gap-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl p-1`}>
          {(['month', 'week'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                viewMode === mode
                  ? `${darkMode ? 'bg-gray-600 text-gray-100' : 'bg-white shadow-sm text-gray-800'}`
                  : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Calendar Grid */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-px mb-1">
            {DAYS.map(day => (
              <div key={day} className={`text-center text-xs font-semibold ${darkMode ? 'text-gray-500' : 'text-gray-400'} py-2`}>{day}</div>
            ))}
          </div>

          {/* Calendar Cells */}
          <div className={`flex-1 grid grid-cols-7 grid-rows-6 gap-px ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-2xl overflow-hidden`}>
            {calendarDays.map((day, index) => {
              const dateKey = getDateKey(day.date);
              const dayTasks = tasksByDate[dateKey] || [];
              const isSelected = selectedDate && getDateKey(selectedDate) === dateKey;

              return (
                <div
                  key={index}
                  onClick={() => setSelectedDate(day.date)}
                  className={`calendar-day ${darkMode ? 'bg-gray-800' : 'bg-white'} p-1.5 cursor-pointer overflow-hidden ${
                    !day.isCurrentMonth ? 'other-month' : ''
                  } ${isToday(day.date) ? 'today' : ''} ${isSelected ? 'ring-2 ring-primary-400 ring-inset' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday(day.date) ? 'text-primary-600' : day.isCurrentMonth ? (darkMode ? 'text-gray-200' : 'text-gray-700') : (darkMode ? 'text-gray-600' : 'text-gray-300')
                  }`}>
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-0.5">
                    {dayTasks.slice(0, 3).map(task => (
                      <div key={task.id} className="flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityDots[task.priority]}`}></div>
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>{task.title}</span>
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>+{dayTasks.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Panel */}
        {selectedDate && (
          <div className={`w-80 glass-card rounded-2xl p-5 flex flex-col overflow-hidden hidden lg:flex`}>
            <div className="mb-4">
              <h3 className={`text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>{selectedDateTasks.length} tasks due</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {selectedDateTasks.length === 0 ? (
                <div className="text-center py-8">
                  <svg className={`w-12 h-12 mx-auto ${darkMode ? 'text-gray-600' : 'text-gray-300'} mb-3`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No tasks on this date</p>
                </div>
              ) : (
                selectedDateTasks.map(task => (
                  <div key={task.id} className={`p-3 rounded-xl border ${darkMode ? 'border-gray-700 hover:border-primary-600' : 'border-gray-100 hover:border-primary-200'} hover:shadow-sm transition-all`}>
                    <div className="flex items-start gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${priorityDots[task.priority]}`}></div>
                      <h4 className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{task.title}</h4>
                    </div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} line-clamp-2 mb-2`}>{task.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        task.status === 'done' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        task.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {task.status.replace('-', ' ')}
                      </span>
                      {task.assignee && (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 flex items-center justify-center text-white text-xs font-bold">
                          {task.assignee.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
