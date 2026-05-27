'use client';

import { Bell, Search, User } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
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

        {/* User */}
        <button className="flex items-center gap-3 p-2 rounded-xl hover:bg-dark-800/60 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </button>
      </div>
    </header>
  );
}
