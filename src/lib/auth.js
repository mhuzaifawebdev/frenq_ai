// Authentication utilities for managing tokens and user state
import { useState, useEffect } from "react";
import { config } from "./config";

const BACKEND_URL = config.BACKEND_URL;

export class AuthService {
  static TOKEN_KEY = config.storage.token;
  static USER_KEY = config.storage.user;

  // Store token in localStorage
  static setToken(token) {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  // Get token from localStorage
  static getToken() {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  // Remove token from localStorage
  static removeToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  // Store user data
  static setUser(user) {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  // Get user data
  static getUser() {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem(this.USER_KEY);
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  // Check if user is authenticated
  static isAuthenticated() {
    return !!this.getToken();
  }

  // Verify token with backend
  static async verifyToken() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "verifyToken",
          token: token,
        }),
      });

      const result = await response.json();

      if (result.success && result.data?.user) {
        console.log("Token verification successful, user data:", result.data.user);
        console.log("User profile picture from backend:", result.data.user.picture);
        this.setUser(result.data.user);
        return true;
      } else {
        console.error("Token verification failed:", result);
        this.removeToken();
        return false;
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      this.removeToken();
      return false;
    }
  }

  // Login with email and password
  static async login(email, password) {
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "login",
          email,
          password,
        }),
      });

      const result = await response.json();

      if (result.success && result.token) {
        this.setToken(result.token);
        this.setUser(result.data.user);
        return { success: true, user: result.data.user };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, message: "Login failed. Please try again." };
    }
  }

  // Register new user
  static async register(name, email, password) {
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "register",
          name,
          email,
          password,
        }),
      });

      const result = await response.json();

      if (result.success && result.token) {
        this.setToken(result.token);
        this.setUser(result.data.user);
        return { success: true, user: result.data.user };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error("Registration failed:", error);
      return {
        success: false,
        message: "Registration failed. Please try again.",
      };
    }
  }

  // Logout user
  static logout() {
    this.removeToken();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }

  // Get Authorization header for API calls
  static getAuthHeader() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

// Hook for React components to use authentication
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = AuthService.getToken();
      if (token) {
        const isValid = await AuthService.verifyToken();
        setIsAuthenticated(isValid);
        if (isValid) {
          setUser(AuthService.getUser());
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  return { isAuthenticated, user, loading };
}
