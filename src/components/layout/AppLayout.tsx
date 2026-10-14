import React, { useState } from 'react';
import { 
  Home, BookOpen, Clock, Bookmark, Sparkles, Settings, 
  AlignLeft, Search, Bell, LogOut, Shield, ChevronDown, Check,
  AlertCircle, DollarSign, BookMarked, User as UserIcon
} from 'lucide-react';
import { User, LibraryNotification } from '../../types';
import { libraryService } from '../../services/libraryService';

export type ActiveTab = 
  | 'home'
  | 'catalog'
  | 'my-books'
  | 'reservations'
  | 'fines'
  | 'recommendations'
  | 'assistant'
  | 'admin'
  | 'profile'
  | 'settings';

interface AppLayoutProps {
  currentUser: User;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (query: string) => void;
  onLogout: () => void;
  notifications: LibraryNotification[];
  onMarkNotificationRead: (id: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentUser,
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onLogout,
  notifications,
  onMarkNotificationRead,
  children,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const isPort3001 = typeof window !== 'undefined' && window.location.port === '3001';

  // Restrict navigation: Admin gets direct access to Library Operations Command
  const navItems = currentUser.role === 'admin'
    ? [
        { id: 'admin', label: 'Library Operations Command', icon: Shield },
        { id: 'catalog', label: 'Catalogue Master', icon: BookOpen },
        { id: 'settings', label: 'Security & Settings', icon: Settings },
      ]
    : [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'catalog', label: 'Discover Books', icon: BookOpen },
        { id: 'my-books', label: 'My Loans & Reading', icon: Clock },
        { id: 'reservations', label: 'Hold Queue', icon: Bookmark },
        { id: 'fines', label: 'Fines & Dues (₹)', icon: DollarSign },
        { id: 'assistant', label: 'Library AI', icon: Sparkles },
        { id: 'settings', label: 'Account & Settings', icon: Settings },
      ];

