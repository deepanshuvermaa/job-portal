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
  const { pendingPhone } = useAuthStore();

  useEffect(() => {
    if (!pendingPhone) {
      navigate('/auth/phone');
    }
  }, [pendingPhone, navigate]);

  const handleRoleSelect = (role: 'employer' | 'worker') => {
    if (role === 'employer') {
      navigate('/employer/signup');
    } else {
      navigate('/worker/signup');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-primary-100">
      <Card className="max-w-md w-full">
        <button
          onClick={() => navigate('/auth/phone')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t('common.back')}
        </button>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('auth.selectRole')}
          </h1>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleRoleSelect('employer')}
            className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200">
                <Briefcase className="w-8 h-8 text-primary-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {t('auth.roleEmployer')}
                </h3>
                <p className="text-sm text-gray-600">
                  {language === 'hi'
                    ? '?\u0906\u092a\u0928\u0947 \u092c\u093f\u091c\u0928\u0947\u0938 \u0915\u0947 \u0932\u093f\u090f \u0935\u0930\u094d\u0915\u0930 \u0922\u0942\u0902\u0922\u0947\u0902'
                    : 'Find workers for your business'}
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleRoleSelect('worker')}
            className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200">
                <UserCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {t('auth.roleWorker')}
                </h3>
                <p className="text-sm text-gray-600">
                  {language === 'hi'
                    ? '?\u0906\u092a\u0928\u0947 \u092a\u093e\u0938 \u0915\u0940 \u091c\u0949\u092c \u0922\u0942\u0902\u0922\u0947\u0902'
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
