import { NextResponse } from "next/server";
import { config } from "../../../lib/config";

const BACKEND_URL = config.BACKEND_URL;

// Handle Gmail API requests
export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication token required" },
        { status: 401 }
      );
    }

    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const maxResults = searchParams.get("maxResults") || "10";
    
    // Forward the request to the backend with proper endpoint
    const response = await fetch(`${BACKEND_URL}/api/gmail/emails?maxResults=${maxResults}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error("Gmail API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch Gmail data", error: error.message },
      { status: 500 }
    );
  }
}

// Handle Gmail actions (compose, send, etc.)
export async function POST(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication token required" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/gmail`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error("Gmail API POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process Gmail request" },
      { status: 500 }
    );
  }
}
