import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';

export const VerificationPending: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Pending</h1>
        <p className="text-gray-600 mb-6">
          Your profile is under review. We will notify you once verification is complete.
        </p>
        <Link to="/notifications">
          <Button variant="primary" fullWidth>View Notifications</Button>
        </Link>
      </Card>
    </div>
  );
};
