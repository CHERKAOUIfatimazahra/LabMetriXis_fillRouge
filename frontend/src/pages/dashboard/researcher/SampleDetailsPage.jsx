import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaVial,
  FaFlask,
  FaTemperatureHigh,
  FaCalendarAlt,
  FaUser,
  FaFileAlt,
  FaArrowLeft,
  FaClock,
  FaDownload,
  FaDna,
  FaCheckCircle,
} from "react-icons/fa";
import Header from "../../../components/dashboard/Header";
import Sidebar from "../../../components/dashboard/Sidebar";

function SampleDetailsPage() {
  const { sampleId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("samples");
  const [sample, setSample] = useState(null);
  const [technician, setTechnician] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Définition des statuts et de leurs couleurs associées
  const statuses = ["Pending", "In Analysis", "Analyzed"];
  const statusColors = {
    Pending: "text-yellow-500",
    "In Analysis": "text-blue-500",
    Analyzed: "text-green-500",
    Failed: "text-red-500",
  };

  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: <FaFlask />,
      navigator: "/dashboard/researcher",
    },
    {
      id: "projects",
      label: "Projects",
      icon: <FaFileAlt />,
      navigator: "/dashboard/researcher/projects",
    },
    {
      id: "samples",
      label: "Samples",
      icon: <FaVial />,
      navigator: "/dashboard/researcher/samples",
    },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Analyzed":
        return "bg-green-100 text-green-800";
      case "In Analysis":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Analyzed":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white";
      case "In Analysis":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white";
      case "Pending":
        return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white";
      case "Failed":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
    }
  };

  // Ajout de la fonction handleViewReport manquante
  const handleViewReport = (sampleId) => {
    navigate(`/dashboard/researcher/samples/report/${sampleId}`);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const apiUrl = `${
          import.meta.env.VITE_API_URL
        }/project/projects/samples/${sampleId}`;

        const response = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        console.log("Response Data:", response.data);
        setSample(response.data);

        // Placeholder data for technician and project
        setTechnician({
          name: "Dr. Jane Smith",
          position: "Senior Lab Technician",
          email: "jane.smith@example.com",
        });

        setProject({
          projectName: "Cancer Research Study Phase II",
          researchDomain: "Oncology",
        });
      } catch (err) {
        console.error("Error fetching data:", err.response || err);
        setError("Error loading sample data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [sampleId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-t-4 border-teal-600 border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-teal-800 font-medium">
            Loading sample details...
          </p>
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

  if (!sample) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-600 bg-gray-100 px-6 py-4 rounded-lg shadow">
          <p className="font-medium">Sample not found.</p>
          <button
            onClick={() => navigate("/dashboard/researcher/samples")}
            className="mt-4 bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition-colors"
          >
            Back to Samples
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
          <div className="md:w-64">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              navItems={navItems}
              accentColor="teal"
            />
          </div>

          <main className="flex-1">
            <div className="mb-6 flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-2 rounded-full bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors"
              >
                <FaArrowLeft />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                Sample Details
              </h1>
            </div>

            {/* Sample Overview Card */}
            <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100 mb-6 overflow-hidden relative">
              {/* Status indicator overlay */}
              <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden">
                <div
                  className={`absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 rotate-45 w-32 h-12 ${getStatusBadge(
                    sample.status
                  )}`}
                ></div>
              </div>

              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-teal-800">
                    {sample.name}
                  </h2>
                  <div className="flex items-center mt-1">
                    <span className="inline-flex items-center px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm font-medium">
                      <FaDna className="mr-1" />
                      {sample.identification}
                    </span>
                    <span className="ml-4 text-gray-500 text-sm">
                      Created: {new Date(sample.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span
                  className={`px-4 py-2 text-sm font-medium rounded-full shadow-sm ${getStatusColor(
                    sample.status
                  )}`}
                >
                  {sample.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Sample Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2 flex items-center">
                    <FaVial className="mr-2 text-teal-600" />
                    Sample Information
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white shadow-md">
                        <FaVial size={18} />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-500">Sample Type</p>
                        <p className="text-base font-medium text-gray-800">
                          {sample.type}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shadow-md">
                        <FaFlask size={18} />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-500">Quantity</p>
                        <p className="text-base font-medium text-gray-800">
                          {sample.quantity} {sample.unit}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white shadow-md">
                        <FaTemperatureHigh size={18} />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-500">
                          Storage Conditions
                        </p>
                        <p className="text-base font-medium text-gray-800">
                          {sample.storageConditions}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white shadow-md">
                        <FaCalendarAlt size={18} />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-500">Collection Date</p>
                        <p className="text-base font-medium text-gray-800">
                          {formatDate(sample.collectionDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white shadow-md">
                        <FaCalendarAlt size={18} />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-500">Expiration Date</p>
                        <p className="text-base font-medium text-gray-800">
                          {formatDate(sample.expirationDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Info and Technician */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2 flex items-center">
                    <FaFileAlt className="mr-2 text-teal-600" />
                    Project & Personnel
                  </h3>

                  <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-5 rounded-lg mb-6 shadow-sm border border-teal-100">
                    <h4 className="font-medium text-teal-700 mb-2 flex items-center">
                      <FaFileAlt className="mr-2" />
                      Project Information
                    </h4>
                    <p className="font-bold text-gray-800 text-lg">
                      {project.projectName}
                    </p>
                    <div className="mt-2 inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {project.researchDomain}
                    </div>
                    {/* Protocol File */}
                    {sample.protocolFile && (
                      <div className="mt-6 bg-gradient-to-r from-gray-50 to-teal-50 p-5 rounded-lg shadow-sm border border-gray-200">
                        <h4 className="font-medium text-teal-700 mb-2 flex items-center">
                          <FaFileAlt className="mr-2" />
                          Protocol File
                        </h4>
                        <div className="flex items-center justify-between">
                          {sample.protocolFile?.fileName ? (
                            <>
                              <p className="text-sm text-gray-600 truncate max-w-xs">
                                <a
                                  href={`${
                                    import.meta.env.VITE_API_URL
                                  }/${sample.protocolFile.fileLocation.replace(
                                    /\\/g,
                                    "/"
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {sample.protocolFile.fileName}
                                </a>
                              </p>
                              <button
                                className="ml-2 px-3 py-1 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors flex items-center"
                                onClick={() => {
                                  // Handle the actual file download
                                  const fileUrl = `${
                                    import.meta.env.VITE_API_URL
                                  }/${sample.protocolFile.fileLocation.replace(
                                    /\\/g,
                                    "/"
                                  )}`;
                                  const link = document.createElement("a");
                                  link.href = fileUrl;
                                  link.download = sample.protocolFile.fileName;
                                  // This triggers the file download
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                              >
                                <FaDownload className="mr-1" size={14} />
                                <span>Download</span>
                              </button>
                            </>
                          ) : (
                            <p className="text-sm text-gray-600 truncate max-w-xs">
                              Aucun fichier
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-5 rounded-lg shadow-sm border border-blue-100">
                    <h4 className="font-medium text-teal-700 mb-2 flex items-center">
                      <FaUser className="mr-2" />
                      Responsible Technician
                    </h4>
                    <div className="flex items-center">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {technician?.name?.charAt(0) || "T"}
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-gray-800">
                          {technician?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {technician?.position}
                        </p>
                        <p className="text-sm text-teal-600">
                          {technician?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Details */}
            <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100 mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2 flex items-center">
                <FaFlask className="mr-2 text-teal-600" />
                Analysis Details
              </h3>

              {/* Progress Timeline */}
              <div className="mt-8">
                <h4 className="font-medium text-gray-700 mb-4">
                  Analysis Progress
                </h4>
                <div className="relative flex items-center">
                  {/* Barre de progression */}
                  <div className="absolute inset-0 flex items-center">
                    <div className="h-1 w-full bg-gray-200"></div>
                    <div
                      className="h-1 bg-teal-600 absolute transition-all duration-500"
                      style={{
                        width: `${
                          (statuses.indexOf(sample.status) /
                            (statuses.length - 1)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>

                  {/* Étapes */}
                  <ul className="relative flex justify-between w-full">
                    {statuses.map((status, index) => {
                      const isActive = statuses.indexOf(sample.status) >= index;
                      return (
                        <li key={status} className="flex flex-col items-center">
                          {/* Icône */}
                          <div
                            className={`relative flex h-10 w-10 items-center justify-center rounded-full text-white font-bold transition-all duration-300 ${
                              isActive
                                ? "bg-teal-600 scale-110 shadow-lg"
                                : "bg-gray-300"
                            }`}
                          >
                            {isActive ? (
                              <FaCheckCircle className="h-5 w-5" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          {/* Texte */}
                          <span
                            className={`mt-2 text-sm font-medium transition-all duration-300 ${
                              isActive ? statusColors[status] : "text-gray-500"
                            }`}
                          >
                            {status}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* Analysis Notes */}
              <div className="mt-8">
                <h4 className="font-medium text-gray-700 mb-2">
                  Analysis Notes
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700">
                    {sample.notes || "No analysis notes available yet."}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-end">
              {sample.status === "Analyzed" && (
                <button
                  onClick={() => handleViewReport(sample._id)}
                  className="px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg shadow-md hover:from-teal-700 hover:to-teal-800 transition-colors flex items-center"
                >
                  <FaFileAlt className="mr-2" />
                  View Report
                </button>
              )}

              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 transition-colors flex items-center">
                <FaDownload className="mr-2" />
                Export Data
              </button>

              <button
                onClick={() =>
                  navigate(`/dashboard/researcher/samples/edit/${sampleId}`)
                }
                className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg shadow-md hover:from-gray-700 hover:to-gray-800 transition-colors"
              >
                Edit Sample
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default SampleDetailsPage;
