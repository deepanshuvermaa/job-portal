import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, ClipboardList, User, Bell, Briefcase, Users, BarChart3 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';

interface NavItem {
  path: string;
  icon: React.ElementType;
  labelEn: string;
  labelHi: string;
}

const workerTabs: NavItem[] = [
  { path: '/worker/dashboard', icon: Home, labelEn: 'Home', labelHi: 'होम' },
  { path: '/worker/jobs', icon: Search, labelEn: 'Jobs', labelHi: 'नौकरी' },
  { path: '/worker/applications', icon: ClipboardList, labelEn: 'Applied', labelHi: 'आ���ेदन' },
  { path: '/notifications', icon: Bell, labelEn: 'Alerts', labelHi: 'सूचना' },
  { path: '/worker/profile/edit', icon: User, labelEn: 'Profile', labelHi: 'प्रोफाइल' },
];

const employerTabs: NavItem[] = [
  { path: '/employer/dashboard', icon: Home, labelEn: 'Home', labelHi: 'होम' },
  { path: '/employer/jobs', icon: Briefcase, labelEn: 'Jobs', labelHi: 'नौक��ी' },
  { path: '/employer/post-job', icon: ClipboardList, labelEn: 'Post', labelHi: 'पोस्ट' },
  { path: '/employer/browse-workers', icon: Users, labelEn: 'Workers', labelHi: 'कामगार' },
  { path: '/employer/profile', icon: User, labelEn: 'Profile', labelHi: 'प्रोफाइल' },
];

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const { language } = useAppStore();

  // Don't show on auth pages, landing page, admin pages, or when not authenticated
  const hiddenPaths = ['/', '/auth', '/admin', '/employer/signup', '/worker/signup', '/employer/verification-pending'];
  const shouldHide = !isAuthenticated || !user ||
    hiddenPaths.some(p => location.pathname === p || (p !== '/' && location.pathname.startsWith(p)));

  if (shouldHide) return null;

  const tabs = user?.role === 'employer' ? employerTabs : workerTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path ||
            (tab.path !== '/worker/dashboard' && tab.path !== '/employer/dashboard' && location.pathname.startsWith(tab.path));
          const Icon = tab.icon;

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full min-w-[64px] transition-colors ${
                isActive
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
  );
};
