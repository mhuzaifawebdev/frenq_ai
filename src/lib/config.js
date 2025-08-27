// Configuration file for API endpoints and settings

export const config = {
  // Backend API URL
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,

  // API endpoints
  endpoints: {
    auth: {
      login: "/api/auth/login",
      register: "/api/auth/register",
      me: "/api/auth/me",
      google: "/api/auth/google",
      googleCallback: "/api/auth/google/callback",
      googleProfile: "/api/auth/google/profile",
      googleDisconnect: "/api/auth/google/disconnect",
    },
    todos: "/api/todos",
    gmail: "/api/gmail",
    calendar: "/api/calendar",
  },

  // Frontend URLs
  frontend: {
    home: "/",
    dashboard: "/dashboard",
    authCallback: "/auth/callback",
  },

  // Token storage keys
  storage: {
    token: "skyline_auth_token",
    user: "skyline_user",
  },

  // Google OAuth scopes (for reference)
  googleScopes: [
    "profile",
    "email",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/calendar.events",
  ],
};
