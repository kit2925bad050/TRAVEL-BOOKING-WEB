import React, { useState } from 'react';
import { 
  Bus, 
  Menu, 
  X, 
  Bell, 
  Navigation, 
  User, 
  LayoutDashboard, 
  Search, 
  Ticket, 
  ShieldAlert, 
  BarChart3, 
  LogOut, 
  Settings,
  RefreshCw
} from 'lucide-react';
import { Passenger } from '../types';
import { NavTab } from './SidebarNav';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currentUser: Passenger | null;
  unreadCount: number;
  onOpenLiveTracking: () => void;
  onResetDb: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  unreadCount,
  onOpenLiveTracking,
  onResetDb,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getPageTitle = (tab: NavTab) => {
    switch (tab) {
      case 'home': return 'Home & Explore';
      case 'search': return 'Search Coaches & Compare';
      case 'live-tracking': return 'Live Highway Radar & Tracking';
      case 'my-trips': return 'My Trips & Digital Tickets';
      case 'my-tickets': return 'Digital Boarding Passes';
      case 'notifications': return 'Notification Center';
      case 'emergency': return 'Emergency & SOS Helpline';
      case 'profile': return 'My Account & Preferences';
      case 'admin-dashboard': return 'Fleet Operations Command';
      default: return 'Guardian Travels';
    }
  };

  const navItems = [
    { id: 'home' as NavTab, label: 'Home', icon: LayoutDashboard },
    { id: 'search' as NavTab, label: 'Search Buses', icon: Search },
    { id: 'live-tracking' as NavTab, label: 'Live Tracking', icon: Navigation },
    { id: 'my-trips' as NavTab, label: 'My Trips', icon: Ticket },
    { id: 'notifications' as NavTab, label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'emergency' as NavTab, label: 'Emergency', icon: ShieldAlert },
    { id: 'profile' as NavTab, label: 'Profile', icon: User },
    { id: 'admin-dashboard' as NavTab, label: 'Admin HQ', icon: BarChart3 }
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      {/* Top Bar for Desktop and Mobile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Brand & Hamburger */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div 
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Bus className="w-4 h-4" />
              </div>
              <span className="font-black text-sm tracking-tight text-white">
                GUARDIAN <span className="text-emerald-400 font-light">TRAVELS</span>
              </span>
            </div>
          </div>

          {/* Desktop Left: Current Page Breadcrumb */}
          <div className="hidden lg:flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Guardian Travels</span>
            <span className="text-slate-600">/</span>
            <span className="font-bold text-white text-sm">{getPageTitle(activeTab)}</span>
          </div>

          {/* Right Area: Status Indicator, Notifications Bell & User Profile */}
          <div className="flex items-center gap-3">
            {/* Live GPS quick button */}
            <button
              onClick={onOpenLiveTracking}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              title="Open Live Coach GPS Radar"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live GPS Radar</span>
            </button>

            {/* Notifications Bell */}
            <button
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Profile Pill */}
            {currentUser ? (
              <div
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                title="View Profile & Settings"
              >
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs text-white ${
                  currentUser.isAdmin ? 'bg-amber-600' : 'bg-emerald-600'
                }`}>
                  {currentUser.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-bold text-white block leading-tight">
                    {currentUser.fullName}
                  </span>
                  <span className={`text-[10px] block leading-tight ${currentUser.isAdmin ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                    {currentUser.isAdmin ? 'Fleet Admin' : 'Passenger'}
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('home')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 cursor-pointer transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900 px-4 py-4 space-y-2 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-800 text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={`m-${item.id}`}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl font-bold flex items-center justify-between text-left cursor-pointer transition-colors ${
                    isActive ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
            <button
              onClick={() => {
                onResetDb();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1 hover:text-white"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>

            <button
              onClick={() => {
                onLogout();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1 text-rose-400 hover:text-rose-300"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{currentUser ? 'Sign Out' : 'Sign In'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
