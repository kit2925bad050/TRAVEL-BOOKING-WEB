import React from 'react';
import {
  ShieldCheck,
  Search,
  Navigation,
  Clock,
  Compass,
  Bell,
  PhoneCall,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Shield,
  Layers,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Passenger } from '../types';

export type ActiveTab =
  | 'home'
  | 'search'
  | 'live-tracking'
  | 'my-trips'
  | 'my-tickets'
  | 'notifications'
  | 'emergency'
  | 'profile'
  | 'admin-dashboard';

export type NavTab = ActiveTab;

interface SidebarNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currentUser: Passenger | null;
  onLogout: () => void;
  unreadNotificationsCount?: number;
  openAdminLoginModal?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  onLogout,
  unreadNotificationsCount = 0,
  openAdminLoginModal
}) => {
  const isAdmin = currentUser?.role === 'admin';

  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    adminOnly?: boolean;
  }[] = [
    {
      id: 'home',
      label: 'Home & Explore',
      icon: <Compass className="w-5 h-5" />
    },
    {
      id: 'search',
      label: 'Search & Book',
      icon: <Search className="w-5 h-5" />
    },
    {
      id: 'live-tracking',
      label: 'Live GPS Tracking',
      icon: <Navigation className="w-5 h-5" />
    },
    {
      id: 'my-trips',
      label: 'My Trips & Bookings',
      icon: <Clock className="w-5 h-5" />
    },
    {
      id: 'notifications',
      label: 'Travel Alerts',
      icon: <Bell className="w-5 h-5" />,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined
    },
    {
      id: 'emergency',
      label: '24x7 Roadside SOS',
      icon: <PhoneCall className="w-5 h-5 text-rose-400" />
    },
    {
      id: 'profile',
      label: 'My Account',
      icon: <User className="w-5 h-5" />
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none text-slate-300 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <button
          onClick={() => onTabChange('home')}
          className="flex items-center gap-3 text-left focus:outline-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
              GUARDIAN
              <span className="text-cyan-400 font-extrabold text-xs px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                PRO
              </span>
            </h1>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
              Travel Smarter. Travel Safer.
            </p>
          </div>
        </button>
      </div>

      {/* User Quick Strip */}
      <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 truncate">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {currentUser?.fullName?.charAt(0) || 'G'}
          </div>
          <div className="truncate">
            <p className="font-semibold text-white truncate text-xs">
              {currentUser?.fullName || 'Guest Traveler'}
            </p>
            <p className="text-[10px] text-slate-400 capitalize">
              {currentUser?.role === 'admin' ? '🛡️ System Admin' : 'Passenger Account'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation List */}
      <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Main Travel Portal
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition group ${
                isActive
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-blue-700' : 'bg-rose-500 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Admin Special Section */}
        <div className="pt-4 mt-2 border-t border-slate-800/80">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Fleet Operations</span>
            {isAdmin && (
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono">
                ACTIVE
              </span>
            )}
          </div>

          {isAdmin ? (
            <button
              onClick={() => onTabChange('admin-dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition ${
                activeTab === 'admin-dashboard'
                  ? 'bg-gradient-to-r from-blue-700 to-indigo-600 text-white font-bold shadow-md'
                  : 'text-emerald-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-emerald-400" />
                <span>Admin Operations HQ</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>
          ) : (
            <button
              onClick={openAdminLoginModal}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs text-slate-400 hover:bg-slate-800/70 hover:text-slate-200 transition"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Admin Access Portal</span>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">Pin</span>
            </button>
          )}
        </div>
      </nav>

      {/* Footer Navigation */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        <button
          onClick={() => onTabChange('profile')}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <Settings className="w-4 h-4" />
          <span>Preferences</span>
        </button>

        {currentUser ? (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        ) : (
          <button
            onClick={() => onTabChange('search')}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition"
          >
            Sign In to Account
          </button>
        )}
      </div>
    </aside>
  );
};
