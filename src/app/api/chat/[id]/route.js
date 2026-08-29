import { NextResponse } from "next/server";
import { config } from "../../../../lib/config";

const BACKEND_URL = config.BACKEND_URL;

// GET /api/chat/:id — load a specific conversation's messages
export async function GET(request, { params }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const { id } = await params;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication token required" },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/chat/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error("Load conversation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load conversation", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/chat/:id — archive/delete a conversation
export async function DELETE(request, { params }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const { id } = await params;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication token required" },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/chat/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error("Delete conversation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete conversation", error: error.message },
      { status: 500 }
    );
  }
}
