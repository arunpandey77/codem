export type ProjectStatus = "not_analyzed" | "analyzing" | "ready";

export interface AnalysisSummary {
  languages: { name: string; percent: number }[];
  dependencies: string[];
  warnings: string[];
  lastAnalyzedAt: string;
}

// ✅ New: central language code type so Codem can be generic
export type LanguageCode =
  | "c"
  | "cpp"
  | "java"
  | "python"
  | "kotlin"
  | "csharp"
  | "javascript"
  | "typescript";

export interface Project {
  id: string;
  name: string;
  repoUrl: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  analysis?: AnalysisSummary;

  // ✅ New: project-level default source/target
  sourceLanguage?: LanguageCode;
  targetLanguage?: LanguageCode;
}

export type RunStatus = "pending" | "running" | "completed" | "failed";

export interface RunStats {
  totalFiles: number;
  migrated: number;
  pending: number;
  manual: number;
}

export interface Run {
  id: string;
  projectId: string;
  scope: string;
  status: RunStatus;
  stats: RunStats;
  fileIds: string[];
  createdAt: string;
  updatedAt: string;

  // ✅ New: snapshot of source/target at run time
  sourceLanguage?: LanguageCode;
  targetLanguage?: LanguageCode;
}

export type FileStatus = "migrated" | "pending" | "manual";

export interface FileMigration {
  id: string;
  runId: string;
  path: string;
  status: FileStatus;
  originalCode: string;

  // Currently still Kotlin-specific, we’ll generalize this in the next step
  kotlinCode: string;

  // ✅ Optional: prep for fully generic support later
  sourceLanguage?: LanguageCode;
  targetLanguage?: LanguageCode;
  // In a future refactor we can introduce: targetCode?: string

  notes?: string;
}

export interface DB {
  projects: Project[];
  runs: Run[];
  files: FileMigration[];
}