  return (
    <div className="min-h-screen bg-[#F5F4EE] text-[#1D1D1F] flex antialiased">
      {/* Left Slim Navigation Rail - Faithful to uploaded prototype design */}
      <aside className="w-20 sm:w-22 shrink-0 bg-[#F4F3EE] border-r border-[#E8E5DC] flex flex-col items-center py-6 select-none z-30 sticky top-0 h-screen">
        {/* Top Logo Mark */}
        <button 
          onClick={() => onTabChange(currentUser.role === 'admin' ? 'admin' : 'home')}
          className="w-11 h-11 rounded-2xl bg-[#1D1D1F] text-white flex items-center justify-center shadow-md mb-8 hover:scale-105 transition-transform"
          title={currentUser.role === 'admin' ? 'Library Operations Command' : 'Smart Library Home'}
        >
          {/* Custom scribble/hand icon from reference image */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3c-4.5 0-8 3.5-8 8 0 3.5 2 6 4 7.5V21h8v-2.5c2-1.5 4-4 4-7.5 0-4.5-3.5-8-8-8z"/>
            <path d="M9 10h6"/>
            <path d="M10 14h4"/>
          </svg>
        </button>

        {/* Navigation Icon Stack */}
        <nav className="flex-1 flex flex-col items-center gap-4 w-full px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as ActiveTab)}
                title={item.label}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 relative group ${
                  isActive
                    ? 'bg-[#E06953] text-white shadow-md shadow-[#E06953]/25 scale-105'
                    : 'text-[#656157] hover:text-[#1D1D1F] hover:bg-[#EBE8DF]'
                }`}
              >
                <Icon className="w-5 h-5 stroke-[1.8]" />
                {/* Floating tooltip */}
                <span className="absolute left-16 px-2.5 py-1 bg-[#1D1D1F] text-white text-[11px] rounded-lg font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Drawer Toggle Icon matching reference */}
        <div className="pt-4 border-t border-[#E8E5DC] w-full flex flex-col items-center gap-3">
          <button
            onClick={() => onTabChange('profile')}
            title="User Profile"
            className="w-10 h-10 rounded-xl text-[#656157] hover:text-[#1D1D1F] hover:bg-[#EBE8DF] flex items-center justify-center transition-colors"
          >
            <AlignLeft className="w-5 h-5 stroke-[1.8]" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-20 bg-[#F5F4EE]/90 backdrop-blur-md border-b border-[#E8E5DC] px-6 lg:px-10 py-3.5 flex items-center justify-between gap-6">
          {/* Search Bar matching the prototype */}
          <form 
            onSubmit={(e) => { e.preventDefault(); onSearchSubmit(searchQuery); }}
            className="relative flex-1 max-w-xl"
          >
            <Search className="w-4 h-4 text-[#8A857A] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={currentUser.role === 'admin' ? "Search circulation records, barcodes, titles, members..." : "Search book name, author, edition, or barcode..."}
              className="w-full pl-10 pr-4 py-2 text-sm bg-transparent border-none placeholder-[#8A857A] text-[#1D1D1F] focus:outline-none focus:ring-0 font-normal"
            />
          </form>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Dual port switcher badge */}
            {isPort3001 ? (
              <a
                href="http://localhost:3000"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1D1D1F] text-white text-[11px] font-medium hover:bg-[#333336] transition-colors"
                title="Switch to Main App on Port 3000"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Port 3001 (Admin) → Main (3000)</span>
              </a>
            ) : currentUser.role === 'admin' ? (
              <a
                href="http://localhost:3001"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE8E0] text-[#1D1D1F] text-[11px] font-medium hover:bg-[#DDD9CE] transition-colors border border-[#DDD9CE]"
                title="Open Dedicated Admin Port on 3001"
              >
                <Shield className="w-3 h-3 text-[#E06953]" />
                <span>Admin Port: localhost:3001 ↗</span>
              </a>
            ) : null}

            {/* Fine Warning Pill if member has unpaid fees (members only) */}
            {currentUser.role === 'member' && (
              <button
                onClick={() => onTabChange('fines')}
                className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE8E0] hover:bg-[#E2DFD6] text-xs text-[#656157] font-medium border border-[#DDD9CE] transition-colors"
              >
                <span className="font-bold text-[#E06953]">₹</span>
                <span>Fines</span>
              </button>
            )}

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-9 h-9 rounded-full hover:bg-[#EBE8DF] text-[#1D1D1F] flex items-center justify-center transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E06953] ring-2 ring-[#F5F4EE]" />
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#EAE7DF] p-4 z-50 animate-fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F0EEE6] mb-3">
                    <div className="text-xs font-bold text-[#1D1D1F] uppercase tracking-wider">
                      Notifications ({notifications.length})
                    </div>
                    <span className="text-[11px] text-[#8A857A]">Circulation Alerts</span>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-[#8A857A] text-center py-6">No recent notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => onMarkNotificationRead(n.id)}
                          className={`p-3 rounded-xl text-xs transition-colors cursor-pointer ${
                            n.read ? 'bg-[#F9F8F5] text-[#656157]' : 'bg-[#F4F3EE] text-[#1D1D1F] font-medium border-l-2 border-[#E06953]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-[11px] text-[#1D1D1F]">{n.title}</span>
                            <span className="text-[10px] text-[#8A857A]">{n.date}</span>
                          </div>
                          <p className="text-[11px] text-[#656157] leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill matching reference layout */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full hover:bg-[#EBE8DF] transition-colors"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-[#DDD9CE]"
                />
                <span className="text-sm font-medium text-[#1D1D1F] hidden sm:inline">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8A857A]" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#EAE7DF] p-3 z-50">
                  <div className="p-2 border-b border-[#F0EEE6] mb-2">
                    <div className="font-semibold text-xs text-[#1D1D1F]">{currentUser.name}</div>
                    <div className="text-[11px] text-[#8A857A] truncate">{currentUser.email}</div>
                    <div className="mt-1.5 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F5F4EE] text-[#E06953]">
                      Role: {currentUser.role === 'admin' ? 'Chief Librarian' : 'Registered Member'}
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <button
                      onClick={() => { onTabChange('profile'); setShowUserMenu(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#F5F4EE] text-[#1D1D1F] flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-[#8A857A]" />
                      <span>My Profile & Cards</span>
                    </button>

                    <button
                      onClick={() => { onTabChange('my-books'); setShowUserMenu(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#F5F4EE] text-[#1D1D1F] flex items-center gap-2"
                    >
                      <BookMarked className="w-3.5 h-3.5 text-[#8A857A]" />
                      <span>Active Borrowed Books</span>
                    </button>

                    <div className="pt-2 mt-1 border-t border-[#F0EEE6] px-3 py-1 space-y-1">
                      <div className="text-[10px] uppercase font-bold text-[#8A857A]">
                        Session Security
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#656157]">
                        <span>Auth Token</span>
                        <span className="font-mono text-emerald-600 font-semibold">JWT (HS256)</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#656157]">
                        <span>Card ID</span>
                        <span className="font-mono text-[#1D1D1F]">{currentUser.membershipId}</span>
                      </div>
                    </div>

                    <div className="pt-2 mt-1 border-t border-[#F0EEE6]">
                      <button
                        onClick={() => { setShowUserMenu(false); onLogout(); }}
                        className="w-full text-left px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Sub-Header Breadcrumb / Quick Stats Bar */}
        <main className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
