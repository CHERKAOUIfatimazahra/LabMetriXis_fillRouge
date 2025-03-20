import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaBriefcase,
  FaBuilding,
  FaLock,
  FaVial,
  FaFlask,
  FaClipboardList,
  FaUsers,
  FaCog,
} from "react-icons/fa";
import Header from "../../../components/dashboard/Header";
import Sidebar from "../../../components/dashboard/Sidebar";

function TechnicienProfile() {
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
      icon: <FaClipboardList />,
      navigator: "/dashboard/technician",
    },
    {
      id: "samples",
      label: "Samples",
      icon: <FaVial />,
      navigator: "/dashboard/technician/samples",
    },
    {
      id: "equipment",
      label: "Equipment",
      icon: <FaCog />,
      navigator: "/dashboard/technician/equipment",
    },
    {
      id: "team",
      label: "Lab Team",
      icon: <FaUsers />,
      navigator: "/dashboard/technician/team",
    },
    {
      id: "profile",
      label: "Profile",
      icon: <FaUser />,
      navigator: "/dashboard/technician/profile",
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
        title="Laboratory Technician Portal"
        userName={user.name}
        userInitials={userInitials}
        notificationCount={3}
        bgColor="bg-blue-700 backdrop-filter backdrop-blur-lg bg-opacity-90"
        hoverColor="text-blue-200"
      />

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div>
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              navItems={navItems}
              accentColor="blue"
            />
          </div>

          <main className="flex-1">
            {/* Profile Header */}
            <div className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-xl text-white p-6">
              <h1 className="text-3xl font-bold mb-2">User Profile</h1>
              <p className="text-blue-100">
                View your personal information and lab credentials
              </p>
            </div>

            {/* Profile Content */}
            <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-100 mb-6">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Profile Photo Section */}
                <div className="md:w-1/3 flex flex-col items-center justify-start">
                  <div className="bg-blue-100 text-blue-700 h-48 w-48 rounded-full flex items-center justify-center text-6xl font-bold mb-4 border-4 border-blue-500 shadow-lg">
                    {userInitials}
                  </div>
                  <h2 className="text-2xl font-bold text-blue-800 mb-2 text-center">
                    {user.name}
                  </h2>
                  <p className="text-gray-600 text-center bg-blue-50 px-4 py-1 rounded-full capitalize">
                    {user.role}
                  </p>
                </div>

                {/* Profile Information */}
                <div className="md:w-2/3">
                  <h3 className="text-xl font-semibold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2">
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="flex items-start">
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mr-4">
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
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mr-4">
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
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mr-4">
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
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mr-4">
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

                  <h3 className="text-xl font-semibold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2">
                    Account Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start">
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mr-4">
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

            {/* Lab Statistics */}
            <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-semibold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2">
                Laboratory Performance
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                  <div className="text-center">
                    <p className="text-sm text-blue-600 font-medium">
                      Samples Processed
                    </p>
                    <p className="text-3xl font-bold text-blue-800 mt-2">347</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                  <div className="text-center">
                    <p className="text-sm text-green-600 font-medium">
                      Equipment Maintenance
                    </p>
                    <p className="text-3xl font-bold text-green-800 mt-2">28</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200 hover:shadow-md transition-shadow">
                  <div className="text-center">
                    <p className="text-sm text-yellow-600 font-medium">
                      Quality Score
                    </p>
                    <p className="text-3xl font-bold text-yellow-800 mt-2">
                      9.2
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lab Certifications */}
            <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-100 mt-6">
              <h3 className="text-xl font-semibold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2">
                Certifications & Skills
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-blue-700 mb-3">
                    Certifications
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center bg-blue-50 p-2 rounded">
                      <FaFlask className="text-blue-600 mr-2" />
                      <span>Laboratory Safety Certification</span>
                    </div>
                    <div className="flex items-center bg-blue-50 p-2 rounded">
                      <FaVial className="text-blue-600 mr-2" />
                      <span>Sample Processing Specialist</span>
                    </div>
                    <div className="flex items-center bg-blue-50 p-2 rounded">
                      <FaCog className="text-blue-600 mr-2" />
                      <span>Equipment Maintenance Technician</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-blue-700 mb-3">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      Sample Analysis
                    </span>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      Equipment Calibration
                    </span>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      Cell Culture
                    </span>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      PCR
                    </span>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      HPLC
                    </span>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      Spectroscopy
                    </span>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      Microbiology
                    </span>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      Documentation
                    </span>
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

export default TechnicienProfile;