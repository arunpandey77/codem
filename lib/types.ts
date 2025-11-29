export type ProjectStatus = "not_analyzed" | "analyzing" | "ready";

export interface AnalysisSummary {
  languages: { name: string; percent: number }[];
  dependencies: string[];
  warnings: string[];
  lastAnalyzedAt: string;
}

export interface Project {
  id: string;
  name: string;
  repoUrl: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  analysis?: AnalysisSummary;
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
}

export type FileStatus = "migrated" | "pending" | "manual";

export interface FileMigration {
  id: string;
  runId: string;
  path: string;
  status: FileStatus;
  originalCode: string;
  kotlinCode: string;
  notes?: string;
}

export interface DB {
  projects: Project[];
  runs: Run[];
  files: FileMigration[];
}
