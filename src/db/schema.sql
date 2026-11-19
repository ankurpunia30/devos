-- DevOS Schema: Phase 1 & 2 (Compatible with PostgreSQL 16 & SQLite)

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'planning',
    category TEXT DEFAULT 'personal',
    tech_stack TEXT DEFAULT '[]', -- JSON array string
    architecture_overview TEXT,
    target_completion_date TEXT,
    progress_percentage INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(user_id, slug)
);

CREATE TABLE IF NOT EXISTS project_milestones (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT,
    is_completed INTEGER DEFAULT 0,
    completed_at TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
    parent_task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'todo',
    due_date TEXT,
    estimated_minutes INTEGER,
    actual_minutes INTEGER DEFAULT 0,
    tags TEXT DEFAULT '[]', -- JSON array string
    external_reference TEXT, -- JSON string
    completed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS task_dependencies (
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, depends_on_task_id)
);

CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    source_domain TEXT NOT NULL,
    project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
    repository_id TEXT,
    task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    metadata TEXT DEFAULT '{}',
    external_id TEXT,
    occurred_at TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_priorities (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    rank INTEGER NOT NULL,
    task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
    custom_title TEXT,
    is_completed INTEGER DEFAULT 0,
    completed_at TEXT
);

CREATE TABLE IF NOT EXISTS pomodoro_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
    duration_minutes INTEGER NOT NULL,
    completed_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS standup_reports (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    yesterday_accomplishments TEXT NOT NULL, -- JSON array
    today_plan TEXT NOT NULL, -- JSON array
    blockers TEXT NOT NULL, -- JSON array
    raw_markdown TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- ==========================================
-- Phase 2: GitHub Integration Tables
-- ==========================================
CREATE TABLE IF NOT EXISTS github_repositories (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
    github_repo_id INTEGER UNIQUE NOT NULL,
    name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    html_url TEXT NOT NULL,
    description TEXT,
    is_private INTEGER DEFAULT 0,
    default_branch TEXT DEFAULT 'main',
    open_issues_count INTEGER DEFAULT 0,
    stargazers_count INTEGER DEFAULT 0,
    last_synced_at TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS github_commits (
    id TEXT PRIMARY KEY,
    repository_id TEXT NOT NULL REFERENCES github_repositories(id) ON DELETE CASCADE,
    sha TEXT UNIQUE NOT NULL,
    message TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    html_url TEXT NOT NULL,
    committed_at TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS github_pull_requests (
    id TEXT PRIMARY KEY,
    repository_id TEXT NOT NULL REFERENCES github_repositories(id) ON DELETE CASCADE,
    task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
    github_pr_id INTEGER UNIQUE NOT NULL,
    number INTEGER NOT NULL,
    title TEXT NOT NULL,
    state TEXT DEFAULT 'open', -- 'open' | 'closed' | 'merged'
    author_login TEXT NOT NULL,
    html_url TEXT NOT NULL,
    review_status TEXT DEFAULT 'pending', -- 'pending' | 'approved' | 'changes_requested'
    merged_at TEXT,
    created_at TEXT NOT NULL
);

-- ==========================================
-- Phase 2: LeetCode & NeetCode Tables
-- ==========================================
CREATE TABLE IF NOT EXISTS dsa_topics (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS dsa_problems (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id TEXT NOT NULL REFERENCES dsa_topics(id),
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    leetcode_url TEXT NOT NULL,
    neetcode_roadmap_flag INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'attempted', 'solved', 'revision_needed')),
    notes TEXT,
    approach_summary TEXT,
    time_complexity TEXT,
    space_complexity TEXT,
    next_revision_date TEXT,
    last_solved_at TEXT,
    created_at TEXT NOT NULL,
    UNIQUE(user_id, slug)
);

CREATE TABLE IF NOT EXISTS dsa_submissions (
    id TEXT PRIMARY KEY,
    problem_id TEXT NOT NULL REFERENCES dsa_problems(id) ON DELETE CASCADE,
    status TEXT NOT NULL, -- 'Accepted', 'Wrong Answer', 'Time Limit Exceeded'
    code TEXT,
    runtime_ms INTEGER,
    memory_mb REAL,
    submitted_at TEXT NOT NULL
);

-- ==========================================
-- Phase 4: Career & Interview Tables
-- ==========================================
CREATE TABLE IF NOT EXISTS career_applications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    stage TEXT DEFAULT 'applied' CHECK (stage IN ('wishlist', 'applied', 'screening', 'technical', 'behavioral', 'offer', 'rejected')),
    salary_range TEXT,
    location TEXT,
    applied_date TEXT,
    next_interview_date TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS career_questions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company TEXT,
    question TEXT NOT NULL,
    category TEXT DEFAULT 'technical' CHECK (category IN ('technical', 'behavioral', 'system_design')),
    star_situation TEXT,
    star_task TEXT,
    star_action TEXT,
    star_result TEXT,
    notes TEXT,
    created_at TEXT NOT NULL
);

-- ==========================================
-- Phase 4: Architecture Decision Records (ADRs)
-- ==========================================
CREATE TABLE IF NOT EXISTS architecture_decisions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
    adr_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'accepted' CHECK (status IN ('proposed', 'accepted', 'deprecated', 'superseded')),
    context TEXT NOT NULL,
    decision TEXT NOT NULL,
    consequences TEXT NOT NULL,
    mermaid_diagram TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(user_id, adr_number)
);

-- ==========================================
-- Phase 4: Environment & Deployments
-- ==========================================
CREATE TABLE IF NOT EXISTS deployments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
    environment TEXT NOT NULL CHECK (environment IN ('local', 'dev', 'staging', 'prod')),
    version_tag TEXT NOT NULL,
    commit_sha TEXT,
    status TEXT DEFAULT 'healthy' CHECK (status IN ('healthy', 'degraded', 'down', 'deploying')),
    rollback_plan TEXT,
    deployed_at TEXT NOT NULL,
    created_at TEXT NOT NULL
);
