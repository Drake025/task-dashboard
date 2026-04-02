'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { User, UserRole } from '@/types';

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

export default function MemberManagement() {
  const { users, tasks, addMember, deleteMember, updateMember, currentUser, darkMode } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('member');
  const [department, setDepartment] = useState('General');

  const filteredMembers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const resetForm = () => {
    setName('');
    setEmail('');
    setRole('member');
    setDepartment('General');
    setEditingMember(null);
  };

  const handleAdd = () => {
    if (!name.trim() || !email.trim()) return;
    addMember({
      name: name.trim(),
      email: email.trim(),
      role,
      avatar: name.trim().split(' ').map(n => n[0]).join('').toUpperCase(),
      department,
    });
    resetForm();
    setShowAddModal(false);
  };

  const handleEdit = (member: User) => {
    setEditingMember(member);
    setName(member.name);
    setEmail(member.email);
    setRole(member.role);
    setDepartment(member.department);
    setShowAddModal(true);
  };

  const handleUpdate = () => {
    if (!editingMember || !name.trim() || !email.trim()) return;
    updateMember(editingMember.id, {
      name: name.trim(),
      email: email.trim(),
      role,
      department,
      avatar: name.trim().split(' ').map(n => n[0]).join('').toUpperCase(),
    });
    resetForm();
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this member? Their tasks will be unassigned.')) {
      deleteMember(id);
    }
  };

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  return (
    <div className="p-4 md:p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Member Management</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{users.length} team members</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Member
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <svg className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'} absolute left-3 top-1/2 -translate-y-1/2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text" placeholder="Search members..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className={`pl-10 pr-4 py-2 rounded-xl border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-200 bg-white'} w-full text-sm focus:border-primary-300`}
          />
        </div>
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          className={`px-3 py-2 rounded-xl border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-200 bg-white'} text-sm`}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="member">Member</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member, i) => {
          const memberTasks = tasks.filter(t => t.assignee?.id === member.id);
          const completedTasks = memberTasks.filter(t => t.status === 'done').length;
          const completionRate = memberTasks.length > 0 ? Math.round((completedTasks / memberTasks.length) * 100) : 0;

          return (
            <div key={member.id} className="glass-card rounded-2xl p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${avatarGradients[i % avatarGradients.length]} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                    {member.avatar || member.name.split(' ').map(n => n[0]).join('')}
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
                {isAdmin && member.id !== currentUser?.id && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(member)}
                      className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                      title="Edit"
                    >
                      <svg className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Remove"
                    >
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className={`text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{memberTasks.length}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Tasks</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">{completedTasks}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Done</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-600">{memberTasks.filter(t => t.status === 'in-progress').length}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Active</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className={`flex justify-between text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                    <span>Completion</span>
                    <span>{completionRate}%</span>
                  </div>
                  <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all" style={{ width: `${completionRate}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <svg className={`w-16 h-16 mx-auto ${darkMode ? 'text-gray-600' : 'text-gray-300'} mb-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className={darkMode ? 'text-gray-500' : 'text-gray-500'}>No members found</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setShowAddModal(false); resetForm(); }}>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-md p-6`} onClick={e => e.stopPropagation()}>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-4`}>
              {editingMember ? 'Edit Member' : 'Add New Member'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Full Name</label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-200'} focus:border-primary-300`}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-200'} focus:border-primary-300`}
                  placeholder="john@ventrahealth.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Role</label>
                  <select
                    value={role} onChange={e => setRole(e.target.value as UserRole)}
                    className={`w-full px-4 py-2.5 rounded-xl border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-200'} focus:border-primary-300`}
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Department</label>
                  <select
                    value={department} onChange={e => setDepartment(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-200'} focus:border-primary-300`}
                  >
                    <option value="RCM">RCM</option>
                    <option value="Operations">Operations</option>
                    <option value="Technology">Technology</option>
                    <option value="Analytics">Analytics</option>
                    <option value="Compliance">Compliance</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className={`flex-1 px-4 py-2.5 rounded-xl border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'} text-sm font-medium transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={editingMember ? handleUpdate : handleAdd}
                disabled={!name.trim() || !email.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingMember ? 'Save Changes' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
