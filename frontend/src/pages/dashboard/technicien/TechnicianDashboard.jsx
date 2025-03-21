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
  FaCalendarAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/dashboard/Header";
import Sidebar from "../../../components/dashboard/Sidebar";

const StatCard = ({ icon, title, value, color }) => (
  <div
    className={`bg-white p-4 rounded-lg shadow-md border-l-4 border-${color}-500 hover:shadow-lg transition-shadow`}
  >
    <div className="flex items-center">
      <div
        className={`p-3 rounded-full bg-${color}-100 text-${color}-600 mr-4`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  </div>
);

const StorageCard = ({ condition, count, icon, color }) => (
  <div
    className={`bg-${color}-50 p-4 rounded-lg shadow-md border border-${color}-200`}
  >
    <div className="flex justify-between items-center">
      <div>
        <span className="text-2xl mr-2">{icon}</span>
        <span className={`font-medium text-${color}-700`}>{condition}</span>
      </div>
      <span className={`text-2xl font-bold text-${color}-600`}>{count}</span>
    </div>
    <p className="mt-2 text-sm text-gray-600">
      {count} samples requiring {condition.toLowerCase()} storage
    </p>
  </div>
);

function TechnicianDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [samples, setSamples] = useState([]);
  const [recentSamples, setRecentSamples] = useState([]);
  const [expiringNonAnalyzedSamples, setExpiringNonAnalyzedSamples] = useState(
    []
  );
  const [expiredSamples, setExpiredSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState("");
  const [userInitials, setUserInitials] = useState("");

  const storageConditions = [
    { name: "Room Temperature", icon: "🌡️", color: "green" },
    { name: "Refrigerated (2-8°C)", icon: "❄️", color: "blue" },
    { name: "Frozen (-20°C)", icon: "❄️❄️", color: "indigo" },
    { name: "Ultra-frozen (-80°C)", icon: "❄️❄️❄️", color: "purple" },
    { name: "Liquid Nitrogen", icon: "💧", color: "cyan" },
  ];

  const [stats, setStats] = useState({
    totalSamples: 0,
    pendingSamples: 0,
    inAnalysisSamples: 0,
    analyzedSamples: 0,
    criticalExpirations: 0,
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
    const statusColors = {
      Analyzed: "bg-green-100 text-green-800",
      "In Analysis": "bg-blue-100 text-blue-800",
      Pending: "bg-yellow-100 text-yellow-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  const getDaysUntilExpiration = (expirationDate) => {
    if (!expirationDate) return null;
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = Math.abs(expDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return expDate > today ? diffDays : -diffDays;
  };

  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleDateString() : "N/A";

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const API_URL = `${import.meta.env.VITE_API_URL}/samples`;
        const { data: samplesData } = await axios.get(`${API_URL}/samples`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        setSamples(samplesData);

        const sortedByCreationDate = [...samplesData].sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        setRecentSamples(sortedByCreationDate.slice(0, 5));

        const today = new Date();
        const fifteenDaysFromNow = new Date();
        fifteenDaysFromNow.setDate(today.getDate() + 15);

        const expiringNonAnalyzed = samplesData
          .filter((sample) => {
            if (!sample.expirationDate) return false;
            const expirationDate = new Date(sample.expirationDate);
            return (
              expirationDate > today &&
              expirationDate <= fifteenDaysFromNow &&
              sample.status !== "Analyzed"
            );
          })
          .sort(
            (a, b) => new Date(a.expirationDate) - new Date(b.expirationDate)
          );

        setExpiringNonAnalyzedSamples(expiringNonAnalyzed);

        const expired = samplesData.filter((sample) => {
          if (!sample.expirationDate) return false;
          const expirationDate = new Date(sample.expirationDate);
          return expirationDate < today && sample.status !== "Analyzed";
        });

        setExpiredSamples(expired);

        setStats({
          totalSamples: samplesData.length,
          pendingSamples: samplesData.filter((s) => s.status === "Pending")
            .length,
          inAnalysisSamples: samplesData.filter(
            (s) => s.status === "In Analysis"
          ).length,
          analyzedSamples: samplesData.filter((s) => s.status === "Analyzed")
            .length,
          criticalExpirations: expired.length,
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
              <StatCard
                icon={<FaVial size={24} />}
                title="Total Samples"
                value={stats.totalSamples}
                color="blue"
              />
              <StatCard
                icon={<FaFlask size={24} />}
                title="Pending Analysis"
                value={stats.pendingSamples}
                color="yellow"
              />
              <StatCard
                icon={<FaClipboardCheck size={24} />}
                title="Analyzed"
                value={stats.analyzedSamples}
                color="green"
              />
              <StatCard
                icon={<FaExclamationTriangle size={24} />}
                title="Expiring Soon"
                value={stats.criticalExpirations}
                color="red"
              />
            </div>

            {/* Expired Samples Section */}
            {expiredSamples.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-red-800 flex items-center">
                    <FaExclamationTriangle className="mr-2" /> Expired Samples
                    Requiring Attention
                  </h2>
                </div>
                <div className="bg-red-100 rounded-lg shadow overflow-x-auto border border-red-300">
                  <table className="min-w-full divide-y divide-red-300">
                    <thead className="bg-red-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">
                          Expiration Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">
                          Days Expired
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-red-200">
                      {expiredSamples.slice(0, 5).map((sample) => {
                        const daysUntil = getDaysUntilExpiration(
                          sample.expirationDate
                        );
                        return (
                          <tr key={sample._id} className="hover:bg-red-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-800">
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-800 font-bold">
                              {Math.abs(daysUntil)} days ago
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() =>
                                  navigate(
                                    `/dashboard/technician/samples/${sample._id}`
                                  )
                                }
                                className="bg-red-800 text-white px-3 py-1 rounded hover:bg-red-900 transition-colors"
                              >
                                Urgent Action
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent Samples Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <FaCalendarAlt className="mr-2" /> Recently Created Samples
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
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
                          {formatDate(sample.createdAt)}
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
                          <p className="text-xs">{sample.createdBy?.email}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sample.project?.projectName || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() =>
                              navigate(
                                `/dashboard/technician/samples/${sample._id}`
                              )
                            }
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View
                          </button>
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
                  const count = samples.filter(
                    (s) =>
                      s.storageConditions &&
                      s.storageConditions.includes(condition.name)
                  ).length;

                  return (
                    <StorageCard
                      key={condition.name}
                      condition={condition.name}
                      count={count}
                      icon={condition.icon}
                      color={condition.color}
                    />
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