import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaVial,
  FaSearch,
  FaFilter,
  FaEye,
  FaDownload,
  FaChevronLeft,
  FaChevronRight,
  FaClipboardList,
  FaCog,
  FaUsers,
  FaUserCog,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/dashboard/Header";
import Sidebar from "../../../components/dashboard/Sidebar";

function SamplesList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("samples");
  const [samples, setSamples] = useState([]);
  const [filteredSamples, setFilteredSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState("");
  const [userInitials, setUserInitials] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [samplesPerPage] = useState(10);
  const [totalSamples, setTotalSamples] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const statusOptions = ["All", "Analyzed", "In Analysis", "Pending"];

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
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "In Analysis":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "Pending":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const API_URL = `${import.meta.env.VITE_API_URL}/samples`;

        const response = await axios.get(`${API_URL}/samples`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        console.log("API Response:", response.data);

        setSamples(response.data);

        setFilteredSamples(response.data);
        setTotalSamples(response.data.length || 0);
      } catch (err) {
        setError("Error loading samples.");
        console.error("Error fetching samples:", err);
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

  useEffect(() => {
    searchAndFilterSamples();
    setCurrentPage(1);
  }, [searchTerm, statusFilter, samples]);

  const searchAndFilterSamples = () => {
    let results = [...samples];

    if (searchTerm.trim() !== "") {
      results = results.filter((sample) =>
        sample.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "All") {
      results = results.filter((sample) => sample.status === statusFilter);
    }

    setFilteredSamples(results);
    setTotalSamples(results.length);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleDateString() : "N/A";

  const indexOfLastSample = currentPage * samplesPerPage;
  const indexOfFirstSample = indexOfLastSample - samplesPerPage;
  const currentSamples = filteredSamples.slice(
    indexOfFirstSample,
    indexOfLastSample
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(totalSamples / samplesPerPage);

  const getPaginationRange = () => {
    const delta = 2;
    const range = [];

    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(totalPages, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (range[0] > 1) {
      range.unshift(1);
      if (range[1] > 2) range.splice(1, 0, "...");
    }

    if (range[range.length - 1] < totalPages) {
      if (range[range.length - 1] < totalPages - 1) range.push("...");
      range.push(totalPages);
    }

    return range;
  };

  const viewSampleDetails = (sampleId) => {
    navigate(`/dashboard/technician/samples/${sampleId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-t-4 border-indigo-600 border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-indigo-800 font-medium">
            Loading samples data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-red-50 px-8 py-6 rounded-xl shadow-lg border border-red-200 max-w-md">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <p className="text-lg font-medium text-red-800 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 inline-flex items-center justify-center space-x-2 shadow-md"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              ></path>
            </svg>
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <Header
        title="Laboratory Samples"
        userName={userName || "Lab Technician"}
        userInitials={userInitials || "LT"}
        bgColor="bg-blue-700 backdrop-filter backdrop-blur-lg bg-opacity-90"
        hoverColor="text-blue-200"
      />

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              navItems={navItems}
              accentColor="blue"
            />
          </div>

          <main className="flex-1">
            {/* Page Header */}
            <div className="mb-6 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Samples Management
                  </h1>
                  <p className="text-gray-500 mt-1">
                    View and manage your laboratory samples
                  </p>
                </div>

                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  {/* Search by name */}
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      placeholder="Search by name..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Filter by status */}
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaFilter className="text-gray-400" />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={handleStatusFilterChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status === "All" ? "All Statuses" : status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Samples List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center">Sample ID</div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center">Name</div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center">Type</div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center">Status</div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center">Collection Date</div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentSamples.length > 0 ? (
                      currentSamples.map((sample) => (
                        <tr key={sample.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {sample._id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {sample.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {sample.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                sample.status
                              )}`}
                            >
                              {sample.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {formatDate(sample.collectionDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <button
                              onClick={() => viewSampleDetails(sample._id)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                              title="View Sample Details"
                            >
                              <FaEye className="inline" />
                            </button>
                            {sample.status === "Analyzed" && (
                              <button
                                className="text-gray-600 hover:text-gray-900"
                                title="Download Sample Report"
                              >
                                <FaDownload className="inline" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-10 text-center">
                          <div className="text-gray-500">
                            <p className="text-lg font-medium mb-2">
                              No samples found
                            </p>
                            <p className="text-sm">
                              {searchTerm || statusFilter !== "All"
                                ? "Try adjusting your search or filter criteria"
                                : "Add a new sample to get started"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalSamples > 0 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <FaChevronLeft className="mr-2 h-3 w-3" />
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        paginate(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Next
                      <FaChevronRight className="ml-2 h-3 w-3" />
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-medium">
                          {indexOfFirstSample + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium">
                          {Math.min(indexOfLastSample, totalSamples)}
                        </span>{" "}
                        of <span className="font-medium">{totalSamples}</span>{" "}
                        samples
                      </p>
                    </div>
                    <div>
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={() => paginate(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === 1
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <FaChevronLeft className="h-4 w-4" />
                        </button>

                        {getPaginationRange().map((page, index) => (
                          <div key={index}>
                            {page === "..." ? (
                              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                ...
                              </span>
                            ) : (
                              <button
                                onClick={() => paginate(page)}
                                className={`relative inline-flex items-center px-4 py-2 border ${
                                  currentPage === page
                                    ? "bg-indigo-50 border-indigo-500 text-indigo-600"
                                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                                } text-sm font-medium`}
                              >
                                {page}
                              </button>
                            )}
                          </div>
                        ))}

                        <button
                          onClick={() =>
                            paginate(Math.min(totalPages, currentPage + 1))
                          }
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === totalPages
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <FaChevronRight className="h-4 w-4" />
                        </button>
                      </nav>
                    </div>
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

export default SamplesList;
