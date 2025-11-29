import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import type { AnalysisSummary } from "@/lib/types";

interface Params {
  params: { projectId: string };
}

export async function POST(_: Request, { params }: Params) {
  const db = await readDB();
  const project = db.projects.find((p) => p.id === params.projectId);

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const now = new Date().toISOString();
  project.status = "analyzing";
  project.updatedAt = now;

  // Mock analysis for now – can be wired to a separate n8n flow later.
  const analysis: AnalysisSummary = {
    languages: [
      { name: "C", percent: 20 },
      { name: "C++", percent: 25 },
      { name: "Java", percent: 35 },
      { name: "Python", percent: 20 },
    ],
    dependencies: [
      "auth-service -> user-service",
      "payment-service -> ledger-service",
      "fraud-service -> rules-engine",
    ],
    warnings: [
      "Manual memory management in legacy modules.",
      "Native interop/FFI present in some layers.",
      "Multi-threading primitives need careful review post-migration.",
    ],
    lastAnalyzedAt: now,
  };

  project.analysis = analysis;
  project.status = "ready";
  project.updatedAt = new Date().toISOString();
  await writeDB(db);

  return NextResponse.json(project);
}
