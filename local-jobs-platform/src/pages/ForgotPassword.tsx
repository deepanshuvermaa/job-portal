import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { useTranslation } from '../utils/translations';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { Card } from '../components/shared/Card';
import { Phone, Lock, ArrowLeft, KeyRound } from 'lucide-react';
import { isValidPhone } from '../utils/helpers';
import { api } from '../services/api';
import { sendOtp } from '../services/auth';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const { t } = useTranslation(language);

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'password'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    setError('');

    if (!isValidPhone(phone)) {
      setError(t('auth.invalidPhone'));
      return;
    }

    setLoading(true);
    try {
      await sendOtp(phone, 'password_reset');
      setStep('otp');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to send OTP');
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

    setStep('password');
  };

  const handleResetPassword = async () => {
    setError('');

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', {
        phone,
        otp,
        newPassword
      });

      alert(language === 'en'
        ? 'Password reset successfully! Please login with your new password.'
        : 'पासवर्ड सफलतापूर्वक रीसेट हो गया! कृपया अपने नए पासवर्ड के साथ लॉगिन करें।'
      );
      navigate('/auth/login');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'password') {
      setStep('otp');
    } else if (step === 'otp') {
      setStep('phone');
    } else {
      navigate('/auth/login');
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
            <KeyRound className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {language === 'en' ? 'Reset Password' : 'पासवर्ड रीसेट करें'}
          </h1>
          <p className="text-gray-600">
            {step === 'phone' && (language === 'en' ? 'Enter your phone number' : 'अपना फोन नंबर दर्ज करें')}
            {step === 'otp' && (language === 'en' ? 'Enter OTP sent to your phone' : 'अपने फोन पर भेजा गया OTP दर्ज करें')}
            {step === 'password' && (language === 'en' ? 'Create a new password' : 'नया पासवर्ड बनाएं')}
          </p>
        </div>

        {step === 'phone' && (
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
              icon={<Phone className="w-5 h-5" />}
            />

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleSendOtp}
              loading={loading}
            >
              {language === 'en' ? 'Send OTP' : 'OTP भेजें'}
            </Button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-6">
            <div className="text-center text-sm text-gray-600 mb-4">
              <p>{language === 'en' ? 'OTP sent to:' : 'OTP भेजा गया:'} {phone}</p>
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
              {language === 'en' ? 'Verify OTP' : 'OTP सत्यापित करें'}
            </Button>

            <button
              onClick={handleSendOtp}
              className="w-full text-center text-sm text-primary-600 hover:text-primary-700"
            >
              {t('auth.resendOTP')}
            </button>
          </div>
        )}

        {step === 'password' && (
          <div className="space-y-6">
            <Input
              type="password"
              label={language === 'en' ? 'New Password' : 'नया पासवर्ड'}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={error && !confirmPassword ? error : ''}
              required
              icon={<Lock className="w-5 h-5" />}
            />

            <Input
              type="password"
              label={language === 'en' ? 'Confirm Password' : 'पासवर्ड की पुष्टि करें'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={error && confirmPassword ? error : ''}
              required
              icon={<Lock className="w-5 h-5" />}
            />

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleResetPassword}
              loading={loading}
            >
              {language === 'en' ? 'Reset Password' : 'पासवर्ड रीसेट करें'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
