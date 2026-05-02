import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { loadCurrentUser } from './services/auth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LanguageSelection } from './pages/LanguageSelection';
import { PhoneAuth } from './pages/PhoneAuth';
import { RoleSelection } from './pages/RoleSelection';
import { EmployerSignup } from './pages/EmployerSignup';
import { WorkerSignup } from './pages/WorkerSignup';
import { EmployerDashboard } from './pages/EmployerDashboard';
import { WorkerDashboard } from './pages/WorkerDashboard';
import { VerificationPending } from './pages/VerificationPending';
import { JobFeed } from './pages/JobFeed';
import { JobDetails } from './pages/JobDetails';
import { PostJob } from './pages/PostJob';
import { EmployerJobs } from './pages/EmployerJobs';
import { EmployerJobApplications } from './pages/EmployerJobApplications';
import { WorkerApplications } from './pages/WorkerApplications';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminLogin } from './pages/AdminLogin';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { Notifications } from './pages/Notifications';
import { NotFound } from './pages/NotFound';
import { EmployerProfile } from './pages/EmployerProfile';
import { WorkerProfileEdit } from './pages/WorkerProfileEdit';
import { EmployerProfileEdit } from './pages/EmployerProfileEdit';
import { SavedJobs } from './pages/SavedJobs';
import { JobTemplates } from './pages/JobTemplates';
import { ReferralDashboard } from './pages/ReferralDashboard';
import { JobAnalytics } from './pages/JobAnalytics';
import { PublicEmployerPage } from './pages/PublicEmployerPage';
import { PublicWorkerProfile } from './pages/PublicWorkerProfile';
import { ReportJob } from './pages/ReportJob';
import { ReportUser } from './pages/ReportUser';
import { MyReports } from './pages/MyReports';
import { AdminReports } from './pages/AdminReports';
import { AdminAllJobs } from './pages/AdminAllJobs';
import { JobAlerts } from './pages/JobAlerts';
import { BrowseWorkers } from './pages/BrowseWorkers';
import { AdminConnections } from './pages/AdminConnections';
import { BottomNav } from './components/BottomNav';

const App: React.FC = () => {
  const { token, user, loading, setLoading, setUser, logout } = useAuthStore();

  // Track last validation time to avoid excessive API calls
  const lastValidationRef = React.useRef<number>(0);
  const validationIntervalRef = React.useRef<number | null>(null);

  const validateSession = async (force = false) => {
    const now = Date.now();
    const timeSinceLastValidation = now - lastValidationRef.current;

    // Skip if validated within last 2 minutes (unless forced)
    if (!force && timeSinceLastValidation < 2 * 60 * 1000) {
      return;
    }

    if (!token) return;

    try {
      console.log('🔍 Validating session...');
      const currentUser = await loadCurrentUser();
      setUser(currentUser);
      lastValidationRef.current = now;
      console.log('✅ Session valid');
    } catch (error: any) {
      console.error('❌ Session validation failed:', error);
      // Only logout if it's not a network error (allow temporary network issues)
      if (error?.response?.status === 401) {
        console.log('🚪 Session expired, logging out');
        logout();
      }
    }
  };

  // Initial hydration - validate user on app load
  useEffect(() => {
    let active = true;

    const hydrateUser = async () => {
      if (!token) return;

      // If we already have a user and validated recently, skip
      if (user && (Date.now() - lastValidationRef.current < 5 * 60 * 1000)) {
        return;
      }

      setLoading(true);
      try {
        console.log('💧 Hydrating user session...');
        const currentUser = await loadCurrentUser();
        if (active) {
          setUser(currentUser);
          lastValidationRef.current = Date.now();
          console.log('✅ User hydrated:', currentUser.role);
        }
      } catch (error: any) {
        console.error('❌ Hydration failed:', error);
        if (active) {
          // Only clear session on 401, not on network errors
          if (error?.response?.status === 401) {
            setUser(null);
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    hydrateUser();

    return () => {
      active = false;
    };
  }, [token, setLoading, setUser]);

  // Periodic validation - check session every 5 minutes
  useEffect(() => {
    if (!token || !user) return;

    console.log('⏰ Setting up periodic session validation (every 5 minutes)');

    validationIntervalRef.current = setInterval(() => {
      validateSession();
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      if (validationIntervalRef.current) {
        clearInterval(validationIntervalRef.current);
        validationIntervalRef.current = null;
      }
    };
  }, [token, user]);

  // Visibility change listener - re-validate when user returns to tab
  useEffect(() => {
    if (!token || !user) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Tab became visible, validating session');
        validateSession(true); // Force validation when returning to tab
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [token, user]);

  // Online/offline listener - re-validate when connection restored
  useEffect(() => {
    if (!token || !user) return;

    const handleOnline = () => {
      console.log('🌐 Connection restored, validating session');
      validateSession(true);
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [token, user]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
      <Route path="/language" element={<LanguageSelection />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/phone" element={<PhoneAuth />} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/role-select" element={<RoleSelection />} />

      <Route path="/employer/signup" element={<EmployerSignup />} />
      <Route path="/employer/verification-pending" element={<VerificationPending />} />

      <Route element={<ProtectedRoute role="employer" />}>
        <Route path="/employer/dashboard" element={<EmployerDashboard />} />
        <Route path="/employer/profile" element={<EmployerProfile />} />
        <Route path="/employer/profile/edit" element={<EmployerProfileEdit />} />
        <Route path="/employer/jobs" element={<EmployerJobs />} />
        <Route path="/employer/jobs/:jobId/applications" element={<EmployerJobApplications />} />
        <Route path="/employer/jobs/:jobId/analytics" element={<JobAnalytics />} />
        <Route path="/employer/post-job" element={<PostJob />} />
        <Route path="/employer/browse-workers" element={<BrowseWorkers />} />
        <Route path="/employer/templates" element={<JobTemplates />} />
        <Route path="/employer/referrals" element={<ReferralDashboard />} />
        <Route path="/employer/workers/:workerId" element={<PublicWorkerProfile />} />
      </Route>

      <Route path="/worker/signup" element={<WorkerSignup />} />

      <Route element={<ProtectedRoute role="worker" />}>
        <Route path="/worker/dashboard" element={<WorkerDashboard />} />
        <Route path="/worker/profile/edit" element={<WorkerProfileEdit />} />
        <Route path="/worker/jobs" element={<JobFeed />} />
        <Route path="/worker/jobs/:jobId" element={<JobDetails />} />
        <Route path="/worker/applications" element={<WorkerApplications />} />
        <Route path="/worker/saved-jobs" element={<SavedJobs />} />
        <Route path="/worker/job-alerts" element={<JobAlerts />} />
        <Route path="/worker/referrals" element={<ReferralDashboard />} />
        <Route path="/worker/employers/:employerId" element={<PublicEmployerPage />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/jobs" element={<AdminAllJobs />} />
        <Route path="/admin/connections" element={<AdminConnections />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/reports" element={<MyReports />} />
        <Route path="/report/job/:jobId" element={<ReportJob />} />
        <Route path="/report/user/:userId" element={<ReportUser />} />
      </Route>

      <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNav />
    </>
  );
};

export default App;
