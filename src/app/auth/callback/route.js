import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      // Redirect to main page with error
      return NextResponse.redirect(
        new URL(`/?auth=error&message=${error}`, request.url)
      );
    }

    if (token) {
      // Redirect to dashboard with token
      return NextResponse.redirect(
        new URL(`/dashboard?token=${token}`, request.url)
      );
    }

    // No token or error, redirect to home
    return NextResponse.redirect(new URL("/?auth=failed", request.url));
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(new URL("/?auth=error", request.url));
  }
}
