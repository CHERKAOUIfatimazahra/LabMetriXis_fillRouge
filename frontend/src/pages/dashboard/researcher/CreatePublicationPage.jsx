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
  FaImage,
  FaTable,
  FaFilePdf,
  FaHistory,
} from "react-icons/fa";
import { jsPDF } from "jspdf";

function CreateFinalReportPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("publications");
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [project, setProject] = useState(null);
  const [formData, setFormData] = useState({
    content: "",
    publishedAt: new Date().toISOString().substring(0, 10),
  });
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versionHistory, setVersionHistory] = useState([]);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/project/projects/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setProject(response.data);

        if (response.data.finalReport && response.data.finalReport.content) {
          setFormData({
            content: response.data.finalReport.content,
            publishedAt: new Date(response.data.finalReport.publishedAt)
              .toISOString()
              .substring(0, 10),
          });
        }

        fetchVersionHistory();
        // console.log(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching project:", error);
        toast.error("Erreur lors du chargement du projet");
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  // Function to fetch version
  const fetchVersionHistory = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/project/projects/${projectId}/report-versions`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setVersionHistory(response.data);
    } catch (error) {
      console.error("Error fetching version history:", error);
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
  ];

  const saveAsDraft = async () => {
    setSaveLoading(true);
    try {
      await axios.patch(
        `${
          import.meta.env.VITE_API_URL
        }/project/projects/${projectId}/final-report-draft`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Brouillon sauvegardé avec succès");
      fetchVersionHistory();
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
        `${
          import.meta.env.VITE_API_URL
        }/project/projects/${projectId}/final-report`,
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
      setFormData({
        ...formData,
        content: event.target.result,
      });
      toast.success(`Fichier "${file.name}" importé avec succès`);
      setAutoSaveStatus("Non sauvegardé");
    };
    reader.readAsText(file);
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF();

      const title = project?.projectName || "Rapport Final";
      doc.setFontSize(16);
      doc.text(title, 20, 20);

      doc.setFontSize(12);
      doc.text(`Date: ${formData.publishedAt}`, 20, 30);

      doc.setFontSize(12);
      const splitText = doc.splitTextToSize(formData.content, 170);
      doc.text(splitText, 20, 40);

      const safeFilename =
        project && project.projectName
          ? project.projectName.replace(/\s+/g, "_")
          : "rapport";

      doc.save(`${safeFilename}_Final_Report.pdf`);

      toast.success("PDF généré avec succès");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Erreur lors de la génération du PDF");
    }
  };
  const loadVersion = async (versionId) => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/project/projects/${projectId}/report-versions/${versionId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setFormData({
        ...formData,
        content: response.data.content,
      });

      toast.info("Version précédente chargée");
      setShowVersionHistory(false);
    } catch (error) {
      console.error("Error loading version:", error);
      toast.error("Erreur lors du chargement de la version");
    }
  };

  const formatText = (format) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);

    let formattedText = selectedText;
    let cursorOffset = 0;

    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`;
        cursorOffset = 2;
        break;
      case "italic":
        formattedText = `*${selectedText}*`;
        cursorOffset = 1;
        break;
      case "heading":
        formattedText = `\n# ${selectedText}\n`;
        cursorOffset = 3;
        break;
      case "bullet-list":
        formattedText = selectedText
          .split("\n")
          .map((line) => `- ${line}`)
          .join("\n");
        cursorOffset = 2;
        break;
      case "numbered-list":
        formattedText = selectedText
          .split("\n")
          .map((line, i) => `${i + 1}. ${line}`)
          .join("\n");
        cursorOffset = 3;
        break;
      default:
        toast.info(
          `Fonction de formatage "${format}" à implémenter avec un éditeur de texte riche`
        );
        return;
    }

    const newContent =
      formData.content.substring(0, start) +
      formattedText +
      formData.content.substring(end);

    setFormData({
      ...formData,
      content: newContent,
    });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + cursorOffset,
        start + formattedText.length - cursorOffset
      );
    }, 0);

    setAutoSaveStatus("Non sauvegardé");
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
            </div>

            {loading ? (
              <div className="bg-white rounded-lg shadow-xl p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement du projet...</p>
              </div>
            ) : project ? (
              <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                {/* Form Section */}
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
                          Gestion du document
                        </label>
                        <div className="flex gap-2 h-full">
                          <button
                            type="button"
                            onClick={handleUploadReport}
                            className="flex-1 flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                          >
                            <FaUpload /> Importer texte
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
                            onClick={generatePDF}
                            className="flex-1 flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                          >
                            <FaFilePdf /> Générer PDF
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setShowVersionHistory(!showVersionHistory)
                            }
                            className="flex-1 flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                          >
                            <FaHistory /> Historique
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Version history panel */}
                    {showVersionHistory && (
                      <div className="bg-gray-50 rounded-lg border border-gray-300 p-4 mt-2">
                        <h3 className="font-medium text-gray-700 mb-3">
                          Versions précédentes
                        </h3>
                        {versionHistory.length === 0 ? (
                          <p className="text-gray-500 text-sm">
                            Aucune version précédente disponible
                          </p>
                        ) : (
                          <div className="max-h-48 overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Taille
                                  </th>
                                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Action
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {versionHistory.map((version, index) => (
                                  <tr
                                    key={version.id || index}
                                    className="hover:bg-gray-50"
                                  >
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                      {new Date(
                                        version.createdAt
                                      ).toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                      {version.content?.length
                                        ? `${
                                            Math.round(
                                              (version.content.length / 1024) *
                                                10
                                            ) / 10
                                          } KB`
                                        : "N/A"}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                                      <button
                                        onClick={() => loadVersion(version._id)}
                                        className="text-teal-600 hover:text-teal-900"
                                      >
                                        Charger
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setShowVersionHistory(false)}
                            className="text-sm text-gray-600 hover:text-gray-900"
                          >
                            Fermer
                          </button>
                        </div>
                      </div>
                    )}

                    {/* text editor toolbar */}
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
                        ref={textareaRef}
                        value={formData.content}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            content: e.target.value,
                          });
                          setAutoSaveStatus("Non sauvegardé");
                        }}
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
            ) : (
              <div className="bg-white rounded-lg shadow-xl p-8 text-center">
                <div className="text-gray-600">
                  <FaFileAlt className="mx-auto text-4xl text-gray-400 mb-4" />
                  <p className="text-lg">Projet non trouvé</p>
                  <p className="text-sm mt-2">
                    Le projet que vous recherchez n'existe pas ou vous n'avez
                    pas les permissions nécessaires.
                  </p>
                  <button
                    onClick={() => navigate("/dashboard/researcher/projects")}
                    className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors inline-flex items-center"
                  >
                    <FaArrowLeft className="mr-2" />
                    Retour aux projets
                  </button>
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
