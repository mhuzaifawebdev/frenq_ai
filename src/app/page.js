"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

function SkylineAppContent() {
  const [currentView, setCurrentView] = useState("homepage");
  const [isLoading, setIsLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const authStatus = searchParams.get("auth");
    const errorMessage = searchParams.get("message");
    if (authStatus === "error") setAuthMessage("Authentication failed: " + (errorMessage || "Unknown error"));
    else if (authStatus === "failed") setAuthMessage("Authentication failed. Please try again.");
    else if (authStatus === "expired") setAuthMessage("Your session has expired. Please sign in again.");
    else if (authStatus === "required") setAuthMessage("Please sign in to access the dashboard.");
  }, [searchParams]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleGetStarted = () => setCurrentView("auth");

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try { window.location.href = "/api/auth"; }
    catch (error) { console.error("Authentication error:", error); setIsLoading(false); }
  };

  if (currentView === "auth") {
    return (
      <div className="h-screen w-screen bg-figma-gradient relative flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#001E4A] filter blur-[140px] opacity-60 pointer-events-none" style={{ borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%" }} />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#0A2651] filter blur-[140px] opacity-70 pointer-events-none" style={{ borderRadius: "60% 40% 30% 70% / 50% 60% 40% 50%" }} />
        <div className="relative w-full max-w-5xl z-10 flex flex-col">
          <button
            onClick={() => { setCurrentView("homepage"); setAuthMessage(""); }}
            className="mb-4 text-slate-400 hover:text-white transition-colors flex items-center space-x-2 text-sm font-medium group cursor-pointer self-start"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Home</span>
          </button>
          <div className="bg-[#0E0E0E] rounded-[28px] border border-[#484848]/40 shadow-2xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden" style={{ height: "min(82vh, 560px)" }}>
            <div className="p-8 lg:p-12 flex flex-col justify-between h-full">
              <div className="flex items-center">
                <Image src="/images/logo.png" alt="FrenqAI Logo" width={120} height={40} style={{ objectFit: 'contain' }} />
              </div>
              <div className="space-y-6 text-center my-auto py-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">Welcome to FrenqAI</h1>
                  <p className="text-slate-400 text-sm">Sign in to your account to continue</p>
                </div>
                {authMessage && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                    <p className="text-red-300 text-xs font-medium">{authMessage}</p>
                  </div>
                )}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full bg-[#161616] hover:bg-[#202020] border border-[#333333] hover:border-[#005EFF]/60 text-white text-sm font-semibold py-3.5 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Connecting to Google...</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                      </div>
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>
              </div>
              <div className="text-center shrink-0">
                <p className="text-slate-500 text-xs">
                  By signing in, you agree to our{" "}
                  <a href="#" className="text-slate-300 font-semibold hover:underline">Terms</a>
                  {" "}and{" "}
                  <a href="#" className="text-slate-300 font-semibold hover:underline">Privacy Policy</a>
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#001E4A] via-[#0A2651] to-[#001233] p-8 relative hidden lg:flex flex-col justify-between overflow-hidden border-l border-[#222222] h-full">
              <style>{`
                @keyframes floatInRight {
                  0%   { opacity: 0; transform: translateX(40px) translateY(-10px); }
                  100% { opacity: 1; transform: translateX(0) translateY(0); }
                }
                @keyframes floatInLeft {
                  0%   { opacity: 0; transform: translateX(-40px) translateY(10px); }
                  100% { opacity: 1; transform: translateX(0) translateY(0); }
                }
                @keyframes floatBob {
                  0%, 100% { transform: translateY(0px); }
                  50%       { transform: translateY(-7px); }
                }
                @keyframes floatBobAlt {
                  0%, 100% { transform: translateY(0px); }
                  50%       { transform: translateY(-5px); }
                }
                .widget-gmail {
                  animation:
                    floatInRight 0.7s cubic-bezier(0.22,1,0.36,1) both,
                    floatBob 4s ease-in-out 0.7s infinite;
                }
                .widget-whatsapp {
                  animation:
                    floatInLeft 0.7s cubic-bezier(0.22,1,0.36,1) 0.25s both,
                    floatBobAlt 4.5s ease-in-out 1s infinite;
                }
              `}</style>
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
              <div className="widget-gmail bg-[#0E0E0E] border border-white/5 p-4 rounded-2xl w-[280px] absolute top-6 right-6 z-10 shadow-2xl">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 rounded-md bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 text-[10px]">✉</div>
                      <span className="font-bold text-white text-xs">Gmail</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-[#1e1e1e] text-[9px] text-slate-400">4 unread</span>
                    </div>
                    <span className="text-[9px] text-slate-500">sync</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-md bg-blue-600 text-white text-[10px] font-semibold">+ Compose</span>
                    <span className="px-2.5 py-1 rounded-md bg-[#1e1e1e] text-slate-300 text-[10px]">Open Gmail</span>
                  </div>
                  <div className="pt-1.5 border-t border-white/10 text-[10px]">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">Google Security alert</span>
                      <span className="text-slate-500 text-[9px]">2:02 PM</span>
                    </div>
                    <p className="text-slate-400 text-[9px] line-clamp-1">You allowed skyline-assistant access...</p>
                  </div>
                </div>
              </div>
              <div className="widget-whatsapp bg-[#0E0E0E] border border-white/5 p-4 rounded-2xl w-[280px] absolute top-[155px] left-6 z-20 shadow-2xl">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 rounded-md bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-[10px]">WA</div>
                      <span className="font-bold text-white text-xs">WhatsApp</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-semibold">8 new</span>
                    </div>
                    <span className="text-[9px] text-slate-500">sync</span>
                  </div>
                  <div className="space-y-1.5 text-[10px]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-[9px]">A</div>
                        <div>
                          <p className="text-white font-semibold leading-tight text-[11px]">Ayesha Siddique</p>
                          <p className="text-slate-400 text-[9px] line-clamp-1">Can we move the review to 4?</p>
                        </div>
                      </div>
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-black text-[8px] font-bold flex items-center justify-center">2</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[9px]">DT</div>
                        <div>
                          <p className="text-white font-semibold leading-tight text-[11px]">Design Team</p>
                          <p className="text-slate-400 text-[9px] line-clamp-1">Hamza: pushed the new loader</p>
                        </div>
                      </div>
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-black text-[8px] font-bold flex items-center justify-center">5</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-auto flex items-center justify-center z-30 pt-2 shrink-0">
                <Image src="/images/logo.png" alt="FrenqAI" width={80} height={28} style={{ objectFit: 'contain', opacity: 0.5 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-figma-gradient text-slate-100 relative overflow-x-clip">
      <div className="absolute top-[-150px] left-[-150px] w-[750px] h-[750px] bg-[#001E4A] filter blur-[180px] opacity-70 pointer-events-none" style={{ borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%" }} />
      <div className="absolute top-[50px] right-[-200px] w-[800px] h-[800px] bg-[#0A2651] filter blur-[200px] opacity-75 pointer-events-none" style={{ borderRadius: "60% 40% 30% 70% / 50% 60% 40% 50%" }} />
      <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-t from-[#001E4A]/50 to-[#0A2651]/30 filter blur-[200px] opacity-60 pointer-events-none" style={{ borderRadius: "50% 50% 20% 20% / 60% 60% 10% 10%" }} />

      <style jsx>{`
        .feature-card {
          background: rgba(10,16,29,0.9);
          border: 1px solid rgba(0,94,255,0.25);
          border-radius: 24px;
          padding: 28px;
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), border-color 0.3s ease, box-shadow 0.3s ease;
          cursor: default;
        }
        .feature-card:hover {
          transform: translateY(-8px) scale(1.02);
          border-color: rgba(0,94,255,0.65);
          box-shadow: 0 24px 64px rgba(0,94,255,0.22), 0 0 0 1px rgba(0,94,255,0.2);
          background: rgba(10,20,45,0.97);
        }
        .feature-card .card-icon {
          transition: transform 0.3s ease;
        }
        .feature-card:hover .card-icon {
          transform: scale(1.1) rotate(-3deg);
        }
        .btn-primary {
          background: linear-gradient(135deg, #005EFF, #0A2651);
          border: 1px solid rgba(0,94,255,0.5);
          color: white;
          font-weight: 600;
          border-radius: 14px;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .btn-primary:hover {
          background: linear-gradient(135deg, #1a74ff, #0A2651);
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0,94,255,0.35);
        }
        .btn-primary:active { transform: translateY(0px); }
        .btn-secondary {
          background: rgba(22,22,22,0.8);
          border: 1px solid rgba(72,72,72,0.6);
          color: #94a3b8;
          font-weight: 500;
          border-radius: 14px;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .btn-secondary:hover {
          background: rgba(30,30,30,0.9);
          border-color: rgba(148,163,184,0.4);
          color: white;
          transform: translateY(-2px);
        }
        .badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: rgba(0,94,255,0.1);
          border: 1px solid rgba(0,94,255,0.3);
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 600;
          color: #6ca6ff;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .stat-card {
          background: rgba(14,14,14,0.7);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
        }
        .gradient-text {
          background: linear-gradient(90deg, #5b9af8, #7c6cf8, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <header className={`sticky top-0 z-50 px-6 py-4 transition-all duration-300 ${scrolled ? "backdrop-blur-xl bg-[#060b14]/80 border-b border-white/5" : ""}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Image src="/images/logo.png" alt="FrenqAI Logo" width={130} height={44} style={{ objectFit: 'contain' }} />
          </div>
          <nav className="hidden md:flex items-center space-x-8 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#cta" className="hover:text-white transition-colors">Pricing</a>
            <a href="#cta" className="hover:text-white transition-colors">About</a>
          </nav>
          <button
            id="nav-get-started"
            onClick={handleGetStarted}
            className="btn-primary"
            style={{ padding: "10px 24px", fontSize: "0.85rem" }}
          >
            Get Started
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </header>

      <section className="relative z-10 px-6 pt-16 pb-24 max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-[46%] space-y-6">
            <span className="badge-pill">Powered by Gemini AI</span>
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-white tracking-tight leading-[1.1]">
              Your AI-Powered<br />
              <span className="gradient-text">Task Assistant</span>
            </h1>
            <p className="text-[#8492A6] text-base sm:text-lg leading-relaxed max-w-md">
              Seamlessly manage tasks, sync with Google Calendar, get smart reminders, and interact with an intelligent AI that understands your workflow.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                id="hero-get-started"
                onClick={handleGetStarted}
                className="btn-primary"
                style={{ padding: "14px 32px", fontSize: "0.9rem" }}
              >
                Get Started for Free
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <button
                className="btn-secondary"
                style={{ padding: "14px 32px", fontSize: "0.9rem" }}
              >
                Watch Demo
              </button>
            </div>
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>10k+ Users</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Google OAuth</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>AI-Powered</span>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-[54%] flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[860px] h-[580px] scale-90 sm:scale-95 lg:scale-100 origin-top" style={{ overflow: 'visible' }}>
              {/* Card: Secure Google Auth — mid-left */}
              <div className="feature-card absolute top-[150px] left-0 w-[300px] z-10">
                <div className="card-icon w-11 h-11 rounded-xl bg-[#141414] border border-white/10 flex items-center justify-center mb-5 shadow-inner">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </div>
                <h3 className="text-white text-[15px] font-bold mb-2 tracking-tight">Secure Google Auth</h3>
                <p className="text-[#8492A6] text-[13px] leading-relaxed">Seamless sign-in with your Google account. Enterprise-grade security built in.</p>
              </div>

              {/* Card: Smart Task Management — top-center */}
              <div className="feature-card absolute top-0 left-[200px] w-[300px] z-20">
                <div className="card-icon w-11 h-11 rounded-xl bg-[#141414] border border-white/10 flex items-center justify-center mb-5 shadow-inner">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-white text-[15px] font-bold mb-2 tracking-tight">Smart Task Management</h3>
                <p className="text-[#8492A6] text-[13px] leading-relaxed">Create, organize, and track your tasks with an intuitive interface. Never miss a deadline again.</p>
              </div>

              {/* Card: Google Calendar Sync — far right */}
              <div className="feature-card absolute top-[185px] left-[430px] w-[310px] z-30">
                <div className="card-icon w-11 h-11 rounded-xl bg-[#141414] border border-white/10 flex items-center justify-center mb-5 shadow-inner">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-white text-[15px] font-bold mb-2 tracking-tight">Google Calendar Sync</h3>
                <p className="text-[#8492A6] text-[13px] leading-relaxed">Automatically sync tasks to Google Calendar. Keep all your events in one place.</p>
              </div>

              {/* Card: Smart Email Reminders — bottom-center */}
              <div className="feature-card absolute top-[370px] left-[120px] w-[300px] z-40">
                <div className="card-icon w-11 h-11 rounded-xl bg-[#141414] border border-white/10 flex items-center justify-center mb-5 shadow-inner">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-white text-[15px] font-bold mb-2 tracking-tight">Smart Email Reminders</h3>
                <p className="text-[#8492A6] text-[13px] leading-relaxed">Get timely email notifications for tasks and appointments. Stay on top of your schedule.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="stat-card"><p className="text-2xl sm:text-3xl font-extrabold text-white mb-1">10k+</p><p className="text-xs text-slate-500">Active Users</p></div>
          <div className="stat-card"><p className="text-2xl sm:text-3xl font-extrabold text-white mb-1">99.9%</p><p className="text-xs text-slate-500">Uptime SLA</p></div>
          <div className="stat-card"><p className="text-2xl sm:text-3xl font-extrabold text-white mb-1">4x</p><p className="text-xs text-slate-500">Productivity Boost</p></div>
          <div className="stat-card"><p className="text-2xl sm:text-3xl font-extrabold text-white mb-1">0s</p><p className="text-xs text-slate-500">Setup Time</p></div>
        </div>
      </section>

      <section id="features" className="relative z-10 px-6 py-6 max-w-6xl mx-auto">
        <div className="bg-[#0E0E0E] border border-white/5 p-8 sm:p-10 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-[#141414] border border-white/10 flex items-center justify-center shrink-0">
            <svg className="w-7 h-7" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          </div>
          <div className="flex-1 space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Intelligent AI Assistant</h2>
            <p className="text-[#94A3B8] text-sm leading-relaxed max-w-2xl">
              Interact with our advanced AI that understands context and helps you manage tasks, set reminders, and streamline your entire workflow automatically.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-3 py-1 rounded-full bg-[#181818] border border-[#333] text-slate-300 text-xs font-medium">Voice Commands</span>
              <span className="px-3 py-1 rounded-full bg-[#181818] border border-[#333] text-slate-300 text-xs font-medium">Smart Scheduling</span>
              <span className="px-3 py-1 rounded-full bg-[#181818] border border-[#333] text-slate-300 text-xs font-medium">Context Aware</span>
              <span className="px-3 py-1 rounded-full bg-[#181818] border border-[#333] text-slate-300 text-xs font-medium">Auto-Reminders</span>
            </div>
          </div>
          <button
            onClick={handleGetStarted}
            className="btn-primary shrink-0 self-start sm:self-center"
            style={{ padding: "10px 24px", fontSize: "0.85rem" }}
          >
            Try Now
          </button>
        </div>
      </section>

      <section id="cta" className="relative z-10 px-6 py-16 max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-br from-[#0A101D] to-[#060b14] border border-[#005EFF]/20 p-10 sm:p-14 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#005EFF]/5 to-transparent pointer-events-none rounded-3xl" />
          <div className="relative space-y-5">
            <span className="badge-pill">Get Started Today</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Transform<br />Your Productivity?
            </h2>
            <p className="text-[#8492A6] text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
              Join thousands of users managing their workflow with FrenqAI. Sync with Google, automate tasks, and let AI handle the complexity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                id="cta-get-started"
                onClick={handleGetStarted}
                className="btn-primary"
                style={{ padding: "16px 40px", fontSize: "1rem" }}
              >
                Start Free - No Credit Card
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <button
                className="btn-secondary"
                style={{ padding: "16px 40px", fontSize: "1rem" }}
              >
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 px-6 py-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <Image src="/images/logo.png" alt="FrenqAI" width={90} height={30} style={{ objectFit: 'contain', opacity: 0.75 }} />
          </div>
          <p className="text-slate-500 text-xs">2026 FrenqAI. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function SkylineApp() {
  return (
    <Suspense fallback={null}>
      <SkylineAppContent />
    </Suspense>
  );
}