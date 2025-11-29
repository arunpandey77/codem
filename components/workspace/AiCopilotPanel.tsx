"use client";

import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  projectId: string;
  runId: string;
  fileId: string | null;
  filePath?: string;
}

export default function AiCopilotPanel({
  projectId,
  runId,
  fileId,
  filePath,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi, I’m your migration copilot. Select a file and ask me to explain the conversion, highlight risks, or suggest tests.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendQuestion = async () => {
    const question = input.trim();
    if (!question) return;

    if (!fileId) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: question },
        {
          role: "assistant",
          content:
            "Please select a migrated file on the left so I can analyze the original and converted code.",
        },
      ]);
      setInput("");
      return;
    }

    const userMsg: Message = { role: "user", content: question };

    // Optimistically add the user message + a placeholder
    setMessages((prev) => [
      ...prev,
      userMsg,
      { role: "assistant", content: "Analyzing this migration..." },
    ]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          runId,
          fileId,
          question,
          history: messages,
        }),
      });

      const json = await res.json();

      setMessages((prev) => {
        // Remove the last placeholder assistant message
        const trimmed = [...prev];
        trimmed.pop(); // remove "Analyzing..." bubble

        return [
          ...trimmed,
          {
            role: "assistant",
            content:
              json.answer ||
              "I couldn't get a detailed answer from the copilot backend.",
          },
        ];
      });
    } catch (err) {
      console.error("Copilot error:", err);
      setMessages((prev) => {
        const trimmed = [...prev];
        trimmed.pop();
        return [
          ...trimmed,
          {
            role: "assistant",
            content:
              "Something went wrong while calling the copilot backend. Please try again in a moment.",
          },
        ];
      });
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading) {
        sendQuestion();
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-slate-800">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          AI Copilot
        </h3>
        <p className="text-[11px] text-gray-500 truncate">
          {filePath
            ? `Focused on: ${filePath}`
            : "Select a file on the left to give the copilot context."}
        </p>
      </div>

      <div className="flex-1 overflow-auto px-3 py-2 space-y-2 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`rounded-lg px-2 py-1 whitespace-pre-wrap ${
              m.role === "assistant"
                ? "bg-slate-900 text-gray-200"
                : "bg-indigo-600 text-white ml-auto"
            } max-w-[90%]`}
          >
            {m.content}
          </div>
        ))}
      </div>

      <div className="border-t border-slate-800 p-2">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              fileId
                ? "Ask about this migration…"
                : "Select a file first, then ask a question…"
            }
            className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-xs"
            disabled={loading}
          />
          <button
            onClick={sendQuestion}
            disabled={loading}
            className="px-3 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-[11px]"
          >
            {loading ? "Thinking…" : "Send"}
          </button>
        </div>
        <p className="mt-1 text-[10px] text-gray-500">
          Tip: Ask about potential regressions, performance changes, or what
          tests to write.
        </p>
      </div>
    </div>
  );
}
