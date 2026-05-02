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
  const { login, setPendingPhone, setPendingFirebaseToken, setToken, isAuthenticated, user } = useAuthStore();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('✅ User already authenticated, redirecting to dashboard');
      if (user.role === 'employer') {
        navigate('/employer/dashboard', { replace: true });
      } else if (user.role === 'worker') {
        navigate('/worker/dashboard', { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Initialize reCAPTCHA on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      initializeRecaptcha('recaptcha-container');
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // WebOTP API — auto-read OTP on Android
  useEffect(() => {
    if (step !== 'otp') return;

    let abortController: AbortController | null = null;

    const tryWebOTP = async () => {
      if ('OTPCredential' in window) {
        try {
          abortController = new AbortController();
          const content = await (navigator as any).credentials.get({
            otp: { transport: ['sms'] },
            signal: abortController.signal,
          });
          if (content?.code) {
            setOtp(content.code);
          }
        } catch (e) {
          // WebOTP not supported or user cancelled — silent fail
        }
      }
    };

    tryWebOTP();

    return () => {
      abortController?.abort();
    };
  }, [step]);

  // Resend countdown timer
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

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
      setOtpCountdown(30);
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
      const response = await api.post('/api/firebase-auth/verify', {
        firebaseToken
      });

      console.log('Backend response:', response.data);

      // 3. Handle response
      if (response.data.data.isNewUser) {
        console.log('New user - navigating to role select');
        setPendingPhone(phone);
        setPendingFirebaseToken(firebaseToken);
        navigate('/auth/role-select', { replace: true });
      } else {
        console.log('Existing user - logging in');
        const userData = response.data.data;
        setToken(userData.tokens.accessToken, userData.tokens.refreshToken);
        login(userData.user, userData.tokens.accessToken, userData.tokens.refreshToken);

        if (userData.user.role === 'employer') {
          navigate('/employer/dashboard', { replace: true });
        } else if (userData.user.role === 'worker') {
          navigate('/worker/dashboard', { replace: true });
        } else {
          navigate('/admin/dashboard', { replace: true });
        }
      }
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError(err.response?.data?.message || err.message || t('auth.invalidOTP'));
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
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 min-h-[48px] min-w-[48px]"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          <span className="text-base font-medium">{t('common.back')}</span>
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-4">
            <Phone className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {step === 'phone' ? t('auth.enterPhone') : t('auth.enterOTP')}
          </h1>
          <p className="text-base text-gray-500">
            {step === 'phone'
              ? (language === 'hi' ? 'अपना फ़ोन नंबर डालें' : 'Enter your phone number to continue')
              : (language === 'hi' ? 'SMS में आया OTP डालें' : 'Enter the OTP sent to your phone')}
          </p>
        </div>

        {step === 'phone' ? (
          <div className="space-y-6">
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                {language === 'hi' ? 'फ़ोन नंबर' : 'Phone Number'}
              </label>
              <div className="flex items-center border-2 border-gray-300 rounded-xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
                <span className="pl-4 pr-2 text-lg font-semibold text-gray-600">+91</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                  className="flex-1 py-4 pr-4 text-xl font-medium bg-transparent outline-none"
                />
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleSendOtp}
              loading={loading}
            >
              <span className="text-lg font-semibold">
                {language === 'hi' ? 'OTP भेजें' : 'Send OTP'}
              </span>
            </Button>

            <div className="text-center text-base text-gray-500">
              <p>{language === 'hi' ? 'SMS से OTP आएगा' : 'OTP will be sent via SMS'}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center text-base text-gray-600 bg-blue-50 rounded-xl p-3 mb-4">
              <p>{language === 'hi' ? `${phone} पर OTP भेजा गया` : `OTP sent to: +91 ${phone}`}</p>
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                {language === 'hi' ? 'OTP डालें' : 'Enter OTP'}
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="w-full py-4 px-4 text-2xl font-bold text-center tracking-[0.5em] border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleVerifyOtp}
              loading={loading}
            >
              <span className="text-lg font-semibold">
                {language === 'hi' ? 'OTP सत्यापित करें' : 'Verify OTP'}
              </span>
            </Button>

            <button
              onClick={handleSendOtp}
              disabled={otpCountdown > 0}
              className={`w-full text-center text-base font-medium min-h-[48px] flex items-center justify-center ${
                otpCountdown > 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-primary-600 hover:text-primary-700'
              }`}
            >
              {otpCountdown > 0
                ? (language === 'hi' ? `${otpCountdown}s में दोबारा भेजें` : `Resend in ${otpCountdown}s`)
                : (language === 'hi' ? 'OTP दोबारा भेजें' : 'Resend OTP')}
            </button>
          </div>
        )}
      </Card>
    </div>
  );
};
