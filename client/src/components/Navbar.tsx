import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Recycle, 
  ScanLine, 
  BookOpen, 
  MapPin, 
  CalendarClock, 
  BarChart3, 
  History, 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  Sparkles,
  Award
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout, setShowAuthModal, setAuthModalMode } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Home', icon: Recycle },
    { id: 'scanner', label: 'AI Scanner', icon: ScanLine },
    { id: 'knowledge', label: 'Disposal Guide', icon: BookOpen },
    { id: 'locator', label: 'Recycling Locator', icon: MapPin },
    { id: 'pickup', label: 'Pickup Scheduler', icon: CalendarClock },
    { id: 'impact', label: 'EcoPoints & Impact', icon: BarChart3 },
    { id: 'history', label: 'History', icon: History, authRequired: true },
    ...(user?.role === 'admin' ? [{ id: 'admin', label: 'Admin Portal', icon: ShieldCheck, adminOnly: true }] : []),
  ];

  const handleNavClick = (id: string, authRequired?: boolean) => {
    if (authRequired && !user) {
      setAuthModalMode('login');
      setShowAuthModal(true);
      return;
    }
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-emerald-100 sticky top-[45px] md:top-[41px] z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button 
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-2.5 group text-left focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition">
              <Recycle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-emerald-950">Eco<span className="text-emerald-600">Sort</span></span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">AI Platform</span>
              </div>
              <p className="text-[10px] text-gray-500 font-medium -mt-0.5">Smart Waste & Circular Recycling</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.authRequired)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs'
                      : 'text-gray-600 hover:text-emerald-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={15} className={isActive ? 'text-emerald-600' : 'text-gray-400'} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User actions */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {/* EcoPoints pill */}
                <button
                  onClick={() => handleNavClick('impact')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-full text-emerald-800 text-xs font-bold shadow-xs hover:border-emerald-300 transition"
                  title="Your verified EcoPoints"
                >
                  <Award size={14} className="text-emerald-600" />
                  <span>{user.total_points ?? 0} pts</span>
                </button>

                {/* Profile menu dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition border border-gray-200"
                    aria-label="User menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                      {user.full_name.charAt(0)}
                    </div>
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-fade-in">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-900 truncate">{user.full_name}</p>
                        <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded bg-emerald-100 text-emerald-800">
                          {user.role}
                        </span>
                      </div>
                      <button
                        onClick={() => { setActiveTab('history'); setProfileDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <History size={14} className="text-gray-400" /> My Waste History
                      </button>
                      <button
                        onClick={() => { setActiveTab('pickup'); setProfileDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <CalendarClock size={14} className="text-gray-400" /> My Pickup Bookings
                      </button>
                      {user.role === 'admin' && (
                        <button
                          onClick={() => { setActiveTab('admin'); setProfileDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs text-purple-700 font-semibold hover:bg-purple-50 flex items-center gap-2"
                        >
                          <ShieldCheck size={14} className="text-purple-600" /> Admin Dashboard
                        </button>
                      )}
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        onClick={() => { logout(); setProfileDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setAuthModalMode('login'); setShowAuthModal(true); }}
                  className="px-3.5 py-2 text-xs font-semibold text-emerald-900 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setAuthModalMode('register'); setShowAuthModal(true); }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm shadow-emerald-700/20 transition flex items-center gap-1.5"
                >
                  <Sparkles size={13} /> Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="lg:hidden flex items-center gap-2">
            {user && (
              <button
                onClick={() => handleNavClick('impact')}
                className="px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-800 text-[11px] font-bold"
              >
                {user.total_points ?? 0} pts
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-5 space-y-1 shadow-lg animate-fade-in">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id, item.authRequired)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-emerald-600' : 'text-gray-400'} />
                {item.label}
              </button>
            );
          })}

          <div className="pt-3 border-t border-gray-100">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-gray-50 rounded-lg">
                  <p className="text-xs font-bold text-gray-900">{user.full_name}</p>
                  <p className="text-[11px] text-gray-500">{user.email}</p>
                </div>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 font-medium hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => { setAuthModalMode('login'); setShowAuthModal(true); setMobileMenuOpen(false); }}
                  className="py-2.5 text-center text-xs font-semibold text-emerald-900 bg-emerald-50 rounded-lg"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setAuthModalMode('register'); setShowAuthModal(true); setMobileMenuOpen(false); }}
                  className="py-2.5 text-center text-xs font-semibold text-white bg-emerald-700 rounded-lg"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
