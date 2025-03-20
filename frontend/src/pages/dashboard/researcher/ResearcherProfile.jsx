import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaBriefcase,
  FaBuilding,
  FaLock,
  FaChartLine,
  FaClipboardList,
  FaUsers,
  FaFileAlt,
} from "react-icons/fa";
import Header from "../../../components/dashboard/Header";
import Sidebar from "../../../components/dashboard/Sidebar";

function ResearcherProfile() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
    specialty: "",
    institution: "",
  });
  const [userInitials, setUserInitials] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: <FaChartLine />,
      navigator: "/dashboard/researcher",
    },
    {
      id: "projects",
      label: "Projects",
      icon: <FaClipboardList />,
      navigator: "/dashboard/researcher/projects",
    },
    {
      id: "team",
      label: "Research Team",
      icon: <FaUsers />,
      navigator: "/dashboard/researcher/team",
    },
    {
      id: "publications",
      label: "Publications",
      icon: <FaFileAlt />,
      navigator: "/dashboard/researcher/publications",
    },
    {
      id: "profile",
      label: "Profile",
      icon: <FaUser />,
      navigator: "/dashboard/researcher/profile",
    },
  ];

  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser({
          name: parsedUser.name || "",
          email: parsedUser.email || "",
          role: parsedUser.role || "",
          specialty: parsedUser.specialty || "",
          institution: parsedUser.institution || "",
        });

        const initials = (parsedUser.name || "")
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase();
        setUserInitials(initials);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header
        title="Research Lab Portal"
        userName={user.name}
        userInitials={userInitials}
        notificationCount={3}
        bgColor="bg-teal-700 backdrop-filter backdrop-blur-lg bg-opacity-90"
        hoverColor="text-teal-200"
      />

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div>
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              navItems={navItems}
              accentColor="teal"
            />
          </div>

          <main className="flex-1">
            {/* Profile Header */}
            <div className="mb-6 bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl shadow-xl text-white p-6">
              <h1 className="text-3xl font-bold mb-2">User Profile</h1>
              <p className="text-teal-100">
                View your personal information and research details
              </p>
            </div>

            {/* Profile Content */}
            <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-100 mb-6">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Profile Photo Section */}
                <div className="md:w-1/3 flex flex-col items-center justify-start">
                  <div className="bg-teal-100 text-teal-700 h-48 w-48 rounded-full flex items-center justify-center text-6xl font-bold mb-4 border-4 border-teal-500 shadow-lg">
                    {userInitials}
                  </div>
                  <h2 className="text-2xl font-bold text-teal-800 mb-2 text-center">
                    {user.name}
                  </h2>
                  <p className="text-gray-600 text-center bg-teal-50 px-4 py-1 rounded-full capitalize">
                    {user.role}
                  </p>
                </div>

                {/* Profile Information */}
                <div className="md:w-2/3">
                  <h3 className="text-xl font-semibold text-teal-800 mb-4 border-b-2 border-teal-200 pb-2">
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="flex items-start">
                      <div className="bg-teal-100 p-2 rounded-lg text-teal-600 mr-4">
                        <FaUser size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="text-base font-medium text-gray-800">
                          {user.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-teal-100 p-2 rounded-lg text-teal-600 mr-4">
                        <FaEnvelope size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email Address</p>
                        <p className="text-base font-medium text-gray-800">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-teal-100 p-2 rounded-lg text-teal-600 mr-4">
                        <FaBriefcase size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Specialty</p>
                        <p className="text-base font-medium text-gray-800">
                          {user.specialty}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-teal-100 p-2 rounded-lg text-teal-600 mr-4">
                        <FaBuilding size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Institution</p>
                        <p className="text-base font-medium text-gray-800">
                          {user.institution}
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-teal-800 mb-4 border-b-2 border-teal-200 pb-2">
                    Account Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start">
                      <div className="bg-teal-100 p-2 rounded-lg text-teal-600 mr-4">
                        <FaLock size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Account Type</p>
                        <p className="text-base font-medium text-gray-800 capitalize">
                          {user.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Research Stats */}
            <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-semibold text-teal-800 mb-4 border-b-2 border-teal-200 pb-2">
                Research Statistics
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-lg border border-teal-200 hover:shadow-md transition-shadow">
                  <div className="text-center">
                    <p className="text-sm text-teal-600 font-medium">
                      Active Projects
                    </p>
                    <p className="text-3xl font-bold text-teal-800 mt-2">12</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                  <div className="text-center">
                    <p className="text-sm text-blue-600 font-medium">
                      Publications
                    </p>
                    <p className="text-3xl font-bold text-blue-800 mt-2">24</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
                  <div className="text-center">
                    <p className="text-sm text-purple-600 font-medium">
                      Research Impact
                    </p>
                    <p className="text-3xl font-bold text-purple-800 mt-2">
                      8.4
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default ResearcherProfile;