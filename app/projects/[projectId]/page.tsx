"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/auth/AuthGuard";
import type { Project, Run } from "@/lib/types";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

<header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
  <div>
    <Link
      href="/projects"
      className="inline-flex items-center text-xs text-gray-400 hover:text-white transition-colors mb-1"
    >
      ← All Projects
    </Link>
    <h1 className="text-lg font-semibold text-white">
      Project {project.id}
    </h1>
    <p className="text-xs text-gray-400">
      Repository: {project.repoUrl}
    </p>
  </div>
  <div className="flex items-center gap-2">
    <Link
      href={`/projects/${project.id}/analysis`}
      className="text-[11px] px-3 py-1 rounded-lg border border-slate-700 text-gray-200 hover:bg-slate-800"
    >
      View Analysis
    </Link>
    <Link
      href={`/projects/${project.id}?startNewRun=1`}
      className="text-[11px] px-3 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm"
    >
      + New Migration Run
    </Link>
  </div>
</header>



interface ProjectResponse {
  project: Project;
  runs: Run[];
}

export default function ProjectDashboardPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  const [data, setData] = useState<ProjectResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        const json = await res.json();
        setData(json);
      } finally {
        setLoading(false);
      }
    };
    if (projectId) {
      load();
    }
  }, [projectId]);

  const project = data?.project;
  const runs = data?.runs || [];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-semibold">
              {project?.name || "Project"}
            </h2>
            <p className="text-xs text-gray-400">
              {project?.repoUrl || "Loading repo URL..."}
            </p>
          </div>
          {project && (
            <ProjectActions
              projectId={projectId}
              hasRuns={runs.length > 0}
              onRunCreated={(runId) =>
                router.push(`/projects/${projectId}/runs/${runId}`)
              }
            />
          )}
        </header>

        <main className="flex-1 px-6 py-6">
          {loading || !project ? (
            <p className="text-sm text-gray-400">Loading project...</p>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-4 mb-6">
                <div className="border border-slate-800 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <p className="text-2xl font-semibold">{project.status}</p>
                </div>
                <div className="border border-slate-800 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Runs</p>
                  <p className="text-2xl font-semibold">{runs.length}</p>
                </div>
                <div className="border border-slate-800 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Created</p>
                  <p className="text-xs">
                    {new Date(project.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="border border-slate-800 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Updated</p>
                  <p className="text-xs">
                    {new Date(project.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <h3 className="text-sm font-semibold mb-2">Migration Runs</h3>
              {runs.length === 0 ? (
                <p className="text-xs text-gray-400">
                  No runs yet. Use &quot;New Migration Run&quot; to trigger your
                  n8n conversion workflow.
                </p>
              ) : (
                <table className="w-full text-xs border border-slate-800 rounded-xl overflow-hidden">
                  <thead className="bg-slate-900">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Run ID</th>
                      <th className="px-3 py-2 text-left font-medium">Scope</th>
                      <th className="px-3 py-2 text-left font-medium">Status</th>
                      <th className="px-3 py-2 text-left font-medium">
                        Files (M/P/Mn)
                      </th>
                      <th className="px-3 py-2 text-left font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runs.map((run) => (
                      <tr key={run.id} className="border-t border-slate-800">
                        <td className="px-3 py-2">{run.id}</td>
                        <td className="px-3 py-2">{run.scope}</td>
                        <td className="px-3 py-2 text-emerald-400">{run.status}</td>
                        <td className="px-3 py-2">
                          {run.stats.totalFiles} (
                          {run.stats.migrated}/{run.stats.pending}/
                          {run.stats.manual})
                        </td>
                        <td className="px-3 py-2">
                          <Link
                            href={`/projects/${projectId}/runs/${run.id}`}
                            className="text-indigo-400 hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}

function ProjectActions({
  projectId,
  hasRuns,
  onRunCreated,
}: {
  projectId: string;
  hasRuns: boolean;
  onRunCreated: (runId: string) => void;
}) {
  const [creating, setCreating] = useState(false);

  const handleNewRun = async () => {
    setCreating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: "service" }),
      });
      if (!res.ok) {
        console.error("Failed to create run", await res.text());
        return;
      }
      const run = await res.json();
      onRunCreated(run.id);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Link
        href={`/projects/${projectId}/analysis`}
        className="px-3 py-2 rounded-lg border border-slate-700 text-xs"
      >
        View Analysis
      </Link>
      {hasRuns && (
        <button
          onClick={handleNewRun}
          disabled={creating}
          className="px-3 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-xs font-medium disabled:opacity-60"
        >
          {creating ? "Starting..." : "New Migration Run"}
        </button>
      )}
    </div>
  );
}
