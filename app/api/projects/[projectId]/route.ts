import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";

interface Params {
  params: { projectId: string };
}

export async function GET(_: Request, { params }: Params) {
  const db = await readDB();
  const project = db.projects.find((p) => p.id === params.projectId);

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const runs = db.runs.filter((r) => r.projectId === project.id);

  return NextResponse.json({ project, runs });
}
