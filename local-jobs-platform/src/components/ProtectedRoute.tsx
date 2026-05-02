import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  role?: 'worker' | 'employer' | 'admin';
}

const getDashboardForRole = (role: string) => {
  switch (role) {
    case 'worker': return '/worker/dashboard';
    case 'employer': return '/employer/dashboard';
    case 'admin': return '/admin/dashboard';
    default: return '/auth/phone';
  }
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role }) => {
  const { isAuthenticated, user, loading, token } = useAuthStore();

  if (loading || (token && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/phone" replace />;
  }

  // If user has wrong role, redirect to their correct dashboard (not back to auth)
  if (role && user.role !== role) {
    return <Navigate to={getDashboardForRole(user.role)} replace />;
  }

  return <Outlet />;
};
