# Codem – GenAI Code Migration Studio (n8n-integrated)

This is an MVP web app for **Codem**, a GenAI-based migration studio that
orchestrates C/C++/Java/Python → modern target migrations via **n8n**.

Tech stack:

- **Next.js 14 (App Router, TypeScript)**
- **Firebase + Google OAuth** auth
- **JSON-file DB** under `data/db.json`
- **n8n** webhook for migration runs
- Side-by-side migration review workspace

## 1. Environment Setup

1. Unzip and `cd` into this folder.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `.env.local` with your Firebase config:

   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Optional: override n8n webhook URL (defaults to your test URL)
   # N8N_MIGRATION_WEBHOOK_URL=https://mailabs.app.n8n.cloud/webhook-test/conversion
   ```

   If `N8N_MIGRATION_WEBHOOK_URL` is **not** set, the app uses the default:

   ```text
   https://mailabs.app.n8n.cloud/webhook-test/conversion
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

5. Visit `http://localhost:3000`.

   - Sign in with Google.
   - Create a new migration via the 3-step wizard.
   - The app will:
     - Create a project.
     - Generate a mock analysis.
     - Call your **n8n migration webhook**.
     - Persist returned files and open the migration workspace.

## 2. n8n Integration

The migration route is at:

```text
POST /api/projects/:projectId/runs
```

It calls your n8n webhook:

```ts
const webhookUrl =
  process.env.N8N_MIGRATION_WEBHOOK_URL ||
  "https://mailabs.app.n8n.cloud/webhook-test/conversion";
```

### Request Body to n8n

The app sends:

```json
{
  "projectId": "proj_xxx",
  "runId": "run_xxx",
  "repoUrl": "https://github.com/org/repo.git",
  "scope": "service"
}
```

`scope` is `"file" | "service" | "full"` based on the wizard.

### Expected Response from n8n

Codem accepts **two shapes**:

1. Array:

   ```json
   [
     {
       "path": "src/auth/LoginService.java",
       "status": "migrated",
       "originalCode": "public class LoginService { ... }",
       "kotlinCode": "class LoginService { ... }",
       "notes": "Converted using GenAI; verify auth flows."
     }
   ]
   ```

2. Object with `files` array:

   ```json
   {
     "files": [
       {
         "path": "src/auth/LoginService.java",
         "status": "migrated",
         "originalCode": "public class LoginService { ... }",
         "kotlinCode": "class LoginService { ... }",
         "notes": "Converted using GenAI; verify auth flows."
       }
     ]
   }
   ```

It also tolerates alternative field names:

- `originalCode` **or** `source` **or** `srcCode`
- `kotlinCode` **or** `target` **or** `dstCode`
- `notes` **or** `comment`

Each file is stored as a `FileMigration` and linked to a `Run`.

If n8n returns an error, invalid JSON, or no files, Codem logs the raw
response and falls back to a small mock file so the workspace always renders.

## 3. UI Overview

- `/` – Landing + Google login.
- `/projects` – List of Codem projects.
- `/projects/new` – 3-step wizard:
  1. Connect repository (paste Git URL).
  2. Define scope (auto/manual).
  3. Choose migration strategy (file/service/full).
- `/projects/:projectId` – Project dashboard:
  - Status and metadata cards.
  - Runs table with stats (total/migrated/pending/manual).
  - Button to trigger **New Migration Run** (calls n8n again).
- `/projects/:projectId/analysis` – Mock analysis view.
- `/projects/:projectId/runs/:runId` – Migration workspace:
  - Left: file list with status chips.
  - Center: side-by-side original vs converted code.
  - Right: **AI Copilot** panel with a generic migration helper chat
    (currently local-demo mode; ready for backend LLM wiring).

## 4. Next Steps

- Wire the AI Copilot panel to a backend `/api/copilot` route that calls your
  preferred LLM (directly or via n8n) and reasons over the selected file.
- Replace the mock analysis route with a dedicated n8n workflow.
- Add GitHub OAuth and PR export from migrated files.
- Integrate Pinecone inside the n8n flow for retrieval-augmented migration
  and risk detection.
