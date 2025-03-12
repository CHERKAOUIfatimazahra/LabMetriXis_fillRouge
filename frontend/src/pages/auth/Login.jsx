import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          email,
          password,
        }
      );

      const { token, user, message } = response.data;

      if (message === "OTP sent to email") {
        localStorage.setItem("email", email);
        localStorage.setItem("requiresOTP", "true");
        navigate("/otp");
        return;
      }

      if (!token || !user) {
        setError("Réponse du serveur invalide");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.removeItem("requiresOTP");

      switch (user.role) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "chercheur":
          navigate("/dashboard/researcher");
          break;
        case "technicien":
          navigate("/dashboard/technician");
          break;
        default:
          setError("Rôle d'utilisateur non reconnu.");
          return;
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
          "Erreur de connexion. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-700 to-teal-900 opacity-90">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-extrabold mb-6 text-black text-center">
          Connexion
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="shadow-sm border rounded-lg w-full py-2 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-700"
              id="email"
              type="email"
              placeholder="Entrez votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Mot de passe
            </label>
            <input
              className="shadow-sm border rounded-lg w-full py-2 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-700"
              id="password"
              type="password"
              placeholder="Entrez votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between mb-6">
            <Link
              to="/forgot-password"
              className="text-teal-700 hover:text-green-800 text-sm"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            className="bg-gradient-to-br from-teal-700 to-teal-900 opacity-90 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg w-full transition duration-200 ease-in-out transform hover:scale-105"
            type="submit"
            disabled={loading}
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-teal-700">
            Pas encore de compte ?
            <Link
              to="/register"
              className="text-teal-900 hover:text-green-800 ml-1"
            >
              Inscrivez-vous ici
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
