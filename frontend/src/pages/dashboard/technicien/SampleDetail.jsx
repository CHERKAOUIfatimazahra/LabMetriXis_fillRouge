import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaVial,
  FaArrowLeft,
  FaEdit,
  FaFilePdf,
  FaDownload,
  FaChevronRight,
  FaFlask,
  FaTools,
  FaUsers,
  FaUserCircle,
  FaRegClipboard,
  FaTemperatureHigh,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaHourglassEnd,
  FaTag,
  FaInfo,
} from "react-icons/fa";
import Header from "../../../components/dashboard/Header";
import Sidebar from "../../../components/dashboard/Sidebar";

function SampleDetail() {
  const { sampleId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("samples");
  const [sample, setSample] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState("");
  const [userInitials, setUserInitials] = useState("");
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: <FaRegClipboard />,
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
      icon: <FaTools />,
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
      icon: <FaUserCircle />,
      navigator: "/dashboard/technician/profile",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Analyzed":
        return {
          bg: "bg-emerald-100",
          text: "text-emerald-800",
          border: "border-emerald-200",
          icon: <FaFlask className="mr-1.5" />,
          fullBg: "bg-emerald-600",
        };
      case "In Analysis":
        return {
          bg: "bg-blue-100",
          text: "text-blue-800",
          border: "border-blue-200",
          icon: <FaVial className="mr-1.5 animate-pulse" />,
          fullBg: "bg-blue-600",
        };
      case "Pending":
        return {
          bg: "bg-amber-100",
          text: "text-amber-800",
          border: "border-amber-200",
          icon: <FaHourglassEnd className="mr-1.5" />,
          fullBg: "bg-amber-600",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          border: "border-gray-200",
          icon: <FaInfo className="mr-1.5" />,
          fullBg: "bg-gray-600",
        };
    }
  };

  useEffect(() => {
    const loadSampleData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_API_URL
          }/project/projects/samples/${sampleId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        console.log("Sample data:", response.data);
        setSample(response.data);
      } catch (err) {
        setError("Error loading sample details.");
        console.error("Error fetching sample details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSampleData();
  }, [sampleId]);

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

  const handleStartAnalysis = async () => {
    if (
      !sample ||
      sample.status === "In Analysis" ||
      sample.status === "Analysis"
    )
      return;

    setStatusUpdateLoading(true);

    try {
      const newStatus =
        sample.status === "In Analysis" ? "Analysis" : "In Analysis";
      
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/samples/samples/${sampleId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setSample({
        ...sample,
        status: newStatus,
      });
    } catch (err) {
      setError("Failed to update sample status.");
      console.error("Error updating sample status:", err);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleCreateReport = () => {
    navigate(`/dashboard/technician/samples/${sampleId}/report`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-t-4 border-indigo-600 border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-indigo-800 font-medium">
            Loading sample details...
          </p>
        </div>
      </div>
    );
  }

  if (!sample) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 max-w-md mx-auto bg-white rounded-xl shadow-md">
          <FaVial className="mx-auto text-gray-400 w-16 h-16 mb-4" />
          <p className="text-xl font-medium text-gray-800 mb-4">
            Sample not found
          </p>
          <button
            onClick={() => navigate("/dashboard/technician/samples")}
            className="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center mx-auto"
          >
            <FaArrowLeft className="mr-2" />
            Back to Samples
          </button>
        </div>
      </div>
    );
  }

  const statusStyles = getStatusColor(sample.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <Header
        title="Sample Details"
        userName={userName || "Lab Technician"}
        userInitials={userInitials || "LT"}
        bgColor="bg-indigo-700 backdrop-filter backdrop-blur-lg bg-opacity-95"
        hoverColor="text-indigo-200"
      />

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              navItems={navItems}
              accentColor="indigo"
            />
          </div>

          <main className="flex-1">
            {/* Navigation */}
            <div className="mb-6">
              <button
                onClick={() => navigate("/dashboard/technician/samples")}
                className="group flex items-center text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
              >
                <div className="p-1.5 rounded-full bg-indigo-100 group-hover:bg-indigo-200 transition-colors mr-2">
                  <FaArrowLeft className="text-indigo-600" />
                </div>
                Back to Samples List
              </button>
            </div>

            {/* Sample Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Left Status Bar */}
                <div
                  className={`${statusStyles.fullBg} w-full md:w-2 flex-shrink-0`}
                ></div>

                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${statusStyles.bg} ${statusStyles.text} ${statusStyles.border}`}
                        >
                          {statusStyles.icon}
                          {sample.status}
                        </span>
                      </div>
                      <h1 className="text-2xl font-bold text-gray-800 mb-1">
                        {sample.name}
                      </h1>
                      <p className="text-gray-500 flex items-center">
                        <FaTag className="mr-1.5 text-gray-400" />
                        ID: {sample._id}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                      {sample.status === "Pending" && (
                        <button
                          onClick={handleStartAnalysis}
                          disabled={statusUpdateLoading}
                          className={`px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm ${
                            statusUpdateLoading
                              ? "opacity-70 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {statusUpdateLoading ? (
                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                          ) : (
                            <FaEdit className="mr-2" />
                          )}
                          Start Analysis
                        </button>
                      )}

                      {sample.status === "In Analysis" && (
                        <button
                          onClick={handleCreateReport}
                          className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center shadow-sm"
                        >
                          <FaFilePdf className="mr-2" />
                          Create Report
                        </button>
                      )}

                      {sample.status === "Analyzed" && sample.protocolFile && (
                        <button className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center shadow-sm">
                          <FaDownload className="mr-2" />
                          Download Report
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sample Information */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                      <FaInfo className="mr-2 text-indigo-600" />
                      Sample Information
                    </h2>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-500">
                          Description
                        </h3>
                        <p className="text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100">
                          {sample.description || "No description provided"}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <FaFlask className="text-indigo-600" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-xs font-medium text-gray-500">
                              Type
                            </h3>
                            <p className="text-gray-800 font-medium">
                              {sample.type}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <FaVial className="text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-xs font-medium text-gray-500">
                              Quantity
                            </h3>
                            <p className="text-gray-800 font-medium">
                              {sample.quantity} {sample.unit}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <FaTemperatureHigh className="text-amber-600" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-xs font-medium text-gray-500">
                              Storage Conditions
                            </h3>
                            <p className="text-gray-800 font-medium">
                              {sample.storageConditions || "Not specified"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <FaMapMarkerAlt className="text-emerald-600" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-xs font-medium text-gray-500">
                              Identification
                            </h3>
                            <p className="text-gray-800 font-medium">
                              {sample.identification}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <FaCalendarAlt className="text-purple-600" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-xs font-medium text-gray-500">
                            Collection Date
                          </h3>
                          <p className="text-gray-800 font-medium">
                            {formatDate(sample.collectionDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                          <FaCalendarAlt className="text-red-600" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-xs font-medium text-gray-500">
                            Expiration Date
                          </h3>
                          <p className="text-gray-800 font-medium">
                            {formatDate(sample.expirationDate) || "Not set"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analysis Report */}
                {sample.status === "Analyzed" && sample.analysisReport && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                      <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                        <FaRegClipboard className="mr-2 text-indigo-600" />
                        Analysis Results
                      </h2>
                    </div>

                    <div className="p-6">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <p className="text-gray-800 whitespace-pre-line">
                          {sample.analysisReport}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Side Info */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                      <FaChevronRight className="mr-2 text-indigo-600" />
                      Sample protocolFile
                    </h2>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      {/* Report Status */}
                      {sample.protocolFile && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                          <div className="p-6">
                            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex items-center">
                              <FaFilePdf className="text-indigo-600 text-lg mr-3" />
                              <div>
                                <p className="text-sm font-medium text-indigo-800">
                                  {sample.protocolFile.fileName ||
                                    "Analysis Report"}
                                </p>
                                <p className="text-xs text-indigo-600">
                                  Uploaded:{" "}
                                  {formatDate(sample.protocolFile.uploadDate)}
                                </p>
                              </div>
                            </div>

                            {sample.protocolFile?.fileName ? (
                              <a
                                href={`${
                                  import.meta.env.VITE_API_URL
                                }/${sample.protocolFile.fileLocation.replace(
                                  /\\/g,
                                  "/"
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                              >
                                <FaDownload className="mr-2" />
                                Download Report
                              </a>
                            ) : (
                              <p className="mt-4 text-sm text-gray-600">
                                Aucun fichier
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              ;
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default SampleDetail;
