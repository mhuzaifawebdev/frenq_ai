"use client";
import React, { useState, useEffect } from "react";
import { Mail, Maximize2, ExternalLink, RefreshCw, Settings, Plus, Search, AlertCircle } from "lucide-react";
import { AuthService } from "../lib/auth";
import { config } from "../lib/config";
import axios from "axios";

const GmailWidget = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [viewMode, setViewMode] = useState("list"); // "list", "external"
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE = config.BACKEND_URL;

  useEffect(() => {
    // Try to load emails from API first
    fetchEmails();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const fetchEmails = async () => {
    const token = AuthService.getToken();
    
    if (!token) {
      showMessage('error', 'Please login first');
      setViewMode("external");
      setLoading(false);
      return;
    }
    
    setRefreshing(true);
    if (!loading) setLoading(true);
    
    try {
      const response = await axios.get(`${API_BASE}/api/gmail/emails?maxResults=10`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000 // 10 second timeout
      });
      
      if (response.data.success) {
        setEmails(response.data.data.emails || response.data.emails || []);
        setViewMode("list");
        setError(null);
        showMessage('success', `Fetched ${(response.data.data.emails || response.data.emails || []).length} emails successfully`);
      } else {
        throw new Error(response.data.message || 'Failed to fetch emails');
      }
    } catch (error) {
      console.error('Fetch emails error:', error);
      
      if (error.response?.status === 401) {
        showMessage('error', 'Session expired. Please login again.');
        setViewMode("external");
      } else if (error.response?.status === 403) {
        showMessage('error', 'Gmail access not authorized. Please reconnect your Google account.');
        setViewMode("external");
      } else if (error.code === 'ECONNABORTED') {
        showMessage('error', 'Request timeout. Please try again.');
        setViewMode("external");
      } else {
        const errorMsg = error.response?.data?.message || 'Failed to fetch emails. Please try again.';
        showMessage('error', errorMsg);
        setError(errorMsg);
        setViewMode("external");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const openGmailInNewTab = () => {
    window.open("https://mail.google.com", "_blank");
  };

  const openComposeInNewTab = () => {
    window.open("https://mail.google.com/mail/?view=cm&fs=1", "_blank");
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    
    let date;
    
    // Handle different date formats
    if (typeof dateString === 'number') {
      // Handle timestamp (Gmail internalDate is often a timestamp in milliseconds)
      date = new Date(parseInt(dateString));
    } else if (typeof dateString === 'string') {
      // Handle ISO string or other string formats
      date = new Date(dateString);
    } else {
      console.warn('Invalid date format:', dateString, typeof dateString);
      return 'Unknown';
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date created from:', dateString);
      return 'Unknown';
    }
    
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    try {
      if (diffDays === 1) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays <= 7) {
        return date.toLocaleDateString([], { weekday: 'short' });
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    } catch (error) {
      console.error('Date formatting error:', error, 'for date:', dateString);
      return 'Unknown';
    }
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return "";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-white font-medium flex items-center gap-2">
        <Mail className="w-5 h-5" />
        Gmail {emails.length > 0 && `(${emails.length})`}
      </h2>
      
      <div className="flex items-center gap-2">
        
        <button
          onClick={fetchEmails}
          disabled={refreshing}
          className="p-1 hover:bg-gray-800/30 rounded transition-colors disabled:opacity-50"
          title="Refresh"
        > 
             <RefreshCw
                    className={`w-4 h-4 text-blue-400 ${refreshing ? "animate-spin" : ""}`}
                  />
        </button>
      
        <button
          onClick={openGmailInNewTab}
          className="p-1 hover:bg-gray-800/30 rounded transition-colors"
          title="Open Gmail"
        >
          <ExternalLink className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );

  const renderMessage = () => {
    if (!message.text) return null;
    
    const bgColor = message.type === 'success' ? 'bg-green-600/20 border-green-500/30' : 
                   message.type === 'error' ? 'bg-red-600/20 border-red-500/30' : 
                   'bg-blue-600/20 border-blue-500/30';
    
    const textColor = message.type === 'success' ? 'text-green-300' : 
                     message.type === 'error' ? 'text-red-300' : 
                     'text-blue-300';
    
    return (
      <div className={`mb-4 p-3 rounded-lg border ${bgColor} ${textColor} text-sm flex items-center gap-2`}>
        {message.type === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
        <span>{message.text}</span>
      </div>
    );
  };

  const renderQuickActions = () => (
    <div className="flex gap-2 mb-4">
      <button
        onClick={openComposeInNewTab}
        className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition-colors"
      >
        <Plus className="w-4 h-4" />
        Compose
      </button>
      <button
        onClick={openGmailInNewTab}
        className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white text-sm transition-colors"
      >
        Open Gmail
      </button>
    </div>
  );

  const renderEmailList = () => {
    if (emails.length === 0) {
      return (
        <div className="text-center py-8">
          <Mail className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No recent emails</p>
          <button
            onClick={openGmailInNewTab}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
          >
            View All Emails
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-1 max-h-[320px] overflow-y-auto custom-scrollbar">
        {emails.slice(0, 10).map((email, index) => {
          // Handle different email data structures and date formats
          let emailDate = email.date || email.receivedDateTime || email.internalDate;
          
          // Convert Gmail internalDate (timestamp as string) to proper format
          if (email.internalDate && typeof email.internalDate === 'string') {
            emailDate = parseInt(email.internalDate);
          }
          
          // Debug logging for date issues
          // if (process.env.NODE_ENV === 'development') {
          //   console.log('Email date debug:', {
          //     originalDate: email.date,
          //     receivedDateTime: email.receivedDateTime,
          //     internalDate: email.internalDate,
          //     finalDate: emailDate,
          //     emailId: email.id
          //   });
          // }
          
          const emailData = {
            id: email.id || index,
            sender: email.sender || email.from || email.payload?.headers?.find(h => h.name === 'From')?.value || 'Unknown Sender',
            subject: email.subject || email.payload?.headers?.find(h => h.name === 'Subject')?.value || 'No Subject',
            snippet: email.snippet || email.preview || email.bodyPreview || 'No preview available',
            date: emailDate,
            unread: email.unread || email.labelIds?.includes('UNREAD') || false,
            hasAttachment: email.hasAttachment || (email.payload?.parts?.some(part => part.filename)) || false
          };

          return (
            <div
              key={emailData.id}
              className="flex items-start gap-3 p-3 hover:bg-gray-800/30 rounded-lg cursor-pointer transition-colors group"
              onClick={openGmailInNewTab}
            >
              {/* Unread Indicator */}
              {emailData.unread && (
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              )}
              
              <div className="flex-1 min-w-0">
                {/* Sender and Time */}
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium truncate ${emailData.unread ? 'text-white' : 'text-gray-300'}`}>
                    {truncateText(emailData.sender, 25)}
                  </span>
                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    {emailData.hasAttachment && (
                      <div className="w-3 h-3 text-gray-400" title="Has attachment">📎</div>
                    )}
                    <span className="text-xs text-gray-400">
                      {formatDate(emailData.date)}
                    </span>
                  </div>
                </div>
                
                {/* Subject */}
                <p className={`text-sm mb-1 truncate ${emailData.unread ? 'text-white font-medium' : 'text-gray-300'}`}>
                  {emailData.subject}
                </p>
                
                {/* Preview */}
                <p className="text-gray-400 text-xs truncate">
                  {emailData.snippet}
                </p>
              </div>

              <ExternalLink className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
            </div>
          );
        })}
      </div>
    );
  };

  const renderExternalView = () => (
    <div className="text-center py-8">
      <Mail className="w-16 h-16 text-gray-500 mx-auto mb-4" />
      <h3 className="text-white text-lg font-medium mb-2">Access Your Gmail</h3>
      <p className="text-gray-400 mb-6 max-w-sm mx-auto">
        {error || "Gmail integration is not available. Access your emails directly through Gmail."}
      </p>
      <div className="space-y-3">
        <button
          onClick={openComposeInNewTab}
          className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Compose Email
        </button>
        <button
          onClick={openGmailInNewTab}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Mail className="w-5 h-5" />
          Open Gmail
        </button>
      </div>
    </div>
  );

  const renderFooter = () => (
    <div className="mt-4 pt-3 border-t border-gray-700/50">
      <button
        onClick={openGmailInNewTab}
        className="w-full text-center text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
      >
        View all emails in Gmail
        <ExternalLink className="w-3 h-3" />
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-[#1c1c1c]/50 backdrop-blur-md border border-gray-700/30 rounded-2xl p-4 mb-4">
        {renderHeader()}
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading Gmail...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1c1c1c]/50 backdrop-blur-md border border-gray-700/30 rounded-2xl hover:bg-[#1c1c1c]/30 transition-all duration-300 p-4 mb-4">
      {renderHeader()}
      {renderMessage()}
      {renderQuickActions()}
      
      {viewMode === "list" ? renderEmailList() : renderExternalView()}
      {viewMode === "list" && renderFooter()}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }
      `}</style>
    </div>
  );
};

export default GmailWidget;
