import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const RUNS_FILE = path.join(DATA_DIR, "runs.ndjson");

export async function POST(req: Request) {
  const body = await req.json();

  const record = {
    ...body,
    createdAt: new Date().toISOString(),
  };

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.appendFile(RUNS_FILE, JSON.stringify(record) + "\n", "utf8");

  return NextResponse.json({ ok: true });
}

export async function GET() {
  try {
    const raw = await fs.readFile(RUNS_FILE, "utf8");
    const runs = raw
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));

    return NextResponse.json({ runs });
  } catch {
    return NextResponse.json({ runs: [] });
  }
}
