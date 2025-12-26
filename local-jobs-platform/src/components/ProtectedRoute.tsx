import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  role?: 'worker' | 'employer' | 'admin';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role }) => {
  const { isAuthenticated, user, loading, token } = useAuthStore();

  if (loading || (token && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/phone" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/auth/phone" replace />;
  }

  return <Outlet />;
};
