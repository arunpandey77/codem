import type { FileMigration } from "@/lib/types";

interface Props {
  file: FileMigration | null;
}

export default function DiffViewer({ file }: Props) {
  if (!file) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-gray-400">
        Select a migrated file from the left to view its original vs converted
        code side by side.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Migration Diff
          </h3>
          <p className="text-[11px] text-gray-500 truncate">{file.path}</p>
        </div>
        <div className="flex gap-2 text-[10px]">
          <button className="px-2 py-1 rounded border border-slate-700 hover:bg-slate-900">
            Regenerate
          </button>
          <button className="px-2 py-1 rounded border border-slate-700 hover:bg-slate-900">
            Improve Conversion
          </button>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-2 text-xs overflow-auto">
        <pre className="p-3 border-r border-slate-800 bg-slate-950 whitespace-pre-wrap">
          {file.originalCode}
        </pre>
        <pre className="p-3 bg-slate-950 whitespace-pre-wrap text-emerald-200">
          {file.kotlinCode}
        </pre>
      </div>
    </div>
  );
}
