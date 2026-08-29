import { NextResponse } from "next/server";
import { config } from "../../../lib/config";

const BACKEND_URL = config.BACKEND_URL;

// POST /api/chat — send a message to the AI agent
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

    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(65000), // 65s — slightly over the 60s client timeout
    });

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error("Chat POST error:", error);
    if (error.name === "TimeoutError" || error.code === "ECONNABORTED") {
      return NextResponse.json(
        { success: false, message: "AI request timed out. Please try again." },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to process chat request", error: error.message },
      { status: 500 }
    );
  }
}

// GET /api/chat?page=1&limit=20 — list conversation history
export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication token required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "20";

    const response = await fetch(
      `${BACKEND_URL}/api/chat/history?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error("Chat history GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch chat history", error: error.message },
      { status: 500 }
    );
  }
}
