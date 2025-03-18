import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaFlask,
  FaVial,
  FaClipboardCheck,
  FaCog,
  FaExclamationTriangle,
  FaUsers,
  FaUserCog,
  FaClipboardList,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/dashboard/Header";
import Sidebar from "../../../components/dashboard/Sidebar";

function TechnicianDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [samples, setSamples] = useState([]);
  const [recentSamples, setRecentSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState("");
  const [userInitials, setUserInitials] = useState("");
  const [storageConditions, setStorageConditions] = useState([
    "Room Temperature",
    "Refrigerated (2-8°C)",
    "Frozen (-20°C)",
    "Ultra-frozen (-80°C)",
    "Liquid Nitrogen",
  ]);
  const [sampleTypes, setSampleTypes] = useState([
    "Blood",
    "Tissue",
    "DNA",
    "RNA",
    "Protein",
    "Cell Culture",
    "Serum",
    "Plasma",
    "Other",
  ]);
  const [units, setUnits] = useState([
    "ml",
    "µl",
    "g",
    "mg",
    "µg",
    "cells",
    "pieces",
  ]);

  const [stats, setStats] = useState({
    totalSamples: 0,
    pendingSamples: 0,
    inAnalysisSamples: 0,
    analyzedSamples: 0,
    expiringSoon: 0,
    maintenanceTasks: 0,
    equipmentIssues: 0,
  });

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
      icon: <FaUserCog />,
      navigator: "/dashboard/technician/profile",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Analyzed":
        return "bg-green-100 text-green-800";
      case "In Analysis":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const API_URL = `${import.meta.env.VITE_API_URL}/samples`;

        const { data: samplesData } = await axios.get(`${API_URL}/samples`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        setSamples(samplesData);

        const sortedSamples = [...samplesData].sort(
          (a, b) =>
            new Date(b.collectionDate || 0) - new Date(a.collectionDate || 0)
        );
        setRecentSamples(sortedSamples.slice(0, 5));

        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        const expiringSoon = samplesData.filter((sample) => {
          if (!sample.expirationDate) return false;
          const expirationDate = new Date(sample.expirationDate);
          return expirationDate > today && expirationDate <= thirtyDaysFromNow;
        }).length;

        setStats({
          totalSamples: samplesData.length,
          pendingSamples: samplesData.filter((s) => s.status === "Pending")
            .length,
          inAnalysisSamples: samplesData.filter(
            (s) => s.status === "In Analysis"
          ).length,
          analyzedSamples: samplesData.filter((s) => s.status === "Analyzed")
            .length,
          expiringSync: expiringSoon,
        });
      } catch (err) {
        setError("Error loading data.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (userData) {
      try {
        const user = JSON.parse(userData);
        const fullName = user.name || "Utilisateur";
        setUserName(fullName);

        const initials = fullName
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

  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleDateString() : "N/A";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-t-4 border-blue-600 border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-blue-800 font-medium">LabMatriXis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600 bg-red-100 px-6 py-4 rounded-lg shadow">
          <p className="font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header
        title="Laboratory Technician Portal"
        userName={userName || "Lab Technician"}
        userInitials={userInitials || "LT"}
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
            {/* Welcome Section */}
            <div className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-xl text-white p-6">
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {userName || "Lab Technician"}
              </h1>
              <p className="text-blue-100">
                You have {stats.pendingSamples} samples pending analysis and{" "}
                {stats.inAnalysisSamples} samples currently in analysis.
              </p>
            </div>

            {/* Statistics Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                    <FaVial size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Samples</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {stats.totalSamples}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                    <FaFlask size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pending Analysis</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {stats.pendingSamples}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                    <FaClipboardCheck size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Analyzed</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {stats.analyzedSamples}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                    <FaExclamationTriangle size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expiring Soon</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {stats.expiringSync}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Samples Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Recent Samples
                </h2>
                <button
                  onClick={() => navigate("/dashboard/technician/samples")}
                  className="text-blue-600 hover:text-blue-800"
                >
                  View all
                </button>
              </div>
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        ID
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Expiration Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercas tracking-wider"
                      >
                        Create By
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Project
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentSamples.map((sample) => (
                      <tr key={sample._id} className="hover:bg-blue-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {sample.identification}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {sample.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sample.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(sample.expirationDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              sample.status
                            )}`}
                          >
                            {sample.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sample.createdBy?.name}
                          <p>{sample.createdBy?.email}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sample.project?.projectName || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sample Storage Conditions */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Sample Storage Requirements
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {storageConditions.map((condition) => {
                  // Count samples that require the current storage condition
                  const count = samples.filter(
                    (s) =>
                      s.storageConditions &&
                      s.storageConditions.includes(condition)
                  ).length;

                  // Define an icon and color for each condition
                  let icon, color;
                  switch (condition) {
                    case "Refrigerated (2-8°C)":
                      icon = "❄️";
                      color = "blue";
                      break;
                    case "Room Temperature":
                      icon = "🌡️";
                      color = "green";
                      break;
                    case "Frozen (-20°C)":
                      icon = "❄️❄️";
                      color = "indigo";
                      break;
                    case "Ultra-frozen (-80°C)":
                      icon = "❄️❄️❄️";
                      color = "purple";
                      break;
                    case "Liquid Nitrogen":
                      icon = "💧";
                      color = "cyan";
                      break;
                    default:
                      icon = "🔒";
                      color = "gray";
                  }

                  return (
                    <div
                      key={condition}
                      className={`bg-${color}-50 p-4 rounded-lg shadow-md border border-${color}-200`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-2xl mr-2">{icon}</span>
                          <span className={`font-medium text-${color}-700`}>
                            {condition}
                          </span>
                        </div>
                        <span
                          className={`text-2xl font-bold text-${color}-600`}
                        >
                          {count}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        {count} samples requiring {condition.toLowerCase()}{" "}
                        storage
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default TechnicianDashboard;
