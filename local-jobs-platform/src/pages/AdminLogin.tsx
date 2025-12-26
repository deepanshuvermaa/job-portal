import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { adminLogin } from '../services/auth';
import { useAuthStore } from '../store/authStore';
import { MOCK_MODE } from '../services/api';
import { MOCK_ADMIN_PASSWORD } from '../services/mockStore';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, setToken } = useAuthStore();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminLogin(password);
      if (response?.tokens?.accessToken && response?.user) {
        setToken(response.tokens.accessToken, response.tokens.refreshToken);
        login(response.user, response.tokens.accessToken, response.tokens.refreshToken);
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Login</h1>
        {error && (
          <div className="mb-3 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}
        <Input
          type="password"
          label="Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter admin password"
        />
        {MOCK_MODE && (
          <p className="mt-2 text-xs text-gray-500">
            Mock admin password: {MOCK_ADMIN_PASSWORD}
          </p>
        )}
        <div className="mt-4">
          <Button variant="primary" fullWidth onClick={handleLogin} loading={loading}>
            Login
          </Button>
        </div>
      </Card>
    </div>
  );
};
