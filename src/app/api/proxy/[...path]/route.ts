import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_KEY = process.env.DASHBOARD_API_KEY;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const endpoint = `/api/${path.join("/")}`;
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${API_BASE_URL}${endpoint}${searchParams ? `?${searchParams}` : ""}`;

  try {
    const response = await fetch(url, {
      headers: {
        "X-API-Key": API_KEY || "",
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Backend connection failed" },
      { status: 503 }
    );
  }
}
