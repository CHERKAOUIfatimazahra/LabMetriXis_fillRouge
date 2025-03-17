import React, { useEffect, useState } from "react";
import { FaFlask, FaBell, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import NotificationDropdown from "../NotificationDropdown";
import axios from "axios";

const Header = ({ title, bgColor, hoverColor }) => {
  const [userName, setUserName] = useState("");
  const [userInitials, setUserInitials] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  // Récupération des informations de l'utilisateur depuis localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (userData) {
      try {
        const user = JSON.parse(userData);
        const fullName = user.name || "Utilisateur";
        setUserName(fullName);

        // Générer les initiales
        const initials = fullName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase();
        setUserInitials(initials);
      } catch (error) {
        console.error("Erreur lors du parsing des données utilisateur:", error);
      }
    }
  }, []);

  // Fetch unread notification count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/notification/count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotificationCount(response.data.count);
      } catch (error) {
        console.error("Error fetching notification count:", error);
      }
    };

    fetchNotificationCount();

    // Set up polling for new notifications (every 30 seconds)
    const intervalId = setInterval(fetchNotificationCount, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Toggle notification dropdown
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <header className={`${bgColor} text-white shadow-md`}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <FaFlask className="text-2xl" />
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <FaBell
              className={`text-xl cursor-pointer hover:${hoverColor}`}
              onClick={toggleNotifications}
            />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
            <NotificationDropdown
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`h-8 w-8 rounded-full ${bgColor.replace(
                "500",
                "800"
              )} flex items-center justify-center`}
            >
              <span className="text-sm font-medium">{userInitials}</span>
            </div>
            <span className="hidden md:inline-block font-medium">
              {userName}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm"
          >
            <FaSignOutAlt />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
