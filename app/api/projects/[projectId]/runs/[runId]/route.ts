import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";

interface Params {
  params: { projectId: string; runId: string };
}

export async function GET(_: Request, { params }: Params) {
  const db = await readDB();
  const run = db.runs.find(
    (r) => r.id === params.runId && r.projectId === params.projectId,
  );

  if (!run) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  const files = db.files.filter((f) => f.runId === run.id);

  return NextResponse.json({ run, files });
}
