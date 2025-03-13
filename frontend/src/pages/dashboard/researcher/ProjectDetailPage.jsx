import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaChartLine,
  FaClipboardList,
  FaUsers,
  FaFileAlt,
  FaCalendarAlt,
  FaDollarSign,
  FaFlask,
  FaEdit,
  FaArrowLeft,
  FaFileDownload,
  FaBriefcase,
  FaBuilding,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import Header from "../../../components/dashboard/Header";
import Sidebar from "../../../components/dashboard/Sidebar";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";

function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("projects");
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTeamMemberAlert, setShowTeamMemberAlert] = useState(false);
  const [showSampleAlert, setShowSampleAlert] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [selectedSampleId, setSelectedSampleId] = useState(null);

  // Navigation items config (même que dans ProjectListPage)
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

  // Function pour déterminer la couleur du statut
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

  // Function pour calculer la progression (basée sur les samples)
  const calculateProgress = (samples) => {
    const totalSamples = samples.length;
    const analyzedSamples = samples.filter(
      (sample) => sample.status === "Analyzed"
    ).length;
    if (totalSamples > 0) {
      return (analyzedSamples / totalSamples) * 100;
    } else {
      return 0;
    }
  };

  // Function pour déterminer la couleur de la progression
  const getProgressColor = (progress) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 40) return "bg-blue-500";
    return "bg-yellow-500";
  };

  // Function to show team member delete confirmation
  const confirmTeamMemberDelete = (memberId) => {
    setSelectedMemberId(memberId);
    setShowTeamMemberAlert(true);
  };

  // Function to show sample delete confirmation
  const confirmSampleDelete = (sampleId) => {
    setSelectedSampleId(sampleId);
    setShowSampleAlert(true);
  };

  // Function to handle team member deletion
  const removeTeamMember = async () => {
    try {
      const token = localStorage.getItem("token");

      // Correct URL structure with projectId and memberId
      const response = await axios.delete(
        `${
          import.meta.env.VITE_API_URL
        }/project/projects/${projectId}/team-members/${selectedMemberId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.project) {
        setProject(response.data.project);
        toast.success("Membre supprimé avec succès");
      }
    } catch (error) {
      console.error("Error removing team member:", error);
      if (error.response?.status === 403) {
        toast.error("Seul le chef d'équipe peut supprimer des membres");
      } else {
        console.error("Erreur lors de la suppression du membre");
      }
    } finally {
      setShowTeamMemberAlert(false);
      setSelectedMemberId(null);
    }
  };

  // Function to handle sample deletion
  const removeSample = async () => {
    try {
      const response = await axios.delete(
        `${
          import.meta.env.VITE_API_URL
        }/project/projects/${projectId}/samples/${selectedSampleId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setProject(response.data.project);
      toast.success("Échantillon supprimé avec succès");
    } catch (error) {
      console.error("Error removing sample:", error);
      if (error.response?.status === 403) {
        toast.error(
          "Vous n'avez pas les droits nécessaires pour supprimer cet échantillon"
        );
      } else {
        toast.error("Erreur lors de la suppression de l'échantillon");
      }
    } finally {
      setShowSampleAlert(false);
      setSelectedSampleId(null);
    }
  };

  // Fetch project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/project/projects/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setProject(response.data.project);
        // console.log(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching project details:", err);
        setError("Erreur lors du chargement des détails du projet");
        setIsLoading(false);
        toast.error("Impossible de charger les détails du projet");
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-t-4 border-teal-600 border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-teal-800 font-medium">
            Chargement des détails du projet...
          </p>
        </div>
      </div>
    );
  }

  // Calcul du progrès pour ce projet
  const progress = calculateProgress(project.samples);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Delete Team Member Confirmation Alert */}
      {showTeamMemberAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
            <div className="flex items-center text-red-500 mb-4">
              <FaExclamationTriangle className="mr-2 text-xl" />
              <h3 className="text-lg font-bold">Confirmation de suppression</h3>
            </div>
            <p className="mb-6">
              Êtes-vous sûr de vouloir supprimer ce membre de l'équipe ? Cette
              action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowTeamMemberAlert(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={isLoading}
              >
                Annuler
              </button>
              <button
                onClick={removeTeamMember}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Sample Confirmation Alert */}
      {showSampleAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
            <div className="flex items-center text-red-500 mb-4">
              <FaExclamationTriangle className="mr-2 text-xl" />
              <h3 className="text-lg font-bold">Confirmation de suppression</h3>
            </div>
            <p className="mb-6">
              Êtes-vous sûr de vouloir supprimer cet échantillon ? Cette action
              est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSampleAlert(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={removeSample}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

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
            {/* Navigation breadcrumb */}
            <div className="mb-6">
              <button
                onClick={() => navigate("/dashboard/researcher/projects")}
                className="flex items-center text-teal-700 hover:text-teal-800 transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                <span>Retour à la liste des projets</span>
              </button>
            </div>

            {/* Header du projet */}
            <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-100 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-teal-800">
                    {project.projectName}
                  </h1>
                  <div className="flex items-center mt-2">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {project.status || "N/A"}
                    </span>
                    <span className="ml-3 text-sm text-gray-500">
                      Domaine: {project.researchDomain}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        navigate(
                          `/dashboard/researcher/projects/${projectId}/create-publication`
                        )
                      }
                      className="flex items-center px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors shadow-md"
                    >
                      <FaFileAlt className="mr-2" />
                      Créer un rapport
                    </button>
                    
                  </div>

                  <button
                    onClick={() =>
                      navigate(
                        `/dashboard/researcher/projects/${projectId}/edit`
                      )
                    }
                    className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-md"
                  >
                    <FaEdit className="mr-2" />
                    Modifier
                  </button>
                </div>
              </div>
            </div>

            {/* Détails principaux et progression */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2 bg-white rounded-lg shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-teal-800 mb-4 border-b pb-2">
                  Détails du projet
                </h2>
                <p className="text-gray-700 mb-6">{project.description}</p>

                <h3 className="font-semibold text-teal-700 mb-2">
                  Résultats attendus
                </h3>
                <p className="text-gray-700 mb-6">
                  {project.expectedOutcomes || "Non spécifié"}
                </p>

                {project.collaboratingInstitutions && (
                  <>
                    <h3 className="font-semibold text-teal-700 mb-2">
                      Institutions collaboratrices
                    </h3>
                    <div className="flex items-center mb-6">
                      <FaBuilding className="text-teal-600 mr-2" />
                      <p className="text-gray-700">
                        {project.collaboratingInstitutions}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-teal-800 mb-4 border-b pb-2">
                  Progression
                </h2>
                <div className="w-full mb-6">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {progress}% terminé
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${getProgressColor(
                        progress
                      )}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-teal-700 mb-2">
                    Dates clés
                  </h3>
                  <div className="flex items-center mb-2">
                    <FaCalendarAlt className="text-teal-600 mr-2" />
                    <div>
                      <span className="text-sm font-medium">Début: </span>
                      <span className="text-gray-700">
                        {project.startDate
                          ? new Date(project.startDate).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center mb-6">
                    <FaCalendarAlt className="text-teal-600 mr-2" />
                    <div>
                      <span className="text-sm font-medium">Fin: </span>
                      <span className="text-gray-700">
                        {project.deadline
                          ? new Date(project.deadline).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-teal-700 mb-2">Budget</h3>
                  <div className="flex items-center">
                    <FaDollarSign className="text-teal-600 mr-2" />
                    <span className="text-gray-700 font-medium">
                      {project.budget
                        ? project.budget.toLocaleString() + " €"
                        : "Non spécifié"}
                    </span>
                  </div>
                  {project.fundingSource && (
                    <div className="text-sm text-gray-600 mt-1">
                      Source: {project.fundingSource}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Équipe et échantillons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                  <h2 className="text-xl font-bold text-teal-800">
                    Équipe de recherche
                  </h2>
                </div>

                {project.teamLead && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-teal-700 mb-2">
                      Chef d'équipe
                    </h3>
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-teal-200 flex items-center justify-center text-teal-700 font-semibold">
                        {project.teamLead.name
                          ? project.teamLead.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                          : "TL"}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium">
                          {project.teamLead.name || "Nom non disponible"}
                        </div>
                        {project.teamLead.institution && (
                          <div className="text-xs text-gray-500">
                            {project.teamLead.institution}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <h3 className="font-semibold text-teal-700 mb-2">
                  Membres de l'équipe
                </h3>
                {project.teamMembers && project.teamMembers.length > 0 ? (
                  <ul className="space-y-2">
                    {project.teamMembers.map((teamMember, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold">
                            {teamMember.name
                              ? teamMember.name.split(" ")[0][0] +
                                (teamMember.name.split(" ")[1]
                                  ? teamMember.name.split(" ")[1][0]
                                  : "")
                              : "M"}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium">
                              {teamMember.name || "Membre d'équipe"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {teamMember.role || "Rôle non spécifié"}
                              {teamMember.institution &&
                                ` - ${teamMember.institution}`}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            confirmTeamMemberDelete(teamMember._id)
                          }
                          className="text-red-500 hover:bg-red-50 p-2 rounded-full"
                          title="Supprimer le membre"
                        >
                          <FaTrash />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">
                    Aucun membre d'équipe ajouté
                  </p>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                  <h2 className="text-xl font-bold text-teal-800 flex items-center">
                    <FaFlask className="mr-2" />
                    Échantillons
                    {project.samples && project.samples.length > 0 && (
                      <span className="ml-2 bg-teal-100 text-teal-800 text-xs py-1 px-2 rounded-full">
                        {project.samples.length}
                      </span>
                    )}
                  </h2>
                  <button
                    onClick={() =>
                      navigate(
                        `/dashboard/researcher/projects/create/add-sample/${projectId}`
                      )
                    }
                    className="text-teal-600 hover:bg-teal-50 p-2 rounded-full"
                    title="Ajouter un échantillon"
                  >
                    <FaPlus />
                  </button>
                </div>

                {project.samples && project.samples.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                            Nom
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                            protocolFile
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                            Statut
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {project.samples.map((sample, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {sample.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {sample.identification}
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
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
                                  className="text-blue-600 hover:underline"
                                >
                                  {sample.protocolFile.fileName}
                                </a>
                              ) : (
                                "Aucun fichier"
                              )}
                            </td>

                            <td className="px-3 py-2 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  sample.status === "Analyzed"
                                    ? "bg-green-100 text-green-800"
                                    : sample.status === "In Analysis"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {sample.status}
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <button
                                onClick={() => confirmSampleDelete(sample._id)}
                                className="text-red-500 hover:bg-red-50 p-2 rounded-full"
                                title="Supprimer l'échantillon"
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaFlask className="mx-auto text-gray-300 text-4xl mb-2" />
                    <p className="text-gray-500">
                      Aucun échantillon associé à ce projet
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Rapport final */}
            {project.finalReport && project.finalReport.content && (
              <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6 mb-6">
                <h2 className="text-xl font-bold text-teal-800 mb-4 border-b pb-2">
                  Rapport final
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="prose max-w-none">
                    {project.finalReport.content}
                  </div>
                  {project.finalReport.publishedAt ? (
                    <div className="text-sm text-gray-500 mt-4">
                      Publié le:{" "}
                      {new Date(
                        project.finalReport.publishedAt
                      ).toLocaleDateString()}
                    </div>
                  ) : (
                    // Add "Create Publication" link if not published
                    <div className="mt-4">
                      <a
                        href={`/create-publication/${project._id}`}
                        className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                      >
                        Créer une publication pour ce projet
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Métadonnées */}
            <div className="bg-white rounded-lg shadow border border-gray-100 p-4">
              <div className="text-sm text-gray-500 flex flex-wrap gap-x-6 gap-y-2">
                <div>
                  <span className="font-medium">Créé le:</span>{" "}
                  {new Date(project.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Dernière mise à jour:</span>{" "}
                  {new Date(project.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetailPage;
