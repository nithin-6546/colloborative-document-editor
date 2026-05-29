import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import EditorPage from "./pages/EditorPage";

// Standard loading screen
const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
    <div className="relative w-16 h-16">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-100 rounded-full"></div>
      <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
    </div>
    <p className="mt-4 text-sm font-semibold text-slate-500 animate-pulse">Connecting to your workspace...</p>
  </div>
);

// Protected routes require authentication
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
};

// Guest routes are for non-logged-in users only
const GuestRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/" replace />;

  return <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Guest Routes */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/documents/:id" element={<EditorPage />} />
            </Route>

            {/* Fallback Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
