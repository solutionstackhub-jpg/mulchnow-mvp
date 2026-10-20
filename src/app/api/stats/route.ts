import { NextResponse } from "next/server";
import { getStats } from "@/lib/data";

export async function GET() {
  try {
    return NextResponse.json(getStats());
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
