import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FileText, ArrowRight, AlertCircle, Loader } from "lucide-react";

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate("/");
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
            Sign in to Docs
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Build and edit documents in real-time
          </p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
            <AlertCircle size={20} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
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
                placeholder="you@example.com"
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
                autoComplete="current-password"
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
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
