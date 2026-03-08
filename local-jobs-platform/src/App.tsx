import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
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

const App: React.FC = () => {
  const { token, user, loading, setLoading, setUser } = useAuthStore();

  useEffect(() => {
    let active = true;

    const hydrateUser = async () => {
      if (!token || user || loading) return;
      setLoading(true);
      try {
        const currentUser = await loadCurrentUser();
        if (active) {
          setUser(currentUser);
        }
      } catch (error) {
        if (active) {
          setUser(null);
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
  }, [token, user, loading, setLoading, setUser]);

  return (
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
  );
};

export default App;
