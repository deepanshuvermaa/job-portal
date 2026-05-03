import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, ClipboardList, User, Bell, Briefcase, Users, LogOut, Settings } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';

interface NavItem {
  path: string;
  icon: React.ElementType;
  labelEn: string;
  labelHi: string;
  action?: 'logout';
}

const workerTabs: NavItem[] = [
  { path: '/worker/dashboard', icon: Home, labelEn: 'Home', labelHi: 'होम' },
  { path: '/worker/jobs', icon: Search, labelEn: 'Jobs', labelHi: 'नौकरी' },
  { path: '/worker/applications', icon: ClipboardList, labelEn: 'Applied', labelHi: 'आवेदन' },
  { path: '/notifications', icon: Bell, labelEn: 'Alerts', labelHi: 'सूचना' },
  { path: '/worker/profile/edit', icon: User, labelEn: 'Profile', labelHi: 'प्रोफाइल' },
];

const employerTabs: NavItem[] = [
  { path: '/employer/dashboard', icon: Home, labelEn: 'Home', labelHi: 'होम' },
  { path: '/employer/jobs', icon: Briefcase, labelEn: 'Jobs', labelHi: 'नौकरी' },
  { path: '/employer/post-job', icon: ClipboardList, labelEn: 'Post', labelHi: 'पोस्ट' },
  { path: '/employer/browse-workers', icon: Users, labelEn: 'Workers', labelHi: 'कामगार' },
  { path: '/employer/profile', icon: User, labelEn: 'Profile', labelHi: 'प्रोफाइल' },
];

const adminTabs: NavItem[] = [
  { path: '/admin/dashboard', icon: Home, labelEn: 'Home', labelHi: 'होम' },
  { path: '/admin/jobs', icon: Briefcase, labelEn: 'Jobs', labelHi: 'नौकरी' },
  { path: '/admin/connections', icon: Users, labelEn: 'Connects', labelHi: 'कनेक्शन' },
  { path: '/admin/reports', icon: Settings, labelEn: 'Reports', labelHi: 'रिपोर्ट' },
  { path: '', icon: LogOut, labelEn: 'Logout', labelHi: 'लॉगआउट', action: 'logout' },
];

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { language } = useAppStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Don't show on auth pages, landing page, or when not authenticated
  const hiddenPaths = ['/', '/auth', '/employer/signup', '/worker/signup', '/employer/verification-pending'];
  const shouldHide = !isAuthenticated || !user ||
    hiddenPaths.some(p => location.pathname === p || (p !== '/' && location.pathname.startsWith(p)));

  if (shouldHide) return null;

  const getTabs = () => {
    if (user?.role === 'admin') return adminTabs;
    if (user?.role === 'employer') return employerTabs;
    return workerTabs;
  };

  const tabs = getTabs();

  const handleTabClick = (tab: NavItem) => {
    if (tab.action === 'logout') {
      setShowLogoutConfirm(true);
      return;
    }
    navigate(tab.path);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/', { replace: true });
  };

  return (
    <>
      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {language === 'hi' ? 'लॉगआउट करें?' : 'Logout?'}
            </h3>
            <p className="text-gray-600 mb-6">
              {language === 'hi'
                ? 'क्या आप वाकई लॉगआउट करना चाहते हैं?'
                : 'Are you sure you want to logout?'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-semibold text-base min-h-[48px]"
              >
                {language === 'hi' ? 'रहने दें' : 'Cancel'}
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-semibold text-base min-h-[48px]"
              >
                {language === 'hi' ? 'लॉगआउट' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg safe-area-bottom">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {tabs.map((tab, index) => {
            const isActive = !tab.action && (
              location.pathname === tab.path ||
              (tab.path !== '/worker/dashboard' && tab.path !== '/employer/dashboard' && tab.path !== '/admin/dashboard' && tab.path !== '' && location.pathname.startsWith(tab.path))
            );
            const Icon = tab.icon;
            const isLogout = tab.action === 'logout';

            return (
              <button
                key={tab.path || `action-${index}`}
                onClick={() => handleTabClick(tab)}
                className={`flex flex-col items-center justify-center flex-1 h-full min-w-[64px] transition-colors ${
                  isLogout
                    ? 'text-red-500 active:text-red-700'
                    : isActive
                      ? 'text-blue-600'
                      : 'text-gray-500 active:text-gray-700'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
                <span className={`text-[11px] mt-0.5 leading-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {language === 'hi' ? tab.labelHi : tab.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
