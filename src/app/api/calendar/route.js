import { NextResponse } from "next/server";
import { config } from "../../../lib/config";

const BACKEND_URL = config.BACKEND_URL;

// Handle Calendar API requests
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
    const maxResults = searchParams.get("maxResults") || "20";
    const timeMin = searchParams.get("timeMin");
    const timeMax = searchParams.get("timeMax");
    
    // Build query parameters
    let queryParams = `maxResults=${maxResults}`;
    if (timeMin) queryParams += `&timeMin=${encodeURIComponent(timeMin)}`;
    if (timeMax) queryParams += `&timeMax=${encodeURIComponent(timeMax)}`;
    
    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/calendar/events?${queryParams}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error("Calendar API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch calendar data", error: error.message },
      { status: 500 }
    );
  }
}

// Handle Calendar actions (create events, etc.)
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
    const response = await fetch(`${BACKEND_URL}/api/calendar/events`, {
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
    console.error("Calendar API POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process calendar request" },
      { status: 500 }
    );
  }
}
