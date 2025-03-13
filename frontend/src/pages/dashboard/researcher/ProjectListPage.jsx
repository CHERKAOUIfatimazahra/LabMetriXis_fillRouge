import React, { useState, useEffect } from "react";
import {
  FaChartLine,
  FaClipboardList,
  FaUsers,
  FaFileAlt,
  FaSearch,
  FaFilter,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaDollarSign,
  FaFlask,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../../components/dashboard/Header";
import Sidebar from "../../../components/dashboard/Sidebar";
import { toast } from "react-toastify";

function ProjectListPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("projects");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [projects, setProjects] = useState([]);
  const [statistics, setStatistics] = useState(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    projectsPerPage: 8,
    totalPages: 1,
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

  const handleStatusFilter = (e) => {
    setFilterStatus(e.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
    document
      .querySelector(".projects-table-container")
      ?.scrollIntoView({ behavior: "smooth" });
  };

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

  const getProgressColor = (progress) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 40) return "bg-blue-500";
    return "bg-yellow-500";
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/project/projects`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        // console.log(response.data);

        if (Array.isArray(response.data)) {
          setProjects(response.data);
        } else if (response.data.projects) {
          setProjects(response.data.projects);
        } else {
          console.error("Unexpected response format:", response.data);
          setProjects([]);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Fetch statistics
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/statistic/statistic`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setStatistics(response.data);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    fetchStatistics();
  }, []);

  // Filter projects based on search term and status
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      (project.projectName &&
        project.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (project.description &&
        project.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      filterStatus === "All" || project.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Update pagination when filtered projects change
  useEffect(() => {
    setPagination((prev) => {
      const newTotalPages = Math.ceil(
        filteredProjects.length / prev.projectsPerPage
      );
      return prev.totalPages !== newTotalPages
        ? { ...prev, totalPages: newTotalPages }
        : prev;
    });
  }, [filteredProjects]);

  // Calculate current page projects (8 per page)
  const indexOfLastProject =
    pagination.currentPage * pagination.projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - pagination.projectsPerPage;
  const currentProjects = filteredProjects.slice(
    indexOfFirstProject,
    indexOfLastProject
  );

  // Generate page numbers for pagination
  const pageNumbers = [];
  for (let i = 1; i <= pagination.totalPages; i++) {
    pageNumbers.push(i);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-t-4 border-teal-600 border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-teal-800 font-medium">Loading projects...</p>
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
            {/* Statistics Section */}
            {statistics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-16 h-16 bg-white opacity-10 rounded-bl-full"></div>
                  <h3 className="text-sm font-medium mb-1">Total Projects</h3>
                  <p className="text-3xl font-bold">
                    {statistics.totalProjects}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-4 rounded-lg shadow relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-16 h-16 bg-white opacity-10 rounded-bl-full"></div>
                  <h3 className="text-sm font-medium mb-1">Active Projects</h3>
                  <p className="text-3xl font-bold">
                    {statistics.statusDistribution?.Active || 0}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg shadow relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-16 h-16 bg-white opacity-10 rounded-bl-full"></div>
                  <h3 className="text-sm font-medium mb-1">Total Budget</h3>
                  <p className="text-3xl font-bold">
                    $
                    {statistics.budgetStatistics?.totalBudget?.toLocaleString() ||
                      0}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-16 h-16 bg-white opacity-10 rounded-bl-full"></div>
                  <h3 className="text-sm font-medium mb-1">Total Samples</h3>
                  <p className="text-3xl font-bold">
                    {Object.values(statistics.sampleStatistics || {}).reduce(
                      (a, b) => a + b,
                      0
                    )}
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-100">
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-teal-800">
                  <span className="border-b-4 border-teal-500 pb-1">
                    Research Projects
                  </span>
                </h1>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative flex-grow">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={handleSearch}
                      className="pl-10 pr-4 py-2 w-full bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={filterStatus}
                      onChange={handleStatusFilter}
                      className="appearance-none pl-10 pr-10 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="All">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Planning">Planning</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>

                  <button
                    onClick={() =>
                      navigate("/dashboard/researcher/projects/create")
                    }
                    className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-4 py-2 rounded-lg flex items-center justify-center shadow-md transition-all duration-300"
                  >
                    <FaPlus className="w-4 h-4 mr-2" />
                    New Project
                  </button>
                </div>
              </div>

              {/* Projects Table */}
              <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100 projects-table-container">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team Lead
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timeline
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentProjects.length > 0 ? (
                      currentProjects.map((project) => (
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

                                <div className="text-xs text-teal-600 mt-1">
                                  Budget: $
                                  {project.budget?.toLocaleString() || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col items-start space-y-2">
                              <span
                                className={`px-3 py-1 text-xs rounded-full ${getStatusColor(
                                  project.status
                                )}`}
                              >
                                {project.status || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 bg-teal-200 text-teal-600 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium">
                                  {project.teamLeadName
                                    ? project.teamLeadName
                                        .split(" ")
                                        .map((name) => name[0])
                                        .join("")
                                    : "TL"}
                                </span>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {project.teamLead?.name || "Unassigned"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <div className="flex items-center text-xs text-gray-700">
                                <span className="font-medium">Start:</span>
                                <span className="ml-2">
                                  {project.startDate
                                    ? new Date(
                                        project.startDate
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </span>
                              </div>
                              <div className="flex items-center text-xs text-gray-700 mt-1">
                                <span className="font-medium">End:</span>
                                <span className="ml-2">
                                  {project.deadline
                                    ? new Date(
                                        project.deadline
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="w-full">
                              <div className="flex justify-between mb-1">
                                <span className="text-xs font-medium text-gray-700">
                                  {project.progress || 0}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${getProgressColor(
                                    project.progress || 0
                                  )}`}
                                  style={{ width: `${project.progress || 0}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() =>
                                  navigate(
                                    `/dashboard/researcher/projects/${project._id}`
                                  )
                                }
                                className="p-2 text-blue-600 hover:text-blue-800 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors duration-200"
                              >
                                <FaEye size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  navigate(
                                    `/dashboard/researcher/projects/${project._id}/edit`
                                  )
                                }
                                className="p-2 text-yellow-600 hover:text-yellow-800 bg-yellow-100 rounded-full hover:bg-yellow-200 transition-colors duration-200"
                              >
                                <FaEdit size={16} />
                              </button>
                              <button className="p-2 text-red-600 hover:text-red-800 bg-red-100 rounded-full hover:bg-red-200 transition-colors duration-200">
                                <FaTrash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-10 text-center text-gray-500"
                        >
                          No projects found matching your search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Improved Pagination */}
              {filteredProjects.length > 0 && (
                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center">
                  <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                    Showing{" "}
                    <span className="font-medium">
                      {indexOfFirstProject + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastProject, filteredProjects.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {filteredProjects.length}
                    </span>{" "}
                    projects
                  </div>

                  <div className="flex items-center">
                    {/* Pagination buttons */}
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={pagination.currentPage === 1}
                      className={`h-8 w-8 flex items-center justify-center rounded-l-md ${
                        pagination.currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      <FaChevronLeft size={12} />
                      <FaChevronLeft size={12} className="-ml-1" />
                    </button>

                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={pagination.currentPage === 1}
                      className={`h-8 w-8 flex items-center justify-center ${
                        pagination.currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      <FaChevronLeft size={12} />
                    </button>

                    {/* Dynamic page number buttons */}
                    <div className="flex items-center">
                      {pageNumbers.map((number) => {
                        if (
                          number === 1 ||
                          number === pagination.totalPages ||
                          (number >= pagination.currentPage - 1 &&
                            number <= pagination.currentPage + 1)
                        ) {
                          return (
                            <button
                              key={number}
                              onClick={() => handlePageChange(number)}
                              className={`h-8 w-8 flex items-center justify-center ${
                                pagination.currentPage === number
                                  ? "bg-teal-500 text-white"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            >
                              {number}
                            </button>
                          );
                        }

                        if (
                          (number === 2 && pagination.currentPage > 3) ||
                          (number === pagination.totalPages - 1 &&
                            pagination.currentPage < pagination.totalPages - 2)
                        ) {
                          return (
                            <span
                              key={number}
                              className="h-8 w-8 flex items-center justify-center bg-gray-100"
                            >
                              ...
                            </span>
                          );
                        }

                        return null;
                      })}
                    </div>

                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
                      className={`h-8 w-8 flex items-center justify-center ${
                        pagination.currentPage === pagination.totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      <FaChevronRight size={12} />
                    </button>

                    <button
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
                      className={`h-8 w-8 flex items-center justify-center rounded-r-md ${
                        pagination.currentPage === pagination.totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      <FaChevronRight size={12} />
                      <FaChevronRight size={12} className="-ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default ProjectListPage;
