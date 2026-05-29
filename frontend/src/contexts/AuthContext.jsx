import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check user session on initial load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await api.get("/api/users/me");
        if (res.data && res.data.success) {
          const sessionUser = res.data.user;
          setUser({
            ...sessionUser,
            _id: sessionUser.userId || sessionUser._id,
            userId: sessionUser.userId || sessionUser._id
          });
        }
      } catch (err) {
        // Not logged in or expired, clear user state
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/api/users/login", { email, password });
      if (res.data && res.data.success) {
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }
        const loginUser = res.data.user;
        const unifiedUser = {
          ...loginUser,
          _id: loginUser._id || loginUser.userId,
          userId: loginUser._id || loginUser.userId
        };
        setUser(unifiedUser);
        return { success: true, user: unifiedUser };
      }
      return { success: false, message: "Login failed" };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Invalid credentials",
      };
    }
  };

  const register = async (firstName, lastName, email, password) => {
    try {
      const res = await api.post("/api/users/register", {
        firstName,
        lastName,
        email,
        password,
      });
      if (res.data && res.data.success) {
        return { success: true };
      }
      return { success: false, message: "Registration failed" };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.error || err.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/users/logout");
    } catch (err) {
      console.error("Logout API error:", err);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  const updateUser = (updatedUser, token) => {
    if (token) {
      localStorage.setItem("token", token);
    }
    setUser({
      ...updatedUser,
      _id: updatedUser._id || updatedUser.userId,
      userId: updatedUser._id || updatedUser.userId
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
