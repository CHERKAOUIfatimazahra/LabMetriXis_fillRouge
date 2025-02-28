import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiLock,
  FiActivity,
  FiCheck,
  FiAlertCircle,
  FiArrowLeft,
} from "react-icons/fi";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState("");
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    setToken(token);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.newPassword)
      newErrors.newPassword = "Le nouveau mot de passe est requis";

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        token,
        newPassword: formData.newPassword,
      });

      setIsSubmitted(true);
      setSuccessMessage("Le mot de passe a été changé avec succès.");
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage(
          "Une erreur s'est produite lors du changement du mot de passe."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full px-4 bg-gradient-to-r from-teal-50 to-blue-50 relative overflow-hidden p-8">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 z-0">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-teal-500"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-blue-500"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-teal-300"></div>
      </div>

      <div className="w-full max-w-lg z-10 flex rounded-xl shadow-2xl bg-white overflow-hidden">
        <div className="hidden md:flex md:w-2/5 bg-gradient-to-b from-teal-500 to-teal-700 p-8 flex-col justify-between">
          <div>
            <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center mb-6">
              <FiActivity className="h-8 w-8 text-teal-600" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">LabMetriXis</h2>
            <p className="text-teal-100 mb-6">
              Système avancé de gestion de laboratoire pour professionnels
            </p>
          </div>
          <div className="text-teal-100 text-sm">
            © {new Date().getFullYear()} LabMetriXis. Tous droits réservés.
          </div>
        </div>

        <div className="w-full md:w-3/5 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-medium text-gray-800">
              Changer le mot de passe
            </h3>
            <div className="md:hidden flex items-center">
              <FiActivity className="h-6 w-6 text-teal-600 mr-2" />
              <span className="text-lg font-bold text-teal-700">
                LabMetriXis
              </span>
            </div>
          </div>

          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4 flex items-start">
              <FiCheck className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <p className="text-green-800">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 flex items-start">
              <FiAlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <p className="text-red-600">{errorMessage}</p>
            </div>
          )}

          {isSubmitted ? (
            <div className="space-y-5">
              <div className="p-4 bg-green-50 rounded-md flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <FiCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-green-800 text-center">
                    Votre mot de passe a été changé avec succès. Vous pouvez
                    maintenant vous connecter avec votre nouveau mot de passe.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleBackToLogin}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Retour à la connexion
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nouveau mot de passe
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-4 w-4 text-teal-500" />
                  </div>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`block w-full pl-10 py-2 text-sm border rounded-md shadow-sm ${
                      errors.newPassword
                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                    }`}
                  />
                  {errors.newPassword && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.newPassword}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirmer le mot de passe
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-4 w-4 text-teal-500" />
                  </div>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`block w-full pl-10 py-2 text-sm border rounded-md shadow-sm ${
                      errors.confirmPassword
                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Changement en cours...
                    </span>
                  ) : (
                    "Changer le mot de passe"
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  <FiArrowLeft className="mr-2 h-4 w-4" />
                  Retour à la connexion
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center text-xs text-gray-500 md:hidden">
            © {new Date().getFullYear()} LabMetriXis. Tous droits réservés.
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
