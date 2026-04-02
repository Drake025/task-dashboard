'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function Header() {
  const { activeView, toggleSidebar, notifications, markNotificationRead, searchQuery, setSearchQuery, getUnreadCount, darkMode, toggleDarkMode } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const titles: Record<string, string> = {
    dashboard: 'Dashboard',
    kanban: 'Kanban Board',
    calendar: 'Calendar',
    analytics: 'Analytics',
    team: 'Team',
    tasks: 'All Tasks',
  };

  const unreadCount = getUnreadCount();

  const shortcuts = [
    { key: '1-6', desc: 'Switch views' },
    { key: 'Ctrl+K', desc: 'Search' },
    { key: 'Esc', desc: 'Close modals' },
  ];

  return (
    <header className={`h-16 ${darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/80 border-gray-100'} backdrop-blur-lg border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-30`}>
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <svg className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{titles[activeView] || 'Dashboard'}</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <svg className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'} absolute left-3 top-1/2 -translate-y-1/2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text" placeholder="Search tasks..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className={`pl-10 pr-4 py-2 rounded-xl border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400' : 'border-gray-200 bg-gray-50/50'} w-48 lg:w-64 text-sm focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all`}
          />
        </div>

        {/* Keyboard shortcuts button */}
        <button
          onClick={() => setShowShortcuts(!showShortcuts)}
          className={`relative p-2 rounded-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
          title="Keyboard shortcuts"
        >
          <svg className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
          </svg>
        </button>

        {showShortcuts && (
          <div className={`absolute right-28 top-16 w-56 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-2xl border overflow-hidden z-50`}>
            <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <h3 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Keyboard Shortcuts</h3>
            </div>
            <div className="p-4 space-y-2">
              {shortcuts.map(s => (
                <div key={s.key} className="flex items-center justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{s.desc}</span>
                  <kbd className={`px-2 py-1 rounded text-xs font-mono ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>{s.key}</kbd>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode ? (
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
          >
            <svg className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="notification-badge absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className={`absolute right-0 mt-2 w-80 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-2xl border overflow-hidden z-50`}>
              <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <h3 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className={`p-4 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'} text-center`}>No notifications</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-4 border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-50 hover:bg-gray-50'} cursor-pointer transition-colors ${!n.read ? (darkMode ? 'bg-blue-900/20' : 'bg-blue-50/50') : ''}`}
                      onClick={() => markNotificationRead(n.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          n.type === 'task_assigned' ? 'bg-blue-100 text-blue-600' :
                          n.type === 'task_completed' ? 'bg-green-100 text-green-600' :
                          n.type === 'deadline' ? 'bg-orange-100 text-orange-600' :
                          n.type === 'comment' ? 'bg-purple-100 text-purple-600' :
                          'bg-pink-100 text-pink-600'
                        }`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {n.type === 'task_completed' ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /> :
                             n.type === 'deadline' ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> :
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />}
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{n.message}</p>
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>{new Date(n.createdAt).toLocaleDateString()}</p>
                        </div>
                        {!n.read && <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2"></div>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
