"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function SkylineApp() {
  const [currentView, setCurrentView] = useState("homepage"); // 'homepage', 'auth'
  const [isLoading, setIsLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for auth messages in URL params
    const authStatus = searchParams.get("auth");
    const errorMessage = searchParams.get("message");

    if (authStatus === "error") {
      setAuthMessage(
        `Authentication failed: ${errorMessage || "Unknown error"}`
      );
    } else if (authStatus === "failed") {
      setAuthMessage("Authentication failed. Please try again.");
    } else if (authStatus === "expired") {
      setAuthMessage("Your session has expired. Please sign in again.");
    } else if (authStatus === "required") {
      setAuthMessage("Please sign in to access the dashboard.");
    }
  }, [searchParams]);

  const handleGetStarted = () => {
    setCurrentView("auth");
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // Redirect to Google OAuth via  API route
      window.location.href = "/api/auth";
    } catch (error) {
      console.error("Authentication error:", error);
      setIsLoading(false);
      // You can add error handling here
    }
  };

  if (currentView === "auth") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        {/* Subtle animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-gray-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gray-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        </div>

        <div className="relative w-full max-w-md">
          {/* Back button */}
          <button
            onClick={() => {
              setCurrentView("homepage");
              setAuthMessage(""); // Clear any auth messages
            }}
            className="mb-4 text-gray-400 hover:text-white transition-colors flex items-center space-x-2"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Back</span>
          </button>

          {/* Main form container */}
          <div className="bg-[#1c1c1c]/50 backdrop-blur-md border border-gray-700/30 rounded-2xl hover:bg-[#1c1c1c]/30 transition-all duration-300 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#1c1c1c]/70 border border-gray-700/50 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome</h1>
              <p className="text-gray-400 text-sm">
                Sign in to your account to continue
              </p>

              {/* Auth message display */}
              {authMessage && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{authMessage}</p>
                </div>
              )}
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-[#1c1c1c]/80 hover:bg-[#1c1c1c]/60 border border-gray-700/40 text-white font-medium py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 hover:border-gray-600/60 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="group-hover:text-gray-200 transition-colors">
                    Continue with Google
                  </span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="mt-8 pt-6 border-t border-gray-700/30">
              <p className="text-center text-gray-400 text-xs">
                By signing in, you agree to our{" "}
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Terms
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Homepage view
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Dotted Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, #333 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        ></div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        .animated-border {
          position: relative;
          background: linear-gradient(135deg, #1c1c1c80, #1c1c1c30);
          backdrop-filter: blur(16px);
          border-radius: 1rem;
          overflow: hidden;
        }

        .animated-border::before {
          content: "";
          position: absolute;
          inset: 0;
          padding: 2px;
          background: linear-gradient(
            45deg,
            #4a5568,
            #2d3748,
            #1a202c,
            #2d3748,
            #4a5568
          );
          background-size: 300% 300%;
          border-radius: inherit;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          animation: borderAnimation 3s ease-in-out infinite;
        }

        .animated-border:hover::before {
          background: linear-gradient(
            45deg,
            #718096,
            #4a5568,
            #2d3748,
            #4a5568,
            #718096
          );
          background-size: 300% 300%;
          animation: borderAnimationHover 2s ease-in-out infinite;
        }

        .animated-border-glow {
          position: relative;
          background: linear-gradient(135deg, #1c1c1c80, #1c1c1c30);
          backdrop-filter: blur(16px);
          border-radius: 1rem;
          overflow: hidden;
        }

        .animated-border-glow::before {
          content: "";
          position: absolute;
          inset: 0;
          padding: 2px;
          background: linear-gradient(
            45deg,
            #6366f1,
            #8b5cf6,
            #ec4899,
            #f59e0b,
            #10b981,
            #6366f1
          );
          background-size: 300% 300%;
          border-radius: inherit;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          animation: colorfulBorder 4s ease-in-out infinite;
        }

        .animated-border-glow:hover::before {
          animation: colorfulBorderFast 1.5s ease-in-out infinite;
        }

        @keyframes borderAnimation {
          0%,
          100% {
            background-position: 0% 50%;
            opacity: 0.7;
          }
          50% {
            background-position: 100% 50%;
            opacity: 1;
          }
        }

        @keyframes borderAnimationHover {
          0%,
          100% {
            background-position: 0% 50%;
            opacity: 1;
          }
          50% {
            background-position: 100% 50%;
            opacity: 0.8;
          }
        }

        @keyframes colorfulBorder {
          0%,
          100% {
            background-position: 0% 50%;
            opacity: 0.6;
          }
          50% {
            background-position: 100% 50%;
            opacity: 0.9;
          }
        }

        @keyframes colorfulBorderFast {
          0%,
          100% {
            background-position: 0% 50%;
            opacity: 0.9;
          }
          50% {
            background-position: 100% 50%;
            opacity: 1;
          }
        }
      `}</style>

      <div className="relative z-10 p-6">
        {/* Navbar */}
        <nav className="animated-border p-4 mb-12 transition-all duration-300">
          <div className="flex items-center justify-between relative z-10">
            {/* Logo Section */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#1c1c1c]/70 border border-gray-700/50 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-white text-xl font-semibold">FrenqAI</span>
            </div>

            {/* Get Started Button */}
            <button
              onClick={handleGetStarted}
              className="bg-[#1c1c1c]/80 hover:bg-[#1c1c1c]/60 border border-gray-700/40 text-white font-medium py-2.5 px-6 rounded-xl transition-all duration-300 hover:border-gray-600/60 group"
            >
              <span className="group-hover:text-gray-200 transition-colors">
                Get Started
              </span>
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-6">
              Your AI-Powered Task Assistant
            </h1>
            <p className="text-gray-400 text-xl mb-8 max-w-3xl mx-auto">
              Seamlessly manage tasks, sync with Google Calendar, get smart
              reminders, and interact with an intelligent AI system that
              understands your workflow.
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Google Authentication */}
            <div className="animated-border p-6 group transition-all duration-300">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-[#1c1c1c]/70 border border-gray-700/50 rounded-xl flex items-center justify-center mb-6 group-hover:border-gray-600/70 transition-all duration-300">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </div>
                <h3 className="text-white text-xl font-semibold mb-3">
                  Secure Google Authentication
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Seamless sign-in with your Google account. Your data stays
                  protected with enterprise-grade security.
                </p>
              </div>
            </div>

            {/* Task Management */}
            <div className="animated-border p-6 group transition-all duration-300">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-[#1c1c1c]/70 border border-gray-700/50 rounded-xl flex items-center justify-center mb-6 group-hover:border-gray-600/70 transition-all duration-300">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                </div>
                <h3 className="text-white text-xl font-semibold mb-3">
                  Smart Task Management
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Create, organize, and track your tasks with an intuitive
                  interface. Never miss a deadline again.
                </p>
              </div>
            </div>

            {/* Calendar Integration */}
            <div className="animated-border p-6 group transition-all duration-300">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-[#1c1c1c]/70 border border-gray-700/50 rounded-xl flex items-center justify-center mb-6 group-hover:border-gray-600/70 transition-all duration-300">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-white text-xl font-semibold mb-3">
                  Google Calendar Sync
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Automatically sync your tasks to Google Calendar. Keep all
                  your events and deadlines in one place.
                </p>
              </div>
            </div>

            {/* AI Chat System - Special animated border */}
            <div className="animated-border-glow p-6 group lg:col-span-2 transition-all duration-300">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-[#1c1c1c]/70 border border-gray-700/50 rounded-xl flex items-center justify-center mb-6 group-hover:border-gray-600/70 transition-all duration-300">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-white text-xl font-semibold mb-3">
                  Intelligent AI Assistant
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  Interact with our advanced AI system that understands context
                  and can help you manage tasks, set reminders, and make calls
                  based on prompts.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-700/30 text-gray-300 text-xs rounded-lg">
                    Voice Commands
                  </span>
                  <span className="px-3 py-1 bg-gray-700/30 text-gray-300 text-xs rounded-lg">
                    Smart Scheduling
                  </span>
                  <span className="px-3 py-1 bg-gray-700/30 text-gray-300 text-xs rounded-lg">
                    Context Aware
                  </span>
                </div>
              </div>
            </div>

            {/* Email Notifications */}
            <div className="animated-border p-6 group transition-all duration-300">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-[#1c1c1c]/70 border border-gray-700/50 rounded-xl flex items-center justify-center mb-6 group-hover:border-gray-600/70 transition-all duration-300">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-white text-xl font-semibold mb-3">
                  Smart Email Reminders
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Get timely email notifications for your tasks and
                  appointments. Stay on top of your schedule effortlessly.
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="animated-border p-12 max-w-4xl mx-auto transition-all duration-300">
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Ready to Transform Your Productivity?
                </h2>
                <p className="text-gray-400 mb-8 text-lg max-w-2xl mx-auto">
                  Join the future of task management with Skyline-Agent.
                  Automate your workflow, sync with Google services, and let AI
                  handle the complexity.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleGetStarted}
                    className="bg-[#1c1c1c]/80 hover:bg-[#1c1c1c]/60 border border-gray-700/40 text-white font-medium py-4 px-8 rounded-xl transition-all duration-300 hover:border-gray-600/60 group"
                  >
                    <span className="group-hover:text-gray-200 transition-colors">
                      Start Free Trial
                    </span>
                  </button>
                  <button className="border border-gray-600/60 hover:bg-[#1c1c1c]/30 text-gray-300 hover:text-white font-medium py-4 px-8 rounded-xl transition-all duration-300">
                    Watch Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
