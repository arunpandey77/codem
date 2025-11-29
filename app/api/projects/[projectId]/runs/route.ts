import { NextResponse } from "next/server";
import { readDB, writeDB, generateId } from "@/lib/db";
import type { Run, FileMigration } from "@/lib/types";

// Default to your test webhook; can be overridden via env
const DEFAULT_N8N_MIGRATION_WEBHOOK =
  "https://mailabs.app.n8n.cloud/webhook-test/conversion";

interface Params {
  params: { projectId: string };
}

export async function GET(_: Request, { params }: Params) {
  const db = await readDB();
  const runs = db.runs.filter((r) => r.projectId === params.projectId);
  return NextResponse.json(runs);
}

export async function POST(req: Request, { params }: Params) {
  const body = await req.json();
  const { scope } = body as { scope?: string };

  const db = await readDB();
  const project = db.projects.find((p) => p.id === params.projectId);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const now = new Date().toISOString();
  const runId = generateId("run");

  let files: FileMigration[] = [];
  const webhookUrl =
    process.env.N8N_MIGRATION_WEBHOOK_URL || DEFAULT_N8N_MIGRATION_WEBHOOK;

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: project.id,
        runId,
        repoUrl: project.repoUrl,
        scope: scope || "service",
      }),
    });

    const raw = await res.text();
    console.log("[Codem] n8n webhook URL:", webhookUrl);
    console.log("[Codem] n8n status:", res.status);
    console.log("[Codem] n8n raw body:", raw);

    if (!res.ok) {
      throw new Error(`n8n migration webhook error: ${res.status} ${raw}`);
    }

    let data: any;
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch (e) {
      throw new Error("Invalid JSON from n8n: " + raw);
    }

    // Accept MANY shapes:
    // 1) { files: [...] }
    // 2) [ ... ]
    // 3) { data: { files: [...] } }
    let rawFiles: any[] = [];

    if (Array.isArray(data)) {
      rawFiles = data;
    } else if (Array.isArray(data.files)) {
      rawFiles = data.files;
    } else if (data.data && Array.isArray(data.data.files)) {
      rawFiles = data.data.files;
    } else if (data.files && typeof data.files === "object") {
      // Sometimes n8n returns { files: { 0: {...}, 1: {...} } }
      rawFiles = Object.values(data.files);
    }

    if (!rawFiles.length) {
      console.warn(
        "[Codem] n8n responded with 200 but no files[] found; run will be created with 0 files.",
      );
    } else {
      files = rawFiles.map((f, idx) => {
        const path = f.path ?? f.filePath ?? `file_${idx}.txt`;
        const status = (f.status ?? "migrated") as
          | "migrated"
          | "pending"
          | "manual";
        const originalCode =
          f.originalCode ??
          f.source ??
          f.srcCode ??
          f.original ??
          "// original code not provided by n8n";
        const kotlinCode =
          f.kotlinCode ??
          f.target ??
          f.dstCode ??
          f.converted ??
          "// converted code not provided by n8n";
        const notes = f.notes ?? f.comment ?? f.message ?? undefined;

        const file: FileMigration = {
          id: generateId("file"),
          runId,
          path,
          status,
          originalCode,
          kotlinCode,
          notes,
        };

        return file;
      });
    }
  } catch (err) {
    console.error("Error calling n8n migration webhook:", err);

    // Only fall back to dummy data if the webhook itself failed.
    files = [
      {
        id: generateId("file"),
        runId,
        path: "src/example/Example.java",
        status: "migrated",
        originalCode:
          "public class Example {\n    public int add(int a, int b) { return a + b; }\n}",
        kotlinCode:
          "class Example {\n    fun add(a: Int, b: Int): Int = a + b\n}",
      },
    ];
  }

  const run: Run = {
    id: runId,
    projectId: project.id,
    scope: scope || "service",
    status: "completed",
    stats: {
      totalFiles: files.length,
      migrated: files.filter((f) => f.status === "migrated").length,
      pending: files.filter((f) => f.status === "pending").length,
      manual: files.filter((f) => f.status === "manual").length,
    },
    fileIds: files.map((f) => f.id),
    createdAt: now,
    updatedAt: now,
  };

  db.runs.push(run);
  db.files.push(...files);
  await writeDB(db);

  return NextResponse.json(run, { status: 201 });
}
