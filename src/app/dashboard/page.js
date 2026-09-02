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
      <div className="min-h-screen w-full bg-figma-gradient text-white flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#001E4A] filter blur-[140px] opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#0A2651] filter blur-[140px] opacity-70 pointer-events-none"></div>
        <div className="text-center relative z-10">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-figma-gradient text-white flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#001E4A] filter blur-[140px] opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#0A2651] filter blur-[140px] opacity-70 pointer-events-none"></div>
        <div className="text-center relative z-10">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-400 mb-6 text-sm">
            Please sign in to access your dashboard.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-[#001E4A] hover:bg-[#0A2651] border border-[#005EFF]/50 text-white px-6 py-2.5 rounded-xl transition-all duration-300 shadow-lg font-medium"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-figma-gradient text-slate-100 p-4 sm:p-6 relative overflow-hidden selection:bg-[#005EFF] selection:text-white">
      {/* Ambient background glow halos matching Figma */}
      <div 
        className="absolute top-[-150px] left-[-150px] w-[750px] h-[750px] bg-[#001E4A] filter blur-[180px] opacity-70 pointer-events-none animate-pulse-glow"
        style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}
      ></div>
      <div 
        className="absolute top-[50px] right-[-200px] w-[800px] h-[800px] bg-[#0A2651] filter blur-[200px] opacity-75 pointer-events-none"
        style={{ borderRadius: '60% 40% 30% 70% / 50% 60% 40% 50%' }}
      ></div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* Styled User info header */}
        <div className="relative">
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#001E4A]/30 via-[#0A2651]/40 to-[#005EFF]/20 rounded-2xl blur-xl"></div>

          {/* Main header container */}
          <div className="relative backdrop-blur-md bg-[#0E0E0E]/90 border border-[#484848]/50 rounded-2xl p-3.5 shadow-2xl">
            <div className="flex justify-between items-center">
              {/* User info section */}
              <div className="flex items-center space-x-4">
                {/* User avatar */}
                <div className="relative">
                  <UserAvatar user={user} size={50} />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-[#0E0E0E] shadow-sm animate-pulse"></div>
                </div>

                {/* User details */}
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Welcome back, {user?.name || "User"}!
                  </h1>
                  <p className="text-slate-400 text-xs flex items-center mt-0.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Sign out button */}
              <button
                onClick={() => AuthService.logout()}
                className="bg-[#141414] hover:bg-[#1f1f1f] border border-[#484848]/80 text-slate-200 hover:text-white px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2 text-xs font-semibold hover:border-[#005EFF]/60 shadow-md cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
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
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
    </div>
  );
};

export default Dashboard;

