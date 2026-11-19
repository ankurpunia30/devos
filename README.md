# DevOS — The Personal Developer Operating System

> **Single Source of Truth for Your Development Life**  
> Consolidating tasks, projects, GitHub repositories, code reviews, NeetCode 150 practice, engineering knowledge, snippets, and offline developer utilities into a unified, high-density workstation.

---

## ⚡ What is DevOS?

**DevOS** is a **Linear/Raycast-grade Developer Operating System** built on **Next.js 16 App Router (React 19, Tailwind CSS, SQLite with WAL mode)**. It eliminates context switching across fragmented developer tools by providing one single source of truth for planning, execution, DSA practice, code reviews, technical documentation, and daily engineering rituals.

---

## 🚀 Shipped Modules & Capabilities

### 1. Executive Dashboard (`/`)
- **Real-time Telemetry Metrics**: Daily Streak, NeetCode 150 Mastery Percentage, Open Pull Requests, Active Sprint Tickets.
- **35-Day Multi-Domain Heatstrip**: Hoverable visual strip capturing cross-domain activities (tasks, git, dsa, daily).
- **Today's Focus & Daily Rocks**: Fast 1-click completion toggle for essential intentions.
- **Active Projects & Workspaces**: Multi-repository workspaces with progress bars and tech stack badges.
- **Live Universal Activity Stream**: Real-time event log with source domain badges and timestamps.

### 2. Task Kanban & Sprints (`/tasks`)
- **Linear-grade 5-Column Kanban**: `Backlog`, `Todo`, `In Progress`, `Blocked`, and `Completed`.
- **Instant Workflow Navigation**: 1-click status shifts (`←`, `→`) with optimistic updates.
- **Priority Indicators**: Critical (🔴), High (🟠), Medium (🟡), and Low (🔵).
- **Filters & Search**: Fast client-side title/description search and priority pill filtering.
- **Task Scaffolding Modal**: Project selection, estimated minutes, and priority selectors.

### 3. Project Workspaces (`/projects`)
- Multi-repository project workspaces across categories: `Personal`, `Professional`, `Learning`, and `Experimental`.
- Milestone tracking and automated progress percentage calculation.
- Tech stack tag arrays and target delivery dates.

### 4. GitHub Hub & PR Review Queue (`/github`)
- Connected GitHub repositories with star counts, open issues, and default branch chips.
- Pull Request review queue with review status badges: `Approved` (emerald), `Changes Requested` (rose), `Review Pending` (amber).
- Commit telemetry stream with SHA hashes, author metadata, and commit timestamps.

### 5. NeetCode 150 Practice Matrix (`/dsa`)
- Pre-seeded **NeetCode 150 Core Curriculum** (Arrays & Hashing, Two Pointers, Sliding Window, Trees, Graphs, DP).
- Topic tabs with solve count ratios (`solved/total`).
- Spaced Repetition engine: Marking a problem `solved` automatically schedules revision 3 days into the future.
- One-click **Solve on LeetCode** direct external navigation.

### 6. Daily Workspace & Standup Generator (`/daily`)
- **Pomodoro Deep Work Timer**: 25-minute sprint with animated visual indicator, Start/Pause/Reset, logging completed blocks to SQLite.
- **Top 3 Daily Rocks**: Intentional daily priorities manager.
- **Automated Grounded Standup Generator**: Synthesizes actual completed tasks, Git commits, and DSA solves into a clean 3-part Markdown standup report with 1-click clipboard copy.

### 7. Heatmap & Contribution Streaks (`/analytics`)
- 60-day interactive multi-domain contribution matrix.
- Current streak, longest streak, and total activity counters.
- Domain breakdown cards: Task Kanban, GitHub Sync, DSA Practice, Daily Focus.

### 8. Universal Activity Journal (`/activities`)
- Immutable, audit-ready event bus capturing state transitions across all developer domains.
- Domain filters (Tasks, GitHub, DSA, Daily, Projects).

### 9. Developer Offline Toolbox (`/toolbox`)
- **JSON Formatter & Validator**: Beautify (indent 2) and Minify with validation error highlights.
- **JWT Token Debugger**: Offline decoding of headers and payload claims without sending tokens over the internet.
- **Base64 Encoder / Decoder**: Instant binary-safe conversions.
- **UUID v4 Generator**: Cryptographically secure RFC 4122 v4 UUID generator.
- **Unix Timestamp Converter**: Epoch seconds ↔ human-readable UTC and local time.

### 10. Code Snippet Vault (`/snippets`)
- Personal vault of reusable algorithms, Docker configurations, SQL recursive CTEs, and system design patterns.
- Language filters (TypeScript, SQL, Python, Docker, Rust, Go, Bash).
- 1-click copy-to-clipboard with instant visual feedback.

### 11. Developer Knowledge Base (`/notes`)
- Personal engineering memory: Architecture decisions, database schemas, debugging notes, and system design specs.
- Markdown viewer with category filtering and tag search.

### 12. 3rd-Party Integrations Hub & Webhooks (`/integrations`)
- **Live GitHub Sync**: Connect Personal Access Token (PAT) or username to synchronize real repositories, recent commits, and pull requests directly into local SQLite.
- **LeetCode GraphQL Integration**: Connect public LeetCode handle to query `leetcode.com/graphql`, pulling total solved problems (Easy, Medium, Hard) and matching recent submissions to automatically progress the NeetCode 150 matrix.
- **Inbound GitHub Webhooks**: Webhook endpoint (`/api/integrations/github/webhook`) listening for `push` and `pull_request` events to update telemetry in real time.
- **Local Token Masking**: Personal Access Tokens and secrets are stored in local SQLite and masked in the UI.

### 13. Global Raycast-Style Command Palette (`⌘K`)
- Press `⌘K` or click the search bar anywhere in the app to open the Raycast-style command palette for instant keyboard navigation across all modules and utilities.

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router, React 19)
- **Styling**: Tailwind CSS (Deep zinc obsidian palette, Linear/Raycast design language)
- **Icons**: Lucide React
- **Database**: SQLite (`node:sqlite`) with `WAL` mode and `busy_timeout` for concurrent worker safety
- **Domain Architecture**: Event-driven Universal Activity Bus (`ActivityBus`) fanning out to subscribers
- **Testing**: Node 24 native test runner (`--experimental-strip-types --test`)

---

## 🏃 Running the Application

### 1. Run All Tests
```bash
npm test
```
All 8 domain and API test suites execute in ~140ms with zero mocks or live socket dependencies.

### 2. Run Next.js Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build & Start
```bash
npm run build
npm start
```
