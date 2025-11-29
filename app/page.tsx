"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";

export default function LandingPage() {
  const { user, loginWithGoogle, logout } = useAuth();
  const router = useRouter();

  const handleStart = async () => {
    if (!user) {
      await loginWithGoogle();
    }
    router.push("/projects");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl md:text-4xl font-semibold mb-4 text-center">
        Codem – GenAI Code Migration Studio
      </h1>
      <p className="text-gray-300 mb-8 max-w-xl text-center text-sm md:text-base">
        Point Codem at a repository and orchestrate AI-powered migration for C,
        C++, Java, and Python services into a modern target stack. Review diffs,
        iterate, and ship faster.
      </p>

      <button
        onClick={handleStart}
        className="px-6 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 transition text-sm font-medium"
      >
        {user ? "Go to Projects" : "Sign in with Google to start"}
      </button>

      {user && (
        <button
          onClick={logout}
          className="mt-4 text-xs text-gray-400 underline hover:text-gray-200"
        >
          Logout
        </button>
      )}
    </div>
  );
}
