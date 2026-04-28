import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const RUNS_FILE = path.join(DATA_DIR, "runs.ndjson");

function readRuns() {
  if (!fs.existsSync(RUNS_FILE)) return [];

  return fs
    .readFileSync(RUNS_FILE, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

export async function GET() {
  return NextResponse.json(readRuns());
}

export async function POST(request: Request) {
  try {
    const run = await request.json();

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    fs.appendFileSync(
      RUNS_FILE,
      JSON.stringify({
        ...run,
        ts: new Date().toISOString(),
      }) + "\n"
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
