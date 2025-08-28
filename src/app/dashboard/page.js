"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ContactDetails from "../../components/ContactDetails";
import TodoList from "../../components/TodoList";
import GmailWidget from "../../components/GmailWidget";
import CalendarWidget from "../../components/Calender";
import AIAssistant from "../../components/AIAssistant";
// import SimpleAvatar from "../../components/SimpleAvatar";
import UserAvatar from "@/components/UserAvatar";
import { AuthService } from "../../lib/auth";

const Dashboard = () => {
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuth = async () => {
      // Check if there's a token in the URL (from OAuth callback)
      const tokenFromUrl = searchParams.get("token");

      if (tokenFromUrl) {
        // Store the token and verify it
        AuthService.setToken(tokenFromUrl);

        // Clean up the URL
        window.history.replaceState({}, document.title, "/dashboard");
      }

      // Check authentication status
      const token = AuthService.getToken();
      if (token) {
        const isValid = await AuthService.verifyToken();
        if (isValid) {
          setIsAuthenticated(true);
          const userData = AuthService.getUser();
          console.log("Dashboard: User data loaded:", userData);
          console.log(
            "Dashboard: Profile picture URL:",
            userData?.profilePicture
          );
          console.log("Dashboard: Picture field (legacy):", userData?.picture);
          console.log(
            "Dashboard: User object keys:",
            userData ? Object.keys(userData) : "No user data"
          );
          setUser(userData);
        } else {
          // Invalid token, redirect to home
          window.location.href = "/?auth=expired";
          return;
        }
      } else {
        // No token, redirect to home
        window.location.href = "/?auth=required";
        return;
      }

      setLoading(false);
    };

    handleAuth();
  }, [searchParams]);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-400 mb-6">
            Please sign in to access your dashboard.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-white p-6">
      {/* Styled User info header */}
      <div className="mb-6 relative">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-red-600/10 rounded-2xl blur-xl"></div>

        {/* Main header container */}
        <div className="relative backdrop-blur-sm bg-gradient-to-r from-gray-900/80 via-gray-800/60 to-gray-900/80 border border-gray-700/50 rounded-2xl p-3 shadow-2xl">
          <div className="flex justify-between items-center">
            {/* User info section */}
            <div className="flex items-center space-x-4">
              {/* User avatar */}
              <div className="relative">
                <UserAvatar user={user} size={56} />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-800 shadow-sm animate-pulse"></div>
              </div>

              {/* User details */}
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
                  Welcome back, {user?.name || "User"}!
                </h1>
                <p className="text-gray-400 text-sm flex items-center mt-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Sign out button */}
            <button
              onClick={() => AuthService.logout()}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-red-500/25 border border-red-500/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-2">
                <svg
                  className="w-4 h-4 transition-transform group-hover:rotate-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="font-medium">Sign Out</span>
              </div>
            </button>
          </div>
        </div>

        {/* Subtle animation elements */}
        <div className="absolute top-2 left-2 w-3 h-3 bg-blue-400/30 rounded-full animate-ping delay-100"></div>
        <div className="absolute top-4 right-8 w-2 h-2 bg-purple-400/30 rounded-full animate-ping delay-300"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-screen">
        {/* Left Column - Contact Details, Todo, Gmail */}
        <div className="space-y-6">
          <ContactDetails userData={user} />
          <TodoList />
          <GmailWidget />
        </div>

        {/* Middle Column - Calendar */}
        <div>
          <CalendarWidget />
        </div>

        {/* Right Column - AI Assistant */}
        <div>
          <AIAssistant />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
