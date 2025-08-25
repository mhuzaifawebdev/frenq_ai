import { NextResponse } from "next/server";
import { config } from "../../../lib/config";

const BACKEND_URL = config.BACKEND_URL;

// Handle Google OAuth initiation
export async function GET(request) {
  try {
    // Redirect to backend Google OAuth
    const googleAuthUrl = `${BACKEND_URL}/api/auth/google`;

    return NextResponse.redirect(googleAuthUrl);
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { success: false, message: "Authentication error" },
      { status: 500 }
    );
  }
}

// Handle other auth operations
export async function POST(request) {
  try {
    const { action, ...data } = await request.json();

    switch (action) {
      case "login":
        return await handleLogin(data);
      case "register":
        return await handleRegister(data);
      case "verifyToken":
        return await handleVerifyToken(data);
      case "getGmailToken":
        return await handleGetGmailToken(data);
      default:
        return NextResponse.json(
          { success: false, message: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Auth POST error:", error);
    return NextResponse.json(
      { success: false, message: "Authentication error" },
      { status: 500 }
    );
  }
}

async function handleLogin(data) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Login failed" },
      { status: 500 }
    );
  }
}

async function handleRegister(data) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Registration failed" },
      { status: 500 }
    );
  }
}

async function handleVerifyToken(data) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${data.token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Token verification failed" },
      { status: 500 }
    );
  }
}

async function handleGetGmailToken(data) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/gmail-token`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${data.token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Backend Gmail token error: ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error("Gmail token fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Gmail token not available" },
      { status: 503 }
    );
  }
}
