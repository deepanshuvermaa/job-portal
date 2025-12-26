import { api, MOCK_MODE } from './api';
import { mockGetNotifications, mockMarkNotificationRead, mockMarkAllNotificationsRead } from './mockStore';

export const getNotifications = async () => {
  if (MOCK_MODE) {
    return mockGetNotifications();
  }
  const { data } = await api.get('/api/notifications');
  return data.data;
};

export const markNotificationRead = async (notificationId: string) => {
  if (MOCK_MODE) {
    return mockMarkNotificationRead(notificationId);
  }
  const { data } = await api.put(`/api/notifications/${notificationId}/read`);
  return data.data;
};

export const markAllNotificationsRead = async () => {
  if (MOCK_MODE) {
    return mockMarkAllNotificationsRead();
  }
  const { data } = await api.put('/api/notifications/read-all');
  return data.data;
};
