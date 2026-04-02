'use client';

import { useApp } from '@/context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const COLORS = ['#91A7FF', '#B5F7D8', '#F7B5D8', '#F7F0B5', '#D4B5F7'];

export default function DashboardView() {
  const { tasks, users, setActiveView, darkMode } = useApp();

  const statusCounts = [
    { name: 'Backlog', count: tasks.filter(t => t.status === 'backlog').length, color: '#E8D5F5' },
    { name: 'To Do', count: tasks.filter(t => t.status === 'todo').length, color: '#F7F0B5' },
    { name: 'In Progress', count: tasks.filter(t => t.status === 'in-progress').length, color: '#B5D8F7' },
    { name: 'Review', count: tasks.filter(t => t.status === 'review').length, color: '#F7D4B5' },
    { name: 'Done', count: tasks.filter(t => t.status === 'done').length, color: '#B5F7D8' },
  ];

  const priorityData = [
    { name: 'Urgent', value: tasks.filter(t => t.priority === 'urgent').length },
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length },
  ];

  const weeklyData = [
    { day: 'Mon', completed: 3, created: 5 },
    { day: 'Tue', completed: 5, created: 3 },
    { day: 'Wed', completed: 2, created: 4 },
    { day: 'Thu', completed: 7, created: 6 },
    { day: 'Fri', completed: 4, created: 2 },
    { day: 'Sat', completed: 1, created: 1 },
    { day: 'Sun', completed: 2, created: 0 },
  ];

  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;

  const recentTasks = [...tasks].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: totalTasks, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: 'from-blue-400 to-blue-600', bg: darkMode ? 'bg-blue-900/30' : 'bg-blue-50' },
          { label: 'Completed', value: completedTasks, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'from-green-400 to-green-600', bg: darkMode ? 'bg-green-900/30' : 'bg-green-50' },
          { label: 'Completion Rate', value: `${completionRate}%`, icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', color: 'from-purple-400 to-purple-600', bg: darkMode ? 'bg-purple-900/30' : 'bg-purple-50' },
          { label: 'Overdue', value: overdueTasks, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'from-red-400 to-red-600', bg: darkMode ? 'bg-red-900/30' : 'bg-red-50' },
        ].map((stat, i) => (
          <div key={i} className={`stats-card glass-card rounded-2xl p-5 ${stat.bg} animate-slide-in-up`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
                <p className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mt-1`}>{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-4`}>Task Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusCounts}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#f0f0f0'} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: darkMode ? '#9ca3af' : '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: darkMode ? '#9ca3af' : '#6b7280' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', backgroundColor: darkMode ? '#1f2937' : '#fff', color: darkMode ? '#f3f4f6' : '#111827' }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {statusCounts.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Breakdown */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-4`}>Priority Breakdown</h3>
          <div className="flex items-center">
            <ResponsiveContainer width="50%" height={250}>
              <PieChart>
                <Pie data={priorityData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value">
                  {priorityData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', backgroundColor: darkMode ? '#1f2937' : '#fff', color: darkMode ? '#f3f4f6' : '#111827' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {priorityData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.name}</span>
                  <span className={`text-sm font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Activity & Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-4`}>Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#f0f0f0'} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: darkMode ? '#9ca3af' : '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: darkMode ? '#9ca3af' : '#6b7280' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', backgroundColor: darkMode ? '#1f2937' : '#fff', color: darkMode ? '#f3f4f6' : '#111827' }} />
              <Legend />
              <Line type="monotone" dataKey="completed" stroke="#91A7FF" strokeWidth={3} dot={{ r: 5 }} name="Completed" />
              <Line type="monotone" dataKey="created" stroke="#F7B5D8" strokeWidth={3} dot={{ r: 5 }} name="Created" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Recent Activity</h3>
            <button onClick={() => setActiveView('tasks')} className="text-sm text-primary-600 hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {recentTasks.map(task => (
              <div key={task.id} className={`flex items-start gap-3 p-3 rounded-xl ${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  task.priority === 'urgent' ? 'bg-red-500' :
                  task.priority === 'high' ? 'bg-orange-500' :
                  task.priority === 'medium' ? 'bg-blue-500' : 'bg-gray-400'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} truncate`}>{task.title}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-0.5`}>
                    {task.assignee?.name || 'Unassigned'} · {task.status.replace('-', ' ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
