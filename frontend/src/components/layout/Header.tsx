'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = user
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-dark-50">{title}</h1>
        {subtitle && <p className="text-dark-400 mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 glass-input !w-64 !py-2">
          <Search className="w-4 h-4 text-dark-500" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm text-dark-200 placeholder-dark-500 w-full"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-dark-400 hover:text-dark-200 hover:bg-dark-800/60 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-brand-500 rounded-full" />
        </button>

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 p-2 rounded-xl hover:bg-dark-800/60 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
              {initials}
            </div>
            {user && (
              <>
                <span className="hidden lg:block text-sm text-dark-200">{user.full_name}</span>
                <ChevronDown className="w-3 h-3 text-dark-400 hidden lg:block" />
              </>
            )}
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 glass-card p-2 z-50">
              {user && (
                <div className="px-3 py-2 border-b border-dark-700/50 mb-1">
                  <p className="text-sm font-medium text-dark-100">{user.full_name}</p>
                  <p className="text-xs text-dark-500">{user.email}</p>
                </div>
              )}
              <a href="/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-dark-300 hover:text-dark-100 hover:bg-dark-800/60 rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
                Settings
              </a>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-dark-800/60 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
