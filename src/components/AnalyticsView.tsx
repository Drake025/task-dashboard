'use client';

import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const COLORS = ['#91A7FF', '#B5F7D8', '#F7B5D8', '#F7F0B5', '#D4B5F7', '#F7D4B5'];

export default function AnalyticsView() {
  const { tasks, users, darkMode } = useApp();

  const statusData = useMemo(() => [
    { name: 'Backlog', value: tasks.filter(t => t.status === 'backlog').length, color: '#E8D5F5' },
    { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length, color: '#F7F0B5' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, color: '#B5D8F7' },
    { name: 'Review', value: tasks.filter(t => t.status === 'review').length, color: '#F7D4B5' },
    { name: 'Done', value: tasks.filter(t => t.status === 'done').length, color: '#B5F7D8' },
  ], [tasks]);

  const priorityData = useMemo(() => [
    { name: 'Urgent', value: tasks.filter(t => t.priority === 'urgent').length },
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length },
  ], [tasks]);

  const memberWorkload = useMemo(() =>
    users.map(u => ({
      name: u.name.split(' ')[0],
      tasks: tasks.filter(t => t.assignee?.id === u.id).length,
      completed: tasks.filter(t => t.assignee?.id === u.id && t.status === 'done').length,
      inProgress: tasks.filter(t => t.assignee?.id === u.id && t.status === 'in-progress').length,
    })).filter(m => m.tasks > 0),
  [tasks, users]);

  const tagData = useMemo(() => {
    const tags: Record<string, number> = {};
    tasks.forEach(t => t.tags.forEach(tag => { tags[tag] = (tags[tag] || 0) + 1; }));
    return Object.entries(tags).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [tasks]);

  const monthlyTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((m) => ({
      name: m,
      created: Math.floor(Math.random() * 10) + 5,
      completed: Math.floor(Math.random() * 8) + 3,
      velocity: Math.floor(Math.random() * 5) + 2,
    }));
  }, []);

  const teamPerformance = useMemo(() => {
    const categories = ['Productivity', 'Quality', 'Speed', 'Collaboration', 'Communication'];
    return categories.map(cat => ({
      subject: cat,
      team: Math.floor(Math.random() * 30) + 70,
      target: 85,
    }));
  }, []);

  const completionRate = tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0;
  const avgProgress = tasks.length > 0 ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length) : 0;

  const chartTextStyle = { fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: 12 };
  const tooltipStyle = { borderRadius: 12, border: 'none', backgroundColor: darkMode ? '#1f2937' : '#fff', color: darkMode ? '#f3f4f6' : '#111827' };
  const gridStroke = darkMode ? '#374151' : '#f0f0f0';

  return (
    <div className="p-4 md:p-6 space-y-6 overflow-y-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`glass-card rounded-2xl p-5 ${darkMode ? 'bg-gradient-to-br from-blue-900/30 to-indigo-900/30' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Completion Rate</p>
          <div className="flex items-end gap-2 mt-1">
            <span className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{completionRate}%</span>
            <span className="text-sm text-green-600 mb-1">↑ 12%</span>
          </div>
          <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 mt-3`}>
            <div className="progress-bar bg-gradient-to-r from-blue-400 to-indigo-500 h-2 rounded-full" style={{ width: `${completionRate}%` }}></div>
          </div>
        </div>
        <div className={`glass-card rounded-2xl p-5 ${darkMode ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30' : 'bg-gradient-to-br from-green-50 to-emerald-50'}`}>
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Avg Progress</p>
          <div className="flex items-end gap-2 mt-1">
            <span className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{avgProgress}%</span>
            <span className="text-sm text-green-600 mb-1">↑ 8%</span>
          </div>
          <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 mt-3`}>
            <div className="progress-bar bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full" style={{ width: `${avgProgress}%` }}></div>
          </div>
        </div>
        <div className={`glass-card rounded-2xl p-5 ${darkMode ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/30' : 'bg-gradient-to-br from-purple-50 to-pink-50'}`}>
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Team Velocity</p>
          <div className="flex items-end gap-2 mt-1">
            <span className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{tasks.filter(t => t.status === 'done').length}</span>
            <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-1`}>tasks/week</span>
          </div>
          <div className="flex gap-1 mt-3">
            {[3, 5, 4, 7, 6, 8, 5].map((v, i) => (
              <div key={i} className="flex-1 bg-purple-200 rounded-sm" style={{ height: `${v * 4}px` }}></div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-4`}>Task Status Distribution</h3>
          <div className="flex items-center">
            <ResponsiveContainer width="55%" height={250}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value">
                  {statusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {statusData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.name}</span>
                  <span className={`text-sm font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'} ml-auto`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-4`}>Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={priorityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis type="number" tick={chartTextStyle} />
              <YAxis dataKey="name" type="category" tick={chartTextStyle} width={60} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {priorityData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-4`}>Monthly Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="name" tick={chartTextStyle} />
              <YAxis tick={chartTextStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Area type="monotone" dataKey="created" stackId="1" stroke="#91A7FF" fill="#91A7FF" fillOpacity={0.6} name="Created" />
              <Area type="monotone" dataKey="completed" stackId="2" stroke="#B5F7D8" fill="#B5F7D8" fillOpacity={0.6} name="Completed" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-4`}>Team Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={teamPerformance}>
              <PolarGrid stroke={darkMode ? '#374151' : '#e0e0e0'} />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: darkMode ? '#9ca3af' : '#6b7280' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: darkMode ? '#9ca3af' : '#6b7280' }} />
              <Radar name="Team" dataKey="team" stroke="#91A7FF" fill="#91A7FF" fillOpacity={0.3} strokeWidth={2} />
              <Radar name="Target" dataKey="target" stroke="#F7B5D8" fill="#F7B5D8" fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team Workload & Tags */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-4`}>Team Workload</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={memberWorkload}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="name" tick={chartTextStyle} />
              <YAxis tick={chartTextStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="tasks" fill="#D4B5F7" radius={[8, 8, 0, 0]} name="Total" />
              <Bar dataKey="completed" fill="#B5F7D8" radius={[8, 8, 0, 0]} name="Done" />
              <Bar dataKey="inProgress" fill="#B5D8F7" radius={[8, 8, 0, 0]} name="In Progress" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-4`}>Popular Tags</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={tagData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: darkMode ? '#9ca3af' : '#6b7280' }} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={chartTextStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {tagData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
