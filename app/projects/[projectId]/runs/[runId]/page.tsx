"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import type { Run, FileMigration } from "@/lib/types";
import FilesSidebar from "@/components/workspace/FilesSidebar";
import DiffViewer from "@/components/workspace/DiffViewer";
import AiCopilotPanel from "@/components/workspace/AiCopilotPanel";
import Link from "next/link";


interface RunResponse {
  run: Run;
  files: FileMigration[];
}

export default function RunWorkspacePage() {
  const params = useParams<{ projectId: string; runId: string }>();
  const projectId = params.projectId;
  const runId = params.runId;

  const [run, setRun] = useState<Run | null>(null);
  const [files, setFiles] = useState<FileMigration[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `/api/projects/${projectId}/runs/${runId}`,
        );
        const json: RunResponse = await res.json();
        setRun(json.run);
        setFiles(json.files);
        if (json.files.length > 0) {
          setSelectedFileId(json.files[0].id);
        }
      } finally {
        setLoading(false);
      }
    };
    if (projectId && runId) {
      load();
    }
  }, [projectId, runId]);

  const selectedFile =
    selectedFileId != null
      ? files.find((f) => f.id === selectedFileId) || null
      : null;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
			<div className="flex items-center gap-3">
			 <Link
               href="/projects"
               className="inline-flex items-center text-xs text-gray-400 hover:text-white transition-colors"
             >
      ← All Projects
    </Link>
    <span className="text-slate-700">/</span>
    <Link
      href={`/projects/${projectId}`}
      className="inline-flex items-center text-xs text-gray-300 hover:text-white transition-colors"
    >
      Project {projectId}
    </Link>
    <span className="text-slate-700">/</span>
    <span className="text-xs text-gray-400">Run {runId}</span>
  </div>

  <div className="text-right">
    <div className="text-sm font-semibold text-white">
      Migration Run {runId}
    </div>
    <div className="text-[11px] text-gray-400 mt-0.5">
      {run ? (
        <>
          Files: {run.stats.totalFiles} • Migrated: {run.stats.migrated} •
          Pending: {run.stats.pending} • Manual: {run.stats.manual}
        </>
      ) : loading ? (
        "Loading run stats..."
      ) : (
        "No run data"
      )}
    </div>
  </div>
</header>


        <main className="flex-1 grid grid-cols-[260px_minmax(0,1.5fr)_minmax(0,1fr)]">
          <section className="border-r border-slate-800">
            <FilesSidebar
              files={files}
              selectedFileId={selectedFileId}
              onSelect={setSelectedFileId}
            />
          </section>

          <section className="border-r border-slate-800">
            <DiffViewer file={selectedFile} />
          </section>

          <section>
            <AiCopilotPanel
              projectId={projectId as string}
              runId={runId as string}
              fileId={selectedFileId}
              filePath={selectedFile?.path} 
			/>
          </section>
        </main>
      </div>
    </AuthGuard>
  );
}
