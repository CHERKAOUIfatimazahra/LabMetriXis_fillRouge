import React, { useEffect, useState } from "react";
import axios from "axios";

const NotificationDropdown = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch notifications when the dropdown is open
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

      // Ensure we're setting an array, even if the API returns something unexpected
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

      await axios.post(
        `${import.meta.env.VITE_API_URL}/notification/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state to reflect the change
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // If dropdown is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden">
      <div className="border-b px-4 py-2 flex justify-between items-center">
        <h3 className="font-medium text-gray-800">Notifications</h3>
        <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
          ×
        </button>
      </div>

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
          // Make sure we're mapping over an array
          Array.isArray(notifications) &&
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-4 py-3 border-b hover:bg-gray-50 cursor-pointer ${
                !notification.read ? "bg-blue-50" : ""
              }`}
              onClick={() => markAsRead(notification.id)}
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

      {notifications.length > 0 && (
        <div className="border-t px-4 py-2">
          <button
            className="text-sm text-blue-600 hover:text-blue-800 w-full text-center"
            onClick={() => {
              // Mark all as read functionality would go here
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
