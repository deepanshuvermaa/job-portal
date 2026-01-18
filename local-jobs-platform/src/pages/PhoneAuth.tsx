import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../utils/translations';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { Card } from '../components/shared/Card';
import { Phone, ArrowLeft } from 'lucide-react';
import { isValidPhone } from '../utils/helpers';
import { sendFirebaseOTP, verifyFirebaseOTP, initializeRecaptcha } from '../services/firebase-auth';
import { api } from '../services/api';

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

  // Initialize reCAPTCHA on mount
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initializeRecaptcha('recaptcha-container');
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleSendOtp = async () => {
    setError('');

    if (!isValidPhone(phone)) {
      setError(t('auth.invalidPhone'));
      return;
    }

    setLoading(true);
    try {
      // Send OTP via Firebase
      await sendFirebaseOTP(phone);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');

    if (otp.length !== 6) {
      setError(t('auth.invalidOTP'));
      return;
    }

    setLoading(true);
    try {
      // 1. Verify OTP with Firebase and get ID token
      const firebaseToken = await verifyFirebaseOTP(otp);

      // 2. Send Firebase token to backend for verification and user creation/login
      const { data } = await api.post('/api/firebase-auth/verify', {
        firebaseToken
      });

      // 3. Handle response
      if (data.isNewUser) {
        setPendingPhone(phone);
        navigate('/auth/role-select');
      } else {
        setToken(data.tokens.accessToken, data.tokens.refreshToken);
        login(data.user, data.tokens.accessToken, data.tokens.refreshToken);

        if (data.user.role === 'employer') {
          navigate('/employer/dashboard');
        } else if (data.user.role === 'worker') {
          navigate('/worker/dashboard');
        } else {
          navigate('/admin/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || t('auth.invalidOTP'));
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
      <div id="recaptcha-container"></div>
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
              <p>OTP will be sent via SMS</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center text-sm text-gray-600 mb-4">
              <p>OTP sent to: {phone}</p>
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
