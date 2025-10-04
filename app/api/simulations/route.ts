import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const SIMULATIONS_FILE = path.join(process.cwd(), "data", "simulations.json");

export async function POST(request: NextRequest) {
  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ success: true });
}
