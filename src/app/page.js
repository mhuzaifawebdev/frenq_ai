"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

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
      window.location.href = "/api/auth";
    } catch (error) {
      console.error("Authentication error:", error);
      setIsLoading(false);
    }
  };

  if (currentView === "auth") {
    return (
      <div className="h-screen w-screen bg-figma-gradient relative flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden selection:bg-[#005EFF] selection:text-white">

        {/* Background ambient glow - applied fluid blob shapes */}
        <div 
          className="absolute top-1/4 -left-20 w-96 h-96 bg-[#001E4A] filter blur-[140px] opacity-60 pointer-events-none"
          style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}
        ></div>
        <div 
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#0A2651] filter blur-[140px] opacity-70 pointer-events-none"
          style={{ borderRadius: '60% 40% 30% 70% / 50% 60% 40% 50%' }}
        ></div>

        <div className="relative w-full max-w-5xl z-10 flex flex-col max-h-full">
          {/* Back button */}
          <button
            onClick={() => {
              setCurrentView("homepage");
              setAuthMessage("");
            }}
            className="mb-3 text-slate-400 hover:text-white transition-colors flex items-center space-x-2 text-sm font-medium group cursor-pointer shrink-0 self-start"
          >
            <svg
              className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
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
            <span>Back to Home</span>
          </button>

          {/* Main Split Authentication Screen Container (Fixed height to prevent overflow) */}
          <div className="bg-[#0E0E0E] rounded-[28px] border border-[#484848]/40 shadow-2xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden h-[82vh] max-h-[550px]">
            
            {/* Left Column: Login Form */}
            <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-between h-full">
              
              {/* Logo Header */}
              <div className="flex items-center space-x-3 cursor-pointer shrink-0">
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <span className="text-white text-xl font-bold tracking-tight">FrenqAI</span>
              </div>

              {/* Welcome Header & Google Sign In */}
              <div className="space-y-5 text-center my-auto py-2">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                    Welcome to FrenqAI
                  </h1>
                  <p className="text-slate-400 text-xs sm:text-sm">
                    Sign In to your account to continue
                  </p>
                </div>

                {/* Auth message display */}
                {authMessage && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                    <p className="text-red-300 text-xs font-medium">{authMessage}</p>
                  </div>
                )}

                {/* ONLY Continue with Google (Active OAuth Action) */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full bg-[#161616] hover:bg-[#202020] border border-[#333333] hover:border-[#005EFF]/60 text-white text-xs sm:text-sm font-semibold py-3.5 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg group cursor-pointer"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Connecting to Google...</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full" viewBox="0 0 24 24">
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
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>
              </div>

              {/* Footer */}
              <div className="text-center shrink-0">
                <p className="text-slate-400 text-xs leading-relaxed">
                  By signing in, you agree to our{" "}
                  <a href="#" className="text-white font-semibold hover:underline">
                    Terms
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-white font-semibold hover:underline">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>

            {/* Right Column: App Interface Preview Panel with Navy Grid Background */}
            <div className="bg-gradient-to-br from-[#001E4A] via-[#0A2651] to-[#001233] p-6 lg:p-8 relative hidden lg:flex flex-col justify-between overflow-hidden border-l border-[#222222] h-full">
              {/* Grid Lines Background Overlay */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              ></div>

              {/* Floating Widget 1: Gmail Widget */}
              <div className="figma-card p-3.5 rounded-2xl w-[280px] absolute top-6 right-6 z-10 shadow-2xl bg-[#0E0E0E] border border-white/5">
                <div className="relative z-20 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <div className="flex items-center space-x-2">
                      <div className="w-4.5 h-4.5 rounded-md bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 text-[10px]">
                        ✉
                      </div>
                      <span className="font-bold text-white text-xs">Gmail</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-[#1e1e1e] text-[9px] text-slate-400">4 unread</span>
                    </div>
                    <span className="text-[9px] text-slate-500">🔄 ↗</span>
                  </div>

                  <div className="flex items-center space-x-2 pt-0.5">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-semibold">+ Compose</span>
                    <span className="px-2.5 py-0.5 rounded-md bg-[#1e1e1e] text-slate-300 text-[10px]">Open Gmail</span>
                  </div>

                  <div className="pt-1.5 border-t border-white/10 text-[10px] space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Google Security alert
                      </span>
                      <span className="text-slate-500 text-[9px]">02:02 PM</span>
                    </div>
                    <p className="text-slate-400 text-[9px] line-clamp-1 pl-2.5">
                      You allowed skyline-assistant-backend.vercel.app access...
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Widget 2: WhatsApp Chat Widget */}
              <div className="figma-card p-3.5 rounded-2xl w-[290px] absolute top-[145px] left-6 z-20 shadow-2xl bg-[#0E0E0E] border border-white/5">
                <div className="relative z-20 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <div className="flex items-center space-x-2">
                      <div className="w-4.5 h-4.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-[10px]">
                        💬
                      </div>
                      <span className="font-bold text-white text-xs">WhatsApp</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-semibold">8 new</span>
                    </div>
                    <span className="text-[9px] text-slate-500">🔄 ↗</span>
                  </div>

                  <div className="text-[9px] text-slate-400 flex items-center justify-between border-b border-white/10 pb-1.5">
                    <span>Linked device +92 308 ••• 617</span>
                    <span className="text-slate-500">synced 22m ago</span>
                  </div>

                  {/* Search Bar */}
                  <div className="bg-[#181818] rounded-lg px-2.5 py-1 flex items-center justify-between text-[10px] text-slate-400">
                    <span>🔍 Search chats...</span>
                    <div className="flex gap-1 text-[8px]">
                      <span className="px-1 py-0.5 rounded bg-slate-700 text-white font-semibold">All</span>
                      <span className="px-1 py-0.5 rounded bg-slate-800 text-slate-400">Unread</span>
                    </div>
                  </div>

                  {/* Chat Item List */}
                  <div className="space-y-1.5 text-[10px] pt-0.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-[10px]">
                          A
                        </div>
                        <div>
                          <p className="text-white font-semibold leading-tight text-[11px]">Ayesha Siddique</p>
                          <p className="text-slate-400 text-[9px] line-clamp-1">Can we move the review to 4?</p>
                        </div>
                      </div>
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-black text-[8px] font-bold flex items-center justify-center">2</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[9px]">
                          DT
                        </div>
                        <div>
                          <p className="text-white font-semibold leading-tight text-[11px]">Design Team</p>
                          <p className="text-slate-400 text-[9px] line-clamp-1">Hamza: pushed the new loader to staging</p>
                        </div>
                      </div>
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-black text-[8px] font-bold flex items-center justify-center">5</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-cyan-500 text-black font-bold flex items-center justify-center text-[10px]">
                          B
                        </div>
                        <div>
                          <p className="text-white font-semibold leading-tight text-[11px]">Bilal Ahmed</p>
                          <p className="text-slate-400 text-[9px] line-clamp-1">Invoice received, thanks!</p>
                        </div>
                      </div>
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-black text-[8px] font-bold flex items-center justify-center">1</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Right Brand Mark */}
              <div className="mt-auto flex items-center justify-center space-x-2 relative z-30 pt-2 shrink-0">
                <div className="w-5 h-5 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Homepage View
  return (
    <div className="min-h-screen bg-figma-gradient text-slate-100 relative overflow-hidden selection:bg-[#005EFF] selection:text-white">

      {/* Background Ambient Radial Glow Halos - applied fluid blob shapes */}
      <div 
        className="absolute top-[-150px] left-[-150px] w-[750px] h-[750px] bg-[#001E4A] filter blur-[180px] opacity-70 pointer-events-none animate-pulse-glow"
        style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}
      ></div>
      <div 
        className="absolute top-[50px] right-[-200px] w-[800px] h-[800px] bg-[#0A2651] filter blur-[200px] opacity-75 pointer-events-none"
        style={{ borderRadius: '60% 40% 30% 70% / 50% 60% 40% 50%' }}
      ></div>
      <div 
        className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-t from-[#001E4A]/50 to-[#0A2651]/30 filter blur-[200px] opacity-60 pointer-events-none"
        style={{ borderRadius: '50% 50% 20% 20% / 60% 60% 10% 10%' }}
      ></div>

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
              <Image
                src="/images/logo.png"
                alt="FrenqAI Logo"
                width={150}
                height={150}
              />
            </div>
            <span className="text-white text-xl font-bold tracking-tight">FrenqAI</span>
          </div>

          {/* Action Button */}
          <button
            onClick={handleGetStarted}
            className="bg-[#0E0E0E] hover:bg-[#181818] border border-[#484848]/80 text-white font-medium py-2.5 px-6 rounded-xl transition-all duration-300 hover:border-[#005EFF]/60 hover:scale-105 active:scale-95 text-sm shadow-md"
          >
            Get Started
          </button>
        </nav>

        {/* Hero Section Split Layout */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-24 lg:mb-32">
          
          {/* Left Column: Hero Text */}
          <div className="w-full lg:w-[42%] text-left space-y-5">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              Your AI-Powered <br />
              Task Assistant
            </h1>

            <p className="text-[#94A3B8] text-base sm:text-lg leading-relaxed font-normal max-w-md">
              Seamlessly manage tasks, sync with Google Calendar, get smart reminders, and interact with an intelligent AI system that understands your workflow.
            </p>
          </div>
{/* Right Column: Overlapping Card Deck Layout */}
          <div className="w-full lg:w-[58%] flex justify-center lg:justify-end mt-12 lg:mt-0">
            {/* 
              Card deck container: 
              Expanded width to 840px to give the rightmost card enough breathing room.
            */}
            <div className="relative w-full max-w-[840px] h-[580px] transform scale-[0.65] sm:scale-75 md:scale-90 xl:scale-100 origin-top lg:origin-top-right">

              {/* Card 2: Secure Google Authentication (Left Base) - z-10 */}
              <div
                className="absolute top-[120px] left-0 w-[340px] z-10 bg-[#0A101D] border border-[#005EFF]/40 shadow-2xl p-6 rounded-[24px] cursor-pointer hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="relative z-20">
                  <div className="w-12 h-12 rounded-xl bg-[#141414] border border-white/10 flex items-center justify-center mb-5 shadow-inner">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  </div>
                  <h3 className="text-white text-[17px] font-bold mb-3 tracking-tight leading-snug">
                    Secure Google<br/>Authentication
                  </h3>
                  <p className="text-[#8492A6] text-sm leading-relaxed">
                    Seamless sign-in with your Google account. Your data stays protected with enterprise-grade security.
                  </p>
                </div>
              </div>

              {/* Card 1: Smart Task Management (Top Center) - z-20 */}
              <div
                className="absolute top-0 left-[200px] w-[340px] z-20 bg-[#0A101D] border border-[#005EFF]/40 shadow-2xl p-6 rounded-[24px] cursor-pointer hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="relative z-20">
                  <div className="w-12 h-12 rounded-xl bg-[#141414] border border-white/10 flex items-center justify-center mb-5 text-white shadow-inner">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-white text-[17px] font-bold mb-3 tracking-tight">
                    Smart Task Management
                  </h3>
                  <p className="text-[#8492A6] text-sm leading-relaxed">
                    Create, organize, and track your tasks with an intuitive interface. Never miss a deadline again.
                  </p>
                </div>
              </div>

              {/* Card 4: Google Calendar Sync (Right) - z-30 */}
              <div
                className="absolute top-[160px] left-[440px] w-[360px] z-30 bg-[#0A101D] border border-[#005EFF]/40 shadow-2xl p-6 rounded-[24px] cursor-pointer hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="relative z-20">
                  <div className="w-12 h-12 rounded-xl bg-[#141414] border border-white/10 flex items-center justify-center mb-5 text-white shadow-inner">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-white text-[17px] font-bold mb-3 tracking-tight">
                    Google Calendar Sync
                  </h3>
                  <p className="text-[#8492A6] text-sm leading-relaxed">
                    Automatically sync your tasks to Google Calendar. Keep all your events and deadline in one place.
                  </p>
                </div>
              </div>

              {/* Card 3: Smart Email Reminders (Bottom Center) - z-40 */}
              <div
                className="absolute top-[340px] left-[120px] w-[340px] z-40 bg-[#0A101D] border border-[#005EFF]/40 shadow-2xl p-6 rounded-[24px] cursor-pointer hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="relative z-20">
                  <div className="w-12 h-12 rounded-xl bg-[#141414] border border-white/10 flex items-center justify-center mb-5 text-white shadow-inner">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-white text-[17px] font-bold mb-3 tracking-tight">
                    Smart Email Reminders
                  </h3>
                  <p className="text-[#8492A6] text-sm leading-relaxed">
                    Get timely email notifications for your tasks and appointments. Stay on top of your schedule effortlessly.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Featured Wide Banner Card - Intelligent AI Assistant */}
        <div id="features" className="bg-[#0E0E0E] border border-white/5 p-6 sm:p-8 my-14 max-w-5xl mx-auto shadow-2xl rounded-2xl relative z-20 group">
          <div className="relative z-20 space-y-4">
            <div className="w-12 h-12 rounded-[14px] bg-[#141414]/90 border border-white/10 flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
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
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Intelligent AI Assistant
            </h2>
            <p className="text-[#94A3B8] text-xs sm:text-sm leading-[1.6] max-w-3xl">
              Interact with our advanced AI system that understands context and can help you manage tasks, set reminders, and make calls based on prompts.
            </p>
            <div className="flex flex-wrap gap-2.5 pt-2">
              <span className="px-3.5 py-1.5 rounded-full bg-[#181818] border border-[#333] text-slate-300 text-xs font-medium">
                Voice Commands
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-[#181818] border border-[#333] text-slate-300 text-xs font-medium">
                Smart Scheduling
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-[#181818] border border-[#333] text-slate-300 text-xs font-medium">
                Context Aware
              </span>
            </div>
          </div>
        </div>

        {/* Call to Action Box */}
        <div className="bg-transparent border border-white/5 p-8 sm:p-12 my-14 max-w-4xl mx-auto text-center relative z-20 rounded-2xl shadow-xl">
          <div className="relative z-20 max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ready to Transform Your Productivity?
            </h2>
            <p className="text-[#94A3B8] text-xs sm:text-sm leading-relaxed">
              Join the future of task management with Sky-line Agent. Automate your workflow, sync with Google services, and let AI handle the complexity
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-[#001E4A] to-[#0A2651] hover:from-[#0A2651] hover:to-[#002f6c] border border-[#005EFF]/50 text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 text-sm"
              >
                Start Free Trial
              </button>
              <button 
                onClick={handleGetStarted}
                className="bg-[#161616] hover:bg-[#202020] text-slate-300 hover:text-white font-medium py-3.5 px-8 rounded-xl border border-[#333] transition-all duration-300 hover:scale-105 active:scale-95 text-sm"
              >
                Watch Demo
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}