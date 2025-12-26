import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-gray-600 mb-6">Page not found.</p>
        <Link to="/">
          <Button variant="primary" fullWidth>Go Home</Button>
        </Link>
      </Card>
    </div>
  );
};
