"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, Menu, Send, Mic, Paperclip } from "lucide-react";

// Configuration for the AI webhook
const AI_WEBHOOK_URL =
  "http://localhost:5678/webhook-test/439a0055-142d-4406-b5be-75b058eeab52";
const USE_PROXY = false; // Set to true if you encounter CORS issues

const ChatAssistance = () => {
  const [messages, setMessages] = useState([
    // {
    //   id: 1,
    //   type: 'user',
    //   content: 'Could you clarify what you\'d like me to do regarding "call"? Are you asking me to make a phone call, schedule one, or assist with something related to calls? Let me know how I can help!',
    //   timestamp: 'Aug 4 at 10:14 PM',
    //   showCallButton: true
    // },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      const newMessage = {
        id: messages.length + 1,
        type: "user",
        content: inputValue,
        timestamp: new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      };

      setMessages((prev) => [...prev, newMessage]);
      const currentPrompt = inputValue;
      setInputValue("");
      setIsTyping(true);

      try {
        // Call the webhook with the user's prompt
        const apiUrl = USE_PROXY ? "/api/ai" : AI_WEBHOOK_URL;

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: currentPrompt,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Handle both direct webhook response and proxy response
        const outputContent =
          data.output ||
          data.message ||
          "I apologize, but I couldn't process your request at the moment.";

        const assistantMessage = {
          id: messages.length + 2,
          type: "assistant",
          content: outputContent,
          timestamp: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Error calling AI service:", error);

        let errorContent =
          "I apologize, but I encountered an error while processing your request.";

        if (error.message.includes("Failed to fetch")) {
          errorContent += USE_PROXY
            ? " Please make sure the application is running properly and try again."
            : " Please make sure the AI service is running at localhost:5678 and try again.";
        } else if (error.message.includes("HTTP error")) {
          errorContent += ` Server responded with an error (${error.message}). Please try again later.`;
        }

        const errorMessage = {
          id: messages.length + 2,
          type: "assistant",
          content: errorContent,
          timestamp: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const MessageBubble = ({ message }) => {
    const isUser = message.type === "user";

    // Function to render message content with clickable links
    const renderContent = (content) => {
      // Convert markdown-style links [text](url) to clickable links
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = linkRegex.exec(content)) !== null) {
        // Add text before the link
        if (match.index > lastIndex) {
          parts.push(content.slice(lastIndex, match.index));
        }

        // Add the clickable link
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

      // Add remaining text after the last link
      if (lastIndex < content.length) {
        parts.push(content.slice(lastIndex));
      }

      return parts.length > 0 ? parts : content;
    };

    return (
      <div
        className={`flex flex-col ${
          isUser ? "items-end" : "items-start"
        } mb-6 animate-fade-in`}
      >
        <div
          className={`max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl relative ${
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
              {renderContent(message.content)}
            </div>
          </div>

          {/* Action Buttons */}
          {message.showCallButton && (
            <button className="mt-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105">
              Call Me
            </button>
          )}

          {message.showStartCall && (
            <button className="mt-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105">
              Start Phone Call
            </button>
          )}
        </div>

        <div
          className={`text-xs text-gray-500 mt-1 ${
            isUser ? "order-1 mr-2" : "order-2 ml-2"
          }`}
        >
          {message.timestamp}
        </div>
      </div>
    );
  };

  const TypingIndicator = () => (
    <div className="flex items-start mb-6 animate-fade-in">
      <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
          <span className="text-gray-400 text-xs ml-2">AI is thinking...</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#1c1c1c]/50 backdrop-blur-md border border-gray-700/30 rounded-2xl hover:bg-[#1c1c1c]/30 transition-all duration-300 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b rounded-t-2xl border-gray-800 bg-gray-900 ">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <div>
            <h1 className="text-lg font-medium">AI Task Assistant</h1>
            <p className="text-xs text-gray-400">
              I can help you with calendar events, emails, calls, and more
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-400">Online</span>
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors ml-2">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-white text-2xl font-bold">AI</span>
            </div>
            <h3 className="text-xl font-semibold text-white">
              How can I help you today?
            </h3>
            <p className="text-gray-400 max-w-md">
              I can help you with calendar events, send emails, make calls,
              manage tasks, and much more. Just tell me what you need!
            </p>
            <div className="grid grid-cols-1 gap-2 w-full max-w-md mt-6">
              <button
                onClick={() =>
                  setInputValue("Set a calendar event for tomorrow at 3 PM")
                }
                className="text-left bg-gray-800/50 hover:bg-gray-700/50 p-3 rounded-lg border border-gray-700/30 transition-colors"
              >
                <div className="text-sm text-white">📅 Schedule a meeting</div>
                <div className="text-xs text-gray-400">
                  "Set a calendar event for tomorrow at 3 PM"
                </div>
              </button>
              <button
                onClick={() =>
                  setInputValue(
                    "Send an email to john@example.com about the project update"
                  )
                }
                className="text-left bg-gray-800/50 hover:bg-gray-700/50 p-3 rounded-lg border border-gray-700/30 transition-colors"
              >
                <div className="text-sm text-white">📧 Send an email</div>
                <div className="text-xs text-gray-400">
                  "Send an email to john@example.com"
                </div>
              </button>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#1c1c1c]/50">
        <div className="flex items-center space-x-2 bg-[#2a2a2a] rounded-xl px-3 py-2 border border-gray-700/50">
          {/* Model Badge */}
          <div className="text-xs text-gray-400 font-medium">GPT-4o</div>

          {/* Divider */}
          <div className="w-px h-4 bg-gray-600"></div>

          {/* Attachment Button */}
          <button className="p-1 text-gray-400 hover:text-gray-300 transition-colors">
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyUp={handleKeyPress}
            placeholder={
              isTyping
                ? "AI is processing..."
                : "Ask me to schedule, call, email, or do anything..."
            }
            disabled={isTyping}
            className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none min-w-0 disabled:opacity-50"
          />

          {/* Mic Button */}
          <button
            className="p-1 text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
            disabled={isTyping}
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className={`p-1.5 rounded-full transition-all duration-200 ${
              inputValue.trim() && !isTyping
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "bg-gray-700/50 text-gray-600 cursor-not-allowed"
            }`}
          >
            {isTyping ? (
              <div className="w-3.5 h-3.5 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        /* Custom scrollbar for webkit browsers */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }

        textarea::-webkit-scrollbar {
          width: 6px;
        }

        textarea::-webkit-scrollbar-track {
          background: transparent;
        }

        textarea::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default ChatAssistance;
