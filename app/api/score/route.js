import { NextResponse } from "next/server";
import { scoreProject } from "@/lib/scoring";
import { PRESETS } from "@/lib/presets";

export async function POST(req) {
  const profile = await req.json();
  return NextResponse.json(scoreProject(profile));
}

export async function GET() {
  return NextResponse.json(scoreProject(PRESETS[0].profile));
}