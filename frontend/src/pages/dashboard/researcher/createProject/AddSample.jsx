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
  FaVial,
  FaExclamationTriangle,
  FaCheckCircle,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaInfo,
} from "react-icons/fa";
import axios from "axios";

function AddSample() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState("projects");
  const [protocolFile, setProtocolFile] = useState(null);
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

  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "",
  });

  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    samples: [],

    currentSample: {
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
    },
  });

  const validateSample = (sample) => {
    const newErrors = {};

    if (!sample.name || sample.name.trim() === "") {
      newErrors.name = "Le nom de l'échantillon est requis";
    }

    if (!sample.description || sample.description.trim() === "") {
      newErrors.description = "La description est requise";
    }

    if (!sample.type) {
      newErrors.type = "Le type d'échantillon est requis";
    }

    if (!sample.quantity) {
      newErrors.quantity = "La quantité est requise";
    } else if (isNaN(sample.quantity) || Number(sample.quantity) <= 0) {
      newErrors.quantity = "La quantité doit être un nombre positif";
    }

    if (!sample.unit) {
      newErrors.unit = "L'unité est requise";
    }

    if (!sample.technicianResponsible) {
      newErrors.technicianResponsible = "Un technicien responsable est requis";
    }

    if (!sample.collectionDate) {
      newErrors.collectionDate = "La date de collecte est requise";
    }

    if (!sample.protocolFile) {
      newErrors.protocolFile = "Un fichier de protocole est requis";
    }

    if (sample.collectionDate && sample.expirationDate) {
      const collectionDate = new Date(sample.collectionDate);
      const expirationDate = new Date(sample.expirationDate);

      if (expirationDate < collectionDate) {
        newErrors.expirationDate =
          "La date d'expiration doit être postérieure à la date de collecte";
      }
    }

    return newErrors;
  };

  const handleSampleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      setFormData({
        ...formData,
        currentSample: {
          ...formData.currentSample,
          [name]: files[0],
        },
      });
      setProtocolFile(files[0]);

      if (files[0] && errors.protocolFile) {
        setErrors({
          ...errors,
          protocolFile: null,
        });
      }
    } else {
      setFormData({
        ...formData,
        currentSample: {
          ...formData.currentSample,
          [name]: value,
        },
      });

      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: null,
        });
      }
    }
  };

  const handleAddSample = () => {
    const validationErrors = validateSample(formData.currentSample);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      setAlert({
        show: true,
        message: "Veuillez corriger les erreurs avant d'ajouter l'échantillon",
        type: "error",
      });

      setTimeout(() => {
        setAlert({ show: false, message: "", type: "" });
      }, 5000);

      return;
    }

    setFormData({
      ...formData,
      samples: [
        ...formData.samples,
        {
          ...formData.currentSample,
          id: Date.now(),
        },
      ],
      currentSample: {
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
      },
    });

    setAlert({
      show: true,
      message: "Échantillon ajouté avec succès à la liste",
      type: "success",
    });

    setTimeout(() => {
      setAlert({ show: false, message: "", type: "" });
    }, 5000);

    setErrors({});
    setProtocolFile(null);
  };

  const handleRemoveSample = (sampleId) => {
    setFormData({
      ...formData,
      samples: formData.samples.filter((sample) => sample.id !== sampleId),
    });

    setAlert({
      show: true,
      message: "Échantillon retiré de la liste",
      type: "info",
    });

    setTimeout(() => {
      setAlert({ show: false, message: "", type: "" });
    }, 5000);
  };

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/project/projects/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProject(response.data);
      } catch (error) {
        console.error("Error fetching project:", error);
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

    if (projectId) {
      fetchProject();
      fetchTeamMembers();
    }
  }, [projectId]);

  useEffect(() => {
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
        // console.log(response.data);
        setAvailableTeamMembers(response.data || []);
      } catch (error) {
        console.error("Error fetching team members:", error);
      }
    };
    fetchTeamMembers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.samples.length === 0) {
      setAlert({
        show: true,
        message: "Veuillez ajouter au moins un échantillon",
        type: "warning",
      });

      setTimeout(() => {
        setAlert({ show: false, message: "", type: "" });
      }, 5000);

      return;
    }

    try {
      const token = localStorage.getItem("token");

      const samplePromises = formData.samples.map(async (sample) => {
        const sampleData = {
          name: sample.name,
          description: sample.description,
          type: sample.type,
          quantity: sample.quantity,
          unit: sample.unit,
          storageConditions: sample.storageConditions,
          collectionDate: sample.collectionDate,
          technicianResponsible: sample.technicianResponsible,
          status: sample.status,
          identification: `${sample.type}-${Date.now()}`,
          project: projectId,
        };

        if (sample.expirationDate) {
          sampleData.expirationDate = sample.expirationDate;
        }

        if (sample.protocolFile) {
          const fileData = new FormData();
          fileData.append("protocolFile", sample.protocolFile);
          fileData.append("sampleData", JSON.stringify(sampleData));

          return axios.post(
            `${
              import.meta.env.VITE_API_URL
            }/project/projects/${projectId}/samples`,
            fileData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
        } else {
          return axios.post(
            `${
              import.meta.env.VITE_API_URL
            }/project/projects/${projectId}/samples`,
            sampleData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
        }
      });

      await Promise.all(samplePromises);

      setAlert({
        show: true,
        message: "Échantillons ajoutés avec succès au projet!",
        type: "success",
      });

      setTimeout(() => {
        navigate(`/dashboard/researcher/projects`);
      }, 2000);
    } catch (error) {
      console.error("Error adding samples:", error);

      setAlert({
        show: true,
        message: "Échec lors de l'ajout des échantillons. Veuillez réessayer.",
        type: "error",
      });

      setTimeout(() => {
        setAlert({ show: false, message: "", type: "" });
      }, 5000);
    }
  };

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
                <h1 className="text-2xl font-bold text-gray-900">
                  Ajouter des échantillons au projet
                </h1>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section Gestion des échantillons */}
                <div className="border-t pt-6">
                  <h2 className="text-lg font-semibold text-teal-700 mb-4">
                    <FaFlask className="inline mr-2" /> Gestion des échantillons
                  </h2>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom de l'échantillon*
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.currentSample.name}
                          onChange={handleSampleChange}
                          className={`w-full px-3 py-2 border ${
                            errors.name ? "border-red-500" : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500`}
                          placeholder="Nom unique de l'échantillon"
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-500 flex items-center">
                            <FaExclamationTriangle className="mr-1" />{" "}
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description*
                        </label>
                        <input
                          type="text"
                          name="description"
                          value={formData.currentSample.description}
                          onChange={handleSampleChange}
                          className={`w-full px-3 py-2 border ${
                            errors.description
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500`}
                          placeholder="Description courte de l'échantillon"
                        />
                        {errors.description && (
                          <p className="mt-1 text-sm text-red-500 flex items-center">
                            <FaExclamationTriangle className="mr-1" />{" "}
                            {errors.description}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type d'échantillon*
                        </label>
                        <select
                          name="type"
                          value={formData.currentSample.type}
                          onChange={handleSampleChange}
                          className={`w-full px-3 py-2 border ${
                            errors.type ? "border-red-500" : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500`}
                        >
                          <option value="">Sélectionner un type</option>
                          {sampleTypes.map((type, idx) => (
                            <option key={idx} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        {errors.type && (
                          <p className="mt-1 text-sm text-red-500 flex items-center">
                            <FaExclamationTriangle className="mr-1" />{" "}
                            {errors.type}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantité*
                        </label>
                        <input
                          type="number"
                          name="quantity"
                          value={formData.currentSample.quantity}
                          onChange={handleSampleChange}
                          className={`w-full px-3 py-2 border ${
                            errors.quantity
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500`}
                          placeholder="Ex: 5, 10, 25..."
                        />
                        {errors.quantity && (
                          <p className="mt-1 text-sm text-red-500 flex items-center">
                            <FaExclamationTriangle className="mr-1" />{" "}
                            {errors.quantity}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unité*
                        </label>
                        <select
                          name="unit"
                          value={formData.currentSample.unit}
                          onChange={handleSampleChange}
                          className={`w-full px-3 py-2 border ${
                            errors.unit ? "border-red-500" : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500`}
                        >
                          <option value="">Sélectionner une unité</option>
                          {units.map((unit, idx) => (
                            <option key={idx} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                        {errors.unit && (
                          <p className="mt-1 text-sm text-red-500 flex items-center">
                            <FaExclamationTriangle className="mr-1" />{" "}
                            {errors.unit}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Technicien responsable*
                        </label>
                        <select
                          name="technicianResponsible"
                          value={formData.currentSample.technicianResponsible}
                          onChange={handleSampleChange}
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date de collecte*
                        </label>
                        <input
                          type="date"
                          name="collectionDate"
                          value={formData.currentSample.collectionDate}
                          onChange={handleSampleChange}
                          className={`w-full px-3 py-2 border ${
                            errors.collectionDate
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500`}
                        />
                        {errors.collectionDate && (
                          <p className="mt-1 text-sm text-red-500 flex items-center">
                            <FaExclamationTriangle className="mr-1" />{" "}
                            {errors.collectionDate}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date d'expiration
                        </label>
                        <input
                          type="date"
                          name="expirationDate"
                          value={formData.currentSample.expirationDate}
                          onChange={handleSampleChange}
                          className={`w-full px-3 py-2 border ${
                            errors.expirationDate
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500`}
                        />
                        {errors.expirationDate && (
                          <p className="mt-1 text-sm text-red-500 flex items-center">
                            <FaExclamationTriangle className="mr-1" />{" "}
                            {errors.expirationDate}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Conditions de stockage
                        </label>
                        <select
                          name="storageConditions"
                          value={formData.currentSample.storageConditions}
                          onChange={handleSampleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="">Sélectionner une condition</option>
                          {storageConditions.map((condition, idx) => (
                            <option key={idx} value={condition}>
                              {condition}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Protocole spécifique à l'échantillon
                        </label>
                        <div className="flex items-center">
                          <input
                            type="file"
                            name="protocolFile"
                            onChange={handleSampleChange}
                            className="hidden"
                            id="protocolFileInput"
                          />
                          <label
                            htmlFor="protocolFileInput"
                            className="cursor-pointer flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
                          >
                            <FaUpload className="mr-2" />
                            {protocolFile
                              ? protocolFile.name
                              : "Choisir un fichier"}
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        onClick={handleAddSample}
                        className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 flex items-center"
                      >
                        <FaVial className="mr-2" /> Ajouter l'échantillon
                      </button>
                    </div>
                  </div>

                  {/* Liste des échantillons ajoutés */}
                  {formData.samples.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-md font-medium text-gray-800 mb-3">
                        Échantillons associés au projet (
                        {formData.samples.length})
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="py-2 px-3 border-b text-left">
                                Nom
                              </th>
                              <th className="py-2 px-3 border-b text-left">
                                Type
                              </th>
                              <th className="py-2 px-3 border-b text-left">
                                Quantité
                              </th>
                              <th className="py-2 px-3 border-b text-left">
                                Date de collecte
                              </th>
                              <th className="py-2 px-3 border-b text-left">
                                Conditions
                              </th>
                              <th className="py-2 px-3 border-b text-left">
                                Statut
                              </th>
                              <th className="py-2 px-3 border-b text-center w-20">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.samples.map((sample) => (
                              <tr key={sample.id} className="hover:bg-gray-50">
                                <td className="py-2 px-3 border-b font-medium">
                                  {sample.name}
                                </td>
                                <td className="py-2 px-3 border-b">
                                  {sample.type}
                                </td>
                                <td className="py-2 px-3 border-b">
                                  {sample.quantity} {sample.unit}
                                </td>
                                <td className="py-2 px-3 border-b">
                                  {new Date(
                                    sample.collectionDate
                                  ).toLocaleDateString()}
                                </td>
                                <td className="py-2 px-3 border-b">
                                  {sample.storageConditions || "-"}
                                </td>
                                <td className="py-2 px-3 border-b">
                                  <span
                                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                      sample.status === "Pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : sample.status === "In Analysis"
                                        ? "bg-blue-100 text-blue-800"
                                        : sample.status === "Analyzed"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {sample.status}
                                  </span>
                                </td>
                                <td className="py-2 px-3 border-b text-center">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveSample(sample.id)
                                    }
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    Retirer
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Boutons de soumission */}
                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/dashboard/researcher/projects/${projectId}`)
                    }
                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                    disabled={formData.samples.length === 0}
                  >
                    Ajouter les échantillons au projet
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AddSample;
