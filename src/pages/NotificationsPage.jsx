import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('raasi_auth') || '{}')?.token;
        const { data } = await axios.get(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(data);
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-secondary mb-2">Notifications</h1>
      <p className="text-gray-500 mb-6">System alerts and updates</p>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-4">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="p-4 text-gray-500">No notifications yet.</p>
        ) : (
          notifications.map((n) => (
            <div key={n._id} className="p-4 border-b last:border-b-0">
              <div className="flex justify-between gap-4">
                <div>
                  <p className="font-semibold text-secondary">{n.title}</p>
                  <p className="text-sm text-gray-600">{n.message}</p>
                </div>
                <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
