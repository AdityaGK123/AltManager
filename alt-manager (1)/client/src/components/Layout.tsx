import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Target, LogOut, Menu, X, BarChart3, FileText } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: MessageSquare, label: 'Chat', path: '/chat' },
    { icon: FileText, label: 'MoMs', path: '/moms' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Target, label: 'Moments', path: '/moments' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 shadow-sm flex-shrink-0 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section - HiPo Brand Integration */}
            <div className="flex items-center space-x-4">
              {/* HiPo Logo - Original PNG with proper clear space (5% width, 20% length) */}
              <div className="flex items-center py-2">
                <img 
                  src="/hipo-logo.png" 
                  alt="HiPo - High Potential Career Assessment" 
                  className="hipo-logo h-8 w-auto sm:h-10 md:h-12 transition-all duration-200"
                  style={{ 
                    padding: '2px 8px',
                    minWidth: '80px'
                  }}
                />
              </div>
              {/* Divider */}
              <div className="hidden sm:block h-8 w-px bg-slate-200"></div>
              {/* ALT Manager Text */}
              <div className="hidden sm:flex flex-col justify-center">
                <h1 className="text-lg md:text-xl font-montserrat font-bold text-slate-900 leading-tight">
                  ALT Manager
                </h1>
                <p className="text-xs font-karla text-slate-500">Powered by HiPo</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-indigo-600/80 text-white font-semibold shadow-md'
                      : 'text-slate-600 hover:bg-indigo-50/50 hover:text-indigo-600'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center space-x-2 text-slate-600 hover:text-red-600 transition-colors"
              >
                <LogOut size={20} />
              </button>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <nav className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Footer - Desktop Only */}
      <footer className="hidden md:block bg-hipo-blue text-white border-t border-slate-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* HiPo Logo - All-white version for Royal Blue background */}
            <div className="flex items-center space-x-4">
              <img 
                src="/hipo-logo.png" 
                alt="HiPo" 
                className="hipo-logo h-10 w-auto"
                style={{ 
                  padding: '2px 8px',
                  filter: 'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)'
                }}
              />
              <div className="flex flex-col">
                <span className="font-montserrat font-bold text-sm">HiPo</span>
                <span className="font-karla text-xs text-white/80">High Potential Career Assessment</span>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="font-karla text-sm text-white/90">
                © {new Date().getFullYear()} HiPo. All rights reserved.
              </p>
              <p className="font-karla text-xs text-white/70 mt-1">
                Empowering GenZ professionals to reach their potential
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden flex-shrink-0 bg-white border-t border-slate-200 shadow-lg z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
                isActive(item.path)
                  ? 'text-hipo-blue'
                  : 'text-slate-400'
              }`}
            >
              <item.icon size={24} />
              <span className="text-xs mt-1 font-karla">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
