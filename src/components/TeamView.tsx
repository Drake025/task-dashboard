'use client';

import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  manager: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  member: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  viewer: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

const avatarGradients = [
  'from-blue-400 to-indigo-500',
  'from-purple-400 to-pink-500',
  'from-green-400 to-emerald-500',
  'from-orange-400 to-red-500',
  'from-teal-400 to-cyan-500',
  'from-pink-400 to-rose-500',
];

export default function TeamView() {
  const { users, tasks, darkMode } = useApp();

  const memberStats = useMemo(() =>
    users.map((u, i) => {
      const userTasks = tasks.filter(t => t.assignee?.id === u.id);
      return {
        ...u,
        totalTasks: userTasks.length,
        completedTasks: userTasks.filter(t => t.status === 'done').length,
        inProgressTasks: userTasks.filter(t => t.status === 'in-progress').length,
        reviewTasks: userTasks.filter(t => t.status === 'review').length,
        avatarGradient: avatarGradients[i % avatarGradients.length],
        completionRate: userTasks.length > 0 ? Math.round((userTasks.filter(t => t.status === 'done').length / userTasks.length) * 100) : 0,
      };
    }),
  [users, tasks]);

  const departments = useMemo(() => {
    const depts: Record<string, typeof memberStats> = {};
    memberStats.forEach(m => {
      if (!depts[m.department]) depts[m.department] = [];
      depts[m.department].push(m);
    });
    return depts;
  }, [memberStats]);

  return (
    <div className="p-4 md:p-6 space-y-6 overflow-y-auto">
      {/* Team Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5">
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Team Members</p>
          <p className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mt-1`}>{users.length}</p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active Tasks</p>
          <p className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mt-1`}>{tasks.filter(t => t.status === 'in-progress').length}</p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Departments</p>
          <p className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mt-1`}>{Object.keys(departments).length}</p>
        </div>
      </div>

      {/* Member Cards */}
      <div>
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-4`}>All Members</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {memberStats.map(member => (
            <div key={member.id} className={`glass-card rounded-2xl p-5 hover:shadow-lg transition-shadow`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${member.avatarGradient} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{member.name}</h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{member.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[member.role]}`}>
                      {member.role}
                    </span>
                    <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{member.department}</span>
                  </div>
                </div>
              </div>

              <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className={`text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{member.totalTasks}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Total</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">{member.completedTasks}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Done</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-600">{member.inProgressTasks}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Active</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className={`flex justify-between text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                    <span>Completion</span>
                    <span>{member.completionRate}%</span>
                  </div>
                  <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                    <div
                      className="progress-bar bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"
                      style={{ width: `${member.completionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Departments */}
      {Object.entries(departments).map(([dept, members]) => (
        <div key={dept}>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-4`}>{dept} Department</h3>
          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                <tr>
                  <th className={`text-left px-6 py-3 text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Member</th>
                  <th className={`text-center px-6 py-3 text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Tasks</th>
                  <th className={`text-center px-6 py-3 text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Done</th>
                  <th className={`text-center px-6 py-3 text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Active</th>
                  <th className={`text-center px-6 py-3 text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>In Review</th>
                  <th className={`text-left px-6 py-3 text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Progress</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {members.map(m => (
                  <tr key={m.id} className={`${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${m.avatarGradient} flex items-center justify-center text-white text-xs font-bold`}>
                          {m.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{m.name}</p>
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} capitalize`}>{m.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`text-center px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>{m.totalTasks}</td>
                    <td className="text-center px-6 py-4 text-sm text-green-600 font-medium">{m.completedTasks}</td>
                    <td className="text-center px-6 py-4 text-sm text-blue-600 font-medium">{m.inProgressTasks}</td>
                    <td className="text-center px-6 py-4 text-sm text-purple-600 font-medium">{m.reviewTasks}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-20 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                          <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${m.completionRate}%` }}></div>
                        </div>
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{m.completionRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
