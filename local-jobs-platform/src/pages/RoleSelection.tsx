import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../utils/translations';
import { Card } from '../components/shared/Card';
import { Briefcase, UserCircle, ArrowLeft } from 'lucide-react';

export const RoleSelection: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const { pendingPhone, isAuthenticated, user } = useAuthStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('✅ User already has role, redirecting to dashboard');
      if (user.role === 'employer') {
        navigate('/employer/dashboard', { replace: true });
      } else if (user.role === 'worker') {
        navigate('/worker/dashboard', { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      }
      return;
    }

    // Redirect to phone auth if no pending phone
    if (!pendingPhone) {
      navigate('/auth/phone', { replace: true });
    }
  }, [pendingPhone, isAuthenticated, user, navigate]);

  const handleRoleSelect = (role: 'employer' | 'worker') => {
    if (role === 'employer') {
      navigate('/employer/signup', { replace: true });
    } else {
      navigate('/worker/signup', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-primary-100">
      <Card className="max-w-md w-full">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 min-h-[48px] min-w-[48px]"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          <span className="text-base font-medium">{t('common.back')}</span>
        </button>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {language === 'hi' ? 'आप कौन हैं?' : 'Who are you?'}
          </h1>
          <p className="text-base text-gray-500">
            {language === 'hi' ? 'अपनी भूमिका चुनें' : 'Select your role to continue'}
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleRoleSelect('employer')}
            className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group active:scale-[0.98] min-h-[96px]"
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200">
                <Briefcase className="w-8 h-8 text-primary-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {language === 'hi' ? 'नियोक्ता / Employer' : 'Employer'}
                </h3>
                <p className="text-base text-gray-600">
                  {language === 'hi'
                    ? 'अपने बिजनेस के लिए वर्कर ढूंढें'
                    : 'Find workers for your business'}
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleRoleSelect('worker')}
            className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group active:scale-[0.98] min-h-[96px]"
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200">
                <UserCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {language === 'hi' ? 'कामगार / Worker' : 'Worker'}
                </h3>
                <p className="text-base text-gray-600">
                  {language === 'hi'
                    ? 'अपने पास की जॉब ढूंढें'
                    : 'Find jobs near you'}
                </p>
              </div>
            </div>
          </button>
        </div>
      </Card>
    </div>
  );
};
