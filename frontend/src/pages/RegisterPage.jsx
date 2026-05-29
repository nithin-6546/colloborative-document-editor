import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FileText, ArrowRight, AlertCircle, Loader, CheckCircle } from "lucide-react";

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    const result = await register(firstName, lastName, email, password);
    setLoading(false);

    if (result.success) {
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl border border-slate-100">
        <div className="flex flex-col items-center">
          {/* Logo */}
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-200 text-white">
            <FileText size={32} />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
            Create account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Collaborate on document projects instantly
          </p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
            <AlertCircle size={20} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center space-x-2 rounded-lg bg-green-50 p-4 text-sm text-green-600 border border-green-100">
            <CheckCircle size={20} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first-name" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  First Name
                </label>
                <input
                  id="first-name"
                  name="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="relative block w-full mt-1.5 rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 sm:text-sm transition-all"
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="last-name" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Last Name
                </label>
                <input
                  id="last-name"
                  name="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="relative block w-full mt-1.5 rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 sm:text-sm transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email-address" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Email Address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full mt-1.5 rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 sm:text-sm transition-all"
                placeholder="john.doe@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full mt-1.5 rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 sm:text-sm transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-100 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all cursor-pointer items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
