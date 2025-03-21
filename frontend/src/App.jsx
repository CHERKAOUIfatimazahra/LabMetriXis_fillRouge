import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";

// Pages d'authentification
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ResendOTP from "./pages/auth/ResendOTP";
import OTP from "./pages/auth/OTP";

// dashboard chercheur
import ResearcherDashboard from "./pages/dashboard/researcher/ResearcherDashboard";
import ProjectCreatePage from "./pages/dashboard/researcher/createProject/ProjectCreatePage";
import AddSample from "./pages/dashboard/researcher/createProject/AddSample";
import ProjectListPage from "./pages/dashboard/researcher/ProjectListPage";
import ProjectDetailPage from "./pages/dashboard/researcher/ProjectDetailPage";
import CreatePublicationPage from "./pages/dashboard/researcher/CreatePublicationPage";
import UpdateProjectPage from "./pages/dashboard/researcher/updateProject/UpdateProjectPage";
import SampleDetailsPage from "./pages/dashboard/researcher/SampleDetailsPage";
import UpdateSample from "./pages/dashboard/researcher/updateProject/UpdateSample";
import ResearcherProfile from "./pages/dashboard/researcher/ResearcherProfile";

// dashboard technicien
import TechnicianDashboard from "./pages/dashboard/technicien/TechnicianDashboard";
import SamplesListe from "./pages/dashboard/technicien/SamplesListe";
import SampleDetail from "./pages/dashboard/technicien/SampleDetail";
import TechnicianReportPage from "./pages/dashboard/technicien/TechnicianReportPage";
import TechnicianProfile from "./pages/dashboard/technicien/TechnicienProfile";

// Pages publiques
import HomePage from "./pages/HomePage";

// Fonction utilitaire pour vérifier l'authentification
const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

// Fonction utilitaire pour obtenir le rôle de l'utilisateur
const getUserRole = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user ? user.role : null;
};

// Composant pour protéger les routes avec authentification
const PrivateRoute = ({ children, allowedRoles }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const authenticated = isAuthenticated();
    const userRole = getUserRole();

    if (!authenticated) {
      setAuthorized(false);
    } else {
      setAuthorized(allowedRoles.includes(userRole));
    }

    setLoading(false);
  }, [allowedRoles]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!authorized) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<HomePage />} />

        {/* Routes d'authentification */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/resend-otp" element={<ResendOTP />} />
        <Route path="/otp" element={<OTP />} />

        {/* dashboard */}

        {/* researcher dashboard */}
        <Route
          path="/dashboard/researcher"
          element={
            <PrivateRoute allowedRoles={["chercheur", "admin"]}>
              <ResearcherDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/researcher/projects/create"
          element={
            <PrivateRoute allowedRoles={["chercheur", "admin"]}>
              <ProjectCreatePage />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/researcher/projects/create/add-sample/:projectId"
          element={
            <PrivateRoute allowedRoles={["chercheur", "admin"]}>
              <AddSample />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/researcher/projects"
          element={
            <PrivateRoute allowedRoles={["chercheur", "admin"]}>
              <ProjectListPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/researcher/projects/:projectId"
          element={
            <PrivateRoute allowedRoles={["chercheur", "admin"]}>
              <ProjectDetailPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/researcher/projects/:projectId/create-publication"
          element={<CreatePublicationPage />}
        />
        <Route
          path="/dashboard/researcher/projects/:projectId/edit"
          element={
            <PrivateRoute allowedRoles={["chercheur", "admin"]}>
              <UpdateProjectPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/researcher/projects/samples/:sampleId"
          element={
            <PrivateRoute allowedRoles={["chercheur", "admin"]}>
              <SampleDetailsPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/researcher/projects/:projectId/samples/:sampleId/edit"
          element={
            <PrivateRoute allowedRoles={["chercheur", "admin"]}>
              <UpdateSample />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/researcher/profile"
          element={
            <PrivateRoute allowedRoles={"chercheur"}>
              <ResearcherProfile />
            </PrivateRoute>
          }
        />

        {/* technicien dashboard */}
        <Route
          path="/dashboard/technician"
          element={
            <PrivateRoute allowedRoles={["technicien", "admin"]}>
              <TechnicianDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/technician/samples"
          element={
            <PrivateRoute allowedRoles={["technicien", "admin"]}>
              <SamplesListe />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/technician/samples/:sampleId"
          element={
            <PrivateRoute allowedRoles={["technicien", "admin"]}>
              <SampleDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/technician/samples/:sampleId/report"
          element={
            <PrivateRoute allowedRoles={["technicien", "admin"]}>
              <TechnicianReportPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/technician/profile"
          element={
            <PrivateRoute allowedRoles={"technicien"}>
              <TechnicianProfile />
            </PrivateRoute>
          }
        />

        {/* Route pour accès non autorisé */}
        <Route path="/unauthorized" element={<div>Accès non autorisé</div>} />

        {/* Route par défaut - redirection vers la page d'accueil */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;