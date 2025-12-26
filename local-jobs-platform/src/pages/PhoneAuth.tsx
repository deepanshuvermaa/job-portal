import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../utils/translations';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { Card } from '../components/shared/Card';
import { Phone, ArrowLeft } from 'lucide-react';
import { isValidPhone } from '../utils/helpers';
import { sendOtp, verifyOtp } from '../services/auth';
import { MOCK_MODE } from '../services/api';
import { MOCK_OTP_CODE } from '../services/mockStore';

export const PhoneAuth: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const { login, setPendingPhone, setToken } = useAuthStore();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const handleSendOtp = async () => {
    setError('');

    if (!isValidPhone(phone)) {
      setError(t('auth.invalidPhone'));
      return;
    }

    setLoading(true);
    try {
      // In MOCK_MODE, show OTP immediately without backend call
      if (MOCK_MODE) {
        setDevOtp(MOCK_OTP_CODE);
        setStep('otp');
        setLoading(false);
        return;
      }

      const response = await sendOtp(phone, 'registration');
      // Store OTP if returned in dev mode
      if (response?.otp) {
        setDevOtp(response.otp);
      }
      setStep('otp');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');

    // In MOCK_MODE, still call verifyOtp to check if user exists
    if (MOCK_MODE) {
      setLoading(true);
      try {
        const result = await verifyOtp(phone, otp, 'registration');

        if (result.signupRequired) {
          setPendingPhone(phone);
          navigate('/auth/role-select');
          return;
        }

        if (result.tokens?.accessToken && result.user) {
          setToken(result.tokens.accessToken, result.tokens.refreshToken);
          login(result.user, result.tokens.accessToken, result.tokens.refreshToken);

          if (result.user.role === 'employer') {
            navigate('/employer/dashboard');
          } else if (result.user.role === 'worker') {
            navigate('/worker/dashboard');
          } else {
            navigate('/admin/dashboard');
          }
        }
      } catch (err: any) {
        setError(err?.response?.data?.error || t('auth.invalidOTP'));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (otp.length !== 6) {
      setError(t('auth.invalidOTP'));
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOtp(phone, otp, 'registration');

      if (result.signupRequired) {
        setPendingPhone(phone);
        navigate('/auth/role-select');
        return;
      }

      if (result.tokens?.accessToken && result.user) {
        setToken(result.tokens.accessToken, result.tokens.refreshToken);
        login(result.user, result.tokens.accessToken, result.tokens.refreshToken);

        if (result.user.role === 'employer') {
          navigate('/employer/dashboard');
        } else if (result.user.role === 'worker') {
          navigate('/worker/dashboard');
        } else {
          navigate('/admin/dashboard');
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || t('auth.invalidOTP'));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('phone');
      setOtp('');
      setError('');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-primary-100">
      <Card className="max-w-md w-full">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t('common.back')}
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Phone className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {step === 'phone' ? t('auth.enterPhone') : t('auth.enterOTP')}
          </h1>
        </div>

        {step === 'phone' ? (
          <div className="space-y-6">
            <Input
              type="tel"
              label={t('auth.phoneLabel')}
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              maxLength={10}
              error={error}
              required
            />

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleSendOtp}
              loading={loading}
            >
              {t('auth.sendOTP')}
            </Button>

            <div className="text-center text-sm text-gray-500">
              <p>{MOCK_MODE ? `Mock OTP: ${MOCK_OTP_CODE}` : 'OTP will be sent via SMS'}</p>
              {!MOCK_MODE && <p className="text-xs mt-1">In dev, check server logs</p>}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center text-sm text-gray-600 mb-4">
              <p>OTP sent to: {phone}</p>
              {(MOCK_MODE || devOtp) && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-semibold">Development OTP: {MOCK_MODE ? MOCK_OTP_CODE : devOtp}</p>
                  <p className="text-xs text-green-600 mt-1">Use this OTP for testing</p>
                </div>
              )}
            </div>

            <Input
              type="text"
              label={t('auth.otpLabel')}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              error={error}
              required
            />

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleVerifyOtp}
              loading={loading}
            >
              {t('auth.verifyOTP')}
            </Button>

            <button
              onClick={handleSendOtp}
              className="w-full text-center text-sm text-primary-600 hover:text-primary-700"
            >
              {t('auth.resendOTP')}
            </button>
          </div>
        )}
      </Card>
    </div>
  );
};
