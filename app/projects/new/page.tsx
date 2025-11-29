"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";

type Step = 1 | 2 | 3;

export default function NewProjectPage() {
  const [step, setStep] = useState<Step>(1);
  const [repoUrl, setRepoUrl] = useState("");
  const [name, setName] = useState("");
  const [scope, setScope] = useState<"auto" | "manual">("auto");
  const [strategy, setStrategy] = useState<"file" | "service" | "full">(
    "service",
  );
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const handleNext = () => {
    if (step < 3) setStep((s) => (s + 1) as Step);
    else {
      handleCreate();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  const handleCreate = async () => {
    if (!repoUrl) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, repoUrl }),
      });
      const project = await res.json();

      await fetch(`/api/projects/${project.id}/analysis`, {
        method: "POST",
      });

      const runRes = await fetch(`/api/projects/${project.id}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: strategy }),
      });

      const run = await runRes.json();
      router.push(`/projects/${project.id}/runs/${run.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <header className="px-6 py-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold">
            New Migration – Step {step} of 3
          </h2>
        </header>

        <main className="flex-1 px-6 py-6 max-w-3xl mx-auto">
          {step === 1 && (
            <section>
              <h3 className="text-base font-semibold mb-2">
                1. Connect Repository
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Paste a Git repository URL. In later iterations, this can
                become a direct GitHub/GitLab integration.
              </p>
              <input
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/org/repo.git"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm mb-3"
              />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Project name (optional)"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              />
            </section>
          )}

          {step === 2 && (
            <section>
              <h3 className="text-base font-semibold mb-2">
                2. Define Scope
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Choose how we determine which parts of the repo to migrate.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <button
                  onClick={() => setScope("auto")}
                  className={`border rounded-xl p-4 text-left text-sm ${
                    scope === "auto"
                      ? "border-indigo-500 bg-slate-900"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <h4 className="font-semibold mb-1">Automatic Detection</h4>
                  <p className="text-xs text-gray-400">
                    Auto-detect modules in C, C++, Java, or Python that are
                    candidates for migration.
                  </p>
                </button>

                <button
                  onClick={() => setScope("manual")}
                  className={`border rounded-xl p-4 text-left text-sm ${
                    scope === "manual"
                      ? "border-indigo-500 bg-slate-900"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <h4 className="font-semibold mb-1">Manual Selection</h4>
                  <p className="text-xs text-gray-400">
                    You&apos;ll manually choose folders/modules to migrate.
                    (Tree selection UI can be added in a next iteration.)
                  </p>
                </button>
              </div>
            </section>
          )}

          {step === 3 && (
            <section>
              <h3 className="text-base font-semibold mb-2">
                3. Choose Migration Strategy
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                How aggressive should the migration be?
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                <button
                  onClick={() => setStrategy("file")}
                  className={`border rounded-xl p-4 text-left text-sm ${
                    strategy === "file"
                      ? "border-indigo-500 bg-slate-900"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <h4 className="font-semibold mb-1">File-level</h4>
                  <p className="text-xs text-gray-400">
                    Convert individual files or small modules. Good for POCs.
                  </p>
                </button>

                <button
                  onClick={() => setStrategy("service")}
                  className={`border rounded-xl p-4 text-left text-sm ${
                    strategy === "service"
                      ? "border-indigo-500 bg-slate-900"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <h4 className="font-semibold mb-1">Service-by-Service</h4>
                  <p className="text-xs text-gray-400">
                    Recommended. Migrate one logical service at a time with
                    dependency awareness.
                  </p>
                </button>

                <button
                  onClick={() => setStrategy("full")}
                  className={`border rounded-xl p-4 text-left text-sm ${
                    strategy === "full"
                      ? "border-indigo-500 bg-slate-900"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <h4 className="font-semibold mb-1">Full Repo</h4>
                  <p className="text-xs text-gray-400">
                    Aggressive. Attempt to migrate the entire repo. Use for
                    advanced scenarios.
                  </p>
                </button>
              </div>
            </section>
          )}

          <div className="mt-8 flex justify-between">
            <button
              onClick={handleBack}
              disabled={step === 1 || submitting}
              className="px-4 py-2 rounded-lg border border-slate-700 text-xs text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={submitting || (step === 1 && !repoUrl)}
              className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-xs font-medium disabled:opacity-50"
            >
              {submitting
                ? "Creating..."
                : step === 3
                ? "Create, Analyze & Run"
                : "Next"}
            </button>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
