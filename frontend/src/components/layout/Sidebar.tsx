'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Megaphone,
  Users,
  Phone,
  BarChart3,
  Settings,
  CreditCard,
  MessageSquare,
  Bot,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/campaigns', icon: Megaphone, label: 'Campaigns' },
  { href: '/leads', icon: Users, label: 'Leads' },
  { href: '/calls', icon: Phone, label: 'Calls' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/ai-models', icon: Bot, label: 'AI Models' },
  { href: '/whatsapp', icon: MessageSquare, label: 'WhatsApp' },
  { href: '/billing', icon: CreditCard, label: 'Billing' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      className={cn(
        'fixed left-0 top-0 bottom-0 z-40 flex flex-col',
        'bg-dark-900/80 backdrop-blur-xl border-r border-dark-800/50',
        'transition-all duration-300'
      )}
      animate={{ width: collapsed ? 72 : 260 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-dark-800/50">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center flex-shrink-0">
          <Phone className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <motion.span
            className="text-lg font-bold gradient-text whitespace-nowrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            CallGenie AI
          </motion.span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                isActive ? 'sidebar-link-active' : 'sidebar-link',
                collapsed && 'justify-center !px-3'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center p-4 border-t border-dark-800/50 text-dark-400 hover:text-dark-200 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>
    </motion.aside>
  );
}
