import { NextResponse } from "next/server";
import { readDB, writeDB, generateId } from "@/lib/db";
import type { Project } from "@/lib/types";

export async function GET() {
  const db = await readDB();
  return NextResponse.json(db.projects);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, repoUrl } = body as { name?: string; repoUrl?: string };

  if (!repoUrl) {
    return NextResponse.json(
      { error: "repoUrl is required" },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const project: Project = {
    id: generateId("proj"),
    name: name || repoUrl.split("/").slice(-1)[0] || "Untitled Project",
    repoUrl,
    status: "not_analyzed",
    createdAt: now,
    updatedAt: now,
  };

  const db = await readDB();
  db.projects.push(project);
  await writeDB(db);

  return NextResponse.json(project, { status: 201 });
}
