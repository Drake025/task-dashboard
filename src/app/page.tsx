'use client';

import { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import LoginForm from '@/components/LoginForm';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import DashboardView from '@/components/DashboardView';
import KanbanView from '@/components/KanbanView';
import CalendarView from '@/components/CalendarView';
import AnalyticsView from '@/components/AnalyticsView';
import TeamView from '@/components/TeamView';
import TasksView from '@/components/TasksView';
import EmployeeDashboard from '@/components/EmployeeDashboard';
import MemberManagement from '@/components/MemberManagement';

export default function Home() {
  const { isAuthenticated, activeView, darkMode } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === '1') useApp().setActiveView('dashboard');
      if (e.key === '2') useApp().setActiveView('my-dashboard');
      if (e.key === '3') useApp().setActiveView('kanban');
      if (e.key === '4') useApp().setActiveView('calendar');
      if (e.key === '5') useApp().setActiveView('analytics');
      if (e.key === '6') useApp().setActiveView('team');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardView />;
      case 'my-dashboard': return <EmployeeDashboard />;
      case 'kanban': return <KanbanView />;
      case 'calendar': return <CalendarView />;
      case 'analytics': return <AnalyticsView />;
      case 'team': return <TeamView />;
      case 'members': return <MemberManagement />;
      case 'tasks': return <TasksView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50'}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
