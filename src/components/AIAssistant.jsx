"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Menu,
  Send,
  Plus,
  Trash2,
  MessageSquare,
  X,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { AuthService } from "../lib/auth";

// ─── Action chip metadata ───────────────────────────────────────────────────

const ACTION_ICONS = {
  create_calendar_event: "📅",
  update_calendar_event: "📅",
  delete_calendar_event: "🗑️",
  send_email: "📧",
  get_emails: "📬",
  search_emails: "🔍",
  create_task: "✅",
  update_task: "✏️",
  complete_task: "☑️",
  delete_task: "🗑️",
  schedule_action: "⏰",
  get_calendar_events: "📆",
  get_tasks: "📋",
};

const ACTION_LABELS = {
  create_calendar_event: (a) => `Created: "${a?.summary}"`,
  update_calendar_event: (a) => `Updated: "${a?.summary}"`,
  delete_calendar_event: () => "Event deleted",
  send_email: (a) => `Email sent to ${a?.to}`,
  get_emails: () => "Fetched recent emails",
  search_emails: (a) => `Searched: "${a?.query}"`,
  create_task: (a) => `Task: "${a?.title}"`,
  update_task: (a) => `Updated: "${a?.title}"`,
  complete_task: () => "Task completed",
  delete_task: () => "Task deleted",
  schedule_action: (a) =>
    `Scheduled for ${a?.scheduledFor ? new Date(a.scheduledFor).toLocaleString() : "later"}`,
  get_calendar_events: () => "Fetched calendar",
  get_tasks: () => "Fetched tasks",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtTimestamp(ts) {
  const d = ts instanceof Date ? ts : new Date(ts);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function fmtRelative(ts) {
  const d = ts instanceof Date ? ts : new Date(ts);
  if (isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const ActionChips = ({ actions }) => {
  if (!actions?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {actions.map((action, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-700/70 border border-gray-600/40 text-gray-300"
        >
          <span>{ACTION_ICONS[action.tool] ?? "🔧"}</span>
          <span>
            {ACTION_LABELS[action.tool]?.(action.args) ?? action.tool.replace(/_/g, " ")}
          </span>
        </span>
      ))}
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex items-start mb-5 animate-fade-in">
    <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md">
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          {[0, 150, 300].map((delay) => (
            <div
              key={delay}
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
        <span className="text-gray-400 text-xs ml-2">AI is thinking...</span>
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const ChatAssistance = () => {
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [googleNotConnected, setGoogleNotConnected] = useState(false);

  // Sidebar / history
  const [showSidebar, setShowSidebar] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [loadingConvId, setLoadingConvId] = useState(null);
  const [deletingConvId, setDeletingConvId] = useState(null);

  const messagesContainerRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = useCallback((behavior = "smooth") => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // ── Auth header helper ──────────────────────────────────────────────────────
  const authHeader = useCallback(() => {
    const token = AuthService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // ── Render message content (markdown links → <a>) ─────────────────────────
  const renderContent = (content) => {
    if (!content) return "";
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      if (match.index > lastIndex) parts.push(content.slice(lastIndex, match.index));
      parts.push(
        <a
          key={match.index}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline"
        >
          {match[1]}
        </a>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < content.length) parts.push(content.slice(lastIndex));
    return parts.length > 0 ? parts : content;
  };

  // ── History ─────────────────────────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    const token = AuthService.getToken();
    if (!token) return;
    setHistoryLoading(true);
    try {
      const res = await axios.get("/api/chat?page=1&limit=30", {
        headers: authHeader(),
        timeout: 15000,
      });
      if (res.data.success) {
        setConversations(res.data.data?.conversations || []);
      }
    } catch {
      // Non-critical — sidebar shows empty list on failure
    } finally {
      setHistoryLoading(false);
    }
  }, [authHeader]);

  const handleToggleSidebar = useCallback(() => {
    setShowSidebar((prev) => {
      if (!prev) loadHistory();
      return !prev;
    });
  }, [loadHistory]);

  const handleLoadConversation = useCallback(
    async (convId) => {
      setLoadingConvId(convId);
      try {
        const res = await axios.get(`/api/chat/${convId}`, {
          headers: authHeader(),
          timeout: 15000,
        });
        if (res.data.success) {
          const conv = res.data.data;
          const mapped = (conv.messages || [])
            .filter((m) => (m.role === "user" || m.role === "assistant") && m.content)
            .map((m, i) => ({
              id: i + 1,
              type: m.role,
              content: m.content,
              actions: m.actions || [],
              timestamp: fmtTimestamp(m.timestamp || new Date()),
            }));
          setMessages(mapped);
          setConversationId(convId);
          setError(null);
          setGoogleNotConnected(false);
          setShowSidebar(false);
        }
      } catch {
        setError("Failed to load conversation. Please try again.");
      } finally {
        setLoadingConvId(null);
      }
    },
    [authHeader]
  );

  const handleDeleteConversation = useCallback(
    async (convId, e) => {
      e.stopPropagation();
      setDeletingConvId(convId);
      try {
        await axios.delete(`/api/chat/${convId}`, {
          headers: authHeader(),
          timeout: 10000,
        });
        setConversations((prev) => prev.filter((c) => c._id !== convId));
        if (conversationId === convId) handleNewChat();
      } catch {
        // Silent fail — conversation still visible, user can retry
      } finally {
        setDeletingConvId(null);
      }
    },
    [authHeader, conversationId]
  );

  // ── New Chat ─────────────────────────────────────────────────────────────────
  const handleNewChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
    setGoogleNotConnected(false);
    setShowSidebar(false);
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, []);

  // ── Send Message ─────────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isTyping) return;

    const token = AuthService.getToken();
    if (!token) {
      setError("Please log in to use the AI assistant.");
      return;
    }

    const userMsg = {
      id: Date.now(),
      type: "user",
      content: trimmed,
      timestamp: fmtTimestamp(new Date()),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);
    setError(null);
    setGoogleNotConnected(false);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "20px";
    }

    try {
      const res = await axios.post(
        "/api/chat",
        { message: trimmed, conversationId },
        {
          headers: { ...authHeader(), "Content-Type": "application/json" },
          timeout: 60000, // 60s — matches backend agent loop max
        }
      );

      if (!res.data.success) {
        throw Object.assign(new Error(res.data.message || "Request failed"), {
          response: { data: res.data, status: res.status },
        });
      }

      const { reply, actions, conversationId: newConvId } = res.data.data;

      if (newConvId) setConversationId(newConvId);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "assistant",
          content: reply || "I couldn't generate a response. Please try again.",
          actions: actions || [],
          timestamp: fmtTimestamp(new Date()),
        },
      ]);
    } catch (err) {
      // Remove the optimistically-added user message on failure
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));

      const status = err.response?.status;
      const code = err.response?.data?.code;
      const backendMsg = err.response?.data?.message;

      if (code === "GOOGLE_NOT_CONNECTED" || status === 403) {
        setGoogleNotConnected(true);
      } else if (status === 401) {
        setError("Your session has expired. Please sign in again.");
        AuthService.logout();
      } else if (status === 429 || code === "RATE_LIMIT") {
        setError("Too many requests. Please wait a moment and try again.");
      } else if (err.code === "ECONNABORTED" || status === 504) {
        setError(
          "The AI took too long to respond. Complex requests can take up to 60 seconds — please try again."
        );
      } else {
        setError(backendMsg || err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, conversationId, isTyping, authHeader]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ── Suggestion prompts ────────────────────────────────────────────────────────
  const SUGGESTIONS = [
    { icon: "📅", label: "Schedule a meeting", prompt: "Set a calendar event for tomorrow at 3 PM" },
    { icon: "📧", label: "Send an email", prompt: "Send an email to john@example.com about the project update" },
    { icon: "✅", label: "Create a task", prompt: "Create a task to review the project proposal" },
    { icon: "📬", label: "Check my emails", prompt: "Show me my recent emails" },
  ];

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#1c1c1c]/50 backdrop-blur-md border border-gray-700/30 rounded-2xl overflow-hidden text-white relative">

      {/* ══ History Sidebar ══════════════════════════════════════════════════════ */}
      <div
        className={`absolute inset-y-0 left-0 z-20 flex flex-col w-72 bg-gray-900/97 backdrop-blur-md border-r border-gray-700/50 transform transition-transform duration-300 ease-in-out ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50 flex-shrink-0">
          <h2 className="text-sm font-semibold text-white">Chat History</h2>
          <button
            onClick={() => setShowSidebar(false)}
            className="p-1.5 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* New Chat CTA */}
        <div className="p-3 border-b border-gray-700/30 flex-shrink-0">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
          {historyLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-5 h-5 border-2 border-gray-500 border-t-blue-400 rounded-full animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-10 px-4">
              <MessageSquare className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-xs">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv._id}
                onClick={() => handleLoadConversation(conv._id)}
                className={`group flex items-center gap-2 px-3 py-2.5 mx-2 rounded-xl cursor-pointer transition-colors hover:bg-gray-700/50 ${
                  conversationId === conv._id
                    ? "bg-gray-700/60 border border-gray-600/40"
                    : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 truncate">
                    {conv.title || "Untitled"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {fmtRelative(conv.lastActivity)}
                  </p>
                </div>
                {loadingConvId === conv._id ? (
                  <div className="w-3.5 h-3.5 border border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                ) : (
                  <button
                    onClick={(e) => handleDeleteConversation(conv._id, e)}
                    disabled={deletingConvId === conv._id}
                    title="Delete conversation"
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded-lg transition-all flex-shrink-0 disabled:opacity-50"
                  >
                    {deletingConvId === conv._id ? (
                      <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3 text-red-400" />
                    )}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sidebar backdrop */}
      {showSidebar && (
        <div
          className="absolute inset-0 z-10 bg-black/30"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* ══ Main Chat Area ═══════════════════════════════════════════════════════ */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b rounded-t-2xl border-gray-800 bg-gray-900 flex-shrink-0">
          <div className="flex items-center space-x-1">
            <div className="w-10 h-10 flex items-center justify-center">
              <Image
                src="/images/frenq-f.png"
                alt="AI Logo"
                width={30}
                height={30}
                className="max-h-[50px]!"
              />
            </div>
            <div>
              <h1 className="text-lg font-medium">AI Task Assistant</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs text-gray-400">Online</span>
            <button
              onClick={handleToggleSidebar}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors ml-2"
              title="Chat history"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Google not-connected banner */}
        {googleNotConnected && (
          <div className="mx-4 mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-start gap-2 flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-yellow-300 text-sm font-medium">
                Google account not connected
              </p>
              <p className="text-yellow-400/70 text-xs mt-0.5">
                Connect your Google account to use Gmail, Calendar and Tasks.
              </p>
            </div>
            <a
              href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google`}
              className="text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0 font-medium"
            >
              Connect
            </a>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="mx-4 mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2 flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm flex-1 min-w-0">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 flex-shrink-0 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Messages */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-black to-purple-500 rounded-full flex items-center justify-center mb-4">
                <Image
                  src="/images/frenq-f.png"
                  alt="AI Logo"
                  width={50}
                  height={50}
                  className="max-h-[50px]! pl-[5px]"
                />
              </div>
              <h3 className="text-xl font-semibold text-white">
                How can I help you today?
              </h3>
              <p className="text-gray-400 max-w-md">
                I can schedule meetings, send emails, manage your tasks and
                more. Just tell me what you need!
              </p>
              <div className="grid grid-cols-1 gap-2 w-full max-w-md mt-6">
                {SUGGESTIONS.map(({ icon, label, prompt }) => (
                  <button
                    key={label}
                    onClick={() => {
                      setInputValue(prompt);
                      textareaRef.current?.focus();
                    }}
                    className="text-left bg-gray-800/50 hover:bg-gray-700/50 p-3 rounded-lg border border-gray-700/30 transition-colors"
                  >
                    <div className="text-sm text-white">
                      {icon} {label}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      &ldquo;{prompt}&rdquo;
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message bubbles */}
          {messages.map((msg) => {
            const isUser = msg.type === "user";
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  isUser ? "items-end" : "items-start"
                } mb-5 animate-fade-in`}
              >
                <div
                  className={`max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl ${
                    isUser ? "order-2" : "order-1"
                  }`}
                >
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      isUser
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-gray-800 text-gray-100 rounded-bl-md"
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">
                      {renderContent(msg.content)}
                    </div>
                  </div>
                  {/* Action chips only for assistant messages */}
                  {!isUser && <ActionChips actions={msg.actions} />}
                </div>
                <div
                  className={`text-xs text-gray-500 mt-1 ${
                    isUser ? "order-1 mr-2" : "order-2 ml-2"
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            );
          })}

          {isTyping && <TypingIndicator />}
        </div>

        {/* Input area */}
        <div className="p-4 bg-[#1c1c1c]/50 flex-shrink-0">
          <div className="flex items-start space-x-2 bg-[#2a2a2a] rounded-xl px-3 py-2 border border-gray-700/50">
            <div className="text-xs text-gray-400 font-medium pt-1 flex-shrink-0">
              FrenqAI
            </div>
            <div className="w-px h-4 bg-gray-600 mt-1 flex-shrink-0" />
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                isTyping ? "processing..." : "Ask me to schedule, email, or manage tasks"
              }
              disabled={isTyping}
              rows={1}
              className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none min-w-0 disabled:opacity-50 resize-none overflow-y-auto max-h-32"
              style={{ minHeight: "20px", lineHeight: "20px", paddingTop: "2px" }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 128) + "px";
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className={`p-1.5 rounded-full transition-all duration-200 flex-shrink-0 ${
                inputValue.trim() && !isTyping
                  ? "bg-blue-600 hover:bg-blue-500 text-white"
                  : "bg-gray-700/50 text-gray-600 cursor-not-allowed"
              }`}
            >
              {isTyping ? (
                <div className="w-3.5 h-3.5 border border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Active conversation indicator + New Chat shortcut */}
          {conversationId && (
            <div className="flex items-center justify-between mt-1.5 px-1">
              <span className="text-xs text-gray-600">Conversation active</span>
              <button
                onClick={handleNewChat}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                New Chat
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.25s ease-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
        textarea::-webkit-scrollbar {
          width: 4px;
        }
        textarea::-webkit-scrollbar-track {
          background: transparent;
        }
        textarea::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
};

export default ChatAssistance;
