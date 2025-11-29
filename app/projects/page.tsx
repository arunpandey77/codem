"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/auth/AuthGuard";
import type { Project } from "@/lib/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        setProjects(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold">Your Codem Projects</h2>
          <Link
            href="/projects/new"
            className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-sm font-medium"
          >
            New Migration
          </Link>
        </header>

        <main className="flex-1 px-6 py-4">
          {loading ? (
            <p className="text-sm text-gray-400">Loading projects...</p>
          ) : projects.length === 0 ? (
            <p className="text-sm text-gray-400">
              No projects yet. Click &quot;New Migration&quot; to create one.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="border border-slate-800 rounded-xl p-4 hover:border-indigo-500 transition"
                >
                  <h3 className="font-semibold mb-1">{p.name}</h3>
                  <p className="text-xs text-gray-400 mb-2">{p.repoUrl}</p>
                  <p className="text-xs text-gray-300">
                    Status: <span className="font-medium">{p.status}</span>
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Created: {new Date(p.createdAt).toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
