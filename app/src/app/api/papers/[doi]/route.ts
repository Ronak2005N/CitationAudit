import { NextResponse } from "next/server";
import { getPaperByDOI } from "@/lib/openalex";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ doi: string }> }
) {
  const { doi } = await params;

  if (!doi) {
    return NextResponse.json({ error: "DOI is required" }, { status: 400 });
  }

  try {
    const decodedDoi = decodeURIComponent(doi)
      .replace(/^https?:\/\/doi\.org\//, "")
      .replace(/^https?:\/\/[^/]+\/api\/papers\//, "")
      .replace(/^https?:\/\/[^/]+\//, "");
    const { paper, references } = await getPaperByDOI(decodedDoi);

    return NextResponse.json({
      paper,
      references,
      referenceCount: references.length,
    });
  } catch (error) {
    console.error(`Failed to fetch paper ${doi}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch paper metadata", details: String(error) },
      { status: 502 }
    );
  }
}
