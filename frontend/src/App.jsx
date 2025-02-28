import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ResendOTP from "./pages/auth/ResendOTP";
import OTP from "./pages/auth/OTP";

// dashboard researcher
import ResearcherDashboard from "./pages/dashboard/researcher/ResearcherDashboard";
import ProjectCreatePage from "./pages/dashboard/researcher/createProject/ProjectCreatePage";
import AddSample from "./pages/dashboard/researcher/createProject/AddSample";
import ProjectListPage from "./pages/dashboard/researcher/ProjectListPage";


import HomePage from "./pages/HomePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<HomePage />} />

        {/* authentification */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/resend-otp" element={<ResendOTP />} />
        <Route path="/otp" element={<OTP />} />

        {/* dashboard */}

        {/* researcher dashboard */}
        <Route path="/dashboard/researcher" element={<ResearcherDashboard />} />
        <Route
          path="/dashboard/researcher/projects/create"
          element={<ProjectCreatePage />}
        />
        <Route
          path="/dashboard/researcher/projects/create/add-sample/:projectId"
          element={<AddSample />}
        />
        <Route
          path="/dashboard/researcher/projects"
          element={<ProjectListPage />}
        />

        {/* technicien dashboard */}

        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
