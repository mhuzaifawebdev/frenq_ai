"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  MoreHorizontal,
  ScanQrCode,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { AuthService } from "../lib/auth";
import { config } from "../lib/config";
import axios from "axios";

const CalendarWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date()); // Add selected date state
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE = config.BACKEND_URL;

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Memoized selected date events to ensure proper re-rendering
  const selectedDateEvents = useMemo(() => {
    const filteredEvents = events.filter((event) => {
      const eventDate = new Date(event.start?.dateTime || event.start?.date);
      const matches = eventDate.toDateString() === selectedDate.toDateString();

      if (process.env.NODE_ENV === "development") {
        console.log(
          "Event date:",
          eventDate.toDateString(),
          "Selected date:",
          selectedDate.toDateString(),
          "Matches:",
          matches
        );
      }

      return matches;
    });

    if (process.env.NODE_ENV === "development") {
      console.log(
        "Memoized selected date events:",
        filteredEvents.length,
        "for date:",
        selectedDate.toDateString()
      );
    }

    return filteredEvents;
  }, [events, selectedDate]);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const fetchEvents = async (isManualRefresh = false) => {
    const token = AuthService.getToken();

    if (!token) {
      showMessage("error", "Please login first");
      setLoading(false);
      return;
    }

    setRefreshing(true);
    // Only show loading spinner for initial load, not manual refresh
    if (!isManualRefresh && !loading) setLoading(true);

    try {
      // Get events for the current month
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      // Format dates in ISO 8601 format
      const timeMin = startOfMonth.toISOString();
      const timeMax = endOfMonth.toISOString();

      const response = await axios.get(
        `${API_BASE}/api/calendar/events?maxResults=20&timeMin=${encodeURIComponent(
          timeMin
        )}&timeMax=${encodeURIComponent(timeMax)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      ); 

      if (response.data.success) {
        const fetchedEvents =
          response.data.data.events || response.data.events || [];
        setEvents(fetchedEvents);
        setError(null);

        // Show success message for manual refresh
        if (isManualRefresh) {
          showMessage(
            "success",
            `Calendar refreshed! Found ${fetchedEvents.length} events`
          );
        } else {
          showMessage(
            "success",
            `Fetched ${fetchedEvents.length} events successfully`
          );
        }
      } else {
        throw new Error(response.data.message || "Failed to fetch events");
      }
    } catch (error) {
      console.error("Fetch events error:", error);

      if (error.response?.status === 401) {
        showMessage("error", "Session expired. Please login again.");
      } else if (error.response?.status === 403) {
        showMessage(
          "error",
          "Calendar access not authorized. Please reconnect your Google account."
        );
      } else if (error.code === "ECONNABORTED") {
        showMessage("error", "Request timeout. Please try again.");
      } else {
        const errorMsg =
          error.response?.data?.message ||
          "Failed to fetch events. Please try again.";
        showMessage("error", errorMsg);
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatEventTime = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    // Subtract 5 hours from the event time
    const adjustedDate = new Date(date.getTime() - 5 * 60 * 60 * 1000);

    return adjustedDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const hasEventsOnDay = (day) => {
    if (!day || events.length === 0) return false;

    const dayDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    return events.some((event) => {
      const eventDate = new Date(event.start?.dateTime || event.start?.date);

      return eventDate.toDateString() === dayDate.toDateString();
    });
  };

  const getEventsForDay = (day) => {
    if (!day || events.length === 0) return [];

    const dayDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    return events.filter((event) => {
      const eventDate = new Date(event.start?.dateTime || event.start?.date);
      return eventDate.toDateString() === dayDate.toDateString();
    });
  };

  const getEventsForSelectedDate = () => {
    return selectedDateEvents;
  };

  const handleDateClick = (day) => {
    if (!day) return;
    const newSelectedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(newSelectedDate);
  };

  const openGoogleCalendar = () => {
    window.open("https://calendar.google.com", "_blank");
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
    // Keep selected date in sync with month navigation
    const newSelectedDate = new Date(selectedDate);
    newSelectedDate.setMonth(newSelectedDate.getMonth() + direction);
    setSelectedDate(newSelectedDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const renderMessage = () => {
    if (!message.text) return null;

    const bgColor =
      message.type === "success"
        ? "bg-green-600/20 border-green-500/30"
        : message.type === "error"
        ? "bg-red-600/20 border-red-500/30"
        : "bg-blue-600/20 border-blue-500/30";

    const textColor =
      message.type === "success"
        ? "text-green-300"
        : message.type === "error"
        ? "text-red-300"
        : "text-blue-300";

    return (
      <div
        className={`mb-4 p-3 rounded-lg border ${bgColor} ${textColor} text-sm flex items-center gap-2`}
      >
        {message.type === "error" && (
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
        )}
        <span>{message.text}</span>
      </div>
    );
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };


  return (
    <div className="bg-gray-900/20 backdrop-blur-md border border-gray-700/30 rounded-2xl p-4 h-full">
      {renderMessage()}

      {/* Reminders Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-medium">Reminders</h2>
          <div className="flex items-center gap-2">
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
              Upcoming
            </span>
            <span className="text-gray-400 text-xs">Past</span>
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Show today's events as reminders */}
        {events.length > 0 &&
        events.filter((event) => {
          const eventDate = new Date(
            event.start?.dateTime || event.start?.date
          );
          return isToday(eventDate);
        }).length > 0 ? (
          <div className="space-y-2">
            {events
              .filter((event) => {
                const eventDate = new Date(
                  event.start?.dateTime || event.start?.date
                );
                return isToday(eventDate);
              })
              .slice(0, 2)
              .map((event, index) => (
                <div
                  key={index}
                  className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-white text-sm">
                        {event.summary || "Untitled Event"}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        {formatEventTime(event.start?.dateTime)} - Today
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="text-white text-sm">
                  No upcoming reminders. Tell Skyline Agent to set a reminder.
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  He'll send you a text message then.
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={openGoogleCalendar}
          className="w-full mt-3 py-2 text-center bg-gray-800/50 hover:bg-gray-800/70 border border-gray-600/50 rounded-lg text-white text-sm"
        >
          Reminder +
        </button>
      </div>

      {/* Calendar Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-medium">Calendar</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchEvents(true)}
              disabled={refreshing}
              className="p-1 hover:bg-gray-800/30 rounded transition-colors disabled:opacity-50"
              title="Refresh Calendar"
            >
              <RefreshCw
                className={`w-4 h-4 text-blue-400 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
            </button>
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-gray-400 text-xs">1 Account Connected</span>
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ChevronLeft className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" />
            <ChevronRight className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" />
            <button className="text-white text-sm">Today</button>
          </div>
          <span className="text-white font-medium">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="text-center text-gray-400 text-xs font-medium py-2"
            >
              {day}
            </div>
          ))}
          {getDaysInMonth().map((day, index) => {
            const isToday =
              day &&
              day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();

            const isSelected =
              day &&
              day === selectedDate.getDate() &&
              currentDate.getMonth() === selectedDate.getMonth() &&
              currentDate.getFullYear() === selectedDate.getFullYear();

            const dayDate = day
              ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
              : null;
            const hasEvents =
              dayDate &&
              events.some((event) => {
                const eventDate = new Date(
                  event.start?.dateTime || event.start?.date
                );
                return eventDate.toDateString() === dayDate.toDateString();
              });

            return (
              <div key={index} className="text-center relative">
                {day ? (
                  <button
                    onClick={() => handleDateClick(day)}
                    className={`w-full p-2 hover:bg-gray-700/50 rounded cursor-pointer transition-colors ${
                      isSelected ? "bg-gray-700/70" : ""
                    }`}
                  >
                    <span
                      className={`text-sm ${
                        isToday
                          ? "text-white bg-blue-500 w-6 h-6 rounded-full flex items-center justify-center mx-auto"
                          : isSelected
                          ? "text-blue-400 font-semibold"
                          : hasEvents
                          ? "text-green-400"
                          : "text-gray-300"
                      }`}
                    >
                      {day}
                    </span>
                    {hasEvents && !isToday && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-400 rounded-full"></div>
                    )}
                  </button>
                ) : (
                  <div className="p-2"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Date Events */}
        <div className="space-y-2">
          <h3 className="text-white text-sm font-medium mb-3">
            {selectedDate.toDateString() === new Date().toDateString()
              ? "Today's Schedule"
              : `Schedule for ${selectedDate.toLocaleDateString()}`}
          </h3>
          {loading ? (
            <div className="text-gray-400 text-sm">Loading events...</div>
          ) : selectedDateEvents.length > 0 ? (
            selectedDateEvents.slice(0, 5).map((event, index) => (
              <div
                key={`${selectedDate.toDateString()}-${index}`}
                className="flex items-center justify-between py-2 border-b border-gray-800/50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-xs w-12">
                    {formatEventTime(event.start?.dateTime)}
                  </span>
                  <div className="flex-1">
                    <p className="text-white text-sm">
                      {event.summary || "Untitled Event"}
                    </p>
                    {event.location && (
                      <p className="text-gray-400 text-xs">{event.location}</p>
                    )}
                  </div>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
            ))
          ) : (
            <div className="text-gray-400 text-sm">
              No events scheduled for {selectedDate.toLocaleDateString()}
            </div>
          )}
        </div>

        <button
          onClick={openGoogleCalendar}
          className="w-full mt-4 p-3 bg-gray-800/50 hover:bg-gray-800/70 border border-gray-600/50 rounded-lg text-gray-400 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Event</span>
        </button>
      </div>
    </div>
  );
};

export default CalendarWidget;
