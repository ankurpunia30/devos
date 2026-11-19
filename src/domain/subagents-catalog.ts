export interface PredefinedSkill {
  id: string;
  name: string;
  description: string;
}

export interface DevOSSubagent {
  id: string;
  name: string;
  domain: string;
  role: string;
  description: string;
  gradient: string;
  iconName: string;
  skills: PredefinedSkill[];
  samplePrompts: string[];
  systemInstructions: string;
}

export const DEVOS_SUBAGENTS: DevOSSubagent[] = [
  {
    id: 'dashboard_agent',
    name: 'Dashboard Telemetry Agent',
    domain: 'dashboard',
    role: 'Executive Systems & Consistency Synthesizer',
    description: 'Aggregates cross-domain activity streaks, monitors operational health, and synthesizes daily engineering telemetry.',
    gradient: 'from-brand-500 to-indigo-600',
    iconName: 'LayoutDashboard',
    skills: [
      { id: 'streak_analyzer', name: 'Streak & Momentum Analysis', description: 'Evaluates consistency across git, dsa, and tasks over 35-day windows' },
      { id: 'executive_digest', name: 'Executive Telemetry Digest', description: 'Generates high-level summaries of open PRs, sprint velocity, and solved problems' },
      { id: 'anomaly_detection', name: 'Focus Disruption Detection', description: 'Flags sudden drop-offs in daily rocks or stalled pull requests' },
    ],
    samplePrompts: [
      'Give me an executive summary of my engineering health today',
      'Analyze my 35-day contribution heatstrip and consistency',
      'What are my top bottlenecks across tasks and open PRs?',
    ],
    systemInstructions: 'You are the DevOS Executive Dashboard Agent. You specialize in synthesizing developer telemetry, momentum, and operational health.',
  },
  {
    id: 'kanban_agent',
    name: 'Task Kanban & Sprint Agent',
    domain: 'tasks',
    role: 'Sprint Backlog & Story Decomposition Specialist',
    description: 'Parses natural language into structured tickets, estimates completion minutes, balances sprint columns, and unblocks stuck items.',
    gradient: 'from-blue-500 to-cyan-500',
    iconName: 'CheckSquare',
    skills: [
      { id: 'nl_task_parser', name: 'Deterministic Natural Language Parser', description: 'Extracts priority tags (#p:high), hashtags, due dates, and estimates' },
      { id: 'backlog_decomposition', name: 'Epic Decomposition', description: 'Breaks down complex features into incremental, reviewable subtasks' },
      { id: 'sprint_balancing', name: 'WIP Limit & Capacity Balancing', description: 'Flags column congestion in "In Progress" or "Blocked" states' },
    ],
    samplePrompts: [
      'Break down "Implement Redis rate limiter middleware" into subtasks',
      'Which tasks in my sprint backlog are currently blocked or high priority?',
      'Estimate the remaining effort for my in-progress tickets',
    ],
    systemInstructions: 'You are the DevOS Task Kanban Agent. You manage sprint velocity, ticket triaging, and deterministic natural-language task parsing.',
  },
  {
    id: 'dsa_agent',
    name: 'LeetCode & Algorithm Tutor',
    domain: 'dsa',
    role: 'Algorithm Complexity & Spaced Repetition Specialist',
    description: 'Analyzes algorithm time/space complexity, formulates optimal patterns, guides spaced repetition reviews, and suggests problem sets.',
    gradient: 'from-amber-500 to-orange-500',
    iconName: 'Code2',
    skills: [
      { id: 'complexity_auditor', name: 'Time & Space Complexity Audit', description: 'Determines Big-O bounds and identifies memory bottlenecks' },
      { id: 'spaced_repetition_scheduler', name: 'Spaced Repetition Scheduler', description: 'Calculates optimal revision intervals (3d, 7d, 21d) for solved problems' },
      { id: 'pattern_classifier', name: 'Pattern Recognition Engine', description: 'Maps problems to Two Pointers, Monotonic Stack, Dynamic Programming, or Tree DFS' },
    ],
    samplePrompts: [
      'What problems in my LeetCode catalog currently need revision?',
      'Explain the optimal two-pointer approach for Trapping Rain Water with O(1) space',
      'Compare Sliding Window vs Two Pointers: when should I use which?',
    ],
    systemInstructions: 'You are the DevOS LeetCode DSA Tutor. You provide strict algorithmic proofs, complexity bounds, and spaced repetition schedules.',
  },
  {
    id: 'github_agent',
    name: 'Code Review & PR Auditor',
    domain: 'github',
    role: 'Static Analysis & Pull Request Auditor',
    description: 'Audits pull request diffs, checks conventional commit conventions, detects security anti-patterns, and summarizes code changes.',
    gradient: 'from-emerald-500 to-teal-500',
    iconName: 'GitBranch',
    skills: [
      { id: 'diff_analyzer', name: 'Pull Request Review Audit', description: 'Checks for security vulnerabilities, memory leaks, and breaking changes' },
      { id: 'conventional_commits', name: 'Commit Standardization', description: 'Formats commits according to semantic conventional commit specifications' },
      { id: 'review_queue_triage', name: 'Review Queue Prioritization', description: 'Sorts pending PRs by urgency and author status' },
    ],
    samplePrompts: [
      'Review my open pull requests and flag any pending review bottlenecks',
      'What are the recent commits across my connected repositories?',
      'How should I format a conventional commit for SQLite WAL configuration?',
    ],
    systemInstructions: 'You are the DevOS Code Review & GitHub Agent. You perform high-rigor code audits, security checks, and PR reviews.',
  },
  {
    id: 'daily_agent',
    name: 'Daily Standup & Focus Coach',
    domain: 'daily',
    role: 'Deep Work Orchestrator & Grounded Standup Synthesizer',
    description: 'Generates zero-hallucination 3-part Markdown standups from real database commits/tasks and optimizes Pomodoro focus blocks.',
    gradient: 'from-violet-500 to-purple-600',
    iconName: 'Clock',
    skills: [
      { id: 'standup_generator', name: 'Grounded Standup Generator', description: 'Synthesizes actual completed tasks, git commits, and dsa solves into Markdown' },
      { id: 'pomodoro_tracker', name: 'Deep Work Sprint Analytics', description: 'Logs completed 25-minute focus sprints and tracks deep work hours' },
      { id: 'daily_rocks_prioritizer', name: 'Top 3 Daily Intentions', description: 'Keeps focus pinned to high-leverage outcomes' },
    ],
    samplePrompts: [
      'Generate my official 3-part engineering standup report for today',
      'How many Pomodoro deep work blocks have I completed today?',
      'Review my top 3 daily rocks and recommend my next sprint focus',
    ],
    systemInstructions: 'You are the DevOS Daily Focus & Standup Coach. You synthesize actual database events into crisp 3-part standup reports.',
  },
  {
    id: 'architecture_agent',
    name: 'Architecture & ADR Specialist',
    domain: 'architecture',
    role: 'Systems Design & Architecture Decision Record Facilitator',
    description: 'Structures Architecture Decision Records (ADRs), renders Mermaid sequence/flowchart diagrams, and evaluates consistency vs latency tradeoffs.',
    gradient: 'from-indigo-500 to-blue-600',
    iconName: 'Layers',
    skills: [
      { id: 'adr_formulation', name: 'ADR Sequencing & Formatting', description: 'Structures Context, Decision, and Consequences according to Michael Nygard standards' },
      { id: 'mermaid_rendering', name: 'Mermaid Diagram Generation', description: 'Produces clean sequenceDiagram and flowchart TD code for system flows' },
      { id: 'tradeoff_evaluator', name: 'Distributed Systems Tradeoff Analysis', description: 'Weighs ACID vs BASE, Raft consensus, and cache invalidation strategies' },
    ],
    samplePrompts: [
      'Draft an ADR for migrating SQLite to PostgreSQL for distributed multi-region support',
      'Generate a Mermaid sequence diagram for our Google OAuth 2.0 authorization flow',
      'What are the trade-offs of SQLite WAL mode in serverless vs containerized environments?',
    ],
    systemInstructions: 'You are the DevOS Systems Architecture Agent. You formulate rigorous ADRs, evaluate distributed systems tradeoffs, and generate Mermaid diagrams.',
  },
  {
    id: 'career_agent',
    name: 'Career & STAR Interview Coach',
    domain: 'career',
    role: 'Staff Engineer Interview & Pipeline Strategist',
    description: 'Polishes behavioral interview answers using the STAR method (Situation, Task, Action, Result) and organizes recruitment pipelines.',
    gradient: 'from-rose-500 to-pink-600',
    iconName: 'Briefcase',
    skills: [
      { id: 'star_formatter', name: 'STAR Behavioral Story Bank', description: 'Structures technical leadership anecdotes with quantifiable impact metrics' },
      { id: 'pipeline_organizer', name: 'Offer & Interview Pipeline Tracker', description: 'Tracks technical, behavioral, and offer stages across target companies' },
      { id: 'compensation_negotiation', name: 'Compensation Benchmarking', description: 'Evaluates base salary, RSU equity vesting, and sign-on bonuses' },
    ],
    samplePrompts: [
      'Format a STAR story about resolving a critical production memory leak',
      'What is the current status of my active job applications and interviews?',
      'Give me mock behavioral questions for a Staff Infrastructure Engineer interview',
    ],
    systemInstructions: 'You are the DevOS Career & Interview Coach. You train engineers for senior/staff technical interviews using the STAR method.',
  },
  {
    id: 'toolbox_agent',
    name: 'Offline Security & Toolbox Agent',
    domain: 'toolbox',
    role: 'Cryptographic & Developer Utilities Specialist',
    description: 'Inspects JWT claims offline with zero internet leakage, validates RFC 4122 UUIDs, formats complex JSON, and performs Base64 conversions.',
    gradient: 'from-teal-500 to-emerald-600',
    iconName: 'Wrench',
    skills: [
      { id: 'jwt_auditor', name: 'Offline JWT Claim Inspector', description: 'Decodes header and payload claims locally without leaking bearer tokens' },
      { id: 'base64_converter', name: 'Binary Safe Encoder / Decoder', description: 'Performs safe UTF-8 string to base64 conversions' },
      { id: 'crypto_uuid', name: 'RFC 4122 v4 UUID Validator', description: 'Generates and validates cryptographically secure UUID tokens' },
    ],
    samplePrompts: [
      'Explain how the offline JWT debugger guarantees zero token leakage',
      'Validate if this token is expired based on its "exp" epoch timestamp',
      'Format and minify a nested JSON structure for database storage',
    ],
    systemInstructions: 'You are the DevOS Offline Security & Toolbox Agent. You verify cryptographic utilities, token decoding, and local developer tools.',
  },
];
