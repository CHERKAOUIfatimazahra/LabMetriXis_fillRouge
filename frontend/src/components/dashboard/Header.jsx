import React, { useEffect, useState } from "react";
import { FaFlask, FaBell, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Header = ({ title, notificationCount, bgColor, hoverColor }) => {
  const [userName, setUserName] = useState("");
  const [userInitials, setUserInitials] = useState("");
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

  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
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
            <FaBell className={`text-xl cursor-pointer hover:${hoverColor}`} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {notificationCount}
            </span>
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
