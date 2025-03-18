import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaChartLine,
  FaClipboardList,
  FaUsers,
  FaFileAlt,
  FaFlask,
  FaVial,
  FaClock,
  FaHourglassHalf,
  FaMoneyBillWave,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/dashboard/Header";
import Sidebar from "../../../components/dashboard/Sidebar";

function ResearcherDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [projects, setProjects] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState("");
  const [userInitials, setUserInitials] = useState("");
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalSamples: 0,
    analyzedSamples: 0,
    inAnalysisSamples: 0,
    pendingSamples: 0,
    totalBudget: 0,
  });

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
      icon: <FaUsers />,
      navigator: "/dashboard/researcher/profile",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Active":
        return "bg-blue-100 text-blue-800";
      case "Planning":
        return "bg-yellow-100 text-yellow-800";
      case "On Hold":
        return "bg-orange-100 text-orange-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const API_URL = `${import.meta.env.VITE_API_URL}/project`;

        const { data: projectsData } = await axios.get(`${API_URL}/projects`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setProjects(projectsData);

        const sortedProjects = [...projectsData].sort(
          (a, b) => new Date(b.startDate || 0) - new Date(a.startDate || 0)
        );
        setRecentProjects(sortedProjects.slice(0, 5));

        let allSamples = [];
        for (const project of projectsData) {
          const { data: samplesData } = await axios.get(
            `${API_URL}/projects/${project._id}/samples`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          allSamples = [...allSamples, ...samplesData];
        }
        setSamples(allSamples);

        setStats({
          totalProjects: projectsData.length,
          totalBudget: projectsData.reduce(
            (acc, project) => acc + project.budget,
            0
          ),
          activeProjects: projectsData.filter((p) => p.status === "Active")
            .length,
          completedProjects: projectsData.filter(
            (p) => p.status === "Completed"
          ).length,
          totalSamples: allSamples.length,
          pendingSamples: allSamples.filter((s) => s.status === "Pending")
            .length,
          analyzedSamples: allSamples.filter((s) => s.status === "Analyzed")
            .length,
          inAnalysisSamples: allSamples.filter(
            (s) => s.status === "In Analysis"
          ).length,
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
        console.error("Erreur lors du parsing des données utilisateur:", error);
      }
    }
  }, []);

  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleDateString() : "N/A";

  const getDaysSinceStart = (dateString) => {
    if (!dateString) return "N/A";
    const startDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-t-4 border-teal-600 border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-teal-800 font-medium">Loading dashboard...</p>
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
        title="Research Lab Portal"
        userName="Dr. Roberts"
        userInitials="DR"
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
            {/* Welcome Section */}
            <div className="mb-6 bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl shadow-xl text-white p-6">
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {userName}
              </h1>
              <p className="text-teal-100">
                You have {stats.activeProjects} active projects and{" "}
                {stats.inAnalysisSamples} samples currently in analysis.
              </p>
            </div>

            {/* Statistics Section */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                    <FaClipboardList size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Projects</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {stats.totalProjects}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-teal-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-teal-100 text-teal-600 mr-4">
                    <FaChartLine size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active Projects</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {stats.activeProjects}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-amber-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
                    <FaMoneyBillWave size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Budget</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {stats.totalBudget}DH
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
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
              <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                    <FaFlask size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Analyzed Samples</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {stats.analyzedSamples}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Projects */}
            <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-100 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-teal-800">
                  <span className="border-b-4 border-teal-500 pb-1">
                    Recent Projects
                  </span>
                </h1>
                <button
                  onClick={() => navigate("/dashboard/researcher/projects")}
                  className="text-teal-600 hover:text-teal-800 font-medium flex items-center transition-colors"
                >
                  View All Projects
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Research Domain
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentProjects.length > 0 ? (
                      recentProjects.map((project) => (
                        <tr
                          key={project._id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600">
                                <FaClipboardList size={18} />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {project.projectName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {project.researchDomain || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {formatDate(project.startDate)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <FaClock
                                className="text-gray-400 mr-2"
                                size={14}
                              />
                              {getDaysSinceStart(project.startDate)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 text-xs rounded-full ${getStatusColor(
                                project.status
                              )}`}
                            >
                              {project.status || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <button
                              onClick={() =>
                                navigate(
                                  `/dashboard/researcher/projects/${project._id}`
                                )
                              }
                              className="text-teal-600 hover:text-teal-900 bg-teal-100 hover:bg-teal-200 p-2 rounded-full transition-colors duration-200"
                              title="View Project Details"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-10 text-center text-gray-500"
                        >
                          No projects found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sample Analysis Status */}
            <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-teal-800">
                  <span className="border-b-4 border-teal-500 pb-1">
                    Sample Analysis Status
                  </span>
                </h1>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                      <FaHourglassHalf size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pending Samples</p>
                      <p className="text-xl font-bold text-gray-800">
                        {stats.pendingSamples}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pl-14">
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-yellow-500 rounded-full"
                        style={{
                          width: `${
                            stats.totalSamples > 0
                              ? (stats.pendingSamples / stats.totalSamples) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                      <FaFlask size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">In Analysis</p>
                      <p className="text-xl font-bold text-gray-800">
                        {stats.inAnalysisSamples}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pl-14">
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{
                          width: `${
                            stats.totalSamples > 0
                              ? (stats.inAnalysisSamples / stats.totalSamples) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                      <FaClipboardList size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Analyzed</p>
                      <p className="text-xl font-bold text-gray-800">
                        {stats.analyzedSamples}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pl-14">
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-green-500 rounded-full"
                        style={{
                          width: `${
                            stats.totalSamples > 0
                              ? (stats.analyzedSamples / stats.totalSamples) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
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

export default ResearcherDashboard;
