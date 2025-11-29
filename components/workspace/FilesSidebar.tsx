import type { FileMigration } from "@/lib/types";

interface Props {
  files: FileMigration[];
  selectedFileId: string | null;
  onSelect: (fileId: string) => void;
}

export default function FilesSidebar({
  files,
  selectedFileId,
  onSelect,
}: {
  files: FileMigration[];
  selectedFileId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b border-slate-800">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Files
        </h3>
        <p className="text-[11px] text-gray-500">
          {files.length} migrated file{files.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="flex-1 overflow-auto text-xs">
        {files.length === 0 ? (
          <div className="px-3 py-4 text-[11px] text-gray-500">
            No migrated files yet for this run.
          </div>
        ) : (
          <ul className="py-1">
            {files.map((f) => {
              const isSelected = f.id === selectedFileId;
              return (
                <li key={f.id}>
                  <button
                    onClick={() => onSelect(f.id)}
                    className={`w-full text-left px-3 py-2 flex flex-col gap-1 border-l-2 ${
                      isSelected
                        ? "bg-slate-900 border-indigo-500"
                        : "border-transparent hover:bg-slate-900/60"
                    }`}
                  >
                    <span className="truncate text-[11px] text-gray-200">
                      {f.path}
                    </span>
                    <span className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ${
                          f.status === "migrated"
                            ? "bg-emerald-500/10 text-emerald-300"
                            : f.status === "pending"
                            ? "bg-amber-500/10 text-amber-300"
                            : "bg-rose-500/10 text-rose-300"
                        }`}
                      >
                        {f.status}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

