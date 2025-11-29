"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import type { Project, AnalysisSummary } from "@/lib/types";
import { useParams } from "next/navigation";

interface ProjectResponse {
  project: Project;
}

export default function AnalysisPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        const json: ProjectResponse = await res.json();
        setProject(json.project);
      } finally {
        setLoading(false);
      }
    };
    if (projectId) {
      load();
    }
  }, [projectId]);

  const analysis: AnalysisSummary | undefined = project?.analysis;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <header className="px-6 py-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold">
            Analysis – {project?.name || projectId}
          </h2>
          <p className="text-xs text-gray-400">
            Language composition, dependencies, and risk areas (mocked for now).
          </p>
        </header>

        <main className="flex-1 px-6 py-6 grid gap-6 md:grid-cols-3">
          <section className="md:col-span-1 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-2">Language Composition</h3>
            {analysis ? (
              <ul className="text-xs text-gray-300 space-y-1">
                {analysis.languages.map((lang) => (
                  <li key={lang.name}>
                    {lang.name}: {lang.percent}%
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-500">
                No analysis stored yet. It will be generated when you create a
                project from the wizard.
              </p>
            )}
          </section>

          <section className="md:col-span-1 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-2">Dependencies</h3>
            {analysis ? (
              <ul className="text-xs text-gray-300 space-y-1">
                {analysis.dependencies.map((d, idx) => (
                  <li key={idx}>{d}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-500">
                Dependencies will appear here after analysis.
              </p>
            )}
          </section>

          <section className="md:col-span-1 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-2">Warnings</h3>
            {analysis ? (
              <ul className="text-xs text-amber-300 space-y-1">
                {analysis.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-500">
                Risk warnings will be listed here after analysis.
              </p>
            )}
          </section>
        </main>
      </div>
    </AuthGuard>
  );
}
