import React, { useState } from "react";
import axios from "axios";
import { FiMail, FiActivity, FiCheck, FiAlertCircle } from "react-icons/fi";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Format d'email invalide";
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
    setErrors({});
    setErrorMessage("");

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        email,
      });

      setIsSubmitted(true);
      setSuccessMessage(
        "Un lien de réinitialisation a été envoyé à votre adresse email."
      );
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage(
          "Une erreur est survenue. Veuillez réessayer ultérieurement."
        );
      }
      console.error("Erreur:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full px-4 bg-gradient-to-r from-teal-50 to-blue-50 relative overflow-hidden p-8">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 z-0">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-teal-500"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-blue-500"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-teal-300"></div>
      </div>

      <div className="w-full max-w-md z-10 flex rounded-xl shadow-2xl bg-white overflow-hidden">
        <div className="w-full p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="h-14 w-14 rounded-full bg-teal-100 flex items-center justify-center mr-4">
              <FiActivity className="h-8 w-8 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">LabMetriXis</h2>
          </div>

          <h3 className="text-2xl font-medium text-gray-800 text-center mb-6">
            Mot de passe oublié
          </h3>

          {isSubmitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                  <FiCheck className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h4 className="text-lg font-medium text-gray-800 mb-2">
                Email envoyé
              </h4>
              <p className="text-gray-600 mb-4">{successMessage}</p>
              <a
                href="/login"
                className="w-full inline-block text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Retour à la connexion
              </a>
            </div>
          ) : (
            <>
              <p className="text-gray-600 text-center mb-6">
                Entrez votre adresse email. Nous vous enverrons un lien pour
                réinitialiser votre mot de passe.
              </p>

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 flex items-start">
                  <FiAlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <p className="text-red-600">{errorMessage}</p>
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Adresse email
                  </label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="h-4 w-4 text-teal-500" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className={`block w-full pl-10 py-2 text-sm border rounded-md shadow-sm ${
                        errors.email
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                      }`}
                      placeholder="votre.email@exemple.com"
                      value={email}
                      onChange={handleChange}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.email}
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
                        Envoi en cours...
                      </span>
                    ) : (
                      "Envoyer le lien de réinitialisation"
                    )}
                  </button>

                  <div className="flex items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <div className="px-3 text-sm text-gray-500">ou</div>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>

                  <a
                    href="/login"
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    Retour à la connexion
                  </a>
                </div>
              </form>
            </>
          )}

          <div className="mt-8 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} LabMetriXis. Tous droits réservés.
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
