import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../../components/dashboard/Header";
import Sidebar from "../../../components/dashboard/Sidebar";
import { toast } from "react-toastify";
import {
  FaChartLine,
  FaClipboardList,
  FaUsers,
  FaFileAlt,
  FaArrowLeft,
  FaFile,
  FaCalendarAlt,
  FaCheckCircle,
  FaSave,
  FaPaperPlane,
  FaBold,
  FaItalic,
  FaUnderline,
  FaListUl,
  FaListOl,
  FaHeading,
  FaLink,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaUpload,
  FaDownload,
  FaImage,
  FaTable,
} from "react-icons/fa";

function CreateFinalReportPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("publications");
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [project, setProject] = useState(null);
  const [formData, setFormData] = useState({
    content: "",
    publishedAt: new Date().toISOString().substr(0, 10),
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Fetch project details when component mounts
    const fetchProject = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/project/projects/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setProject(response.data);

        // Pre-populate with existing data if available
        if (response.data.finalReport && response.data.finalReport.content) {
          setFormData({
            content: response.data.finalReport.content,
            publishedAt: new Date(response.data.finalReport.publishedAt)
              .toISOString()
              .substr(0, 10),
          });
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        toast.error("Erreur lors du chargement du projet");
      }
    };

    fetchProject();
  }, [projectId]);

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
  ];

  const saveAsDraft = async () => {
    setSaveLoading(true);
    try {
      await axios.patch(
        `${
          import.meta.env.VITE_API_URL
        }/projects/${projectId}/final-report-draft`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Brouillon sauvegardé avec succès");
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Erreur lors de la sauvegarde du brouillon");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/projects/${projectId}/final-report`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Rapport final publié avec succès");
      navigate(`/dashboard/researcher/projects/${projectId}`);
    } catch (error) {
      console.error("Error creating final report:", error);
      toast.error("Erreur lors de la création du rapport final");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadReport = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      // For now, we'll just set the file content as plain text
      // In a real implementation, you would parse the document format
      setFormData({
        ...formData,
        content: event.target.result,
      });
      toast.success(`Fichier "${file.name}" importé avec succès`);
    };
    reader.readAsText(file);
  };

  const downloadReport = () => {
    // Create a downloadable file
    const element = document.createElement("a");
    const file = new Blob([formData.content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${project.projectName.replace(
      /\s+/g,
      "_"
    )}_Final_Report.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Dummy function for text formatting buttons (would be implemented with a rich text editor)
  const formatText = (format) => {
    // In a real implementation, this would apply formatting to the selected text
    toast.info(
      `Fonction de formatage "${format}" à implémenter avec un éditeur de texte riche`
    );
  };

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
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            navItems={navItems}
            accentColor="teal"
          />

          <main className="flex-1">
            <div className="mb-6 flex justify-between items-center">
              <button
                onClick={() =>
                  navigate(`/dashboard/researcher/projects/${projectId}`)
                }
                className="flex items-center text-teal-700 hover:text-teal-800 transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                <span>Retour au projet</span>
              </button>

              <div className="text-sm text-gray-600">
                Document • {formData.content.split(/\s+/).length} mots
              </div>
            </div>

            {project && (
              <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                {/* Project Summary Header */}
                <div className="bg-teal-700 text-white p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h1 className="text-xl md:text-2xl font-bold mb-1">
                        {project.projectName}
                      </h1>
                      <p className="text-teal-100">{project.researchDomain}</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-teal-600 text-sm font-medium">
                        <FaFileAlt className="mr-2" />
                        Rapport Final
                      </span>
                    </div>
                  </div>
                </div>

                {/* Project Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-teal-50">
                  <div className="bg-white p-3 rounded-lg shadow flex items-center">
                    <div className="bg-teal-100 p-2 rounded-full mr-3">
                      <FaCalendarAlt className="text-teal-700" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date de fin</p>
                      <p className="font-medium">
                        {new Date(project.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg shadow flex items-center">
                    <div className="bg-teal-100 p-2 rounded-full mr-3">
                      <FaCheckCircle className="text-teal-700" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Statut</p>
                      <p className="font-medium">{project.status}</p>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg shadow flex items-center">
                    <div className="bg-teal-100 p-2 rounded-full mr-3">
                      <FaFile className="text-teal-700" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Rapport final</p>
                      <p className="font-medium text-teal-600">En création</p>
                    </div>
                  </div>
                </div>

                {/* Form Section with Word-like UI */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-teal-800 mb-6 flex items-center">
                    <FaFileAlt className="mr-2" />
                    Rapport Final du Projet
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="w-full md:w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date de publication
                        </label>
                        <input
                          type="date"
                          value={formData.publishedAt}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              publishedAt: e.target.value,
                            })
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                          required
                        />
                      </div>

                      <div className="w-full md:w-1/2 flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Importer/Exporter
                        </label>
                        <div className="flex gap-2 h-full">
                          <button
                            type="button"
                            onClick={handleUploadReport}
                            className="flex-1 flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                          >
                            <FaUpload /> Importer
                          </button>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".txt,.md,.doc,.docx"
                          />
                          <button
                            type="button"
                            onClick={downloadReport}
                            className="flex-1 flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                          >
                            <FaDownload /> Exporter
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Word-like text editor toolbar */}
                    <div className="rounded-t-lg border border-gray-300 border-b-0 overflow-hidden">
                      <div className="bg-gray-100 px-3 py-2 flex flex-wrap items-center gap-1">
                        <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
                          <button
                            type="button"
                            onClick={() => formatText("heading")}
                            className="p-1.5 rounded hover:bg-gray-200"
                            title="Titre"
                          >
                            <FaHeading className="text-gray-700" />
                          </button>
                        </div>

                        <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
                          <button
                            type="button"
                            onClick={() => formatText("bold")}
                            className="p-1.5 rounded hover:bg-gray-200"
                            title="Gras"
                          >
                            <FaBold className="text-gray-700" />
                          </button>
                          <button
                            type="button"
                            onClick={() => formatText("italic")}
                            className="p-1.5 rounded hover:bg-gray-200"
                            title="Italique"
                          >
                            <FaItalic className="text-gray-700" />
                          </button>
                          <button
                            type="button"
                            onClick={() => formatText("underline")}
                            className="p-1.5 rounded hover:bg-gray-200"
                            title="Souligné"
                          >
                            <FaUnderline className="text-gray-700" />
                          </button>
                        </div>

                        <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
                          <button
                            type="button"
                            onClick={() => formatText("bullet-list")}
                            className="p-1.5 rounded hover:bg-gray-200"
                            title="Liste à puces"
                          >
                            <FaListUl className="text-gray-700" />
                          </button>
                          <button
                            type="button"
                            onClick={() => formatText("numbered-list")}
                            className="p-1.5 rounded hover:bg-gray-200"
                            title="Liste numérotée"
                          >
                            <FaListOl className="text-gray-700" />
                          </button>
                        </div>

                        <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
                          <button
                            type="button"
                            onClick={() => formatText("align-left")}
                            className="p-1.5 rounded hover:bg-gray-200"
                            title="Aligner à gauche"
                          >
                            <FaAlignLeft className="text-gray-700" />
                          </button>
                          <button
                            type="button"
                            onClick={() => formatText("align-center")}
                            className="p-1.5 rounded hover:bg-gray-200"
                            title="Centrer"
                          >
                            <FaAlignCenter className="text-gray-700" />
                          </button>
                          <button
                            type="button"
                            onClick={() => formatText("align-right")}
                            className="p-1.5 rounded hover:bg-gray-200"
                            title="Aligner à droite"
                          >
                            <FaAlignRight className="text-gray-700" />
                          </button>
                        </div>

                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() => formatText("link")}
                            className="p-1.5 rounded hover:bg-gray-200"
                            title="Insérer un lien"
                          >
                            <FaLink className="text-gray-700" />
                          </button>
                          <button
                            type="button"
                            onClick={() => formatText("image")}
                            className="p-1.5 rounded hover:bg-gray-200"
                            title="Insérer une image"
                          >
                            <FaImage className="text-gray-700" />
                          </button>
                          <button
                            type="button"
                            onClick={() => formatText("table")}
                            className="p-1.5 rounded hover:bg-gray-200"
                            title="Insérer un tableau"
                          >
                            <FaTable className="text-gray-700" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Main text editor */}
                    <div className="rounded-b-lg border border-gray-300 overflow-hidden mt-0 shadow-sm">
                      <textarea
                        value={formData.content}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            content: e.target.value,
                          })
                        }
                        rows={25}
                        placeholder="Rédigez le rapport final de votre projet de recherche ici. Incluez les sections suivantes: Titre, Résumé, Introduction, Méthodologie, Résultats, Discussion, Conclusion, Références."
                        className="block w-full border-0 focus:ring-0 resize-y p-6"
                        style={{
                          fontFamily: "'Times New Roman', serif",
                          fontSize: "14px",
                          lineHeight: "1.6",
                          minHeight: "600px",
                        }}
                        required
                      />
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-500 px-2">
                      <div>Format: Document texte</div>
                      <div>
                        Mots:{" "}
                        {formData.content.split(/\s+/).filter(Boolean).length} |
                        Caractères: {formData.content.length}
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-end space-y-3 md:space-y-0 md:space-x-4 pt-4 border-t">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/dashboard/researcher/projects/${projectId}`
                          )
                        }
                        className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Annuler
                      </button>

                      <button
                        type="button"
                        onClick={saveAsDraft}
                        disabled={saveLoading}
                        className={`px-5 py-2.5 bg-white border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-center ${
                          saveLoading ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                      >
                        <FaSave className="mr-2" />
                        {saveLoading
                          ? "Sauvegarde..."
                          : "Sauvegarder brouillon"}
                      </button>

                      <button
                        type="submit"
                        disabled={loading}
                        className={`px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center ${
                          loading ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                      >
                        <FaPaperPlane className="mr-2" />
                        {loading ? "Publication..." : "Publier le rapport"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default CreateFinalReportPage;
