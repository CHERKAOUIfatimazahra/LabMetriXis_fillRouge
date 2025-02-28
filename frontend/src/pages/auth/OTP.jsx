import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function OTP() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("email");
    const requiresOTP = localStorage.getItem("requiresOTP");

    if (!email || !requiresOTP) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const email = localStorage.getItem("email");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/verify-otp`,
        {
          email,
          otp,
        }
      );

      const { token, user } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
        }
        localStorage.removeItem("email");
        localStorage.removeItem("requiresOTP");

        // Redirection based on user role
        const userData = user || JSON.parse(localStorage.getItem("user"));
        switch (userData.role) {
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
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur de vérification de l'OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setResendDisabled(true);
    setCountdown(180);

    try {
      const email = localStorage.getItem("email");
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/resend-otp`, {
        email,
      });
      setOtp("");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du renvoi de l'OTP");
      setResendDisabled(false);
      setCountdown(0);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-green-700 text-center">
          Vérification OTP
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="otp"
            >
              Code OTP
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-green-500"
              id="otp"
              type="text"
              placeholder="Entrez le code OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <button
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full mb-4"
            type="submit"
            disabled={loading}
          >
            {loading ? "Vérification..." : "Vérifier OTP"}
          </button>
        </form>

        <div className="text-center">
          <button
            className={`text-green-600 hover:text-green-800 text-sm ${
              resendDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleResendOTP}
            disabled={resendDisabled}
          >
            {countdown > 0 ? `Renvoyer OTP (${countdown}s)` : "Renvoyer OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OTP;
