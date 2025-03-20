import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../../components/dashboard/Header";
import Sidebar from "../../../../components/dashboard/Sidebar";
import {
  FaChartLine,
  FaClipboardList,
  FaUsers,
  FaFileAlt,
  FaUserPlus,
  FaSave,
  FaArrowLeft,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaFlask,
  FaEdit,
  FaTimes,
} from "react-icons/fa";
import axios from "axios";

function UpdateProjectPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState("projects");
  const [selectedMember, setSelectedMember] = useState("");
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    projectName: "",
    researchDomain: "",
    teamLead: "",
    fundingSource: "",
    budget: "",
    startDate: "",
    deadline: "",
    status: "Planning",
    collaboratingInstitutions: "",
    ethicsApproval: false,
    ethicsApprovalRef: "",
    description: "",
    expectedOutcomes: "",
    samples: [],
  });
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [usersResponse, projectResponse] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_API_URL}/project/available-team-members`,
            { headers }
          ),
          axios.get(
            `${import.meta.env.VITE_API_URL}/project/projects/${projectId}`,
            { headers }
          ),
        ]);

        const availableUsersData = usersResponse.data || [];
        setAvailableUsers(availableUsersData);

        const projectData = projectResponse.data?.project;
        if (!projectData) {
          throw new Error("Project data not found");
        }

        setOriginalData(projectData);

        const normalizeDate = (dateString) => {
          if (!dateString) return "";
          return dateString.split("T")[0];
        };

        setFormData({
          projectName: projectData.projectName || "",
          researchDomain: projectData.researchDomain || "",
          teamLead: projectData.teamLead?._id || projectData.teamLead || "",
          fundingSource: projectData.fundingSource || "",
          budget: projectData.budget || "",
          startDate: normalizeDate(projectData.startDate),
          deadline: normalizeDate(projectData.deadline),
          status: projectData.status || "Planning",
          collaboratingInstitutions:
            projectData.collaboratingInstitutions || "",
          ethicsApproval: Boolean(projectData.ethicsApproval),
          ethicsApprovalRef: projectData.ethicsApprovalRef || "",
          description: projectData.description || "",
          expectedOutcomes: projectData.expectedOutcomes || "",
          samples: Array.isArray(projectData.samples)
            ? projectData.samples
            : [],
        });

        if (
          Array.isArray(projectData.teamMembers) &&
          projectData.teamMembers.length > 0
        ) {
          const extractUserId = (member) => {
            if (typeof member === "string") return member;
            return member._id || member.$oid || "";
          };

          const teamMembersData = await Promise.all(
            projectData.teamMembers.map(async (member) => {
              const memberId = extractUserId(member);
              if (!memberId) return null;

              const cachedUser = availableUsersData.find(
                (user) => user._id === memberId || user._id?.$oid === memberId
              );

              if (cachedUser) return cachedUser;

              try {
                const userResponse = await axios.get(
                  `${import.meta.env.VITE_API_URL}/users/${memberId}`,
                  { headers }
                );
                return userResponse.data;
              } catch (error) {
                console.warn(
                  `Could not fetch team member ${memberId}:`,
                  error.message
                );
                return { _id: memberId, name: "Unknown User", role: "unknown" };
              }
            })
          );

          setSelectedTeamMembers(teamMembersData.filter(Boolean));
        }
      } catch (error) {
        console.error("Error fetching project data:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddTeamMember = () => {
    if (!selectedMember) return;

    const memberToAdd = availableUsers.find((m) => m._id === selectedMember);
    if (!memberToAdd) return;

    // Check if member already exists in selected members
    if (selectedTeamMembers.some((m) => m._id === memberToAdd._id)) {
      alert("Ce membre fait déjà partie de l'équipe.");
      return;
    }

    setSelectedTeamMembers((prevMembers) => [...prevMembers, memberToAdd]);
    setSelectedMember("");
  };

  const handleRemoveTeamMember = (memberId) => {
    if (!memberId) return;

    setSelectedTeamMembers((prevMembers) =>
      prevMembers.filter((member) => member._id !== memberId)
    );
  };

  const researchDomains = [
    "Biologie",
    "Chimie",
    "Physique",
    "Biochimie",
    "Neurosciences",
    "Géologie",
    "Informatique",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const formattedTeamMembers = selectedTeamMembers.map(
        (member) => member._id
      );

      const finalFormData = {
        projectName: formData.projectName,
        researchDomains: formData.researchDomain,
        teamLead: formData.teamLead,
        teamMembers: formattedTeamMembers,
        fundingSource: formData.fundingSource,
        budget: formData.budget,
        startDate: formData.startDate,
        deadline: formData.deadline,
        status: formData.status,
        collaboratingInstitutions: formData.collaboratingInstitutions,
        description: formData.description,
        expectedOutcomes: formData.expectedOutcomes,
      };

      // console.log("Sending data:", finalFormData);

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/project/projects/${projectId}`,
        finalFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        alert("Projet mis à jour avec succès!");
        navigate(`/dashboard/researcher/projects`);
      }
    } catch (error) {
      console.error(
        "Error updating project:",
        error.response?.data || error.message
      );
      alert(
        `Échec de la mise à jour du projet: ${
          error.response?.data?.message || error.message
        }. Veuillez réessayer.`
      );
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600 mb-4"></div>
          <p className="text-gray-600">Chargement des données du projet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
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
            {/* Project header with breadcrumb */}
            <div className="mb-6">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <span
                  className="cursor-pointer hover:text-teal-600"
                  onClick={() => navigate("/dashboard/researcher/projects")}
                >
                  Projets
                </span>
                <span className="mx-2">/</span>
                <span className="text-teal-600 font-medium">
                  {formData.projectName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                  <FaEdit className="mr-2 text-teal-600" /> Modification du
                  projet
                </h1>
                <div className="bg-yellow-100 text-yellow-800 text-sm py-1 px-3 rounded-full font-medium border border-yellow-200">
                  {formData.status || "Planning"}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              {/* Project highlights */}
              <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white p-4 border-b">
                <div className="flex flex-wrap justify-between items-center">
                  <div className="flex-grow">
                    <h2 className="text-xl font-bold mb-1">
                      {formData.projectName}
                    </h2>
                    <p className="text-teal-100 text-sm mb-2">
                      <FaFlask className="inline mr-1" />{" "}
                      {formData.researchDomain}
                    </p>
                  </div>
                  <div className="flex space-x-4 text-sm mt-2 md:mt-0">
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-1" />
                      <span>
                        Début:{" "}
                        {formData.startDate
                          ? new Date(formData.startDate).toLocaleDateString()
                          : "Non défini"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FaMoneyBillWave className="mr-1" />
                      <span>{formData.budget} DH</span>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-8">
                  <div className="border-b border-gray-200 pb-4 mb-4">
                    <h2 className="text-lg font-semibold text-teal-700 mb-4">
                      Informations générales
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="projectName"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Titre du projet*
                        </label>
                        <input
                          type="text"
                          id="projectName"
                          name="projectName"
                          value={formData.projectName}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Titre original: {originalData?.projectName}
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="researchDomain"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Domaine de recherche*
                        </label>
                        <select
                          id="researchDomain"
                          name="researchDomain"
                          value={formData.researchDomain}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                          required
                        >
                          <option value="">-- Choisissez un domaine --</option>
                          {researchDomains.map((domain) => (
                            <option key={domain} value={domain}>
                              {domain}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="fundingSource"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Source de financement
                        </label>
                        <input
                          type="text"
                          id="fundingSource"
                          name="fundingSource"
                          value={formData.fundingSource}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                          placeholder="Ex: ANR, ERC, Privé..."
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="budget"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Budget (DH)*
                        </label>
                        <input
                          type="number"
                          id="budget"
                          name="budget"
                          value={formData.budget}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                          required
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="startDate"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Date de début*
                        </label>
                        <input
                          type="date"
                          id="startDate"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                          required
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="deadline"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Date de fin prévue*
                        </label>
                        <input
                          type="date"
                          id="deadline"
                          name="deadline"
                          value={formData.deadline}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-gray-200 pb-4 mb-4">
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      État du projet
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full md:w-64 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                    >
                      <option value="Planning">Planning</option>
                      <option value="Active">Active</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Résumé du projet*
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                      required
                      placeholder="Décrivez brièvement les objectifs et la portée de ce projet de recherche..."
                    ></textarea>

                    <label
                      htmlFor="expectedOutcomes"
                      className="block text-sm font-medium text-gray-700 mt-4 mb-2"
                    >
                      Résultats attendus
                    </label>
                    <textarea
                      id="expectedOutcomes"
                      name="expectedOutcomes"
                      value={formData.expectedOutcomes}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                      placeholder="Décrivez les résultats attendus et les impacts potentiels de cette recherche..."
                    ></textarea>
                  </div>
                </div>

                {/* Section Équipe de recherche */}
                <div className="mb-8">
                  <div className="flex items-center bg-gray-50 border-l-4 border-teal-500 p-4 mb-6">
                    <FaUsers className="text-teal-600 mr-3 text-xl" />
                    <h2 className="text-lg font-semibold text-gray-800">
                      Équipe de recherche
                    </h2>
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="teamLead"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Responsable du projet*
                    </label>
                    <select
                      id="teamLead"
                      name="teamLead"
                      value={formData.teamLead}
                      onChange={handleChange}
                      className="w-full md:w-80 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                      required
                    >
                      <option value="">Sélectionner un responsable</option>
                      {availableUsers
                        .filter((user) => user.role === "chercheur")
                        .map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.name} -{" "}
                            {user.institution || "Institution non spécifiée"}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Team Members Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ajouter des membres à l'équipe
                    </label>
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="w-full md:w-64">
                        <select
                          id="teamMember"
                          value={selectedMember}
                          onChange={(e) => setSelectedMember(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                        >
                          <option value="">Sélectionner un membre</option>
                          {availableUsers.map((user) => (
                            <option key={user._id} value={user._id}>
                              {user.name} - {user.role || "Role non spécifié"}
                              {user.institution ? ` - ${user.institution}` : ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddTeamMember}
                        className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition duration-150 flex items-center"
                      >
                        <FaUserPlus className="mr-2" /> Ajouter
                      </button>
                    </div>
                  </div>

                  {/* Team Members Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b">
                      <h3 className="font-medium text-gray-700">
                        Membres de l'équipe
                      </h3>
                    </div>

                    {selectedTeamMembers.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nom
                              </th>
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rôle
                              </th>
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Spécialité
                              </th>
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Institution
                              </th>
                              <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedTeamMembers.map((member) => (
                              <tr key={member._id} className="hover:bg-gray-50">
                                <td className="py-3 px-4 whitespace-nowrap font-medium text-gray-900">
                                  {member.name || "Nom inconnu"}
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap text-gray-700">
                                  {member.role || "Rôle inconnu"}
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap text-gray-700">
                                  {member.specialty || "-"}
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap text-gray-700">
                                  {member.institution || "-"}
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap text-center">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveTeamMember(member._id)
                                    }
                                    className="text-red-500 hover:text-red-700 transition duration-150 flex items-center justify-center mx-auto"
                                    aria-label="Retirer ce membre"
                                  >
                                    <FaTimes className="mr-1" /> Retirer
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center p-4 bg-gray-50">
                        <p className="text-gray-500">
                          Aucun membre d'équipe sélectionné
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <label
                      htmlFor="collaboratingInstitutions"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Institutions collaboratrices
                    </label>
                    <input
                      type="text"
                      id="collaboratingInstitutions"
                      name="collaboratingInstitutions"
                      value={formData.collaboratingInstitutions}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                      placeholder="Séparez les institutions par des virgules"
                    />
                  </div>
                </div>

                {/* Affichage des modifications */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center mb-2">
                    <FaEdit className="text-yellow-600 mr-2" />
                    <h3 className="font-medium text-yellow-800">
                      Résumé des modifications
                    </h3>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Les modifications seront appliquées lorsque vous cliquerez
                    sur le bouton "Enregistrer les modifications".
                  </p>
                </div>

                {/* Boutons de soumission */}
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard/researcher/projects")}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 border border-gray-300 transition duration-150"
                  >
                    <FaArrowLeft className="mr-2" /> Retour aux projets
                  </button>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/dashboard/researcher/projects/${projectId}`)
                      }
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-150"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition duration-150 flex items-center"
                    >
                      <FaSave className="mr-2" /> Enregistrer les modifications
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default UpdateProjectPage;