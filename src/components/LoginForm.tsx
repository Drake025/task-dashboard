'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function LoginForm() {
  const { login, register, darkMode } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegister) {
      if (!name.trim() || !email.trim()) {
        setError('Please fill in all fields');
        return;
      }
      const success = register(name, email, password);
      if (!success) setError('Email already exists or password too short');
    } else {
      const success = login(email, password);
      if (!success) setError('Invalid credentials. Try alex@company.com with any 4+ char password');
    }
  };

  const quickLogin = (email: string) => {
    login(email, 'demo123');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'} p-4`}>
      <div className="w-full max-w-md">
        <div className="glass-card rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>TaskFlow</h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Project Management Dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Full Name</label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'border-gray-600 bg-gray-700/70 text-gray-100' : 'border-gray-200 bg-white/70'} focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all`}
                  placeholder="John Doe"
                />
              </div>
            )}
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'border-gray-600 bg-gray-700/70 text-gray-100' : 'border-gray-200 bg-white/70'} focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all`}
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'border-gray-600 bg-gray-700/70 text-gray-100' : 'border-gray-200 bg-white/70'} focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all`}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm">{error}</div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl hover:from-primary-600 hover:to-primary-700 transition-all transform hover:-translate-y-0.5"
            >
              {isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-4 ${darkMode ? 'bg-gray-800 text-gray-500' : 'bg-white text-gray-400'}`}>Quick login as</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { name: 'Alex (Admin)', email: 'alex@company.com', color: darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700' },
                { name: 'Jordan (Manager)', email: 'jordan@company.com', color: darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700' },
                { name: 'Sam (Member)', email: 'sam@company.com', color: darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700' },
                { name: 'Casey (Member)', email: 'casey@company.com', color: darkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700' },
              ].map(user => (
                <button
                  key={user.email}
                  onClick={() => quickLogin(user.email)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${user.color} hover:opacity-80 transition-all`}
                >
                  {user.name}
                </button>
              ))}
            </div>
          </div>

          <p className={`mt-6 text-center text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => { setIsRegister(!isRegister); setError(''); }} className="text-primary-600 font-medium hover:underline">
              {isRegister ? 'Sign in' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
