import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";

const DEFAULT_COPILOT_WEBHOOK =
  "https://mailabs.app.n8n.cloud/webhook-test/codem-copilot";

interface CopilotRequestBody {
  projectId: string;
  runId: string;
  fileId: string;
  question: string;
  history?: { role: "user" | "assistant"; content: string }[];
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CopilotRequestBody;
    const { projectId, runId, fileId, question, history } = body;

    if (!projectId || !runId || !fileId || !question) {
      return NextResponse.json(
        { error: "projectId, runId, fileId and question are required" },
        { status: 400 },
      );
    }

    // Load file from our tiny JSON DB
    const db = await readDB();
    const run = db.runs.find(
      (r) => r.id === runId && r.projectId === projectId,
    );
    if (!run) {
      return NextResponse.json(
        { error: "Run not found for given projectId/runId" },
        { status: 404 },
      );
    }

    const file = db.files.find((f) => f.id === fileId && f.runId === runId);
    if (!file) {
      return NextResponse.json(
        { error: "File not found for given runId/fileId" },
        { status: 404 },
      );
    }

    const payload = {
      projectId,
      runId,
      fileId,
      originalCode: file.originalCode,
      kotlinCode: file.kotlinCode,
      question,
      history: history ?? [],
    };

    const webhookUrl =
      process.env.N8N_COPILOT_WEBHOOK_URL || DEFAULT_COPILOT_WEBHOOK;

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error("Copilot n8n error:", res.status, text);
      return NextResponse.json(
        {
          error: "Copilot backend error",
          status: res.status,
          details: text,
        },
        { status: 500 },
      );
    }

    let data: any;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { answer: text };
    }

    if (!data.answer && typeof text === "string") {
      data.answer = text;
    }

    return NextResponse.json({
      answer: data.answer ?? "",
      suggestedTests: data.suggestedTests ?? [],
      risks: data.risks ?? [],
    });
  } catch (err) {
    console.error("Copilot API unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected copilot server error" },
      { status: 500 },
    );
  }
}
