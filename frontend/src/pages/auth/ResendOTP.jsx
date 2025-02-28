import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function ResendOTP() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/resend-otp`,
        {
          email,
        }
      );

      setSuccess(response.data.message || "OTP has been sent to your email");
      localStorage.setItem("email", email);

      // Redirect to OTP verification page after 2 seconds
      setTimeout(() => {
        navigate("/otp");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-green-700 text-center">
          Resend OTP
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <p className="text-gray-600 mb-6 text-center">
          Enter your email address to receive a new verification code.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-green-500"
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full mb-4"
            type="submit"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send New OTP"}
          </button>
        </form>

        <div className="text-center mt-4">
          <div className="flex justify-between">
            <Link
              to="/login"
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Back to Login
            </Link>
            <Link
              to="/otp"
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Already have OTP?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResendOTP;
