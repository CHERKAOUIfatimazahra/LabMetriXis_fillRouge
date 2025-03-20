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
  FaFlask,
  FaArrowLeft,
  FaFile,
  FaCalendarAlt,
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
} from "react-icons/fa";
import { jsPDF } from "jspdf";

function TechnicianReportPage() {
  const { sampleId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("samples");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sample, setSample] = useState(null);
  const [formData, setFormData] = useState({
    analysisReport: "",
  });
  const [autoSaveStatus, setAutoSaveStatus] = useState("Sauvegardé");
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const fetchSample = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${
            import.meta.env.VITE_API_URL
          }/samples/samples/${sampleId}/analysis-report`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setSample(response.data.sample);

        if (response.data.sample.analysisReport) {
          setFormData({
            analysisReport: response.data.sample.analysisReport,
          });
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching sample:", error);
        toast.error("Erreur lors du chargement de l'échantillon");
        setLoading(false);
      }
    };

    fetchSample();
  }, [sampleId]);

  const navItems = [
    {
      id: "overview",
      label: "Tableau de bord",
      icon: <FaChartLine />,
      navigator: "/dashboard/technician",
    },
    {
      id: "samples",
      label: "Échantillons",
      icon: <FaFlask />,
      navigator: "/dashboard/technician/samples",
    },
    {
      id: "projects",
      label: "Projets",
      icon: <FaClipboardList />,
      navigator: "/dashboard/technician/projects",
    },
    {
      id: "team",
      label: "Équipe",
      icon: <FaUsers />,
      navigator: "/dashboard/technician/team",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_API_URL
        }/samples/samples/${sampleId}/analysis-report`,
        {
          analysisReport: formData.analysisReport,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Rapport d'analyse soumis avec succès");
      navigate(`/dashboard/technician/samples`);
    } catch (error) {
      console.error("Error submitting analysis report:", error);
      toast.error("Erreur lors de la soumission du rapport d'analyse");
      setSubmitting(false);
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
        analysisReport: event.target.result,
      });
      toast.success(`Fichier "${file.name}" importé avec succès`);
      setAutoSaveStatus("Non sauvegardé");
    };
    reader.readAsText(file);
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF();

      const title = sample?.name || "Rapport d'Analyse";
      doc.setFontSize(16);
      doc.text(title, 20, 20);

      doc.setFontSize(12);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);

      doc.setFontSize(12);
      const splitText = doc.splitTextToSize(formData.analysisReport, 170);
      doc.text(splitText, 20, 40);

      const safeFilename =
        sample && sample.name
          ? sample.name.replace(/\s+/g, "_")
          : "rapport_analyse";

      doc.save(`${safeFilename}_Analysis_Report.pdf`);

      toast.success("PDF généré avec succès");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Erreur lors de la génération du PDF");
    }
  };

  const formatText = (format) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.analysisReport.substring(start, end);

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
      formData.analysisReport.substring(0, start) +
      formattedText +
      formData.analysisReport.substring(end);

    setFormData({
      ...formData,
      analysisReport: newContent,
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
        title="Laboratoire d'Analyse"
        userName="Tech. Martin"
        userInitials="TM"
        notificationCount={2}
        bgColor="bg-blue-700 backdrop-filter backdrop-blur-lg bg-opacity-90"
        hoverColor="text-blue-200"
      />

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            navItems={navItems}
            accentColor="blue"
          />

          <main className="flex-1">
            <div className="mb-6 flex justify-between items-center">
              <button
                onClick={() => navigate(`/dashboard/technician/samples`)}
                className="flex items-center text-blue-700 hover:text-blue-800 transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                <span>Retour aux échantillons</span>
              </button>
            </div>

            {loading ? (
              <div className="bg-white rounded-lg shadow-xl p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement de l'échantillon...</p>
              </div>
            ) : sample ? (
              <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                {/* Sample info header */}
                <div className="bg-blue-50 p-4 border-b border-blue-100">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-blue-800">
                        {sample.name || "Échantillon sans nom"}
                      </h2>
                      <p className="text-sm text-gray-600">
                        Statut:{" "}
                        <span className="font-medium text-blue-600">
                          {sample.status}
                        </span>
                      </p>
                    </div>
                    <div className="mt-3 md:mt-0">
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <FaCalendarAlt className="mr-1" />
                        Dernière mise à jour:{" "}
                        {new Date(sample.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Section with Word-like UI */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-blue-800 mb-6 flex items-center">
                    <FaFile className="mr-2" />
                    Rapport d'Analyse
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4">
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
                            onClick={() => formatText("link")}
                            className="p-1.5 rounded hover:bg-gray-200"
                            title="Lien"
                          >
                            <FaLink className="text-gray-700" />
                          </button>
                          <button
                            type="button"
                            onClick={() => formatText("image")}
                            className="p-1.5 rounded hover:bg-gray-200"
                            title="Image"
                          >
                            <FaImage className="text-gray-700" />
                          </button>
                          <button
                            type="button"
                            onClick={() => formatText("table")}
                            className="p-1.5 rounded hover:bg-gray-200"
                            title="Tableau"
                          >
                            <FaTable className="text-gray-700" />
                          </button>
                        </div>

                        <div className="flex items-center">
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
                      </div>
                    </div>

                    {/* Text area for analysis report */}
                    <div className="relative">
                      <textarea
                        ref={textareaRef}
                        name="analysisReport"
                        id="analysisReport"
                        rows={20}
                        className="block w-full rounded-b-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 p-4 font-mono text-sm"
                        placeholder="Entrez votre rapport d'analyse ici..."
                        value={formData.analysisReport}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            analysisReport: e.target.value,
                          });
                        }}
                        required
                      ></textarea>
                      <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                        {formData.analysisReport.length} caractères
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <span className="flex items-center">
                          <FaPaperPlane className="mr-2" />
                          Soumettre rapport
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-xl p-8 text-center">
                <p className="text-gray-600">
                  Impossible de charger les informations de l'échantillon.
                  Veuillez réessayer.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default TechnicianReportPage;