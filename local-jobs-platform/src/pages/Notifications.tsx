import React, { useEffect, useState } from 'react';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../services/notifications';

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getNotifications();
      setNotifications(data || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (notificationId: string) => {
    await markNotificationRead(notificationId);
    await loadNotifications();
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    await loadNotifications();
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <Button variant="outline" onClick={handleMarkAll}>Mark all read</Button>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="text-gray-500">No notifications yet.</p>
        ) : (
          <div className="grid gap-4">
            {notifications.map((notification) => (
              <Card key={notification.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-gray-900">{notification.title}</h2>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                  </div>
                  {!notification.is_read && (
                    <Button variant="ghost" onClick={() => handleMarkRead(notification.id)}>
                      Mark read
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
