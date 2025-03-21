import React, { useEffect, useState } from "react";
import axios from "axios";

const NotificationDropdown = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/notification`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Impossible de charger les notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      if (!notificationId) {
        console.error("Notification ID is undefined");
        return;
      }

      await axios.put(
        `${import.meta.env.VITE_API_URL}/notification/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.put(
        `${import.meta.env.VITE_API_URL}/notification/read-all`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    } finally {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden">
      {/* En-tête */}
      <div className="border-b px-4 py-2 flex justify-between items-center">
        <h3 className="font-medium text-gray-800">Notifications</h3>
        <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
          ×
        </button>
      </div>

      {/* Contenu des notifications */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Chargement...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Aucune notification
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`px-4 py-3 border-b hover:bg-gray-50 cursor-pointer ${
                !notification.isRead ? "bg-blue-50" : ""
              }`}
              onClick={() => markAsRead(notification._id)}
            >
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-gray-800">
                  {notification.title}
                </p>
                <span className="text-xs text-gray-500">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Bouton "Tout marquer comme lu" */}
      {notifications.length > 0 && (
        <div className="border-t px-4 py-2">
          <button
            className="text-sm text-blue-600 hover:text-blue-800 w-full text-center"
            onClick={() => {
              markAllAsRead();
              onClose();
            }}
          >
            Tout marquer comme lu
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;