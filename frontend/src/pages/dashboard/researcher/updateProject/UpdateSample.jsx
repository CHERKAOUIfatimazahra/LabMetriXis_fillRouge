import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../../../components/dashboard/Header";
import Sidebar from "../../../../components/dashboard/Sidebar";
import {
  FaChartLine,
  FaClipboardList,
  FaUsers,
  FaFileAlt,
  FaFlask,
  FaUpload,
  FaSave,
  FaExclamationTriangle,
  FaCheckCircle,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaInfo,
  FaArrowLeft,
} from "react-icons/fa";
import axios from "axios";

function UpdateSample() {
  const { projectId, sampleId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState("projects");
  const [protocolFile, setProtocolFile] = useState(null);
  const [currentProtocolFile, setCurrentProtocolFile] = useState(null);
  const [availableTeamMembers, setAvailableTeamMembers] = useState([]);
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
  const [sampleStatuses, setSampleStatuses] = useState([
    "Pending",
    "In Analysis",
    "Analyzed",
  ]);

  // Alert state
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "", // success, error, warning
  });

  // Form validation errors state
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Sample data state
  const [sampleData, setSampleData] = useState({
    name: "",
    description: "",
    type: "",
    quantity: "",
    unit: "",
    storageConditions: "",
    collectionDate: "",
    expirationDate: "",
    protocolFile: null,
    technicianResponsible: "",
    status: "Pending",
  });

  // Fetch sample data
  useEffect(() => {
    const fetchSample = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${
            import.meta.env.VITE_API_URL
          }/project/projects/samples/${sampleId}`,

          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
          {
            sampleData: JSON.stringify(sampleData),
            // Si un fichier est sélectionné
            file: protocolFile,
          }
        );

        const sample = response.data;

        // Format dates for input fields (YYYY-MM-DD)
        const formatDate = (dateString) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          return date.toISOString().split("T")[0];
        };

        setSampleData({
          name: sample.name || "",
          description: sample.description || "",
          type: sample.type || "",
          quantity: sample.quantity || "",
          unit: sample.unit || "",
          storageConditions: sample.storageConditions || "",
          collectionDate: formatDate(sample.collectionDate),
          expirationDate: formatDate(sample.expirationDate),
          technicianResponsible: sample.technicianResponsible?._id,
          status: sample.status || "Pending",
        });

        // Set protocol file info if it exists
        if (sample.protocolFile) {
          setCurrentProtocolFile({
            name: sample.protocolFile.fileName,
            path: sample.protocolFile.fileLocation,
          });
        }

        console.log(sample);
        console.log(sample.technicianResponsible);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching sample data:", error);
        setAlert({
          show: true,
          message: "Erreur lors du chargement des données de l'échantillon",
          type: "error",
        });
        setIsLoading(false);
      }
    };

    const fetchTeamMembers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/project/available-technicians`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAvailableTeamMembers(response.data || []);
      } catch (error) {
        console.error("Error fetching team members:", error);
      }
    };

    if (sampleId) {
      fetchSample();
      fetchTeamMembers();
    }
  }, [sampleId]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!sampleData.name || sampleData.name.trim() === "") {
      newErrors.name = "Le nom de l'échantillon est requis";
    }

    if (!sampleData.description || sampleData.description.trim() === "") {
      newErrors.description = "La description est requise";
    }

    if (!sampleData.type) {
      newErrors.type = "Le type d'échantillon est requis";
    }

    if (!sampleData.quantity) {
      newErrors.quantity = "La quantité est requise";
    } else if (isNaN(sampleData.quantity) || Number(sampleData.quantity) <= 0) {
      newErrors.quantity = "La quantité doit être un nombre positif";
    }

    if (!sampleData.unit) {
      newErrors.unit = "L'unité est requise";
    }

    if (!sampleData.technicianResponsible) {
      newErrors.technicianResponsible = "Un technicien responsable est requis";
    }

    if (!sampleData.collectionDate) {
      newErrors.collectionDate = "La date de collecte est requise";
    }

    // Date validation
    if (sampleData.collectionDate && sampleData.expirationDate) {
      const collectionDate = new Date(sampleData.collectionDate);
      const expirationDate = new Date(sampleData.expirationDate);

      if (expirationDate < collectionDate) {
        newErrors.expirationDate =
          "La date d'expiration doit être postérieure à la date de collecte";
      }
    }

    return newErrors;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      setSampleData({
        ...sampleData,
        [name]: files[0],
      });
      setProtocolFile(files[0]);

      // Clear protocol file error if a file is selected
      if (files[0] && errors.protocolFile) {
        setErrors({
          ...errors,
          protocolFile: null,
        });
      }
    } else {
      setSampleData({
        ...sampleData,
        [name]: value,
      });

      // Clear error for the field if it exists
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: null,
        });
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setAlert({
        show: true,
        message:
          "Veuillez corriger les erreurs avant de soumettre le formulaire",
        type: "error",
      });

      // Automatically hide alert after 5 seconds
      setTimeout(() => {
        setAlert({ show: false, message: "", type: "" });
      }, 5000);

      return;
    }

    try {
      const token = localStorage.getItem("token");

      // Create form data if there's a file, otherwise just send JSON
      if (protocolFile) {
        const formData = new FormData();
        formData.append("protocolFile", protocolFile);

        // Append other sample data
        const dataToSend = { ...sampleData };
        delete dataToSend.protocolFile;
        formData.append("sampleData", JSON.stringify(dataToSend));

        await axios.put(
          `${
            import.meta.env.VITE_API_URL
          }/project/projects/samples/${sampleId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        // Send JSON data without file
        await axios.put(
          `${
            import.meta.env.VITE_API_URL
          }/project/projects/samples/${sampleId}`,
          sampleData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Show success alert
      setAlert({
        show: true,
        message: "Échantillon mis à jour avec succès!",
        type: "success",
      });

      // Navigate back after 2 seconds
      setTimeout(() => {
        navigate(`/dashboard/researcher/projects/${projectId}`);
      }, 2000);
    } catch (error) {
      console.error("Error updating sample:", error);
      setAlert({
        show: true,
        message: "Erreur lors de la mise à jour de l'échantillon",
        type: "error",
      });

      // Automatically hide alert after 5 seconds
      setTimeout(() => {
        setAlert({ show: false, message: "", type: "" });
      }, 5000);
    }
  };

  // Navigation items config
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

  // Get file icon based on extension
  const getFileIcon = (fileName) => {
    if (!fileName) return <FaUpload />;

    const extension = fileName.split(".").pop().toLowerCase();

    if (["pdf"].includes(extension)) return <FaFilePdf />;
    if (["doc", "docx"].includes(extension)) return <FaFileWord />;
    if (["xls", "xlsx"].includes(extension)) return <FaFileExcel />;

    return <FaFileAlt />;
  };

  // Alert component
  const AlertComponent = ({ show, message, type }) => {
    if (!show) return null;

    const alertStyles = {
      success: "bg-green-100 border-green-500 text-green-700",
      error: "bg-red-100 border-red-500 text-red-700",
      warning: "bg-yellow-100 border-yellow-500 text-yellow-700",
      info: "bg-blue-100 border-blue-500 text-blue-700",
    };

    const alertIcons = {
      success: <FaCheckCircle className="h-5 w-5 text-green-500" />,
      error: <FaExclamationTriangle className="h-5 w-5 text-red-500" />,
      warning: <FaExclamationTriangle className="h-5 w-5 text-yellow-500" />,
      info: <FaInfo className="h-5 w-5 text-blue-500" />,
    };

    return (
      <div
        className={`fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg flex items-center ${alertStyles[type]}`}
      >
        <div className="mr-3">{alertIcons[type]}</div>
        <div className="text-sm font-medium">{message}</div>
        <button
          onClick={() => setAlert({ show: false, message: "", type: "" })}
          className="ml-4 text-gray-500 hover:text-gray-800 focus:outline-none"
        >
          ×
        </button>
      </div>
    );
  };

  // Loading component
  const LoadingComponent = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Alert Component */}
      <AlertComponent
        show={alert.show}
        message={alert.message}
        type={alert.type}
      />
      {/* Header Component */}
      <Header
        title="LabMetriXis - Recherche Scientifique"
        userName="Dr. Roberts"
        userInitials="DR"
        notificationCount={3}
        bgColor="bg-teal-700"
        hoverColor="text-teal-200"
      />

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Component */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            navItems={navItems}
            accentColor="teal"
          />

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() =>
                      navigate(`/dashboard/researcher/projects/${projectId}`)
                    }
                    className="flex items-center text-teal-600 hover:text-teal-800"
                  >
                    <FaArrowLeft className="mr-2" /> Retour au projet
                  </button>
                  <h1 className="text-2xl font-bold">Modifier l'échantillon</h1>
                </div>
                {project && (
                  <div className="text-gray-600">
                    Projet:{" "}
                    <span className="font-semibold">{project.name}</span>
                  </div>
                )}
              </div>

              {isLoading ? (
                <LoadingComponent />
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Sample name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nom de l'échantillon*
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={sampleData.name}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md border ${
                          errors.name ? "border-red-500" : "border-gray-300"
                        } px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500`}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Sample type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Type*
                      </label>
                      <select
                        name="type"
                        value={sampleData.type}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md border ${
                          errors.type ? "border-red-500" : "border-gray-300"
                        } px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500`}
                      >
                        <option value="">Sélectionner un type</option>
                        {sampleTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      {errors.type && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.type}
                        </p>
                      )}
                    </div>

                    {/* Sample quantity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Quantité*
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                          type="number"
                          name="quantity"
                          value={sampleData.quantity}
                          onChange={handleInputChange}
                          step="0.01"
                          min="0"
                          className={`block w-full flex-1 rounded-none rounded-l-md border ${
                            errors.quantity
                              ? "border-red-500"
                              : "border-gray-300"
                          } px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-teal-500`}
                        />
                        <select
                          name="unit"
                          value={sampleData.unit}
                          onChange={handleInputChange}
                          className={`rounded-r-md border ${
                            errors.unit ? "border-red-500" : "border-gray-300"
                          } px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-teal-500`}
                        >
                          <option value="">Unité</option>
                          {units.map((unit) => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                      </div>
                      {(errors.quantity || errors.unit) && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.quantity || errors.unit}
                        </p>
                      )}
                    </div>

                    {/* Storage conditions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Conditions de stockage
                      </label>
                      <select
                        name="storageConditions"
                        value={sampleData.storageConditions}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500"
                      >
                        <option value="">Sélectionner les conditions</option>
                        {storageConditions.map((condition) => (
                          <option key={condition} value={condition}>
                            {condition}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Collection date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Date de collecte*
                      </label>
                      <input
                        type="date"
                        name="collectionDate"
                        value={sampleData.collectionDate}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md border ${
                          errors.collectionDate
                            ? "border-red-500"
                            : "border-gray-300"
                        } px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500`}
                      />
                      {errors.collectionDate && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.collectionDate}
                        </p>
                      )}
                    </div>

                    {/* Expiration date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Date d'expiration
                      </label>
                      <input
                        type="date"
                        name="expirationDate"
                        value={sampleData.expirationDate}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md border ${
                          errors.expirationDate
                            ? "border-red-500"
                            : "border-gray-300"
                        } px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500`}
                      />
                      {errors.expirationDate && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.expirationDate}
                        </p>
                      )}
                    </div>

                    {/* Technician responsible */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Technicien responsable*
                      </label>
                      <select
                        name="technicianResponsible"
                        value={sampleData.technicianResponsible}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border ${
                          errors.technicianResponsible
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500`}
                      >
                        <option value="">Sélectionner un technicien</option>
                        {availableTeamMembers.map((tech) => (
                          <option key={tech._id} value={tech._id}>
                            {tech.firstName && tech.lastName
                              ? `${tech.firstName} ${tech.lastName}`
                              : tech.name || tech.email}
                          </option>
                        ))}
                      </select>
                      {errors.technicianResponsible && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                          <FaExclamationTriangle className="mr-1" />{" "}
                          {errors.technicianResponsible}
                        </p>
                      )}
                    </div>

                    {/* Sample status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Statut
                      </label>
                      <select
                        name="status"
                        value={sampleData.status}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500"
                      >
                        {sampleStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description*
                    </label>
                    <textarea
                      name="description"
                      value={sampleData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className={`mt-1 block w-full rounded-md border ${
                        errors.description
                          ? "border-red-500"
                          : "border-gray-300"
                      } px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500`}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* Protocol file */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Protocole (fichier)
                    </label>
                    <div className="mt-1 flex items-center">
                      <div className="flex-grow">
                        <label
                          htmlFor="protocolFile"
                          className="cursor-pointer flex items-center justify-center w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                          <FaUpload className="mr-2" />
                          {protocolFile
                            ? protocolFile.name
                            : currentProtocolFile
                            ? currentProtocolFile.name
                            : "Télécharger un protocole"}
                        </label>
                        <input
                          id="protocolFile"
                          name="protocolFile"
                          type="file"
                          className="sr-only"
                          onChange={handleInputChange}
                        />
                      </div>
                      {(protocolFile || currentProtocolFile) && (
                        <div className="ml-3 flex items-center space-x-3">
                          <div className="flex items-center">
                            {getFileIcon(
                              protocolFile
                                ? protocolFile.name
                                : currentProtocolFile?.name
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {errors.protocolFile && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.protocolFile}
                      </p>
                    )}
                  </div>

                  {/* Submit buttons */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/dashboard/researcher/projects/${projectId}`)
                      }
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none"
                    >
                      <FaSave className="inline mr-2" />
                      Enregistrer les modifications
                    </button>
                  </div>
                </form>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default UpdateSample;
