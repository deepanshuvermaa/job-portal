import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../utils/translations';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { Card } from '../components/shared/Card';
import { Phone, Lock, ArrowLeft } from 'lucide-react';
import { isValidPhone } from '../utils/helpers';
import { api } from '../services/api';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const { login, setToken } = useAuthStore();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');

    if (!isValidPhone(phone)) {
      setError(t('auth.invalidPhone'));
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', {
        phone,
        password
      });

      setToken(data.tokens.accessToken, data.tokens.refreshToken);
      login(data.user, data.tokens.accessToken, data.tokens.refreshToken);

      // Navigate based on role
      if (data.user.role === 'employer') {
        navigate('/employer/dashboard');
      } else if (data.user.role === 'worker') {
        navigate('/worker/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Invalid phone or password');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-primary-100">
      <Card className="max-w-md w-full">
        <button
          onClick={() => navigate('/')}
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
            {language === 'en' ? 'Welcome Back' : 'वापसी पर स्वागत है'}
          </h1>
          <p className="text-gray-600">
            {language === 'en' ? 'Login to your account' : 'अपने खाते में लॉगिन करें'}
          </p>
        </div>

        <div className="space-y-6">
          <Input
            type="tel"
            label={t('auth.phoneLabel')}
            placeholder="9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            maxLength={10}
            error={error && !password ? error : ''}
            required
            icon={<Phone className="w-5 h-5" />}
            onKeyPress={handleKeyPress}
          />

          <Input
            type="password"
            label={language === 'en' ? 'Password' : 'पासवर्ड'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error && password ? error : ''}
            required
            icon={<Lock className="w-5 h-5" />}
            onKeyPress={handleKeyPress}
          />

          <div className="flex items-center justify-between">
            <Link
              to="/auth/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              {language === 'en' ? 'Forgot Password?' : 'पासवर्ड भूल गए?'}
            </Link>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleLogin}
            loading={loading}
          >
            {language === 'en' ? 'Login' : 'लॉगिन करें'}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {language === 'en' ? "Don't have an account?" : 'खाता नहीं है?'}{' '}
              <Link
                to="/auth/phone"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                {language === 'en' ? 'Sign up with OTP' : 'OTP से साइन अप करें'}
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
