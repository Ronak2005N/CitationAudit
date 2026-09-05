import { NextResponse } from "next/server";
import { checkRetractions } from "@/lib/crossref";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dois } = body as { dois: string[] };

    if (!dois || !Array.isArray(dois) || dois.length === 0) {
      return NextResponse.json(
        { error: "An array of DOIs is required" },
        { status: 400 }
      );
    }

    if (dois.length > 50) {
      return NextResponse.json(
        { error: "Maximum 50 DOIs per request" },
        { status: 400 }
      );
    }

    const results = await checkRetractions(dois);
    const retractedCount = results.filter((r) => r.isRetracted).length;

    return NextResponse.json({
      results,
      totalChecked: results.length,
      retractedCount,
    });
  } catch (error) {
    console.error("Retraction check failed:", error);
    return NextResponse.json(
      { error: "Retraction check failed", details: String(error) },
      { status: 500 }
    );
  }
}
